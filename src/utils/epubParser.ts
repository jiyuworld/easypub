import JSZip from 'jszip';
import { createEditor, $getRoot, $isElementNode, $isDecoratorNode, $createParagraphNode } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { $convertToMarkdownString } from '@lexical/markdown';
import { PLAYGROUND_TRANSFORMERS } from '../components/Editor/lexical/plugins/MarkdownTransformers';
import { nodes } from '../components/Editor/lexical/nodes/CustomNodes';
import theme from '../components/Editor/lexical/theme/EditorTheme';
import type { EpubMetadata, EpubStyle, Chapter, ImageItem, EpubImportData } from '../types';

export const parseEpub = async (file: File): Promise<EpubImportData> => {
    const zip = await JSZip.loadAsync(file);
    const container = await zip.file('META-INF/container.xml')?.async('text');

    if (!container) {
        throw new Error('Invalid EPUB: container.xml not found');
    }

    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(container, 'application/xml');
    const rootPath = containerDoc.querySelector('rootfile')?.getAttribute('full-path');

    if (!rootPath) {
        throw new Error('Invalid EPUB: content.opf path not found');
    }

    const contentOpf = await zip.file(rootPath)?.async('text');
    if (!contentOpf) {
        throw new Error('Invalid EPUB: content.opf not found');
    }

    const opfDoc = parser.parseFromString(contentOpf, 'application/xml');
    const opfDir = rootPath.substring(0, rootPath.lastIndexOf('/'));

    // 1. Metadata
    const metadata = parseMetadata(opfDoc);

    // 2. Images
    const images: ImageItem[] = [];
    const manifestItems = Array.from(opfDoc.querySelectorAll('manifest > item'));
    const imageItems = manifestItems.filter(item => item.getAttribute('media-type')?.startsWith('image/'));

    const imagePathMap = new Map<string, string>(); // relative path in epub -> local blob url

    for (const item of imageItems) {
        const href = item.getAttribute('href');
        if (!href) continue;

        const fullPath = opfDir ? `${opfDir}/${href}` : href;
        const fileData = await zip.file(fullPath)?.async('blob');

        if (fileData) {
            const id = item.getAttribute('id') || `img-${Math.random().toString(36).substr(2, 9)}`;
            const url = URL.createObjectURL(fileData);
            images.push({
                id,
                blob: fileData,
                url
            });
            // Map full path
            imagePathMap.set(fullPath, url);

            // Map relative href (as it appears in OPF)
            imagePathMap.set(href, url);

            // Also map just the filename in case of relative paths
            const filename = href.split('/').pop();
            if (filename) {
                imagePathMap.set(filename, url);
            }
        }
    }

    // Handle Cover Image
    const coverMeta = opfDoc.querySelector('metadata > meta[name="cover"]');
    if (coverMeta) {
        const coverId = coverMeta.getAttribute('content');
        if (coverId) {
            const coverItem = opfDoc.querySelector(`manifest > item[id="${coverId}"]`);
            const href = coverItem?.getAttribute('href');
            if (href) {
                const fullPath = opfDir ? `${opfDir}/${href}` : href;
                const blob = await zip.file(fullPath)?.async('blob');
                if (blob) {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                    metadata.coverImage = base64;
                }
            }
        }
    }

    // 3. Chapters
    const chapters: Chapter[] = [];
    const spineRef = Array.from(opfDoc.querySelectorAll('spine > itemref'));

    // Initialize Headless Editor
    const editor = createEditor({
        nodes,
        theme,
        onError: (error) => console.error(error),
    });

    for (let i = 0; i < spineRef.length; i++) {
        const idref = spineRef[i].getAttribute('idref');
        const item = opfDoc.querySelector(`manifest > item[id="${idref}"]`);
        const href = item?.getAttribute('href');

        // Filter out TOC/nav and cover files
        const filename = href?.split('/').pop()?.toLowerCase();
        const shouldSkip = filename?.startsWith('nav.') || idref === 'nav' || item?.getAttribute('properties')?.includes('nav') || idref === 'toc' ||
            filename?.startsWith('cover.') || idref === 'cover';

        if (shouldSkip) {
            continue;
        }

        if (href) {
            const fullPath = opfDir ? `${opfDir}/${href}` : href;
            const content = await zip.file(fullPath)?.async('text');

            if (content) {
                const chapterDoc = parser.parseFromString(content, 'application/xhtml+xml') || parser.parseFromString(content, 'text/html');

                // Replace images with absolute URLs (Blob URLs) so Lexical can see them
                const imgs = chapterDoc.querySelectorAll('img');
                imgs.forEach(img => {
                    const src = img.getAttribute('src');
                    if (src) {
                        const srcFilename = src.split('/').pop();
                        let matchedUrl: string | undefined;

                        if (imagePathMap.has(src)) matchedUrl = imagePathMap.get(src);
                        else if (srcFilename && imagePathMap.has(srcFilename)) matchedUrl = imagePathMap.get(srcFilename);

                        if (matchedUrl) {
                            img.setAttribute('src', matchedUrl);
                            const imgObj = images.find(i => i.url === matchedUrl);
                            if (imgObj) {
                                img.setAttribute('data-image-id', imgObj.id);
                            }
                        }
                    }
                });

                const title = chapterDoc.querySelector('title')?.textContent?.trim() ||
                    chapterDoc.querySelector('h1')?.textContent?.trim() ||
                    chapterDoc.querySelector('h2')?.textContent?.trim() ||
                    `Chapter ${i + 1}`;

                let markdown = '';

                editor.update(() => {
                    const root = $getRoot();
                    root.clear();
                    const lexicalNodes = $generateNodesFromDOM(editor, chapterDoc);

                    // RootNode only accepts ElementNode or DecoratorNode.
                    // We must wrap TextNodes (and other inline nodes) in a ParagraphNode.
                    const childrenToAppend = [];
                    let currentParagraph = null;

                    for (const node of lexicalNodes) {
                        const isBlock = $isElementNode(node) || $isDecoratorNode(node);

                        if (isBlock) {
                            if (currentParagraph) {
                                childrenToAppend.push(currentParagraph);
                                currentParagraph = null;
                            }
                            childrenToAppend.push(node);
                        } else {
                            if (!currentParagraph) {
                                currentParagraph = $createParagraphNode();
                            }
                            currentParagraph.append(node);
                        }
                    }

                    if (currentParagraph) {
                        childrenToAppend.push(currentParagraph);
                    }

                    root.append(...childrenToAppend);
                }, { discrete: true });

                // Read the state synchronously (since discrete:true processes updates immediately)
                editor.getEditorState().read(() => {
                    markdown = $convertToMarkdownString(PLAYGROUND_TRANSFORMERS, undefined, true);
                });

                chapters.push({
                    id: `chapter-${Date.now()}-${i}`,
                    title,
                    content: markdown,
                    html: chapterDoc.body.innerHTML,
                    order: i
                });
            }
        }
    }

    // 4. Style
    const style: EpubStyle = {
        fontSize: 16,
        indentation: true,
        lineHeight: 160,
        paragraphSpacing: 50,
        margin: { top: 5, bottom: 5, left: 5, right: 5 }
    };

    return { metadata, chapters, style, images };
};

const parseMetadata = (opfDoc: Document): EpubMetadata => {
    const getText = (tag: string) => {
        return opfDoc.querySelector(`metadata > dc\\:${tag}`)?.textContent ||
            opfDoc.querySelector(`metadata > ${tag}`)?.textContent || '';
    };

    return {
        title: getText('title') || 'Untitled',
        author: getText('creator') || 'Unknown',
        language: getText('language') || 'ko',
        publisher: getText('publisher'),
        description: getText('description'),
        isbn: opfDoc.querySelector('dc\\:identifier[id="isbn"]')?.textContent || undefined,
        publicationDate: getText('date') || new Date().toISOString().split('T')[0]
    };
};

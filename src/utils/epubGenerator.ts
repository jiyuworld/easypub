import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { EpubMetadata, EpubStyle, Chapter, ImageItem } from '../types';
import { generateStylesheet } from './styleGenerator';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const generateEpub = async (
  metadata: EpubMetadata,
  style: EpubStyle,
  chapters: Chapter[],
  images: ImageItem[]
): Promise<void> => {
  const zip = new JSZip();
  const uuid = generateUUID();

  // mimetype
  zip.file('mimetype', 'application/epub+zip');

  // META-INF/container.xml
  zip.folder('META-INF')?.file(
    'container.xml',
    `<?xml version="1.0"?>
    <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
    <rootfiles>
      <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
    </rootfiles>
    </container>`
  );

  const oebps = zip.folder('OEBPS');
  if (!oebps) return;

  // Images
  if (images && images.length > 0) {
    const imagesFolder = oebps.folder('images');
    if (imagesFolder) {
      images.forEach(image => {
        const extension = image.blob.type.split('/')[1];
        imagesFolder.file(`${image.id}.${extension}`, image.blob);
      });
    }
  }

  // Generate content.opf
  const contentOpf = generateContentOpf(metadata, uuid, chapters, images);
  oebps.file('content.opf', contentOpf);

  // Generate toc.ncx
  const tocNcx = generateTocNcx(metadata, uuid, chapters);
  oebps.file('toc.ncx', tocNcx);

  // Generate nav.xhtml
  const navXhtml = generateNavXhtml(chapters);
  oebps.file('nav.xhtml', navXhtml);

  // stylesheet
  const stylesheet = generateStylesheet(style);
  oebps.file('stylesheet.css', stylesheet);

  // Cover Image and cover.xhtml
  if (metadata.coverImage) {
    console.log(metadata.coverImage);

    const coverData = metadata.coverImage.split(',')[1]; // Remove data:image/jpeg;base64,
    const extension = metadata.coverImage.split(';')[0].split('/')[1];
    oebps.folder('images')?.file(`cover.${extension}`, coverData, { base64: true });

    // Generate cover.xhtml
    const coverXhtml = generateCoverXhtml(extension);
    oebps.file('cover.xhtml', coverXhtml);
  }

  // chapters
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterHtml = await generateChapterHtml(chapter, images);
    oebps.file(`chapter${i + 1}.xhtml`, chapterHtml);
  }

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  const filename = `${metadata.title.replace(/[\/\\:*?"<>|]/g, '')}.epub`;
  saveAs(blob, filename);
};

const generateContentOpf = (
  metadata: EpubMetadata,
  uuid: string,
  chapters: Chapter[],
  images: ImageItem[]
) => {
  let coverExtension = '';
  if (metadata.coverImage) {
    coverExtension = metadata.coverImage.split(';')[0].split('/')[1];
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
  <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0">
    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:title>${escapeXml(metadata.title)}</dc:title>
      <dc:creator>${escapeXml(metadata.author)}</dc:creator>
      <dc:language>${metadata.language}</dc:language>
      <dc:identifier id="BookId">urn:uuid:${uuid}</dc:identifier>
      <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
      ${metadata.coverImage ? '<meta name="cover" content="cover-image" />' : ''}
    </metadata>
    <manifest>
      <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
      <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
      <item id="style" href="stylesheet.css" media-type="text/css"/>
      ${metadata.coverImage ? `<item id="cover-image" href="images/cover.${coverExtension}" media-type="image/${coverExtension}" properties="cover-image"/>` : ''}
      ${metadata.coverImage ? `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>` : ''}
      ${images.map(img => {
    const extension = img.blob.type.split('/')[1];
    return `<item id="${img.id}" href="images/${img.id}.${extension}" media-type="${img.blob.type}"/>`;
  }).join('\n    ')}
      ${chapters.map((_, i) => `<item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
    </manifest>
    <spine toc="toc">
      ${metadata.coverImage ? `<itemref idref="cover"/>` : ''}
      <itemref idref="nav"/>
      ${chapters.map((_, i) => `<itemref idref="chapter${i + 1}"/>`).join('\n    ')}
    </spine>
  </package>`;
};

const generateTocNcx = (
  metadata: EpubMetadata,
  uuid: string,
  chapters: Chapter[]
) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
    <head>
      <meta name="dtb:uid" content="urn:uuid:${uuid}"/>
      <meta name="dtb:depth" content="1"/>
      <meta name="dtb:totalPageCount" content="0"/>
      <meta name="dtb:maxPageNumber" content="0"/>
    </head>
    <docTitle>
      <text>${escapeXml(metadata.title)}</text>
    </docTitle>
    <navMap>
      ${chapters.map((chapter, i) => `
        <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
          <navLabel>
            <text>${escapeXml(chapter.title || `Chapter ${i + 1}`)}</text>
          </navLabel>
          <content src="chapter${i + 1}.xhtml"/>
        </navPoint>`).join('')}
    </navMap>
  </ncx>`;
};

const generateNavXhtml = (chapters: Chapter[]) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
      <title>nav</title>
    </head>
    <body>
      <nav epub:type="toc" id="toc">
        <h1>목차</h1>
        <ol>
          ${chapters.map((chapter, i) => `<li><a href="chapter${i + 1}.xhtml">${escapeXml(chapter.title || `Chapter ${i + 1}`)}</a></li>`).join('\n      ')}
        </ol>
      </nav>
    </body>
  </html>`;
};



const generateCoverXhtml = (extension: string) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <title></title>
      <style>
        body {
          margin: 0;
          padding: 0;
          text-align: center;
        }
        img {
          max-width: 100%;
          max-height: 100vh;
          margin: 0;
        }
      </style>
    </head>
    <body>
      <img src="images/cover.${extension}" alt="Cover Image"/>
    </body>
  </html>`;
};

const generateChapterHtml = async (chapter: Chapter, images: ImageItem[]) => {
  let content = chapter.html || '';

  if (images && images.length > 0) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const imgTags = doc.querySelectorAll('img');

    let modified = false;
    imgTags.forEach(img => {
      const imageId = img.getAttribute('data-image-id');
      if (imageId) {
        const image = images.find(i => i.id === imageId);
        if (image) {
          const extension = image.blob.type.split('/')[1];
          img.setAttribute('src', `images/${image.id}.${extension}`);
          img.removeAttribute('data-image-id');
          modified = true;
        }
      }
    });

    if (modified) {
      const serializer = new XMLSerializer();
      content = Array.from(doc.body.childNodes)
        .map(node => serializer.serializeToString(node))
        .join('');
    }
  }

  content = content.replace(/<br>/g, '<br/>');

  return `<?xml version="1.0" encoding="utf-8"?>
  <!DOCTYPE html>
  <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
    <head>
      <title></title>
      <link rel="stylesheet" type="text/css" href="stylesheet.css"/>
    </head>
    <body>
      ${content}
    </body>
  </html>`;
};

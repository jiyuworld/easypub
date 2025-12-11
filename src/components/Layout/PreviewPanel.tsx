import React, { useEffect, useRef } from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './PreviewPanel.module.css';
import { X } from 'lucide-react';

export const PreviewPanel: React.FC = () => {
    const { previewSettings, setPreviewSettings, chapters, currentChapterId, style } = useEpub();
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const currentChapter = chapters.find((ch) => ch.id === currentChapterId);

    const handleClose = () => {
        setPreviewSettings({ ...previewSettings, visible: false });
    };

    const updatePreview = async () => {
        if (!iframeRef.current || !currentChapter) return;

        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        let content = currentChapter.html || '';

        const cssContent = `
            body {
                font-size: ${style.fontSize}px;
                line-height: ${style.lineHeight / 100};
                padding: ${style.margin.top}% ${style.margin.right}% ${style.margin.bottom}% ${style.margin.left}%;
                word-break: break-all;
            }
            ol {
                list-style-type: none;
            }
            blockquote {
                border-left: 0.2em solid gray;
                margin-left: 1em;
                padding-left: 1em;
            }
            blockquote p {
                text-indent: 0;
            }
            p {
                margin: 0;
                margin-bottom: ${style.paragraphSpacing / 100}em;
                text-indent: ${style.indentation ? '2em' : '0'};
            }
            h1 {
                font-size: 1.5em;
            }
            h2 {
                font-size: 1.25em;
            }
            h3 {
                font-size: 1.125em;
            }
            h4 {
                font-size: 1em;
            }
            img {
                max-width: 100%;
                text-align: center;
            }
            pre {
                border: 1px solid gray;
                word-wrap: break-word;
                padding: 0.5em;
            }
            code {
                background-color: #f8f8f8;
            }
            table, th, td {
                border: 1px solid;
            }
            th, td {
                padding: 0.2em;
                vertical-align: middle;
            }`;

        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <style>${cssContent}</style>
                </head>
                <body>${content}</body>
            </html>`);
        doc.close();
    };

    useEffect(() => {
        if (previewSettings.visible) {
            updatePreview();
        }
    }, [currentChapter, style, previewSettings.visible]);

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const preset = e.target.value as any;
        let width = 375;
        let height = 667;

        switch (preset) {
            case 'palma2':
                width = 335;
                height = 670;
                break;
        }

        setPreviewSettings({ ...previewSettings, preset, width, height });
    };

    if (!previewSettings.visible) return null;

    return (
        <div className={`${styles.panel} ${previewSettings.visible ? styles.visible : ''}`}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <span className={styles.title}>Preview</span>
                    <div className={styles.controls}>
                        <select
                            className={styles.select}
                            value={previewSettings.preset}
                            onChange={handlePresetChange}
                        >
                            <option value="palma2">Palma2</option>
                        </select>
                    </div>
                </div>
                <button className={styles.closeButton} onClick={handleClose}>
                    <X size={20} />
                </button>
            </div>
            <div className={styles.previewContainer}>
                <div
                    className={styles.frameWrapper}
                    style={{
                        width: previewSettings.width,
                        height: previewSettings.height,
                    }}
                >
                    <iframe ref={iframeRef} className={styles.frame} title="Preview" />
                </div>
            </div>
        </div>
    );
};

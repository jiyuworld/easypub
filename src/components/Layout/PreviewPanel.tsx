import React, { useEffect, useRef } from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './PreviewPanel.module.css';
import { X } from 'lucide-react';
import { generateStylesheet } from '../../utils/styleGenerator';

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

        const cssContent = generateStylesheet(style);

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

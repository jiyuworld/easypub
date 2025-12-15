import React from 'react';
import { Menu, Eye, EyeOff, Download } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import { generateEpub } from '../../utils/epubGenerator';
import styles from './Header.module.css';

export const Header: React.FC = () => {
    const {
        sidebarOpen,
        setSidebarOpen,
        previewSettings,
        setPreviewSettings,
        metadata,
        style,
        chapters,
        images,
    } = useEpub();

    const handleExport = async () => {
        try {
            await generateEpub(metadata, style, chapters, images);
        } catch (error) {
            console.error('Failed to generate EPUB:', error);
            alert('EPUB 생성에 실패했습니다.');
        }
    };

    const togglePreview = () => {
        setPreviewSettings({
            ...previewSettings,
            visible: !previewSettings.visible,
        });
    };

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <button
                    className={styles.menuButton}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>
                <h1><span className={styles.title}>EasyPub</span><span style={{ fontSize: 'var(--font-size-2xl)' }}>🪽</span></h1>
            </div>

            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.previewButton} ${previewSettings.visible ? styles.active : ''}`}
                    onClick={togglePreview}
                >
                    {previewSettings.visible ? <EyeOff size={20} /> : <Eye size={20} />}
                    <span className={styles.buttonText}>
                        챕터 미리보기
                    </span>
                </button>

                <button className={`${styles.button} ${styles.exportButton}`} onClick={handleExport}>
                    <Download size={20} />
                    <span className={styles.buttonText}>EPUB</span>
                </button>
            </div>
        </header>
    );
};

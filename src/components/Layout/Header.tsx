import React from 'react';
import { Menu, Eye, EyeOff, Download, FolderOpen } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import { generateEpub } from '../../utils/epubGenerator';
import { parseEpub } from '../../utils/epubParser';
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
        loadEpub,
    } = useEpub();

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const data = await parseEpub(file);
            loadEpub(data);
        } catch (error) {
            console.error('Failed to import EPUB:', error);
            alert('EPUB 불러오기에 실패했습니다.');
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

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
                <input
                    type="file"
                    accept=".epub"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <button className={`${styles.button} ${styles.exportButton}`} onClick={handleImportClick}>
                    <FolderOpen size={20} />
                    <span className={styles.buttonText}>불러오기</span>
                </button>
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
        </header >
    );
};

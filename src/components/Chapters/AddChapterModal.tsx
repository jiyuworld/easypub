import React, { useRef } from 'react';
import { X, FilePlus, Upload } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import styles from './AddChapterModal.module.css';

interface AddChapterModalProps {
    onClose: () => void;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({ onClose }) => {
    const { addChapter } = useEpub();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleNewChapter = () => {
        addChapter({
            title: '제목',
            content: '',
            html: '',
        });
        onClose();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            let content = event.target?.result as string;

            // Remove invalid control characters (keep newlines and tabs)
            content = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

            // If it's a text file, escape MDX special characters
            if (file.name.endsWith('.txt')) {
                content = content
                    .replace(/</g, '&lt;')
                    .replace(/{/g, '\\{')
                    .replace(/}/g, '\\}');
            }

            addChapter({
                title: file.name.replace(/\.(txt|md)$/, ''),
                content: content,
                html: '',
            });
            onClose();
        };
        reader.readAsText(file);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>챕터 추가</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.content}>
                    <div className={styles.options}>
                        <div className={styles.optionCard} onClick={handleNewChapter}>
                            <FilePlus size={32} className={styles.icon} />
                            <span className={styles.optionTitle}>빈 페이지</span>
                            <span className={styles.optionDesc}>새로운 페이지를 추가합니다</span>
                        </div>

                        <div
                            className={styles.optionCard}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} className={styles.icon} />
                            <span className={styles.optionTitle}>파일 업로드</span>
                            <span className={styles.optionDesc}>텍스트(.txt) / 마크다운(.md) 파일</span>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className={styles.fileInput}
                                accept=".txt,.md"
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

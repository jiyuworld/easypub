import React, { useRef, useEffect, useState } from 'react';
import { X, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import styles from './ImageManagerModal.module.css';

interface ImageManagerModalProps {
    onClose: () => void;
}

const ImagePreview: React.FC<{ blob: Blob; className: string }> = ({ blob, className }) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [blob]);

    if (!previewUrl) return null;

    return <img src={previewUrl} className={className} />;
};

export const ImageManagerModal: React.FC<ImageManagerModalProps> = ({ onClose }) => {
    const { images, addImage, deleteImage } = useEpub();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            addImage(file);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>이미지 관리</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {images.length === 0 ? (
                        <div className={styles.emptyState}>
                            <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>등록된 이미지가 없습니다.</p>
                        </div>
                    ) : (
                        <div className={styles.imageList}>
                            {images.map((image) => (
                                <div key={image.id} className={styles.imageItem}>
                                    <ImagePreview
                                        blob={image.blob}
                                        className={styles.imagePreview}
                                    />
                                    <button
                                        className={styles.deleteButton}
                                        onClick={() => deleteImage(image.id)}
                                        aria-label="Delete image"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className={styles.hiddenInput}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <button className={styles.addButton} onClick={handleAddClick}>
                        <Plus size={18} />
                        이미지 추가
                    </button>
                </div>
            </div>
        </div>
    );
};

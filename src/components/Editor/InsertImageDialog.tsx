import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Plus } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import styles from './InsertImageDialog.module.css';

interface InsertImageDialogProps {
    onClose: () => void;
    onInsert: (payload: { src: string; altText: string; imageId: string }) => void;
}

export const InsertImageDialog: React.FC<InsertImageDialogProps> = ({ onClose, onInsert }) => {
    const { images, addImage } = useEpub();
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [altText, setAltText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prevImagesLengthRef = useRef(images.length);

    useEffect(() => {
        if (images.length > prevImagesLengthRef.current) {
            const newImage = images[images.length - 1];
            setSelectedImageId(newImage.id);
        }
        prevImagesLengthRef.current = images.length;
    }, [images]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('이미지 파일만 업로드 가능합니다.');
                return;
            }
            addImage(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleInsert = () => {
        if (selectedImageId) {
            const image = images.find(img => img.id === selectedImageId);
            if (image) {
                onInsert({
                    src: image.url,
                    altText,
                    imageId: selectedImageId
                });
                onClose();
            }
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>이미지 삽입</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    {images.length === 0 ? (
                        <div className={styles.emptyState}>
                            <ImageIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <p>사용 가능한 이미지가 없습니다.</p>
                            <p className={styles.emptyHint}>이미지를 업로드하여 추가해주세요.</p>
                        </div>
                    ) : (
                        <div className={styles.imageList}>
                            {images.map((image) => (
                                <div
                                    key={image.id}
                                    className={`${styles.imageItem} ${selectedImageId === image.id ? styles.selected : ''}`}
                                    onClick={() => setSelectedImageId(image.id)}
                                >
                                    <img
                                        src={URL.createObjectURL(image.blob)}
                                        alt={`Image ${image.id}`}
                                        className={styles.imagePreview}
                                        onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                                    />
                                    {selectedImageId === image.id && <div className={styles.checkMark}>✓</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="altText" className={styles.label}>대체 텍스트 (Alt Text)</label>
                        <input
                            id="altText"
                            type="text"
                            className={styles.input}
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            placeholder="이미지 설명을 입력하세요"
                        />
                    </div>
                    <div className={styles.buttonGroup}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className={styles.hiddenInput}
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <button className={styles.uploadButton} onClick={handleUploadClick}>
                            <Plus size={18} />
                            이미지 업로드
                        </button>
                        <button
                            className={styles.insertButton}
                            onClick={handleInsert}
                            disabled={!selectedImageId}
                        >
                            삽입
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

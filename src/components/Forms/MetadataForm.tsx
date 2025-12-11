import React from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './Form.module.css';

export const MetadataForm: React.FC = () => {
    const { metadata, setMetadata } = useEpub();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setMetadata({ ...metadata, [name]: value });
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.formGroup}>
                <label className={styles.label}>제목</label>
                <input
                    type="text"
                    name="title"
                    className={styles.input}
                    value={metadata.title}
                    onChange={handleChange}
                    placeholder="책 제목"
                />
            </div>

            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>저자</label>
                        <input
                            type="text"
                            name="author"
                            className={styles.input}
                            value={metadata.author}
                            onChange={handleChange}
                            placeholder="저자"
                        />
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>언어</label>
                        <select
                            name="language"
                            className={styles.select}
                            value={metadata.language}
                            onChange={handleChange}
                        >
                            <option value="ko">한국어</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>설명</label>
                <textarea
                    name="description"
                    className={styles.textarea}
                    value={metadata.description}
                    onChange={handleChange}
                    placeholder="책 설명..."
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>표지 이미지</label>
                <input
                    type="file"
                    accept="image/*"
                    className={styles.input}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                setMetadata({ ...metadata, coverImage: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                        }
                    }}
                />
                {metadata.coverImage && (
                    <div style={{ marginTop: '10px' }}>
                        <img
                            src={metadata.coverImage}
                            alt="Cover Preview"
                            style={{ maxWidth: '200px', maxHeight: '300px', objectFit: 'contain' }}
                        />
                        <button
                            type="button"
                            onClick={() => setMetadata({ ...metadata, coverImage: undefined })}
                            style={{ display: 'block', marginTop: '5px', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}
                        >
                            삭제
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>출판사</label>
                        <input
                            type="text"
                            name="publisher"
                            className={styles.input}
                            value={metadata.publisher}
                            onChange={handleChange}
                            placeholder="출판사"
                        />
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>출판일자</label>
                        <input
                            type="date"
                            name="publicationDate"
                            className={styles.input}
                            value={metadata.publicationDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

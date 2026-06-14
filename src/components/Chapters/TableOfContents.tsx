import React from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './TableOfContents.module.css';

export const TableOfContents: React.FC = () => {
    const { chapters, setCurrentChapterId, setViewMode, style, metadata, setMetadata } = useEpub();

    const handleChapterClick = (chapterId: string) => {
        setCurrentChapterId(chapterId);
        setViewMode('editor');
    };

    return (
        <div
            className={styles.container}
            style={{
                fontSize: `${style.fontSize}px`,
                lineHeight: style.lineHeight / 100,
                padding: `${style.margin.top}% ${style.margin.right}% ${style.margin.bottom}% ${style.margin.left}%`,
            }}
        >
            <label className={styles.tocOptionCard} htmlFor="includeToc">
                <input
                    type="checkbox"
                    id="includeToc"
                    className={styles.tocOptionCheckbox}
                    checked={metadata.includeToc}
                    onChange={(e) => setMetadata({ ...metadata, includeToc: e.target.checked })}
                />
                <div className={styles.tocOptionBody}>
                    <span className={styles.tocOptionTitle}>목차 페이지 자동 생성</span>
                    <span className={styles.tocOptionDescription}>
                        체크 시 EPUB에 챕터 목록이 담긴 목차 페이지가 포함됩니다.
                    </span>
                </div>
            </label>
            <h1 className={styles.title}>목차</h1>
            <ol className={styles.tocList}>
                {chapters.length === 0 ? (
                    <p className={styles.emptyText}>챕터를 추가해 주세요</p>
                ) : (
                    chapters.map((chapter) => (
                        <li
                            key={chapter.id}
                            className={styles.tocItem}
                            onClick={() => handleChapterClick(chapter.id)}
                            style={{
                                marginBottom: `${style.paragraphSpacing / 100}em`,
                            }}
                        >
                            {chapter.title || 'Untitled Chapter'}
                        </li>
                    ))
                )}
            </ol>
        </div>
    );
};

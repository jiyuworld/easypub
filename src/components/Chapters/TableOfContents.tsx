import React from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './TableOfContents.module.css';

export const TableOfContents: React.FC = () => {
    const { chapters, setCurrentChapterId, setViewMode, style } = useEpub();

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
            <div className={styles.notificationMessage}>
                챕터를 추가하시면 목차가 자동으로 생성됩니다
            </div>
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

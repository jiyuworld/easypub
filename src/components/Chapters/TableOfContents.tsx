import React from 'react';
import { useEpub } from '../../context/EpubContext';
import type { TocListStyle } from '../../types';
import styles from './TableOfContents.module.css';

const TOC_LIST_STYLE_OPTIONS: { value: TocListStyle; label: string; description: string }[] = [
    { value: 'number', label: '번호', description: '1. 2. 3. 숫자 매기기' },
    { value: 'bullet', label: '글머리 기호', description: '• 동그라미 점' },
    { value: 'none', label: '없음', description: '표시 없음' },
];

const listStyleTypeFor = (tocListStyle: TocListStyle): string => {
    switch (tocListStyle) {
        case 'bullet':
            return 'disc';
        case 'none':
            return 'none';
        case 'number':
        default:
            return 'decimal';
    }
};

export const TableOfContents: React.FC = () => {
    const { chapters, setCurrentChapterId, setViewMode, style, metadata, setMetadata } = useEpub();

    const handleChapterClick = (chapterId: string) => {
        setCurrentChapterId(chapterId);
        setViewMode('editor');
    };

    const listStyleType = listStyleTypeFor(metadata.tocListStyle);

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
            <div
                className={`${styles.tocStyleSection}${metadata.includeToc ? '' : ` ${styles.tocStyleSectionDisabled}`}`}
            >
                <span className={styles.tocStyleLabel}>목차 표시 스타일</span>
                <div className={styles.tocStyleOptions}>
                    {TOC_LIST_STYLE_OPTIONS.map((option) => (
                        <label
                            key={option.value}
                            className={styles.tocStyleOption}
                            title={option.description}
                        >
                            <input
                                type="radio"
                                name="tocListStyle"
                                className={styles.tocStyleRadio}
                                value={option.value}
                                checked={metadata.tocListStyle === option.value}
                                onChange={() => setMetadata({ ...metadata, tocListStyle: option.value })}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
            </div>
            <h1 className={styles.title}>목차</h1>
            <ol
                className={styles.tocList}
                style={{
                    listStyleType,
                    paddingLeft: listStyleType === 'none' ? 0 : '1.5em',
                }}
            >
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

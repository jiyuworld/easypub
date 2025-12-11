import React from 'react';
import { useEpub } from '../../context/EpubContext';
import styles from './Form.module.css';

export const StyleForm: React.FC = () => {
    const { style, setStyle } = useEpub();

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : type === 'number'
                ? Number(value)
                : value;

        if (name.startsWith('margin.')) {
            const marginKey = name.split('.')[1];
            setStyle({
                ...style,
                margin: {
                    ...style.margin,
                    [marginKey]: newValue,
                },
            });
            return;
        }

        setStyle({ ...style, [name]: newValue });
    };

    return (
        <div className={styles.formContainer}>
            <div className={styles.row}>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>폰트 크기 (px)</label>
                        <input
                            type="number"
                            name="fontSize"
                            className={styles.input}
                            value={style.fontSize}
                            onChange={handleChange}
                            min="12"
                            max="24"
                        />
                    </div>
                </div>
                <div className={styles.col}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>줄 간격 (%)</label>
                        <input
                            type="number"
                            name="lineHeight"
                            className={styles.input}
                            value={style.lineHeight}
                            onChange={handleChange}
                            min="100"
                            max="300"
                            step="10"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>문단 간격 (%)</label>
                <input
                    type="number"
                    name="paragraphSpacing"
                    className={styles.input}
                    value={style.paragraphSpacing}
                    onChange={handleChange}
                    min="0"
                    max="200"
                    step="10"
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>여백 (%)</label>
                <div className={styles.row}>
                    <div className={styles.col}>
                        <label className={styles.label} style={{ fontSize: '0.8em' }}>상</label>
                        <input
                            type="number"
                            name="margin.top"
                            className={styles.input}
                            value={style.margin.top}
                            onChange={handleChange}
                            min="0"
                            max="20"
                        />
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label} style={{ fontSize: '0.8em' }}>하</label>
                        <input
                            type="number"
                            name="margin.bottom"
                            className={styles.input}
                            value={style.margin.bottom}
                            onChange={handleChange}
                            min="0"
                            max="20"
                        />
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label} style={{ fontSize: '0.8em' }}>좌</label>
                        <input
                            type="number"
                            name="margin.left"
                            className={styles.input}
                            value={style.margin.left}
                            onChange={handleChange}
                            min="0"
                            max="20"
                        />
                    </div>
                    <div className={styles.col}>
                        <label className={styles.label} style={{ fontSize: '0.8em' }}>우</label>
                        <input
                            type="number"
                            name="margin.right"
                            className={styles.input}
                            value={style.margin.right}
                            onChange={handleChange}
                            min="0"
                            max="20"
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.checkboxGroup}>
                    <input
                        type="checkbox"
                        name="indentation"
                        id="indentation"
                        className={styles.checkbox}
                        checked={style.indentation}
                        onChange={handleChange}
                    />
                    <label htmlFor="indentation" className={styles.label} style={{ marginBottom: 0 }}>
                        들여쓰기
                    </label>
                </div>
            </div>

            <div className={styles.previewBox}>
                <div className={styles.previewTitle}>Preview</div>
                <div
                    className={styles.previewContent}
                    style={{
                        fontSize: `${style.fontSize}px`,
                        lineHeight: style.lineHeight / 100,
                        padding: `${style.margin.top}% ${style.margin.right}% ${style.margin.bottom}% ${style.margin.left}%`,
                    }}
                >
                    <p style={{ textIndent: style.indentation ? '2em' : '0', marginBottom: `${style.paragraphSpacing / 100}em` }}>
                        Freedom is indivisible. As soon as one starts to restrict it, one enters upon a decline on which it is difficult to stop.
                    </p>
                    <p style={{ textAlign: "right", marginBottom: `${style.paragraphSpacing / 100}em` }}>- Ludwig von Mises</p>
                    <p style={{ textIndent: style.indentation ? '2em' : '0', marginBottom: `${style.paragraphSpacing / 100}em` }}>
                        자유는 나눌 수 없습니다. 자유를 제한하기 시작하자마자 멈추기 어려운 쇠퇴에 빠지게 됩니다.
                    </p>
                    <p style={{ textAlign: "right", marginBottom: `${style.paragraphSpacing / 100}em` }}>- 루트비히 폰 미제스</p>
                </div>
            </div>
        </div>
    );
};

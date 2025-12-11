import React from 'react';
import styles from './ConfirmModal.module.css';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttons}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

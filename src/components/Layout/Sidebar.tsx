import React, { useState } from 'react';
import { BookText, BookOpenText, GripVertical, Trash2, Plus, List, X, Image as ImageIcon } from 'lucide-react';
import { useEpub } from '../../context/EpubContext';
import { AddChapterModal } from '../Chapters/AddChapterModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { ImageManagerModal } from '../ImageManager/ImageManagerModal';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
    const {
        chapters,
        currentChapterId,
        setCurrentChapterId,
        deleteChapter,
        sidebarOpen,
        setSidebarOpen,
        viewMode,
        setViewMode,
        reorderChapters,
    } = useEpub();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [draggedChapterIndex, setDraggedChapterIndex] = useState<number | null>(null);

    const handleChapterClick = (id: string) => {
        setCurrentChapterId(id);
        setViewMode('editor');
    };

    const handleDeleteChapter = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCurrentChapterId(null);
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            deleteChapter(deleteConfirmId);
            setDeleteConfirmId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirmId(null);
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedChapterIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedChapterIndex === null || draggedChapterIndex === dropIndex) return;

        reorderChapters(draggedChapterIndex, dropIndex);
        setDraggedChapterIndex(null);
    };

    return (
        <>
            <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.closed : ''}`}>
                <button className={styles.closeButton} onClick={() => setSidebarOpen(false)}>
                    <X size={20} />
                </button>
                <div className={styles.section}>
                    <button
                        className={`${styles.navButton} ${viewMode === 'metadata' ? styles.active : ''}`}
                        onClick={() => setViewMode('metadata')}
                    >
                        <BookText size={20} />
                        책 정보
                    </button>
                    <button
                        className={`${styles.navButton} ${viewMode === 'style' ? styles.active : ''}`}
                        onClick={() => setViewMode('style')}
                    >
                        <BookOpenText size={20} />
                        스타일
                    </button>
                    <button
                        className={`${styles.navButton} ${viewMode === 'toc' ? styles.active : ''}`}
                        onClick={() => setViewMode('toc')}
                    >
                        <List size={20} />
                        목차
                    </button>
                </div>

                <div className={styles.chaptersSection}>
                    <div className={styles.sectionTitle}>챕터</div>
                    <button className={styles.addChapterButton} onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} />
                        챕터 추가
                    </button>

                    <ul className={styles.chapterList}>
                        {chapters.map((chapter, index) => (
                            <li
                                key={chapter.id}
                                className={`${styles.chapterItem} ${currentChapterId === chapter.id && viewMode === 'editor' ? styles.active : ''
                                    } ${draggedChapterIndex === index ? styles.dragging : ''}`}
                                onClick={() => handleChapterClick(chapter.id)}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e)}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <GripVertical size={16} className={styles.dragHandle} />
                                <span className={styles.chapterTitle}>
                                    {chapter.title || 'Untitled Chapter'}
                                </span>
                                <button
                                    className={styles.deleteButton}
                                    onClick={(e) => handleDeleteChapter(e, chapter.id)}
                                    aria-label="Delete chapter"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={styles.footer}>
                    <button
                        className={styles.imageManagerButton}
                        onClick={() => setIsImageManagerOpen(true)}
                    >
                        <ImageIcon size={18} />
                        이미지 관리
                    </button>
                </div>
            </aside>

            {isAddModalOpen && <AddChapterModal onClose={() => setIsAddModalOpen(false)} />}
            {isImageManagerOpen && <ImageManagerModal onClose={() => setIsImageManagerOpen(false)} />}

            <ConfirmModal
                isOpen={deleteConfirmId !== null}
                title="챕터 삭제"
                message="이 챕터를 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
            />
        </>
    );
};

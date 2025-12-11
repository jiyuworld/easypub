import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    EpubMetadata,
    EpubStyle,
    Chapter,
    EditorMode,
    PreviewSettings,
    ViewMode,
} from '../types';

interface EpubContextType {
    // Metadata
    metadata: EpubMetadata;
    setMetadata: (metadata: EpubMetadata) => void;

    // Style
    style: EpubStyle;
    setStyle: (style: EpubStyle) => void;

    // Chapters
    chapters: Chapter[];
    addChapter: (chapter: Omit<Chapter, 'id' | 'order'>) => void;
    updateChapter: (id: string, updates: Partial<Chapter>) => void;
    deleteChapter: (id: string) => void;
    reorderChapters: (startIndex: number, endIndex: number) => void;

    // Current chapter
    currentChapterId: string | null;
    setCurrentChapterId: (id: string | null) => void;

    // Editor mode
    editorMode: EditorMode;
    setEditorMode: (mode: EditorMode) => void;

    // Preview
    previewSettings: PreviewSettings;
    setPreviewSettings: (settings: PreviewSettings) => void;

    // View mode
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;

    // Sidebar
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const EpubContext = createContext<EpubContextType | undefined>(undefined);

export const useEpub = () => {
    const context = useContext(EpubContext);
    if (!context) {
        throw new Error('useEpub must be used within EpubProvider');
    }
    return context;
};

export const EpubProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [metadata, setMetadata] = useState<EpubMetadata>({
        title: 'Untitled Book',
        author: 'Unknown Author',
        language: 'ko',
        publisher: '',
        description: '',
        isbn: '',
        publicationDate: new Date().toISOString().split('T')[0],
    });

    const [style, setStyle] = useState<EpubStyle>({
        fontSize: 16,
        indentation: true,
        lineHeight: 160,
        paragraphSpacing: 50,
        margin: {
            top: 5,
            bottom: 5,
            left: 5,
            right: 5,
        },
    });

    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>('wysiwyg');
    const [viewMode, setViewMode] = useState<ViewMode>('editor');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
        visible: false,
        width: 375,
        height: 667,
        preset: 'mobile',
    });

    const addChapter = (chapter: Omit<Chapter, 'id' | 'order'>) => {
        const newChapter: Chapter = {
            ...chapter,
            id: `chapter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            order: chapters.length,
        };
        setChapters([...chapters, newChapter]);
        setCurrentChapterId(newChapter.id);
        setViewMode('editor');
    };

    const updateChapter = (id: string, updates: Partial<Chapter>) => {
        setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, ...updates } : ch)));
    };

    const deleteChapter = (id: string) => {
        const filtered = chapters.filter((ch) => ch.id !== id);

        setChapters(filtered.map((ch, idx) => ({ ...ch, order: idx })));
        if (currentChapterId === id) {
            setCurrentChapterId(filtered.length > 0 ? filtered[0].id : null);
        }
    };

    const reorderChapters = (startIndex: number, endIndex: number) => {
        const result = Array.from(chapters);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setChapters(result.map((ch, idx) => ({ ...ch, order: idx })));
    };

    return (
        <EpubContext.Provider
            value={{
                metadata,
                setMetadata,
                style,
                setStyle,
                chapters,
                addChapter,
                updateChapter,
                deleteChapter,
                reorderChapters,
                currentChapterId,
                setCurrentChapterId,
                editorMode,
                setEditorMode,
                previewSettings,
                setPreviewSettings,
                viewMode,
                setViewMode,
                sidebarOpen,
                setSidebarOpen,
            }}
        >
            {children}
        </EpubContext.Provider>
    );
};

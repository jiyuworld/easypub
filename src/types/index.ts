// EPUB Metadata
export interface EpubMetadata {
    title: string;
    author: string;
    language: string;
    publisher?: string;
    description?: string;
    isbn?: string;
    publicationDate?: string;
    coverImage?: string;
}

// EPUB Style
export interface EpubStyle {
    fontSize: number; // in px
    indentation: boolean;
    lineHeight: number; // percentage (e.g. 160 = 160%)
    paragraphSpacing: number; // percentage of font size (e.g. 50 = 50%)
    margin: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    }; // percentage
}

// Chapter
export interface Chapter {
    id: string;
    title: string;
    content: string; // markdown
    html: string;
    order: number;
}

// Editor Mode
export type EditorMode = 'wysiwyg' | 'markdown';

// Preview Settings
export interface PreviewSettings {
    visible: boolean;
    width: number;
    height: number;
    preset: 'mobile' | 'tablet' | 'desktop' | 'custom';
}

// View Mode
export type ViewMode = 'editor' | 'metadata' | 'style' | 'toc';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEpub } from '../../context/EpubContext';
import type { Chapter } from '../../types';
import styles from './Editor.module.css';
import { useEffect } from 'react';
import { $convertToMarkdownString } from '@lexical/markdown';
import { PLAYGROUND_TRANSFORMERS } from './lexical/plugins/MarkdownTransformers';
import { ToolbarPlugin } from './lexical/plugins/ToolbarPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';

// Plugin to sync content changes
function SyncContentPlugin({ onChange }: { onChange: (content: string, html: string) => void }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const markdown = $convertToMarkdownString(
                    PLAYGROUND_TRANSFORMERS,
                    undefined,
                    true,
                );
                onChange(markdown, $generateHtmlFromNodes(editor));
            });
        });
    }, [editor, onChange]);

    return null;
}

export const Editor = ({ currentChapter }: { currentChapter: Chapter }) => {
    const { updateChapter, editorMode } =
        useEpub();

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateChapter(currentChapter.id, { title: e.target.value });
    };

    const handleContentChange = (content: string, html: string) => {
        updateChapter(currentChapter.id, { content, html });
    };

    return (
        <div className={styles.editor}>
            <div className={styles.editorHeader}>
                <input
                    type="text"
                    className={styles.titleInput}
                    value={currentChapter.title}
                    onChange={handleTitleChange}
                    placeholder="제목"
                />
            </div>

            <div className={styles.editorContent}>
                {editorMode === 'wysiwyg' ? (
                    <div className="editor-container">
                        <ToolbarPlugin />
                        <div className="editor-inner">
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable className="editor-input" />
                                }
                                placeholder={
                                    <div className="editor-placeholder">
                                        epub을 완성해 주세요
                                    </div>
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                            <HistoryPlugin />
                            <ListPlugin />
                            <TablePlugin />
                            <LinkPlugin />
                            <MarkdownShortcutPlugin />
                            <HorizontalRulePlugin />
                            <SyncContentPlugin onChange={handleContentChange} />
                        </div>
                    </div>
                ) : (
                    <div className={styles.editorWrap}>

                    </div>
                )}
            </div>
        </div>
    );
};
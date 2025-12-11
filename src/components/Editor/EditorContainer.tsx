import React from 'react';
import { useEpub } from '../../context/EpubContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { nodes } from './lexical/nodes/CustomNodes';
import { $createCodeNode } from '@lexical/code';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { PLAYGROUND_TRANSFORMERS } from './lexical/plugins/MarkdownTransformers';
import { Editor } from './Editor';
import { $createTextNode, $getRoot, createEditor } from 'lexical';
import theme from './lexical/theme/EditorTheme';
import "./lexical/lexical.css";

// Error handling
function onError(error: Error) {
    console.error(error);
}

export const EditorContainer: React.FC = () => {
    const { currentChapterId, chapters, editorMode } =
        useEpub();


    const currentChapter = chapters.find((ch) => ch.id === currentChapterId);

    if (!currentChapter) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--color-bg-primary)',
            }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: 'var(--color-text-muted)',
                    }}
                >
                    챕터를 선택하거나 추가해 주세요
                </div>
            </div>
        );
    }

    const initialConfig = {
        namespace: 'EasyPubEditor',
        onError,
        nodes,
        theme
    };

    const loadInitialContent = () => {
        const content = currentChapter.content;
        if (!content) return undefined;

        const emptyEditor = createEditor(initialConfig);
        emptyEditor.update(() => {
            const root = $getRoot();
            const codeNode = $createCodeNode('markdown');
            codeNode.append($createTextNode(currentChapter.content));
            root.clear().append(codeNode);

            if (editorMode === 'wysiwyg') {
                $convertFromMarkdownString(
                    codeNode.getTextContent(),
                    PLAYGROUND_TRANSFORMERS,
                    undefined,
                    true,
                );
            }
        }, { discrete: true });

        return emptyEditor.getEditorState()
    }

    return (
        <LexicalComposer initialConfig={{ ...initialConfig, editorState: loadInitialContent() }} key={currentChapterId}>
            <Editor currentChapter={currentChapter} />
        </LexicalComposer>
    );
};

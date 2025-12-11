import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useEffect, useState } from 'react';
import {
    $getSelection,
    $isRangeSelection,
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CAN_UNDO_COMMAND,
    CAN_REDO_COMMAND,
} from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import {
    $createHeadingNode,
    $createQuoteNode,
    type HeadingTagType,
} from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';
import styles from './ToolbarPlugin.module.css';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Quote,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Minus,
    IndentIncrease,
    IndentDecrease,
    Subscript,
    Superscript,
} from 'lucide-react';

const LowPriority = 1;

export function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
        }
    }, []);

    useEffect(() => {
        return editor.registerCommand(
            CAN_UNDO_COMMAND,
            (payload) => {
                setCanUndo(payload);
                return false;
            },
            LowPriority
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerCommand(
            CAN_REDO_COMMAND,
            (payload) => {
                setCanRedo(payload);
                return false;
            },
            LowPriority
        );
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatHeading = (headingSize: HeadingTagType) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createHeadingNode(headingSize));
            }
        });
    };

    const formatQuote = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createQuoteNode());
            }
        });
    };

    const formatCodeBlock = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $setBlocksType(selection, () => $createCodeNode());
            }
        });
    };

    const insertHorizontalRule = () => {
        editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    };

    return (
        <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
                    disabled={!canUndo}
                    className={styles.toolbarButton}
                    title="Undo"
                >
                    <Undo size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
                    disabled={!canRedo}
                    className={styles.toolbarButton}
                    title="Redo"
                >
                    <Redo size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => formatHeading('h1')}
                    className={styles.toolbarButton}
                    title="Heading 1"
                >
                    <Heading1 size={18} />
                </button>
                <button
                    onClick={() => formatHeading('h2')}
                    className={styles.toolbarButton}
                    title="Heading 2"
                >
                    <Heading2 size={18} />
                </button>
                <button
                    onClick={() => formatHeading('h3')}
                    className={styles.toolbarButton}
                    title="Heading 3"
                >
                    <Heading3 size={18} />
                </button>
                <button
                    onClick={() => formatHeading('h4')}
                    className={styles.toolbarButton}
                    title="Heading 4"
                >
                    <Heading4 size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
                    className={`${styles.toolbarButton} ${isBold ? styles.active : ''}`}
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
                    className={`${styles.toolbarButton} ${isItalic ? styles.active : ''}`}
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
                    className={`${styles.toolbarButton} ${isUnderline ? styles.active : ''}`}
                    title="Underline"
                >
                    <Underline size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
                    className={`${styles.toolbarButton} ${isStrikethrough ? styles.active : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript')}
                    className={`${styles.toolbarButton} ${isSubscript ? styles.active : ''}`}
                    title="Subscript"
                >
                    <Subscript size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript')}
                    className={`${styles.toolbarButton} ${isSuperscript ? styles.active : ''}`}
                    title="Superscript"
                >
                    <Superscript size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                    className={styles.toolbarButton}
                    title="Align Left"
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                    className={styles.toolbarButton}
                    title="Align Center"
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                    className={styles.toolbarButton}
                    title="Align Right"
                >
                    <AlignRight size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                    className={styles.toolbarButton}
                    title="Justify"
                >
                    <AlignJustify size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Decrease Indent"
                >
                    <IndentDecrease size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Increase Indent"
                >
                    <IndentIncrease size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Bullet List"
                >
                    <List size={18} />
                </button>
                <button
                    onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
                    className={styles.toolbarButton}
                    title="Numbered List"
                >
                    <ListOrdered size={18} />
                </button>
            </div>

            <div className={styles.separator} />

            <div className={styles.toolbarGroup}>
                <button
                    onClick={formatQuote}
                    className={styles.toolbarButton}
                    title="Quote"
                >
                    <Quote size={18} />
                </button>
                <button
                    onClick={formatCodeBlock}
                    className={styles.toolbarButton}
                    title="Code Block"
                >
                    <Code size={18} />
                </button>
                <button
                    onClick={insertHorizontalRule}
                    className={styles.toolbarButton}
                    title="Horizontal Rule"
                >
                    <Minus size={18} />
                </button>
            </div>
        </div>
    );
}

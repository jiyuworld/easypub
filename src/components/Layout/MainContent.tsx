import React from 'react';
import { useEpub } from '../../context/EpubContext';
import { EditorContainer } from '../Editor/EditorContainer';
import { MetadataForm } from '../Forms/MetadataForm';
import { StyleForm } from '../Forms/StyleForm';
import { TableOfContents } from '../Chapters/TableOfContents';
import styles from './MainContent.module.css';

export const MainContent: React.FC = () => {
    const { viewMode } = useEpub();

    return (
        <main className={styles.main}>
            {viewMode === 'editor' && <EditorContainer />}
            {viewMode === 'metadata' && <MetadataForm />}
            {viewMode === 'style' && <StyleForm />}
            {viewMode === 'toc' && <TableOfContents />}
        </main>
    );
};

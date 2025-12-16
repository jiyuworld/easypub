import { useEffect } from 'react';
import { EpubProvider, useEpub } from './context/EpubContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { MainContent } from './components/Layout/MainContent';
import { PreviewPanel } from './components/Layout/PreviewPanel';
import styles from './App.module.css';

const AppContent = () => {
    const { sidebarOpen, setSidebarOpen } = useEpub();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div className={styles.app}>
            <Header />
            <div className={styles.layout}>
                <Sidebar />
                <div className={styles.content}>
                    <MainContent />
                </div>
                <PreviewPanel />
                <div
                    className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />
            </div>
        </div>
    );
};

function App() {
    return (
        <EpubProvider>
            <AppContent />
        </EpubProvider>
    );
}

export default App;

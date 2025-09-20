import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { UrlList } from './components/UrlList';
import { ShortenButton } from './components/ShortenButton';
import { Statistics } from './components/Statistics';
import { useUrlManagement } from './hooks/useUrlManagement';
import { logger } from './services/logger';
import './App.css';

function AppContent() {
  const { currentTab, error, clearError } = useUrlManagement();

  const handleErrorDismiss = () => {
    clearError();
    logger.info('component', 'AppContent: Error dismissed');
  };

  logger.info('component', 'AppContent rendered');

  return (
    <div className="app">
      <div className="container">
        <Header />

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={handleErrorDismiss} className="error-close">×</button>
          </div>
        )}

        {currentTab === 'shortener' && (
          <div className="content">
            <UrlInputForm />
            <UrlList />
            <ShortenButton />
          </div>
        )}

        {currentTab === 'statistics' && <Statistics />}
      </div>
    </div>
  );
}

function App() {
  logger.info('component', 'App component initialized');

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
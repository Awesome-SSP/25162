import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { UrlForm } from './components/UrlForm';
import { Statistics } from './components/Statistics';
import { useUrlManagement } from './hooks/useUrlManagement';
import { logger } from './services/logger';
import './App.css';

function AppContent() {
  const { currentTab } = useUrlManagement();

  logger.info('component', 'AppContent rendered');

  return (
    <div className="app">
      <div className="container">
        <Header />

        {currentTab === 'shortener' && <UrlForm />}
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
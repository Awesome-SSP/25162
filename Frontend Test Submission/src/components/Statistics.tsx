import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { logger } from '../services/logger';
import './Statistics.css';

export const Statistics: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      logger.info('component', 'Loading URL statistics');
      const stats = await apiService.getAllShortUrls();
      dispatch({ type: 'SET_URL_STATISTICS', payload: stats });
      logger.info('component', `Loaded ${stats.length} URL statistics`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load statistics';
      setError(errorMessage);
      logger.error('component', `Failed to load statistics: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatistics = () => {
    loadStatistics();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (expiry?: string) => {
    if (!expiry) return 'permanent';
    
    const now = new Date();
    const expiryDate = new Date(expiry);
    
    if (expiryDate < now) return 'expired';
    
    const hoursLeft = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft < 24) return 'expiring-soon';
    
    return 'active';
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'permanent': return 'Permanent';
      case 'active': return 'Active';
      case 'expiring-soon': return 'Expiring Soon';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="statistics">
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h2>URL Statistics</h2>
        <button 
          className="refresh-button"
          onClick={refreshStatistics}
          disabled={loading}
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {state.urlStatistics.length === 0 ? (
        <div className="empty-state">
          <h3>No URLs found</h3>
          <p>Create some short URLs to see statistics here.</p>
        </div>
      ) : (
        <>
          <div className="statistics-summary">
            <div className="summary-card">
              <h3>Total URLs</h3>
              <div className="summary-number">{state.urlStatistics.length}</div>
            </div>
            <div className="summary-card">
              <h3>Total Clicks</h3>
              <div className="summary-number">
                {state.urlStatistics.reduce((sum, url) => sum + (url.totalClicks || 0), 0)}
              </div>
            </div>
            <div className="summary-card">
              <h3>Active URLs</h3>
              <div className="summary-number">
                {state.urlStatistics.filter(url => getStatusBadge(url.expiry) === 'active' || getStatusBadge(url.expiry) === 'permanent').length}
              </div>
            </div>
          </div>

          <div className="statistics-table">
            <div className="table-header">
              <div className="header-cell">Short URL</div>
              <div className="header-cell">Original URL</div>
              <div className="header-cell">Clicks</div>
              <div className="header-cell">Created</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {state.urlStatistics.map((url, index) => {
              const status = getStatusBadge(url.expiry);
              return (
                <div key={url.id || index} className="table-row">
                  <div className="table-cell">
                    <a 
                      href={url.shortLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="short-url-link"
                    >
                      {url.shortLink}
                    </a>
                  </div>
                  <div className="table-cell">
                    <div className="original-url" title={url.originalUrl}>
                      {url.originalUrl.length > 50 ? 
                        `${url.originalUrl.substring(0, 50)}...` : 
                        url.originalUrl
                      }
                    </div>
                  </div>
                  <div className="table-cell">
                    <span className="click-count">{url.totalClicks || 0}</span>
                  </div>
                  <div className="table-cell">
                    <span className="created-date">
                      {formatDate(url.createdAt)}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`status-badge ${status}`}>
                      {getStatusLabel(status)}
                    </span>
                    {url.expiry && (
                      <div className="expiry-date">
                        Expires: {formatDate(url.expiry)}
                      </div>
                    )}
                  </div>
                  <div className="table-cell">
                    <button
                      className="copy-button"
                      onClick={() => {
                        navigator.clipboard.writeText(url.shortLink);
                        logger.info('component', 'Short URL copied to clipboard');
                      }}
                      title="Copy short URL"
                    >
                      📋
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
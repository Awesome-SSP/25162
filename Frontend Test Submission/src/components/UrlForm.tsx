import React from 'react';
import { useUrlForm } from '../hooks/useUrlForm';
import { useAppContext } from '../context/AppContext';
import { logger } from '../services/logger';
import './UrlForm.css';

export const UrlForm: React.FC = () => {
  const { state } = useAppContext();
  const { 
    addUrlEntry, 
    removeUrlEntry, 
    updateUrlEntry, 
    submitUrls
  } = useUrlForm();

  const handleSubmitAll = async () => {
    logger.info('component', 'Submitting all URL entries');
    await submitUrls();
  };

  const canAddMore = state.urlEntries.length < 5;
  const canRemove = state.urlEntries.length > 1;
  const hasValidEntries = state.urlEntries.some(entry => 
    entry.longUrl.trim() && !Object.values(entry.errors).some(error => error)
  );

  return (
    <div className="url-form">
      <h2>URL Shortener</h2>
      <p className="form-description">
        Enter up to 5 URLs to shorten. Each URL can have an optional custom short code and validity period.
      </p>

      {state.error && (
        <div className="error-message global-error">
          {state.error}
        </div>
      )}

      {state.successMessage && (
        <div className="success-message">
          {state.successMessage}
        </div>
      )}

      <div className="url-entries">
        {state.urlEntries.map((entry, index) => (
          <div key={entry.id} className="url-entry">
            <div className="entry-header">
              <h3>URL {index + 1}</h3>
              {canRemove && (
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeUrlEntry(entry.id)}
                  aria-label={`Remove URL ${index + 1}`}
                >
                  ×
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor={`url-${entry.id}`}>
                Long URL <span className="required">*</span>
              </label>
              <input
                id={`url-${entry.id}`}
                type="url"
                value={entry.longUrl}
                onChange={(e) => updateUrlEntry(entry.id, 'longUrl', e.target.value)}
                placeholder="https://example.com/very/long/url"
                className={entry.errors.longUrl ? 'error' : ''}
                required
              />
              {entry.errors.longUrl && (
                <div className="error-message">{entry.errors.longUrl}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor={`custom-${entry.id}`}>Custom Short Code</label>
                <input
                  id={`custom-${entry.id}`}
                  type="text"
                  value={entry.customShortcode}
                  onChange={(e) => updateUrlEntry(entry.id, 'customShortcode', e.target.value)}
                  placeholder="my-custom-code"
                  className={entry.errors.customShortcode ? 'error' : ''}
                />
                {entry.errors.customShortcode && (
                  <div className="error-message">{entry.errors.customShortcode}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`validity-${entry.id}`}>Validity Period (minutes)</label>
                <input
                  id={`validity-${entry.id}`}
                  type="number"
                  value={entry.validityPeriod}
                  onChange={(e) => updateUrlEntry(entry.id, 'validityPeriod', e.target.value)}
                  placeholder="60"
                  min="1"
                  className={entry.errors.validityPeriod ? 'error' : ''}
                />
                {entry.errors.validityPeriod && (
                  <div className="error-message">{entry.errors.validityPeriod}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {state.shortenedUrls.length > 0 && (
        <div className="results-section">
          <h3>Shortened URLs</h3>
          {state.shortenedUrls.map((url, index) => (
            <div key={url.id || index} className="url-result">
              {url.status === 'success' ? (
                <div className="result-success">
                  <strong>Short URL:</strong>
                  <a 
                    href={url.shortLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="short-url-link"
                  >
                    {url.shortLink}
                  </a>
                  <button
                    type="button"
                    className="copy-button"
                    onClick={() => {
                      navigator.clipboard.writeText(url.shortLink);
                      logger.info('component', 'Short URL copied to clipboard');
                    }}
                  >
                    Copy
                  </button>
                  {url.expiry && (
                    <div className="result-info">
                      Valid until: {new Date(url.expiry).toLocaleString()}
                    </div>
                  )}
                </div>
              ) : url.status === 'error' ? (
                <div className="result-error">
                  <strong>Error:</strong> {url.errorMessage || 'Failed to shorten URL'}
                </div>
              ) : (
                <div className="result-pending">
                  Processing...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="form-actions">
        {canAddMore && (
          <button
            type="button"
            className="add-button"
            onClick={addUrlEntry}
          >
            + Add Another URL
          </button>
        )}

        <button
          type="button"
          className="submit-button"
          onClick={handleSubmitAll}
          disabled={state.isSubmitting || !hasValidEntries}
        >
          {state.isSubmitting ? 'Creating Short URLs...' : 'Create Short URLs'}
        </button>
      </div>

      {state.isSubmitting && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Processing your URLs...</span>
        </div>
      )}
    </div>
  );
};
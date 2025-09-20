import React, { useState } from 'react';
import './App.css';

interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortCode: string;
  validityPeriod: string;
  createdAt: Date;
}

interface FormData {
  longUrl: string;
  validityPeriod: string;
  customShortcode: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shortener' | 'statistics'>('shortener');
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [formData, setFormData] = useState<FormData>({
    longUrl: '',
    validityPeriod: '5 min',
    customShortcode: ''
  });

  const validityOptions = [
    { label: '5 min', value: '5 min' },
    { label: '20 min', value: '20 min' },
    { label: '30 min', value: '30 min' },
    { label: '30 hour', value: '30 hour' },
    { label: '1 hour', value: '1 hour' },
    { label: 'custom', value: 'custom' }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateShortCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddUrl = () => {
    if (!formData.longUrl.trim()) return;

    const newUrl: ShortenedUrl = {
      id: Date.now().toString(),
      longUrl: formData.longUrl,
      shortCode: formData.customShortcode || generateShortCode(),
      validityPeriod: formData.validityPeriod,
      createdAt: new Date()
    };

    setUrls(prev => [...prev, newUrl]);
    setFormData({
      longUrl: '',
      validityPeriod: '5 min',
      customShortcode: ''
    });
  };

  const handleRemoveUrl = (id: string) => {
    setUrls(prev => prev.filter(url => url.id !== id));
  };

  const handleShortenUrls = () => {
    // This would typically send the URLs to a backend service
    console.log('Shortening URLs:', urls);
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="logo">
            <div className="logo-icon">⚛</div>
            <span>React</span>
          </div>
          <nav className="nav">
            <button 
              className={`nav-tab ${activeTab === 'shortener' ? 'active' : ''}`}
              onClick={() => setActiveTab('shortener')}
            >
              Shortener
            </button>
            <button 
              className={`nav-tab ${activeTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveTab('statistics')}
            >
              Statistics
            </button>
          </nav>
        </div>

        {/* Main Content */}
        {activeTab === 'shortener' && (
          <div className="shortener">
            <h1 className="title">Shorten up Similiautuarily</h1>
            
            {/* URL Input */}
            <div className="url-input-section">
              <input
                type="text"
                className="url-input"
                placeholder="Long URL text URL 5 SimlIUnion"
                value={formData.longUrl}
                onChange={(e) => handleInputChange('longUrl', e.target.value)}
              />
              
              <div className="url-config">
                <div className="config-section">
                  <span className="config-label">Long URL</span>
                  <span className="config-sublabel">14x1 URL</span>
                  
                  <div className="validity-section">
                    <span className="validity-label">Optional validity validity in minutes</span>
                    <div className="validity-options">
                      {validityOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`validity-btn ${formData.validityPeriod === option.value ? 'active' : ''}`}
                          onClick={() => handleInputChange('validityPeriod', option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button className="remove-btn">Remove URL</button>
                </div>
              </div>
            </div>

            {/* Additional URL Entries */}
            {urls.map((url, index) => (
              <div key={url.id} className="url-entry">
                <div className="url-display">
                  <span className="url-text">{url.longUrl}</span>
                </div>
                
                <div className="url-config">
                  <div className="config-section">
                    <span className="config-label">Long URL</span>
                    <span className="config-sublabel">14x{index + 2} URL</span>
                    
                    <div className="validity-section">
                      <span className="validity-label">Optional validity period in minutes</span>
                      <div className="validity-options">
                        <span className="validity-selected">{url.validityPeriod}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveUrl(url.id)}
                    >
                      Remove URL
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Shortcode Input */}
            <div className="custom-shortcode">
              <input
                type="text"
                className="shortcode-input"
                placeholder="Optional custom shortcode"
                value={formData.customShortcode}
                onChange={(e) => handleInputChange('customShortcode', e.target.value)}
              />
              <button className="add-url-btn" onClick={handleAddUrl}>
                Add URL {urls.length + 1}
              </button>
            </div>

            {/* Action Button */}
            <button className="shorten-btn" onClick={handleShortenUrls}>
              Shorten URLs
            </button>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div className="statistics">
            <h1 className="title">URL Statistics</h1>
            <p>Statistics functionality would be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
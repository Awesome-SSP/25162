import React, { useState } from 'react';
import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('shortener');
  const [urlList, setUrlList] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [validity, setValidity] = useState('5 min');
  const [customCode, setCustomCode] = useState('');

  function makeShortCode() {
    let code = '';
    const letters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      code += letters[Math.floor(Math.random() * letters.length)];
    }
    return code;
  }

  function addUrl() {
    if (longUrl === '') {
      alert('Please enter a URL');
      return;
    }

    const newUrl = {
      id: Date.now(),
      url: longUrl,
      code: customCode || makeShortCode(),
      time: validity
    };

    setUrlList([...urlList, newUrl]);
    setLongUrl('');
    setCustomCode('');
  }

  function removeUrl(id) {
    const newList = urlList.filter(url => url.id !== id);
    setUrlList(newList);
  }

  function shortenAll() {
    alert('URLs shortened! (This is just a demo)');
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header with tabs */}
        <div className="header">
          <div className="logo">
            <span>⚛ React</span>
          </div>
          <div className="tabs">
            <button 
              className={currentTab === 'shortener' ? 'tab active' : 'tab'}
              onClick={() => setCurrentTab('shortener')}
            >
              Shortener
            </button>
            <button 
              className={currentTab === 'statistics' ? 'tab active' : 'tab'}
              onClick={() => setCurrentTab('statistics')}
            >
              Statistics
            </button>
          </div>
        </div>

        {/* Main content */}
        {currentTab === 'shortener' && (
          <div className="content">
            <h1>Shorten up Similiautuarily</h1>
            
            {/* URL input */}
            <input
              type="text"
              className="url-input"
              placeholder="Long URL text URL 5 SimlIUnion"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
            />
            
            {/* Options */}
            <div className="options">
              <div className="left-side">
                <p>Long URL</p>
                <p className="small">14x1 URL</p>
                
                <p>Optional validity period in minutes</p>
                <div className="time-buttons">
                  <button 
                    className={validity === '5 min' ? 'time-btn selected' : 'time-btn'}
                    onClick={() => setValidity('5 min')}
                  >
                    5 min
                  </button>
                  <button 
                    className={validity === '20 min' ? 'time-btn selected' : 'time-btn'}
                    onClick={() => setValidity('20 min')}
                  >
                    20 min
                  </button>
                  <button 
                    className={validity === '30 hour' ? 'time-btn selected' : 'time-btn'}
                    onClick={() => setValidity('30 hour')}
                  >
                    30 hour
                  </button>
                  <button 
                    className={validity === 'custom' ? 'time-btn selected' : 'time-btn'}
                    onClick={() => setValidity('custom')}
                  >
                    custom
                  </button>
                </div>
              </div>
              
              <div className="right-side">
                <button className="remove-btn">Remove URL</button>
              </div>
            </div>

            {/* Show added URLs */}
            {urlList.map((url) => (
              <div key={url.id} className="url-item">
                <div className="url-display">{url.url}</div>
                <div className="url-info">
                  <p>Long URL - {url.code}</p>
                  <p>Validity: {url.time}</p>
                  <button onClick={() => removeUrl(url.id)} className="remove-btn">
                    Remove URL
                  </button>
                </div>
              </div>
            ))}

            {/* Custom shortcode */}
            <div className="bottom-section">
              <input
                type="text"
                className="custom-input"
                placeholder="Optional custom shortcode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />
              <button className="add-btn" onClick={addUrl}>
                Add URL {urlList.length + 1}
              </button>
            </div>

            {/* Main action button */}
            <button className="main-btn" onClick={shortenAll}>
              Shorten URLs
            </button>
          </div>
        )}

        {currentTab === 'statistics' && (
          <div className="content">
            <h1>Statistics</h1>
            <p>No statistics yet!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
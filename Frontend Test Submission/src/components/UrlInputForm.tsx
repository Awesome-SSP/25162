import { useUrlForm } from '../hooks/useUrlForm';
import { logger } from '../services/logger';

const validityOptions = [
  { label: '5 min', value: '5 min' },
  { label: '20 min', value: '20 min' },
  { label: '30 hour', value: '30 hour' },
  { label: 'custom', value: 'custom' }
];

export function UrlInputForm() {
  const { formData, updateLongUrl, updateValidity, updateCustomCode, addUrl, error } = useUrlForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUrl();
    logger.info('component', 'UrlInputForm: Form submitted');
  };

  const handleLongUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateLongUrl(e.target.value);
  };

  const handleCustomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCustomCode(e.target.value);
  };

  const handleValidityClick = (validity: string) => {
    updateValidity(validity);
    logger.debug('component', `UrlInputForm: Validity changed to ${validity}`);
  };

  logger.debug('component', 'UrlInputForm component rendered');

  return (
    <form onSubmit={handleSubmit}>
      <h1>Shorten up Similiautuarily</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* URL input */}
      <input
        type="text"
        className="url-input"
        placeholder="Long URL text URL 5 SimlIUnion"
        value={formData.longUrl}
        onChange={handleLongUrlChange}
      />
      
      {/* Options */}
      <div className="options">
        <div className="left-side">
          <p>Long URL</p>
          <p className="small">14x1 URL</p>
          
          <p>Optional validity period in minutes</p>
          <div className="time-buttons">
            {validityOptions.map((option) => (
              <button 
                key={option.value}
                type="button"
                className={formData.validity === option.value ? 'time-btn selected' : 'time-btn'}
                onClick={() => handleValidityClick(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="right-side">
          <button type="button" className="remove-btn">Remove URL</button>
        </div>
      </div>

      {/* Custom shortcode */}
      <div className="bottom-section">
        <input
          type="text"
          className="custom-input"
          placeholder="Optional custom shortcode"
          value={formData.customCode}
          onChange={handleCustomCodeChange}
        />
        <button type="submit" className="add-btn">
          Add URL
        </button>
      </div>
    </form>
  );
}
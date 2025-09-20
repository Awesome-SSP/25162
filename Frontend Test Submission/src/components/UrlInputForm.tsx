import { logger } from '../services/logger';

export function UrlInputForm() {
    // This component is deprecated and not used in the main app
    // Keeping it for potential future use but commented out to avoid compilation errors
    logger.info('component', 'UrlInputForm: Component rendered (deprecated)');

    return (
        <div className="url-input-form">
            <p>This component is deprecated. Please use the main UrlForm component.</p>
        </div>
    );
}
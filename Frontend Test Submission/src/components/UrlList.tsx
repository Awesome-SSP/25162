import { useUrlManagement } from '../hooks/useUrlManagement';
import { logger } from '../services/logger';

interface UrlListProps {
    className?: string;
}

export function UrlList({ className = '' }: UrlListProps) {
    const { urlEntries, removeUrl } = useUrlManagement();

    const handleRemoveUrl = (id: string) => {
        removeUrl(id);
        logger.info('component', `UrlList: Remove URL requested for id: ${id}`);
    };

    logger.debug('component', `UrlList component rendered with ${urlEntries.length} URL entries`);

    if (urlEntries.length === 0) {
        return null;
    }

    return (
        <div className={`url-list ${className}`}>
            {urlEntries.map((entry) => (
                <div key={entry.id} className="url-item">
                    <div className="url-display">{entry.longUrl}</div>
                    <div className="url-info">
                        <p>Long URL - {entry.customShortcode || 'Auto-generated'}</p>
                        <p>Validity: {entry.validityPeriod || 'Default'} minutes</p>
                        <button
                            onClick={() => handleRemoveUrl(entry.id.toString())}
                            className="remove-btn"
                        >
                            Remove URL
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
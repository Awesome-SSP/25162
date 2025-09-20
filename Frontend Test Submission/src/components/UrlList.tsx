import { useUrlManagement } from '../hooks/useUrlManagement';
import { UrlItem } from '../context/AppContext';
import { logger } from '../services/logger';

interface UrlListProps {
    className?: string;
}

export function UrlList({ className = '' }: UrlListProps) {
    const { urlList, removeUrl } = useUrlManagement();

    const handleRemoveUrl = (id: number) => {
        removeUrl(id);
        logger.info('component', `UrlList: URL removed with id ${id}`);
    };

    logger.debug('component', `UrlList component rendered with ${urlList.length} URLs`);

    if (urlList.length === 0) {
        return null;
    }

    return (
        <div className={`url-list ${className}`}>
            {urlList.map((url: UrlItem) => (
                <div key={url.id} className="url-item">
                    <div className="url-display">{url.url}</div>
                    <div className="url-info">
                        <p>Long URL - {url.code}</p>
                        <p>Validity: {url.time}</p>
                        <button
                            onClick={() => handleRemoveUrl(url.id)}
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
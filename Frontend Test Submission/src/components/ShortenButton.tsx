import { useUrlManagement } from '../hooks/useUrlManagement';
import { logger } from '../services/logger';

interface ShortenButtonProps {
    className?: string;
}

export function ShortenButton({ className = '' }: ShortenButtonProps) {
    const { shortenUrls, isLoading, urlEntries } = useUrlManagement();

    const handleClick = () => {
        shortenUrls();
        logger.info('component', 'ShortenButton: Button clicked');
    };

    logger.debug('component', 'ShortenButton component rendered');

    return (
        <button
            className={`main-btn ${className}`}
            onClick={handleClick}
            disabled={isLoading || urlEntries.length === 0}
        >
            {isLoading ? 'Shortening...' : 'Shorten URLs'}
        </button>
    );
}
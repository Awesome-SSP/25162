import { logger } from '../services/logger';

export function Statistics() {
    logger.debug('component', 'Statistics component rendered');

    return (
        <div className="content">
            <h1>Statistics</h1>
            <p>No statistics yet!</p>
            <div className="stats-placeholder">
                <p>📊 URL Analytics coming soon...</p>
                <p>🔗 Click tracking</p>
                <p>📈 Usage metrics</p>
                <p>🗓️ Historical data</p>
            </div>
        </div>
    );
}
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/apiService';
import { logger } from '../services/logger';
import './Statistics.css';

interface ClickData {
    timestamp: string;
    source: string;
    location: string;
}

interface DetailedUrlStatistics {
    shortLink: string;
    longUrl: string;
    shortcode: string;
    createdAt: string;
    expiry: string;
    totalClicks: number;
    isExpired: boolean;
    clicks: ClickData[];
}

export const Statistics: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedUrls, setExpandedUrls] = useState<Set<string>>(new Set());
    const [detailedStats, setDetailedStats] = useState<Map<string, DetailedUrlStatistics>>(new Map());

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

    const loadDetailedStatistics = async (shortcode: string) => {
        try {
            logger.info('component', `Loading detailed statistics for: ${shortcode}`);
            const detailed = await apiService.getUrlStatistics(shortcode);
            setDetailedStats(prev => new Map(prev).set(shortcode, detailed as DetailedUrlStatistics));
            logger.info('component', `Loaded detailed stats for ${shortcode}: ${detailed.totalClicks} clicks`);
        } catch (err) {
            logger.error('component', `Failed to load detailed stats for ${shortcode}: ${err}`);
        }
    };

    const toggleExpandUrl = async (shortcode: string) => {
        const newExpanded = new Set(expandedUrls);
        if (expandedUrls.has(shortcode)) {
            newExpanded.delete(shortcode);
        } else {
            newExpanded.add(shortcode);
            // Load detailed statistics if not already loaded
            if (!detailedStats.has(shortcode)) {
                await loadDetailedStatistics(shortcode);
            }
        }
        setExpandedUrls(newExpanded);
    };

    const refreshStatistics = () => {
        loadStatistics();
        // Clear detailed stats cache
        setDetailedStats(new Map());
        setExpandedUrls(new Set());
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
                            const isExpanded = expandedUrls.has(url.shortcode);
                            const detailed = detailedStats.get(url.shortcode);

                            return (
                                <div key={url.shortcode || index} className="table-row-container">
                                    <div className="table-row">
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
                                            <div className="original-url" title={url.longUrl}>
                                                {url.longUrl.length > 50 ?
                                                    `${url.longUrl.substring(0, 50)}...` :
                                                    url.longUrl
                                                }
                                            </div>
                                        </div>
                                        <div className="table-cell">
                                            <div className="click-info">
                                                <span className="click-count">{url.totalClicks || 0}</span>
                                                {url.totalClicks > 0 && (
                                                    <button
                                                        className="expand-button"
                                                        onClick={() => toggleExpandUrl(url.shortcode)}
                                                        title={isExpanded ? "Hide click details" : "Show click details"}
                                                    >
                                                        {isExpanded ? '▼' : '▶'}
                                                    </button>
                                                )}
                                            </div>
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

                                    {/* Detailed Click Information */}
                                    {isExpanded && detailed && (
                                        <div className="click-details">
                                            <div className="click-details-header">
                                                <h4>Click Details ({detailed.totalClicks} total clicks)</h4>
                                            </div>
                                            {detailed.clicks.length > 0 ? (
                                                <div className="clicks-list">
                                                    <div className="clicks-header">
                                                        <span className="click-header-timestamp">Timestamp</span>
                                                        <span className="click-header-source">Source</span>
                                                        <span className="click-header-location">Location</span>
                                                    </div>
                                                    {detailed.clicks.map((click, clickIndex) => (
                                                        <div key={clickIndex} className="click-item">
                                                            <span className="click-timestamp">
                                                                {formatDate(click.timestamp)}
                                                            </span>
                                                            <span className="click-source">
                                                                {click.source === 'direct' ? 'Direct Access' : click.source}
                                                            </span>
                                                            <span className="click-location">
                                                                {click.location}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="no-clicks">
                                                    <p>No clicks recorded yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {isExpanded && !detailed && (
                                        <div className="click-details">
                                            <div className="loading-details">
                                                <span>Loading click details...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
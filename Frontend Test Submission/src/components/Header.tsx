import React from 'react';
import { useUrlManagement } from '../hooks/useUrlManagement';
import { logger } from '../services/logger';

interface HeaderProps {
    className?: string;
}

export function Header({ className = '' }: HeaderProps) {
    const { currentTab, switchTab } = useUrlManagement();

    const handleTabClick = (tab: 'shortener' | 'statistics') => {
        switchTab(tab);
        logger.info('component', `Header: Tab clicked - ${tab}`);
    };

    logger.debug('component', 'Header component rendered');

    return (
        <div className={`header ${className}`}>
            <div className="logo">
                <span>⚛ React</span>
            </div>
            <div className="tabs">
                <button
                    className={currentTab === 'shortener' ? 'tab active' : 'tab'}
                    onClick={() => handleTabClick('shortener')}
                >
                    Shortener
                </button>
                <button
                    className={currentTab === 'statistics' ? 'tab active' : 'tab'}
                    onClick={() => handleTabClick('statistics')}
                >
                    Statistics
                </button>
            </div>
        </div>
    );
}
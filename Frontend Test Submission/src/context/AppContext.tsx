import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { logger } from '../services/logger';
import { ShortenedUrlResponse, UrlStatistics } from '../services/apiService';

// Types for URL form entries
export interface UrlFormEntry {
    id: number;
    longUrl: string;
    validityPeriod: string;
    customShortcode: string;
    errors: {
        longUrl?: string;
        validityPeriod?: string;
        customShortcode?: string;
    };
}

// Types for shortened URLs
export interface ShortenedUrl extends ShortenedUrlResponse {
    status: 'pending' | 'success' | 'error';
    errorMessage?: string;
}

export interface AppState {
    currentTab: 'shortener' | 'statistics';
    urlEntries: UrlFormEntry[];
    shortenedUrls: ShortenedUrl[];
    urlStatistics: UrlStatistics[];
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    successMessage: string | null;
}

// Action types
type AppAction =
    | { type: 'SET_CURRENT_TAB'; payload: 'shortener' | 'statistics' }
    | { type: 'ADD_URL_ENTRY' }
    | { type: 'REMOVE_URL_ENTRY'; payload: number }
    | { type: 'UPDATE_URL_ENTRY'; payload: { id: number; field: keyof Omit<UrlFormEntry, 'id' | 'errors'>; value: string } }
    | { type: 'SET_URL_ENTRY_ERROR'; payload: { id: number; field: keyof UrlFormEntry['errors']; error?: string } }
    | { type: 'CLEAR_URL_ENTRY_ERRORS'; payload: number }
    | { type: 'SET_SHORTENED_URLS'; payload: ShortenedUrl[] }
    | { type: 'ADD_SHORTENED_URL'; payload: ShortenedUrl }
    | { type: 'UPDATE_SHORTENED_URL'; payload: { shortLink: string; updates: Partial<ShortenedUrl> } }
    | { type: 'SET_URL_STATISTICS'; payload: UrlStatistics[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SUBMITTING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_SUCCESS_MESSAGE'; payload: string | null }
    | { type: 'CLEAR_FORM' }
    | { type: 'RESET_STATE' };

// Initial state
const createInitialUrlEntry = (id: number): UrlFormEntry => ({
    id,
    longUrl: '',
    validityPeriod: '',
    customShortcode: '',
    errors: {},
});

const initialState: AppState = {
    currentTab: 'shortener',
    urlEntries: [createInitialUrlEntry(1)],
    shortenedUrls: [],
    urlStatistics: [],
    isLoading: false,
    isSubmitting: false,
    error: null,
    successMessage: null,
};
// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
    logger.debug('state', `AppContext reducer called with action: ${action.type}`);

    switch (action.type) {
        case 'SET_CURRENT_TAB':
            return { ...state, currentTab: action.payload };

        case 'ADD_URL_ENTRY':
            if (state.urlEntries.length >= 5) {
                logger.warn('state', 'Maximum 5 URL entries allowed');
                return state;
            }
            const newEntry = createInitialUrlEntry(Date.now());
            return { ...state, urlEntries: [...state.urlEntries, newEntry] };

        case 'REMOVE_URL_ENTRY':
            if (state.urlEntries.length <= 1) {
                logger.warn('state', 'Cannot remove the last URL entry');
                return state;
            }
            return {
                ...state,
                urlEntries: state.urlEntries.filter(entry => entry.id !== action.payload)
            };

        case 'UPDATE_URL_ENTRY':
            return {
                ...state,
                urlEntries: state.urlEntries.map(entry =>
                    entry.id === action.payload.id
                        ? { ...entry, [action.payload.field]: action.payload.value }
                        : entry
                )
            };

        case 'SET_URL_ENTRY_ERROR':
            return {
                ...state,
                urlEntries: state.urlEntries.map(entry =>
                    entry.id === action.payload.id
                        ? {
                            ...entry,
                            errors: {
                                ...entry.errors,
                                [action.payload.field]: action.payload.error
                            }
                        }
                        : entry
                )
            };

        case 'CLEAR_URL_ENTRY_ERRORS':
            return {
                ...state,
                urlEntries: state.urlEntries.map(entry =>
                    entry.id === action.payload
                        ? { ...entry, errors: {} }
                        : entry
                )
            };

        case 'SET_SHORTENED_URLS':
            return { ...state, shortenedUrls: action.payload };

        case 'ADD_SHORTENED_URL':
            return { ...state, shortenedUrls: [...state.shortenedUrls, action.payload] };

        case 'UPDATE_SHORTENED_URL':
            return {
                ...state,
                shortenedUrls: state.shortenedUrls.map(url =>
                    url.shortLink === action.payload.shortLink
                        ? { ...url, ...action.payload.updates }
                        : url
                )
            };

        case 'SET_URL_STATISTICS':
            return { ...state, urlStatistics: action.payload };

        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_SUBMITTING':
            return { ...state, isSubmitting: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        case 'SET_SUCCESS_MESSAGE':
            return { ...state, successMessage: action.payload };

        case 'CLEAR_FORM':
            return {
                ...state,
                urlEntries: [createInitialUrlEntry(1)],
                shortenedUrls: [],
                error: null,
                successMessage: null
            };

        case 'RESET_STATE':
            return { ...initialState };

        default:
            return state;
    }
}

// Context
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
    children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    logger.info('component', 'AppProvider initialized');

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

// Custom hook to use the context
export function useAppContext(): AppContextType {
    const context = useContext(AppContext);
    if (context === undefined) {
        const error = 'useAppContext must be used within an AppProvider';
        logger.error('hook', error);
        throw new Error(error);
    }
    return context;
}
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { logger } from '../services/logger';

// Types
export interface UrlItem {
    id: number;
    url: string;
    code: string;
    time: string;
    createdAt: Date;
}

export interface AppState {
    currentTab: 'shortener' | 'statistics';
    urlList: UrlItem[];
    longUrl: string;
    validity: string;
    customCode: string;
    isLoading: boolean;
    error: string | null;
}

// Action types
type AppAction =
    | { type: 'SET_CURRENT_TAB'; payload: 'shortener' | 'statistics' }
    | { type: 'SET_URL_LIST'; payload: UrlItem[] }
    | { type: 'ADD_URL'; payload: UrlItem }
    | { type: 'REMOVE_URL'; payload: number }
    | { type: 'SET_LONG_URL'; payload: string }
    | { type: 'SET_VALIDITY'; payload: string }
    | { type: 'SET_CUSTOM_CODE'; payload: string }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'CLEAR_FORM' };

// Initial state
const initialState: AppState = {
    currentTab: 'shortener',
    urlList: [],
    longUrl: '',
    validity: '5 min',
    customCode: '',
    isLoading: false,
    error: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
    logger.debug('state', `AppContext reducer called with action: ${action.type}`);

    switch (action.type) {
        case 'SET_CURRENT_TAB':
            return { ...state, currentTab: action.payload };
        case 'SET_URL_LIST':
            return { ...state, urlList: action.payload };
        case 'ADD_URL':
            return { ...state, urlList: [...state.urlList, action.payload] };
        case 'REMOVE_URL':
            return { ...state, urlList: state.urlList.filter(url => url.id !== action.payload) };
        case 'SET_LONG_URL':
            return { ...state, longUrl: action.payload };
        case 'SET_VALIDITY':
            return { ...state, validity: action.payload };
        case 'SET_CUSTOM_CODE':
            return { ...state, customCode: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'CLEAR_FORM':
            return { ...state, longUrl: '', customCode: '', error: null };
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
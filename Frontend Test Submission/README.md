# URL Shortener App

A well-structured React application with modern state management, custom hooks, and comprehensive logging.

## Architecture & Features

### 🏗️ **Modern React Architecture**
- **Component-based structure** - Modular, reusable components
- **Custom Hooks** - `useUrlForm`, `useUrlManagement` for logic separation
- **Context API** - Global state management with useReducer
- **Redux Toolkit** - Additional state management layer (ready for scaling)
- **TypeScript** - Type safety throughout the application

### 🔧 **State Management**
- **useState** - Local component state
- **useContext + useReducer** - Global app state with Context API
- **Redux Toolkit** - Ready for complex state management scenarios
- **Custom hooks** - Encapsulated business logic

### 📊 **Logging System**
- **Built-in logging** - Integrated from `Logging Middleware` folder
- **Frontend logging** - Proper categorization (component, hook, state, etc.)
- **Error tracking** - Comprehensive error logging and handling
- **Debug information** - Detailed component and hook lifecycle logging

## Project Structure

```
src/
├── components/           # React components
│   ├── Header.tsx       # Navigation and tabs
│   ├── UrlInputForm.tsx # URL input form with validation
│   ├── UrlList.tsx      # Display list of URLs
│   ├── ShortenButton.tsx# Main action button
│   └── Statistics.tsx   # Statistics page
├── hooks/               # Custom React hooks
│   ├── useUrlForm.ts    # Form state management
│   └── useUrlManagement.ts # URL operations
├── context/             # Context API
│   └── AppContext.tsx   # Global state management
├── store/               # Redux setup
│   ├── store.ts         # Redux store configuration
│   └── urlSlice.ts      # Redux slice for URLs
├── services/            # External services
│   └── logger.ts        # Logging service
├── App.tsx              # Main app component
├── App.css              # Application styles
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## How to run

1. **Install dependencies:**
   ```bash
   cd "Frontend Test Submission"
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

## State Management Layers

### 1. Context API (Primary)
- **AppContext** - Global state with useReducer
- **useAppContext** - Custom hook for accessing context
- **Actions** - Type-safe state updates

### 2. Custom Hooks
- **useUrlForm** - Form handling and validation
- **useUrlManagement** - URL operations and tab management

### 3. Redux (Ready for scaling)
- **urlSlice** - URL state management
- **store** - Configured with Redux Toolkit
- **Middleware** - Logging middleware integrated

## Logging Integration

The app uses the logging system from `Logging Middleware/` with:
- **Frontend package validation** - component, hook, page, state, style, etc.
- **Log levels** - debug, info, warn, error, fatal
- **Automatic categorization** - Components, hooks, and state changes logged
- **Error handling** - Network errors and validation handled gracefully

## Components & Hooks

### Components
- **Header** - Tab navigation between Shortener/Statistics
- **UrlInputForm** - Form with validation and error handling
- **UrlList** - Dynamic list of added URLs with remove functionality
- **ShortenButton** - Main action with loading states
- **Statistics** - Placeholder for analytics

### Custom Hooks
- **useUrlForm** - Manages form state, validation, and URL addition
- **useUrlManagement** - Handles URL list, tab switching, and bulk operations

## Features

✅ **Implemented:**
- Component-based architecture
- Custom hooks for logic separation
- Context API with useReducer
- Redux Toolkit setup
- Comprehensive logging
- Error handling and user feedback
- Form validation
- Loading states
- TypeScript throughout

🚀 **Ready for:**
- Backend integration
- API calls
- Advanced state management
- Testing implementation
- Performance optimization

## Tech Stack

- **React 18** with TypeScript
- **Context API** + useReducer for state
- **Redux Toolkit** for scalable state management
- **Custom Hooks** for business logic
- **Vite** for development
- **Integrated Logging** system

This architecture demonstrates modern React development practices with proper separation of concerns, type safety, and maintainable code structure.
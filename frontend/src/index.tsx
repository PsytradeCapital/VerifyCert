import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeBrowserCompatibility } from './utils/browserCompatibilityFixes';

// Initialize browser compatibility fixes
initializeBrowserCompatibility();

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App-simple';

console.log('Starting React app...');

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

console.log('Root element found, rendering app...');

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

console.log('App rendered successfully!');
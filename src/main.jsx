import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// 1. Global Styles (Tailwind + Core Scientific UI)
import './index.css';

// 2. Main Application Component (Imports App.css internally)
import App from './App.jsx';

// Mount the Working Memory Engine
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Failed to find the root element. Make sure index.html has a <div id='root'></div>");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

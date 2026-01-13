import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { LanguageProvider } from './LanguageContext'; // YENİ EKLENDİ

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <LanguageProvider> {/* YENİ EKLENDİ */}
        <App />
    </LanguageProvider> {/* YENİ EKLENDİ */}
  </React.StrictMode>
);
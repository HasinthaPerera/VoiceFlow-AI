import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize color theme accent from localStorage
const savedTheme = localStorage.getItem('voiceflow_accent_theme') || 'cosmic-purple';
const themeConfigs = {
  'cosmic-purple': { primary: '99 102 241', secondary: '168 85 247' },
  'cyberpunk-rose': { primary: '217 70 239', secondary: '236 72 153' },
  'emerald-forest': { primary: '16 185 129', secondary: '20 184 166' },
  'oceanic-cyan': { primary: '6 182 212', secondary: '59 130 246' },
  'sunset-amber': { primary: '245 158 11', secondary: '239 68 68' }
};
const config = themeConfigs[savedTheme] || themeConfigs['cosmic-purple'];
document.documentElement.style.setProperty('--color-primary-rgb', config.primary);
document.documentElement.style.setProperty('--color-secondary-rgb', config.secondary);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

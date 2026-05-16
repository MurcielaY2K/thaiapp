import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { GameProvider } from './context/GameContext';
import { App } from './App';

// Apply saved theme before first render
const savedTheme = localStorage.getItem('thaiquest:theme');
if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
);

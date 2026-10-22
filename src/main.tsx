import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

// Gracefully dismiss the initial loading splash screen once React mounts
requestAnimationFrame(() => {
  setTimeout(() => {
    const splashLoader = document.getElementById('app-splash-loader');
    if (splashLoader) {
      splashLoader.classList.add('loaded');
      setTimeout(() => {
        splashLoader.remove();
      }, 400);
    }
  }, 250);
});

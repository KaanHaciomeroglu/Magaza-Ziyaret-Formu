import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mobilde klavye açıldığında odaklanan alanı görünür alana kaydır
document.addEventListener('focusin', (e) => {
  const el = e.target;
  if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
  setTimeout(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const elRect = el.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    if (elRect.top < mainRect.top + 8 || elRect.bottom > mainRect.bottom - 20) {
      main.scrollBy({ top: elRect.top - mainRect.top - 16, behavior: 'smooth' });
    }
  }, 350);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originMeta = document.createElement('meta');
originMeta.httpEquiv = 'origin-trial';
originMeta.content = import.meta.env.VITE_SUMMARIZER_API_KEY;
document.head.append(originMeta)

const orgMeta = document.createElement('meta');
originMeta.httpEquiv = 'origin-trial';
orgMeta.content = import.meta.env.VITE_TRANSLATOR_API_KEY;
document.head.append(orgMeta)

const oMeta = document.createElement('meta');
originMeta.httpEquiv = 'origin-trial';
oMeta.content = import.meta.env.VITE_LANGUAGE_DETECTOR_API_KEY;
document.head.append(oMeta)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

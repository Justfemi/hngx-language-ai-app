import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const originMetaDetect = document.createElement('meta');
originMetaDetect.httpEquiv = 'origin-trial';
originMetaDetect.content = import.meta.env.VITE_DETECTOR_TOKEN;
document.head.append(originMetaDetect);

const originMetaTranslate = document.createElement('meta');
originMetaTranslate.httpEquiv = 'origin-trial';
originMetaTranslate.content = import.meta.env.VITE_TRANSLATOR_TOKEN;
document.head.append(originMetaTranslate);

createRoot(document.getElementById('root')).render(
  <StrictMode>   
    <App />
  </StrictMode>,
);

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { ScrollToTop } from './utils/scrollToTop';
import { LastVisitedPathListener } from './utils/LastVisitedPathListener';
import { installChunkLoadRecovery } from './utils/chunkLoadRecovery';

installChunkLoadRecovery();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <LastVisitedPathListener />
        <ScrollToTop />
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);

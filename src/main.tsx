import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './demo';   // App보다 먼저: 데모 시딩이 스토어 초기화에 선행해야 함
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

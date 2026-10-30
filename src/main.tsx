import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProviderWrapper } from './providers';
import { AppContextProvider } from './context/AppContext';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <DataProviderWrapper>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </DataProviderWrapper>
    </React.StrictMode>
  );
}

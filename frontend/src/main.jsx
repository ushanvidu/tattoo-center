import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/global.css';
import { AuthProvider }  from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import { StoreProvider } from './context/StoreContext';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
          <StoreProvider>
            <App />
          </StoreProvider>
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  </StrictMode>
);

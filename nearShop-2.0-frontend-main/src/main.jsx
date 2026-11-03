import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/authcontext/AuthProvider.jsx';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
import { BrowserRouter } from "react-router-dom";
import KeepAlive from './components/KeepAlive/KeepAlive.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
<BrowserRouter>
      <AuthProvider>
              <QueryClientProvider client={queryClient}>

            <App />
            <KeepAlive></KeepAlive>
            </QueryClientProvider>
      </AuthProvider>
      </BrowserRouter>
      
   </StrictMode>
);

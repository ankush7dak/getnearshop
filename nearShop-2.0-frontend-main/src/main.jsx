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
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "143802123542-i0pts07f6rc1hp30jad2ial6f85mr4hi.apps.googleusercontent.com";




createRoot(document.getElementById('root')).render(
  <StrictMode>
<BrowserRouter>
      <AuthProvider>
              <QueryClientProvider client={queryClient}>

            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
            <KeepAlive></KeepAlive>
            </QueryClientProvider>
      </AuthProvider>
      </BrowserRouter>
      
   </StrictMode>
);

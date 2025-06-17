
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import Index from './pages/Index';
import PrivateRoute from './components/auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import { PrivacyProvider } from './contexts/PrivacyContext';
import { AuthProvider } from './hooks/useAuth';
import WishlistPage from './pages/wishlist/WishlistPage';
import DiarioPage from './pages/diario';
import EventosPage from './pages/eventos/EventosPage';

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <AuthProvider>
        <PrivacyProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <PrivateRoute>
                  <MainLayout>
                    <Index />
                  </MainLayout>
                </PrivateRoute>
              } />
              <Route path="/wishlist/*" element={
                <PrivateRoute>
                  <MainLayout>
                    <WishlistPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              <Route path="/diario" element={
                <PrivateRoute>
                  <MainLayout>
                    <DiarioPage />
                  </MainLayout>
                </PrivateRoute>
              } />
              <Route path="/eventos" element={
                <PrivateRoute>
                  <MainLayout>
                    <EventosPage />
                  </MainLayout>
                </PrivateRoute>
              } />
            </Routes>
          </Router>
        </PrivacyProvider>
      </AuthProvider>
    </div>
  );
}

export default App;

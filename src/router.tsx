import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddProofPage } from './pages/AddProofPage';
import { ProofDetailPage } from './pages/ProofDetailPage';
import { SharePage } from './pages/SharePage';
import { PrivateRoute } from './components/PrivateRoute';
import { PublicRoute } from './components/PublicRoute';
import { ProofsPage } from './pages/ProofsPage';
import ProfilePage from './pages/ProfilePage';
import { Navbar } from './components/Navbar';
import { MobileNavbar } from './components/MobileNavbar';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { RentalsPage } from './pages/RentalsPage';
import { AddPropertyProofPage } from './pages/AddPropertyProofPage';
import { PropertyProofsPage } from './pages/PropertyProofsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import WalletCallbackPage from './pages/WalletCallbackPage';
import { AdminProofsPage } from './pages/AdminProofsPage';

// Composant pour le layout protégé
const ProtectedLayout: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  return (
    <div className="flex w-full min-h-screen">
      <Navbar onOpenWalletModal={onOpenWalletModal} />
      <MobileNavbar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64 pt-16 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

// Composant pour le layout public
const PublicLayout = () => (
  <Routes>
    <Route path="/" element={
      <PublicRoute>
        <HomePage />
      </PublicRoute>
    } />
    <Route path="/auth" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />
    <Route path="/login" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />
    <Route path="/wallet-callback" element={
      <PublicRoute>
        <WalletCallbackPage />
      </PublicRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const AppRouter: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  return (
    <Routes>
      <Route path="/app" element={
        <PrivateRoute>
          <ProtectedLayout onOpenWalletModal={onOpenWalletModal} />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="add-proof" element={<AddProofPage />} />
        <Route path="proof/:id" element={<ProofDetailPage />} />
        <Route path="share/:shareToken" element={<SharePage />} />
        <Route path="proofs" element={<ProofsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="properties" element={<PropertiesPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="add-property" element={<AddPropertyPage />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="my-reservations" element={<MyReservationsPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="properties/:propertyId/proofs" element={<PropertyProofsPage />} />
        <Route path="add-property-proof/:propertyId" element={<AddPropertyProofPage />} />
        <Route path="admin">
          <Route 
            path="proofs" 
            element={
              <PrivateRoute requiredRole="ADMIN">
                <AdminProofsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="users" 
            element={
              <PrivateRoute requiredRole="ADMIN">
                <div>Admin Users - Page en construction</div>
              </PrivateRoute>
            } 
          />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
};

export default AppRouter;

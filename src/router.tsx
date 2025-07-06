import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { UnlockPage } from './pages/UnlockPage';
import { AdminProofsPage } from './pages/AdminProofsPage';

// Composant pour le layout protégé
const ProtectedLayout: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => {
  return (
    <div className="flex w-full min-h-screen">
      <Navbar onOpenWalletModal={onOpenWalletModal} />
      <MobileNavbar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64 pt-16 md:pt-0">
        <Routes>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } />
          <Route path="add-proof" element={
            <PrivateRoute>
              <AddProofPage />
            </PrivateRoute>
          } />
          <Route path="proof/:id" element={
            <PrivateRoute>
              <ProofDetailPage />
            </PrivateRoute>
          } />
          <Route path="share/:shareToken" element={
            <PrivateRoute>
              <SharePage />
            </PrivateRoute>
          } />
          <Route path="proofs" element={
            <PrivateRoute>
              <ProofsPage />
            </PrivateRoute>
          } />
          <Route path="profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="properties" element={
            <PrivateRoute>
              <PropertiesPage />
            </PrivateRoute>
          } />
          <Route path="add-property" element={
            <PrivateRoute>
              <AddPropertyPage />
            </PrivateRoute>
          } />
          <Route path="rentals" element={
            <PrivateRoute>
              <RentalsPage />
            </PrivateRoute>
          } />
          <Route path="my-reservations" element={
            <PrivateRoute>
              <MyReservationsPage />
            </PrivateRoute>
          } />
          <Route path="favorites" element={
            <PrivateRoute>
              <FavoritesPage />
            </PrivateRoute>
          } />
          <Route path="properties/:propertyId/proofs" element={
            <PrivateRoute>
              <PropertyProofsPage />
            </PrivateRoute>
          } />
          <Route path="add-property-proof/:propertyId" element={
            <PrivateRoute>
              <AddPropertyProofPage />
            </PrivateRoute>
          } />
          <Route path="properties/:id" element={
            <PrivateRoute>
              <PropertyDetailPage />
            </PrivateRoute>
          } />
          <Route path="admin-proofs" element={
            <PrivateRoute adminOnly={true}>
              <AdminProofsPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>
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
    <Route path="/unlock" element={
      <PublicRoute>
        <UnlockPage />
      </PublicRoute>
    } />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const AppRouter: React.FC<{ onOpenWalletModal: () => void }> = ({ onOpenWalletModal }) => (
  <Routes>
    <Route path="/app/*" element={
      <PrivateRoute>
        <ProtectedLayout onOpenWalletModal={onOpenWalletModal} />
      </PrivateRoute>
    } />
    <Route path="/*" element={<PublicLayout />} />
  </Routes>
);

export default AppRouter;

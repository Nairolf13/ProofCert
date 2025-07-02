import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddProofPage } from './pages/AddProofPage';
import { ProofDetailPage } from './pages/ProofDetailPage';
import { SharePage } from './pages/SharePage';
import { PrivateRoute } from './components/PrivateRoute';
import { ProofsPage } from './pages/ProofsPage';
import ProfilePage from './pages/ProfilePage';
import { Navbar } from './components/Navbar';
import { MobileNavbar } from './components/MobileNavbar';
import { useAuth } from './hooks/useAuth';
import { AddPropertyPage } from './pages/AddPropertyPage';
import { PropertiesPage } from './pages/PropertiesPage';
import { RentalsPage } from './pages/RentalsPage';
import { AddPropertyProofPage } from './pages/AddPropertyProofPage';
import { PropertyProofsPage } from './pages/PropertyProofsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import MyReservationsPage from './pages/MyReservationsPage';
import { FavoritesPage } from './pages/FavoritesPage';

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex w-full min-h-screen">
      {/* Navigation Desktop */}
      {isAuthenticated && <Navbar />}
      
      {/* Navigation Mobile */}
      {isAuthenticated && <MobileNavbar />}
      
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        isAuthenticated ? 'md:ml-64 pt-16 md:pt-0' : ''
      }`}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route element={<PrivateRoute />}> 
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/add-proof" element={<AddProofPage />} />
            <Route path="/proof/:id" element={<ProofDetailPage />} />
            <Route path="/share/:shareToken" element={<SharePage />} />
            <Route path="/proofs" element={<ProofsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/add-property" element={<AddPropertyPage />} />
            <Route path="/rentals" element={<RentalsPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/properties/:propertyId/proofs" element={<PropertyProofsPage />} />
            <Route path="/add-property-proof/:propertyId" element={<AddPropertyProofPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />
          </Route>
        </Routes>
        
        {/* Composant de debug de connexion - DÉSACTIVÉ */}
        {/* <ConnectionDebug /> */}
      </div>
    </div>
  );
};

export default AppRouter;

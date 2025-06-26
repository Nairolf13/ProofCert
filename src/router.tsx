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
import { BottomNav } from './components/BottomNav';
import { useAuth } from './hooks/useAuth';

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      {isAuthenticated && <Navbar />}
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
        </Route>
      </Routes>
      {isAuthenticated && <BottomNav />}
    </>
  );
};

export default AppRouter;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import VotesPage from './pages/VotesPage';
import VoteDetailPage from './pages/VoteDetailPage';
import MPsPage from './pages/MPsPage';
import MPProfilePage from './pages/MPProfilePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import LoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMPs from './pages/admin/AdminMPs';
import AdminVotes from './pages/admin/AdminVotes';
import AdminVoteRecords from './pages/admin/AdminVoteRecords';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="votes" element={<VotesPage />} />
            <Route path="votes/:id" element={<VoteDetailPage />} />
            <Route path="mps" element={<MPsPage />} />
            <Route path="mps/:id" element={<MPProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<ProtectedRoute><Layout isAdmin /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="mps" element={<AdminMPs />} />
            <Route path="votes" element={<AdminVotes />} />
            <Route path="vote-records" element={<AdminVoteRecords />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
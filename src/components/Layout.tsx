import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminSidebar from './admin/AdminSidebar';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  isAdmin?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ isAdmin = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <Navbar isAdmin={isAdmin} />
      
      <div className="flex flex-1">
        {isAdmin && user && (
          <AdminSidebar />
        )}
        
        <main className={`flex-1 ${isAdmin ? 'ml-0 md:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;
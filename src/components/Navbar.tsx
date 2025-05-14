import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, BarChart2, Users, Vote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  isAdmin?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isAdmin = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <Vote className="h-8 w-8 text-romania-blue" />
            <span className="font-bold text-xl text-romania-blue">
              {isAdmin ? 'Vote Tracker Admin' : 'Vote Tracker'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isAdmin ? (
              <>
                <Link to="/votes" className="text-neutral-700 hover:text-primary-600 font-medium">
                  Votes
                </Link>
                <Link to="/mps" className="text-neutral-700 hover:text-primary-600 font-medium">
                  MPs
                </Link>
                <Link to="/about" className="text-neutral-700 hover:text-primary-600 font-medium">
                  About
                </Link>
                {user && (
                  <Link 
                    to="/admin" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <button 
                onClick={handleSignOut}
                className="flex items-center text-neutral-700 hover:text-error-600 font-medium"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-neutral-700"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-neutral-200 animate-fade-in">
            <ul className="space-y-4">
              {!isAdmin ? (
                <>
                  <li>
                    <Link 
                      to="/votes" 
                      className="block text-neutral-700 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Votes
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/mps" 
                      className="block text-neutral-700 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      MPs
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/about" 
                      className="block text-neutral-700 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </li>
                  {user && (
                    <li>
                      <Link 
                        to="/admin" 
                        className="block bg-primary-600 text-white px-4 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <li>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center text-neutral-700 py-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-white hover:text-purple-200 transition duration-300">
                Agent Manager
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:ml-10 md:space-x-8">
              <Link
                to="/dashboard"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-purple-700 text-white'
                    : 'text-white hover:bg-purple-700 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/agents"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  isActive('/agents')
                    ? 'bg-purple-700 text-white'
                    : 'text-white hover:bg-purple-700 hover:text-white'
                }`}
              >
                Agents
              </Link>
              <Link
                to="/upload-list"
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                  isActive('/upload-list')
                    ? 'bg-purple-700 text-white'
                    : 'text-white hover:bg-purple-700 hover:text-white'
                }`}
              >
                Upload Lists
              </Link>
            </div>
          </div>

          {/* User Info and Mobile Menu Button */}
          <div className="flex items-center">
            {user && (
              <div className="hidden md:flex md:items-center space-x-6">
                <span className="text-sm text-white">Hello, {user.name}</span>
                <button
                  onClick={logout}
                  className="bg-white text-purple-600 py-2 px-4 rounded-md text-sm font-medium hover:bg-purple-50 transition duration-300"
                >
                  Logout
                </button>
              </div>
            )}
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-purple-200 hover:bg-purple-700 focus:outline-none transition duration-300"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-purple-700">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition duration-300 ${
                isActive('/dashboard')
                  ? 'bg-purple-800 text-white'
                  : 'text-white hover:bg-purple-800 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/agents"
              className={`block px-3 py-2 rounded-md text-base font-medium transition duration-300 ${
                isActive('/agents')
                  ? 'bg-purple-800 text-white'
                  : 'text-white hover:bg-purple-800 hover:text-white'
              }`}
            >
              Agents
            </Link>
            <Link
              to="/upload-list"
              className={`block px-3 py-2 rounded-md text-base font-medium transition duration-300 ${
                isActive('/upload-list')
                  ? 'bg-purple-800 text-white'
                  : 'text-white hover:bg-purple-800 hover:text-white'
              }`}
            >
              Upload Lists
            </Link>
            {user && (
              <div className="border-t border-purple-600 pt-4">
                <span className="block px-3 py-2 text-sm text-white">Hello, {user.name}</span>
                <button
                  onClick={logout}
                  className="block w-full px-3 py-2 text-left text-sm font-medium text-white hover:bg-purple-800 hover:text-white rounded-md transition duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

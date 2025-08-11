import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 cursor-pointer">Rental Management System</h1>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 hover:shadow-md transition-all duration-200 transform hover:scale-105"
          >
            <User size={20} />
            <span className="text-sm font-medium">Admin</span>
            <ChevronDown size={16} />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-50 transform transition-all duration-200 animate-in slide-in-from-top-2">
              <div className="py-1">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 hover:pl-6"
                >
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 hover:pl-6"
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    // Add logout logic here
                    console.log('Logout clicked');
                    setShowUserMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all duration-150 hover:pl-6"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

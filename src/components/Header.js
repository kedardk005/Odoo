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
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Rental Management System</h1>
        </div>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 transition-colors"
          >
            <User size={20} />
            <span className="text-sm font-medium">Admin</span>
            <ChevronDown size={16} />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Profile
                </button>
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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

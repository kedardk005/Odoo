import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-gray-900">Rental Management System</h1>
        </div>
        
        <div className="relative">
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
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <hr className="my-1" />
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

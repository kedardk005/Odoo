import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, FileText, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Rental', path: '/rental', icon: Package },
    { name: 'Order', path: '/orders', icon: FileText },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Reporting', path: '/reporting', icon: BarChart3 },
    { name: 'Setting', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'text-black border-black'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

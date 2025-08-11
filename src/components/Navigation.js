import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FileText, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Rental', path: '/rental', icon: Package },
    { name: 'Order', path: '/orders', icon: FileText },
    { name: 'Products', path: '/products', icon: ShoppingBag },
    { name: 'Reporting', path: '/reporting', icon: BarChart3 },
    { name: 'Setting', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-all duration-200 hover:shadow-sm hover:bg-gray-50 rounded-t-lg ${
                    isActive
                      ? 'text-black border-black bg-gray-100 shadow-sm'
                      : 'text-gray-500 border-transparent hover:text-black hover:border-gray-400'
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

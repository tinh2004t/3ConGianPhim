import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Film, Users, Tag, FileText, Home } from 'lucide-react';

const AdminSidebar = ({ 
  currentPage, 
  collapsed, 
  onToggle, 
  isMobile, 
  mobileMenuOpen, 
  onCloseMobile 
}) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, to: '/admin' },
    { id: 'movies', label: 'Movies', icon: Film, to: '/admin/movies' },
    { id: 'genres', label: 'Genres', icon: Tag, to: '/admin/genres' },
    { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
  ];

  const handleMenuItemClick = () => {
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <div
      className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
        isMobile
          ? `fixed top-0 left-0 h-full z-50 ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64`
          : `fixed top-0 left-0 h-full ${collapsed ? 'w-16' : 'w-64'}`
      }`}
    >
      {/* Header */}
      <div className={`p-4 sm:p-6 flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-2">
          <Film className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" />
          {(!collapsed || isMobile) && (
            <h2 className="text-base sm:text-xl font-bold text-white truncate">
              <span className="hidden sm:inline">Triple Gián Admin</span>
              <span className="sm:hidden">Admin</span>
            </h2>
          )}
        </div>
        
        {/* Toggle Button - Hide on mobile when menu is open */}
        {!isMobile && (
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors"
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
          >
            {collapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        )}

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onCloseMobile}
            className="text-gray-400 hover:text-white focus:outline-none transition-colors"
            title="Đóng menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="mt-4 sm:mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

          return (
            <Link
              key={item.id}
              to={item.to}
              onClick={handleMenuItemClick}
              className={`flex items-center px-4 sm:px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-gray-700 text-white border-r-2 border-red-500' : ''
              } ${collapsed && !isMobile ? 'justify-center' : ''}`}
              title={collapsed && !isMobile ? item.label : ''}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${(!collapsed || isMobile) ? 'mr-3' : ''}`} />
              {(!collapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Footer Info */}
      {isMobile && mobileMenuOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-gray-400 text-center">
            Admin Panel v1.0
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
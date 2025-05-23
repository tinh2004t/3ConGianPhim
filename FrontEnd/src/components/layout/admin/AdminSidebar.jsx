import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Film, Users, Tag, FileText, Home } from 'lucide-react';

const AdminSidebar = ({ currentPage, collapsed, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, to: '/admin' },
    { id: 'movies', label: 'Movies', icon: Film, to: '/admin/movies' },
    { id: 'genres', label: 'Genres', icon: Tag, to: '/admin/genres' },
    { id: 'users', label: 'Users', icon: Users, to: '/admin/users' },
  ];

  return (
    <div
      className={`bg-gray-800 border-r border-gray-700 fixed top-0 left-0 h-full transition-width duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Film className="w-8 h-8 text-red-500" />
          {!collapsed && (
            <h2 className="text-xl font-bold text-white">Triple Gián Admin</h2>
          )}
        </div>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-white focus:outline-none"
          title={collapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {/* icon toggle: dùng dấu 3 gạch hoặc mũi tên */}
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');

          return (
            <Link
              key={item.id}
              to={item.to}
              className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? 'bg-gray-700 text-white border-r-2 border-red-500' : ''
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;

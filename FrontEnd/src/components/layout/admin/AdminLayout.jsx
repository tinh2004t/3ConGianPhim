import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import userApi from '../../../api/userApi';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await userApi.getMe(token);
        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobileMenu = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        currentPage=""
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isMobile 
            ? 'w-full' 
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white focus:outline-none lg:hidden mr-4"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
              <span className="hidden sm:inline">Admin Panel - Movie Management</span>
              <span className="sm:hidden">Admin Panel</span>
            </h1>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-gray-300 text-sm hidden sm:inline">
                Welcome, {user?.username || '...'}
              </span>
              <a
                href="/"
                className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-2 rounded text-white transition-colors text-sm"
              >
                <span className="hidden sm:inline">Trang chủ</span>
                <span className="sm:hidden">Home</span>
              </a>
              <button
                className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-2 rounded text-white transition-colors text-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 bg-gray-900 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
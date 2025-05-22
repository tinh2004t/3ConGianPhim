import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import userApi from '../../../api/userApi';

const AdminLayout = () => {
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

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
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar cố định */}
      <AdminSidebar
        currentPage="" // Bạn có thể truyền trang hiện tại nếu muốn
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Nội dung chính có margin-left để không bị sidebar đè */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '4rem' : '16rem' }}
      >
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Admin Panel - Movie Management
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.username || '...'}</span>
              <a
                href="/"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
              >
                Trang chủ
              </a>
              <button
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white transition-colors"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

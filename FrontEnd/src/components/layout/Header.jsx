// src/components/layout/Header.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { UserContext } from '../../contexts/UserContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const handleLogout = () => {
    logout();           // xoá context + localStorage
    navigate('/login'); // điều hướng về trang đăng nhập
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // TODO: triển khai search
  };

  return (
    <header className="bg-black py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* -------- Logo -------- */}
        <Link to="/" className="text-red-600 text-3xl font-bold select-none">
          Tripple&nbsp;Gián
        </Link>

        {/* -------- Search & Actions -------- */}
        <div className="flex items-center space-x-4">
          {/* ô tìm kiếm */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              className="bg-gray-800 text-white px-4 py-2 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-red-600"
              placeholder="Search movies or TV shows..."
            />
            <button
              type="submit"
              className="absolute right-3 top-2 text-gray-400 hover:text-red-500 transition"
              aria-label="Search"
            >
              {/* icon search */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* khu vực Login / Logout */}
          {user ? (
            <div className="inline-flex rounded-lg shadow-md overflow-hidden items-center">
              {user.role === 'admin' && (
                <Link
                  to="/dashboard"
                  className="bg-gray-700 text-white text-sm px-4 py-1.5 hover:bg-gray-600 transition font-medium"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white text-sm px-4 py-1.5 hover:bg-red-700 transition font-medium"
              >
                Đăng&nbsp;xuất
              </button>
            </div>
          ) : (
            <div className="inline-flex rounded-lg shadow-md overflow-hidden">
              <Link
                to="/login"
                className="bg-red-600 text-white text-sm px-4 py-1.5 hover:bg-red-700 transition font-medium"
              >
                Đăng&nbsp;nhập
              </Link>
              <Link
                to="/register"
                className="bg-teal-600 text-white text-sm px-4 py-1.5 hover:bg-teal-700 transition font-medium"
              >
                Đăng&nbsp;kí
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* menu chính */}
      <Navbar />
    </header>
  );
};

export default Header;

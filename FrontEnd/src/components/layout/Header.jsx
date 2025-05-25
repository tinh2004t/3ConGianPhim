import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { UserContext } from '../../contexts/UserContext';
import movieApi from '../../api/movieApi';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const timeoutRef = useRef();
  const userMenuRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowUserMenu(false);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    clearTimeout(timeoutRef.current);

    if (value.trim()) {
      timeoutRef.current = setTimeout(async () => {
        try {
          const res = await movieApi.searchByName(value);
          const movies = res.data.data || [];
          setSearchResults(movies.slice(0, 4));
          setShowSuggestions(true);
        } catch (err) {
          console.error('Lỗi tìm kiếm:', err);
        }
      }, 300);
    } else {
      setShowSuggestions(false);
      setSearchResults([]);
    }
  };

  const handleSuggestionClick = (id) => {
    navigate(`/movies/${id}`);
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const wrapperRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const token = localStorage.getItem('token');

  // Get user initials for avatar
  const getUserInitials = (user) => {
    if (!user || !user.username) return 'U';
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-black py-4 border-b border-gray-800">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-red-600 text-3xl font-bold select-none hover:text-red-500 transition-colors">
          Tripple&nbsp;Gián
        </Link>

        {/* Search + Actions */}
        <div className="flex items-center space-x-6 relative" ref={wrapperRef}>
          {/* Search Box */}
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm movies hoặc TV shows..."
              className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-2.5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-gray-700/80 transition-all border border-gray-700/50 hover:border-gray-600/50"
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Search Suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <ul className="absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl z-[999] border border-gray-700/50 overflow-hidden">
                {searchResults.map((movie) => (
                  <li
                    key={movie._id}
                    onClick={() => handleSuggestionClick(movie._id)}
                    className="flex items-center p-3 hover:bg-gray-800/80 text-white cursor-pointer transition-all hover:scale-[1.02] transform"
                  >
                    <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded-lg mr-3 shadow-md" />
                    <span className="font-medium truncate">{movie.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* User Actions */}
          {user && token ? (
            <div className="relative" ref={userMenuRef}>
              {/* User Avatar Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-700/60 px-4 py-2.5 rounded-xl transition-all border border-gray-700/50 hover:border-gray-600/50 group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  {getUserInitials(user)}
                </div>

                {/* User Info */}
                <div className="flex flex-col items-start">
                  <span className="text-white text-sm font-medium">
                    {user.username || 'User'}
                  </span>
                  {user.role === 'admin' && (
                    <span className="text-red-400 text-xs font-medium">Admin</span>
                  )}
                </div>

                {/* Dropdown Arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                        {getUserInitials(user)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.username || 'User'}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all group"
                      >
                        <svg className="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                        <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">Admin</span>
                      </Link>
                    )}

                    <Link
                      to="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Tài khoản</span>
                    </Link>

                    <div className="border-t border-gray-700/50 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2.5 text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login/Register Buttons */
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 border border-red-500/20"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Đăng nhập
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <Link
                to="/register"
                className="group relative overflow-hidden bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25 border border-teal-500/20"
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Đăng ký
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <Navbar />
    </header>
  );
};

export default Header;
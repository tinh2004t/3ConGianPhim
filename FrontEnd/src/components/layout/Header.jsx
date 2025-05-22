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
  const timeoutRef = useRef();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const token = localStorage.getItem('token'); // check nếu đã đăng xuất (token đã bị xóa)

  return (
    <header className="bg-black py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-red-600 text-3xl font-bold select-none">
          Tripple&nbsp;Gián
        </Link>

        {/* Search + Actions */}
        <div className="flex items-center space-x-4 relative" ref={wrapperRef}>
          {/* ô tìm kiếm */}
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm movies hoặc TV shows..."
              className="bg-gray-800 text-white px-4 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-red-600"
            />
            <button
              className="absolute right-3 top-2 text-gray-400 hover:text-red-500"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Danh sách gợi ý */}
            {showSuggestions && searchResults.length > 0 && (
              <ul className="absolute top-full mt-1 w-full bg-[rgba(30,30,30,0.95)] text-white rounded-md shadow-lg z-[999] backdrop-blur-sm">
                {searchResults.map((movie) => (
                  <li
                    key={movie._id}
                    onClick={() => handleSuggestionClick(movie._id)}
                    className="flex items-center p-2 hover:bg-gray-100 hover:text-black text-white cursor-pointer transition-colors"
                  >
                    <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 object-cover rounded mr-3" />
                    <span className="font-medium truncate">{movie.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Login / Logout */}
          {user && token ? (
            <div className="inline-flex rounded-lg shadow-md overflow-hidden items-center">
              {user.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
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

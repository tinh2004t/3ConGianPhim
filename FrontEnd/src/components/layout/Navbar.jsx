import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell'; // Adjust path as needed

const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function (...args) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  const isMoviePlayerPage = location.pathname.startsWith('/watch/');

  // Check auth status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    const handleScroll = throttle(() => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
    }, 100);

    if (!isMoviePlayerPage) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMoviePlayerPage]);

  // Check auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ease-in-out
        ${!isMoviePlayerPage && isScrolled
          ? 'fixed top-0 left-0 bg-black/30 backdrop-blur-md shadow-md'
          : !isMoviePlayerPage
            ? 'relative bg-transparent'
            : 'relative bg-black'} 
      `}
      style={{
        minHeight: '70px',
        willChange: 'transform',
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Navigation Links */}
          <div className="flex justify-center flex-1">
            <ul className="flex space-x-10 py-5 transition-all duration-300 ease-in-out">
              <li>
                <Link to="/" className="text-white hover:text-red-500 font-medium transition duration-300 px-4 py-2">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-white hover:text-red-500 font-medium transition duration-300 px-4 py-2">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-series" className="text-white hover:text-red-500 font-medium transition duration-300 px-4 py-2">
                  TV Series
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-white hover:text-red-500 font-medium transition duration-300 px-4 py-2">
                  Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Notification Bell - Only show when logged in */}
          {isLoggedIn && (
            <div className="flex items-center py-5">
              <NotificationBell />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
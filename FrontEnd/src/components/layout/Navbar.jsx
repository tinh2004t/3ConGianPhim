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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Listen for login/logout events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'authToken') {
        checkAuthStatus();
      }
    };

    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case of programmatic changes
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.hamburger-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/tv-series', label: 'TV Series' },
    { to: '/account', label: 'Account' }
  ];

  return (
    <>
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
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-[70px]">
            {/* Logo/Brand (optional - you can add your logo here) */}
            

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex justify-center flex-1 mx-8">
              <ul className="flex space-x-8 xl:space-x-10">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link 
                      to={link.to} 
                      className={`text-white hover:text-red-500 font-medium transition duration-300 px-3 py-2 rounded-md
                        ${location.pathname === link.to ? 'text-red-500' : ''}
                      `}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Notification Bell - Only show when logged in */}
              {isLoggedIn && (
                <div className="hidden sm:flex items-center">
                  <NotificationBell isLoggedIn={isLoggedIn} />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="hamburger-button lg:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span 
                    className={`block w-5 h-0.5 bg-white transform transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                    }`}
                  />
                  <span 
                    className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span 
                    className={`block w-5 h-0.5 bg-white transform transition-all duration-300 ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Mobile Menu */}
      <div 
        className={`mobile-menu fixed top-[70px] left-0 right-0 z-50 lg:hidden transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-black/95 backdrop-blur-md border-t border-gray-700">
          <div className="container mx-auto px-4 py-6">
            {/* Mobile Navigation Links */}
            <ul className="space-y-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`block text-white hover:text-red-500 font-medium transition duration-300 px-4 py-3 rounded-md hover:bg-white/10
                      ${location.pathname === link.to ? 'text-red-500 bg-white/10' : ''}
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Notification Bell */}
            {isLoggedIn && (
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between px-4">
                  <span className="text-white font-medium"></span>
                  <NotificationBell isLoggedIn={isLoggedIn} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
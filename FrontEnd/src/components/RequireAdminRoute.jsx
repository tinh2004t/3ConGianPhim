// src/components/RequireAdminRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import userApi from '../api/userApi';

const RequireAdminRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null: đang loading
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkAdmin = async () => {
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      try {
        const res = await userApi.getMe(token);
        if (res.data?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error('Authorization check failed:', err);
        setIsAuthorized(false);
      }
    };

    checkAdmin();
  }, [token]);

  if (isAuthorized === null) return <div className="text-white p-6">Loading...</div>;

  return isAuthorized ? children : <Navigate to="/" replace />;
};

export default RequireAdminRoute;

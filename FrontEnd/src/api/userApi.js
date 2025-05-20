// src/api/userApi.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // điều chỉnh nếu backend chạy port khác

export const getMe = async (token) => {
  const res = await axios.get(`${API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

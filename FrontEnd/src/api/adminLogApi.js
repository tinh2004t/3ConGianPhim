// src/api/adminLogApi.js
import axiosClient from './axiosClient';

export const fetchAdminLogs = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosClient.get('/admin-logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch admin logs:', error);
    throw error;
  }
};

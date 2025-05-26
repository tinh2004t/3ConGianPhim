// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  registerUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  loginUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/login', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authApi;

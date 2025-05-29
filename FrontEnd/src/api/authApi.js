// src/api/authApi.js
import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký tài khoản
  registerUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đăng nhập
  loginUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/login', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Gửi mã xác minh qua email (quên mật khẩu)
  sendResetCode: async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xác minh mã và đổi mật khẩu
  resetPassword: async (email, code, newPassword) => {
    try {
      const response = await axiosClient.post('/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authApi;

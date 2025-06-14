import axiosClient from './axiosClient';

const authApi = {
  // Đăng ký tài khoản (không cần token)
  registerUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đăng nhập (không cần token)
  loginUser: async (userData) => {
    try {
      const response = await axiosClient.post('/auth/login', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Gửi mã xác minh quên mật khẩu (không cần token)
  sendResetCode: async (email) => {
    try {
      const response = await axiosClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Đặt lại mật khẩu (không cần token)
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

  // Yêu cầu mã xác minh để đổi mật khẩu (yêu cầu token)
  requestChangePassword: async (data) => {
    try {
      const response = await axiosClient.post('/auth/request-change-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xác nhận đổi mật khẩu (yêu cầu token)
  confirmChangePassword: async (data) => {
    try {
      const response = await axiosClient.post('/auth/confirm-change-password', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Xác minh mã đổi mật khẩu (yêu cầu token)
  verifyChangePasswordCode: async (data) => {
    try {
      const response = await axiosClient.post('/auth/verify-change-password-code', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default authApi;
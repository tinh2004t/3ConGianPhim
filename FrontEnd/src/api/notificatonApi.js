// notificationApi.js
import axiosClient from './axiosClient'; // Sử dụng axiosClient để nhất quán hoặc dùng axios gốc nếu cần

const notificationApi = {
  // ✅ Lấy danh sách thông báo của user hiện tại
  getNotifications: async (token) => {
    try {
      console.log('=== API: Getting notifications ===');
      console.log('Token:', token ? 'Present' : 'Missing');

      const response = await axiosClient.get('/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in getNotifications:', error);
      throw error?.response?.data || error;
    }
  },

  // ✅ Đánh dấu thông báo đã đọc (hỗ trợ gửi body tùy chọn hoặc không)
  markAsRead: async (notificationId, token, requestBody = null) => {
    try {
      console.log('🔄 Marking notification as read:', { notificationId, token: token ? 'present' : 'missing' });

      if (!notificationId) throw new Error('Notification ID is required');
      if (!token) throw new Error('Token is required');

      const id = String(notificationId).trim();
      const body = requestBody || { isRead: true };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axiosClient.patch(`/notifications/${id}/read`, body, config);

      console.log('✅ Mark as read successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in markAsRead:', error);

      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }

      throw error?.response?.data || error;
    }
  },

  // ✅ Xóa thông báo
  deleteNotification: async (notificationId, token) => {
    try {
      console.log('=== API: Deleting notification ===');
      console.log('Notification ID:', notificationId);
      console.log('Token:', token ? 'Present' : 'Missing');

      if (!notificationId) throw new Error('Notification ID is required');
      if (!token) throw new Error('Token is required');

      const id = String(notificationId).trim();
      const response = await axiosClient.delete(`/notifications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in deleteNotification:', error);
      throw error?.response?.data || error;
    }
  },
};

export default notificationApi;

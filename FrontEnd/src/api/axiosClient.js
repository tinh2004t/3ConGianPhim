import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Giữ nguyên baseURL của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header Authorization
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token không hợp lệ hoặc hết hạn
      localStorage.removeItem('token');
      // Chuyển hướng về trang đăng nhập
      window.location.href = '/login';
      // Hiển thị thông báo cho người dùng (tùy chọn)
      alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
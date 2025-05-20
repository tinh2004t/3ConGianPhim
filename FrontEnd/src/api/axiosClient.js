// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Thay đổi theo địa chỉ backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

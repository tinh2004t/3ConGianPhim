// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://threecongianphim.onrender.com/api', // Thay đổi theo địa chỉ backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;

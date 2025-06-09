// src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Relative URL - sẽ tự động dùng domain hiện tại
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosClient;
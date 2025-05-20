// src/api/genreApi.js
import axiosClient from './axiosClient';

const genreApi = {
  getAll: () => axiosClient.get('/genres'),
};

export default genreApi;

import axios from 'axios';

// Đảm bảo baseURL giống như trong movieApi.js
const API_URL = 'http://localhost:5000/api';

// Thiết lập axios với baseURL
const api = axios.create({
  baseURL: API_URL
});

export const getEpisodesByMovieId = (movieId) =>
  api.get(`/movies/${movieId}/episodes`);

export const getEpisodeById = (id) =>
  api.get(`/episodes/${id}`);

export const createEpisode = (movieId, data) =>
  api.post(`/movies/${movieId}/episodes`, data);

export const updateEpisode = (id, data) =>
  api.put(`/episodes/${id}`, data);

export const deleteEpisode = (id) =>
  api.delete(`/episodes/${id}`);

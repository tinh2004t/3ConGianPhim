// src/api/userApi.js
import axiosClient from './axiosClient';

const userApi = {
  getMe: (token) =>
    axiosClient.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  addFavorite: (movieId, token) =>
    axiosClient.post(
      '/users/me/favorites',
      { movieId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
  getFavorites: (token) =>
    axiosClient.get('/users/me/favorites', { headers: { Authorization: `Bearer ${token}` } }),

  deleteFavorite: (movieId, token) =>
  axiosClient.delete('/users/me/favorites/' + movieId, {
    headers: { Authorization: `Bearer ${token}` },
  }),

  // Nếu sau này bạn có thêm API user khác thì bổ sung vào đây
};

export default userApi;

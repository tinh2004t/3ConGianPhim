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
    axiosClient.get('/users/me/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteFavorite: (movieId, token) =>
    axiosClient.delete('/users/me/favorites/' + movieId, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ POST: thêm hoặc cập nhật lịch sử xem phim
  addHistory: ({ movieId, episodeId }, token) =>
    axiosClient.post(
      '/users/me/history',
      { movieId, episodeId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  // ✅ GET: lấy lịch sử xem phim
  getHistory: (token) =>
    axiosClient.get('/users/me/history', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Nếu sau này bạn có thêm API user khác thì bổ sung vào đây
};

export default userApi;

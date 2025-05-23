import axiosClient from './axiosClient';

const userApi = {
  // ✅ Lấy thông tin người dùng hiện tại
  getMe: (token) =>
    axiosClient.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ Thêm phim vào yêu thích
  addFavorite: (movieId, token) =>
    axiosClient.post(
      '/users/me/favorites',
      { movieId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  // ✅ Lấy danh sách phim yêu thích
  getFavorites: (token) =>
    axiosClient.get('/users/me/favorites', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ Xóa phim khỏi danh sách yêu thích
  deleteFavorite: (movieId, token) =>
    axiosClient.delete('/users/me/favorites/' + movieId, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ Ghi hoặc cập nhật lịch sử xem
  addHistory: ({ movieId, episodeId }, token) =>
    axiosClient.post(
      '/users/me/history',
      { movieId, episodeId },
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  // ✅ Lấy lịch sử xem
  getHistory: (token) =>
    axiosClient.get('/users/me/history', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // -------------------------------
  // 🔐 ADMIN: Quản lý người dùng
  // -------------------------------

  // ✅ Lấy danh sách tất cả người dùng
  getAllUsers: (token) =>
    axiosClient.get('/users', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ Cập nhật thông tin người dùng
  updateUser: (userId, updateData, token) =>
    axiosClient.put(`/users/${userId}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ✅ Xóa người dùng
  deleteUser: (userId, token) =>
    axiosClient.delete(`/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default userApi;

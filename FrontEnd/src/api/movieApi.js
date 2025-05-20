import axiosClient from './axiosClient';

const movieApi = {
  getAll: (params) => axiosClient.get('/movies', { params }),  // hỗ trợ lọc genre, year,...
  getTopViewByType: (type, limit = 12) => axiosClient.get(`/movies/top-view/${type}?limit=${limit}`),
  getRandom: () => axiosClient.get('/movies/random'),
  getByType: (type) => axiosClient.get(`/movies/type/${type}`),
  getTop: () => axiosClient.get('/movies/top'),
  search: (keyword) => axiosClient.get('/movies/search', { params: { q: keyword } }),
  getById: (id) => axiosClient.get(`/movies/${id}`),
  create: (data) => axiosClient.post('/movies', data),
  update: (id, data) => axiosClient.put(`/movies/${id}`, data),
  delete: (id) => axiosClient.delete(`/movies/${id}`), 
};

export default movieApi;

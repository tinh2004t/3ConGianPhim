import axiosClient from './axiosClient';

const movieApi = {
  // Get all movies with filters
  getAll: (params) => axiosClient.get('/movies', { params }),
  
  // Get top viewed movies by type
  getTopViewByType: (type, limit = 12) => axiosClient.get(`/movies/top-view/${type}?limit=${limit}`),
  
  // Search by name (using the main endpoint with query)
  searchByName: (query) => axiosClient.get(`/movies?q=${encodeURIComponent(query)}`),
  
  // Get random movies
  getRandom: () => axiosClient.get('/movies/random'),
  
  // Get movies by type
  getByType: (type) => axiosClient.get(`/movies/type/${type}`),
  
  // Get top movies
  getTop: () => axiosClient.get('/movies/top'),
  
  // Search movies (dedicated search endpoint)
  search: (keyword) => axiosClient.get('/movies/search', { params: { q: keyword } }),
  
  // Get movie by ID
  getById: (id) => axiosClient.get(`/movies/${id}`),
  
  // Create new movie (admin only)
  create: (data, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.post('/movies', data, { headers });
  },
  
  // Update movie (admin only)
  update: (id, data, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.put(`/movies/${id}`, data, { headers });
  },
  
  // Delete movie (admin only)
  delete: (id, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.delete(`/movies/${id}`, { headers });
  },

  // Increment view count
  incrementView: (movieId) => axiosClient.put(`/movies/${movieId}/increment-view`)
};

export default movieApi;
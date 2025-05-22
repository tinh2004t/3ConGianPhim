import axiosClient from './axiosClient';

const genreApi = {
  // Get all genres
  getAll: () => axiosClient.get('/genres'),
  
  // Get genre by ID
  getById: (id) => axiosClient.get(`/genres/${id}`),
  
  // Create new genre (admin only)
  create: (data, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.post('/genres', data, { headers });
  },
  
  // Update genre (admin only)
  update: (id, data, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.put(`/genres/${id}`, data, { headers });
  },
  
  // Delete genre (admin only)
  delete: (id, token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosClient.delete(`/genres/${id}`, { headers });
  }
};

export default genreApi;
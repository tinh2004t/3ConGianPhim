// src/api/commentApi.js
import axiosClient from './axiosClient';

const commentApi = {
  createComment: (data, token) =>
    axiosClient.post('/comments', data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getComments: (params) =>
    axiosClient.get('/comments', { params }), // params: { movieId, episodeId, page, limit }

  deleteComment: (id, token) =>
    axiosClient.delete(`/comments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default commentApi;

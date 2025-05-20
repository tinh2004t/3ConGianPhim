import axios from './axiosClient';

const episodeApi = {
  getEpisodesByMovieId: (movieId) => {
    return axios.get(`/movies/${movieId}/episodes`);
  },
  getEpisodeById: (id) => {
    return axios.get(`/episodes/${id}`);
  },
  getEpisodeByMovieAndEpisodeId: (movieId, episodeId) => {
    return axios.get(`/movies/${movieId}/episodes/${episodeId}`);
  },
  createEpisode: (movieId, episodeData) => {
    return axios.post(`/movies/${movieId}/episodes`, episodeData);
  },
  updateEpisode: (id, episodeData) => {
    return axios.put(`/episodes/${id}`, episodeData);
  },
  deleteEpisode: (id) => {
    return axios.delete(`/episodes/${id}`);
  },
};

export default episodeApi;

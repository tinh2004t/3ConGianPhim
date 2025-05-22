import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit3, Trash2, X, Play, Loader2, ExternalLink } from 'lucide-react';
import episodeApi from '../../../api/episodeApi';
import movieApi from '../../../api/movieApi';

const EpisodeManagement = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState(null);

  const [episodeForm, setEpisodeForm] = useState({
    title: '',
    episodeNumber: '',
    videoSources: [{ type: 'iframe', name: '', url: '' }]
  });

  // Load movie information
  const loadMovie = async () => {
    try {
      const response = await movieApi.getById(movieId);
      setMovie(response.data);
    } catch (error) {
      console.error('Error loading movie:', error);
      setError('Không thể tải thông tin phim');
    }
  };

  // Load episodes
  const loadEpisodes = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await episodeApi.getEpisodesByMovieId(movieId);
      // Xử lý response data phù hợp với API
      setEpisodes(response.data || []);
    } catch (error) {
      console.error('Error loading episodes:', error);
      setError('Không thể tải danh sách tập phim');
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (movieId) {
      loadMovie();
      loadEpisodes();
    }
  }, [movieId]);

  const handleEpisodeSubmit = async () => {
  try {
    setSubmitLoading(true);
    setError('');

    // Validate form
    if (!episodeForm.title.trim() || !episodeForm.episodeNumber) {
      setError('Vui lòng điền đầy đủ thông tin tập phim');
      return;
    }

    // Validate video sources
    const validSources = episodeForm.videoSources.filter(source => 
      source.name.trim() && source.url.trim()
    );

    if (validSources.length === 0) {
      setError('Vui lòng thêm ít nhất một video source hợp lệ');
      return;
    }

    const episodeData = {
      title: episodeForm.title.trim(),
      episodeNumber: parseInt(episodeForm.episodeNumber),
      videoSources: validSources.map(source => ({
        type: source.type || 'iframe',
        name: source.name.trim(),
        url: source.url.trim()
      }))
    };

    const token = localStorage.getItem('token'); // 👈 Lấy token từ localStorage (hoặc context/store nếu bạn dùng)

    if (showEditForm && editingEpisode) {
      // Update episode
      await episodeApi.updateEpisode(editingEpisode._id, episodeData, token);
    } else {
      // Create new episode
      await episodeApi.createEpisode(movieId, episodeData, token);
    }

    // Reload episodes
    await loadEpisodes();

    // Close form and reset
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingEpisode(null);
    resetEpisodeForm();

  } catch (error) {
    console.error('Error saving episode:', error);
    setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu tập phim');
  } finally {
    setSubmitLoading(false);
  }
};


  const handleEdit = (episode) => {
    setEditingEpisode(episode);
    setEpisodeForm({
      title: episode.title || '',
      episodeNumber: episode.episodeNumber?.toString() || '',
      videoSources: episode.videoSources && episode.videoSources.length > 0 
        ? episode.videoSources.map(source => ({
            type: source.type || 'iframe',
            name: source.name || '',
            url: source.url || ''
          }))
        : [{ type: 'iframe', name: '', url: '' }]
    });
    setShowEditForm(true);
  };

  const handleDelete = async (episodeId) => {
  if (!window.confirm('Bạn có chắc chắn muốn xóa tập phim này?')) {
    return;
  }

  try {
    setLoading(true);
    const token = localStorage.getItem('token'); // 👈 Lấy token
    await episodeApi.deleteEpisode(episodeId, token); // 👈 Gửi token

    // Remove from local state
    setEpisodes(episodes.filter(episode => episode._id !== episodeId));
  } catch (error) {
    console.error('Error deleting episode:', error);
    setError(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tập phim');
  } finally {
    setLoading(false);
  }
};


  const addVideoSource = () => {
    setEpisodeForm({
      ...episodeForm,
      videoSources: [...episodeForm.videoSources, { type: 'iframe', name: '', url: '' }]
    });
  };

  const removeVideoSource = (index) => {
    if (episodeForm.videoSources.length > 1) {
      setEpisodeForm({
        ...episodeForm,
        videoSources: episodeForm.videoSources.filter((_, i) => i !== index)
      });
    }
  };

  const updateVideoSource = (index, field, value) => {
    const newSources = [...episodeForm.videoSources];
    newSources[index][field] = value;
    setEpisodeForm({ ...episodeForm, videoSources: newSources });
  };

  const resetEpisodeForm = () => {
    setEpisodeForm({
      title: '',
      episodeNumber: '',
      videoSources: [{ type: 'iframe', name: '', url: '' }]
    });
  };

  const closeAllForms = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingEpisode(null);
    setError('');
    resetEpisodeForm();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/movies')}
            className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          <div>
            <h2 className="text-3xl font-bold text-white">
              Quản lý tập phim
            </h2>
            {movie && (
              <p className="text-gray-400 mt-1">
                {movie.title} ({movie.releaseYear}) - {episodes.length} tập
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm tập mới</span>
        </button>
      </div>

      {/* Movie Info */}
      {movie && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-start space-x-6">
            <img 
              src={movie.posterUrl || '/api/placeholder/120/180'} 
              alt={movie.title}
              className="w-24 h-36 object-cover rounded-lg"
              onError={(e) => {
                e.target.src = '/api/placeholder/120/180';
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{movie.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Năm:</span>
                  <span className="text-white ml-2">{movie.releaseYear}</span>
                </div>
                <div>
                  <span className="text-gray-400">Loại:</span>
                  <span className="text-white ml-2">{movie.type || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400">Lượt xem:</span>
                  <span className="text-white ml-2">{(movie.viewCount || 0).toLocaleString()}</span>
                </div>
              </div>
              {movie.description && (
                <p className="text-gray-300 mt-3 line-clamp-2">{movie.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 border border-red-500 rounded-lg p-4">
          <p className="text-white">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-white">Đang tải...</span>
        </div>
      )}

      {/* Episodes List */}
      {!loading && (
        <div className="space-y-4">
          {episodes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Chưa có tập phim nào</p>
            </div>
          ) : (
            episodes
              .sort((a, b) => a.episodeNumber - b.episodeNumber)
              .map((episode) => (
                <div key={episode._id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Tập {episode.episodeNumber}
                        </span>
                        <h4 className="text-lg font-semibold text-white">
                          {episode.title}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Loại:</span>
                          <span className="text-white">{episode.type || 'TvSeries'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Cập nhật:</span>
                          <span className="text-white">{formatDate(episode.updatedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Play className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">Sources:</span>
                          <span className="text-white">{episode.videoSources?.length || 0}</span>
                        </div>
                      </div>

                      {/* Video Sources */}
                      {episode.videoSources && episode.videoSources.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-gray-300 font-medium mb-2">Video Sources:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {episode.videoSources.map((source, index) => (
                              <div key={`${episode._id}-source-${index}`} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                                <div className="flex items-center space-x-2">
                                  <Play className="w-4 h-4 text-green-400" />
                                  <span className="text-white font-medium">{source.name}</span>
                                  <span className="text-gray-400 text-xs">({source.type})</span>
                                </div>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:text-blue-300 transition-colors"
                                  title="Mở link"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(episode)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white text-sm transition-colors flex items-center space-x-1"
                        title="Chỉnh sửa tập phim"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(episode._id)}
                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white text-sm transition-colors flex items-center space-x-1"
                        title="Xóa tập phim"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Add/Edit Episode Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {showEditForm ? 'Chỉnh sửa tập phim' : 'Thêm tập phim mới'}
              </h3>
              <button
                onClick={closeAllForms}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tên tập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={episodeForm.title}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Fairy Tail Tập 1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số tập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={episodeForm.episodeNumber}
                    onChange={(e) => setEpisodeForm({ ...episodeForm, episodeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Video Sources <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={addVideoSource}
                    type="button"
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Thêm source
                  </button>
                </div>
                
                {episodeForm.videoSources.map((source, index) => (
                  <div key={`video-source-${index}`} className="space-y-2 mb-4 p-3 bg-gray-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Loại</label>
                        <select
                          value={source.type}
                          onChange={(e) => updateVideoSource(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        >
                          <option value="iframe">iframe</option>
                          <option value="direct">direct</option>
                          <option value="hls">hls</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tên server</label>
                        <input
                          type="text"
                          value={source.name}
                          onChange={(e) => updateVideoSource(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="ggdrive"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">URL</label>
                      <div className="flex space-x-2">
                        <input
                          type="url"
                          value={source.url}
                          onChange={(e) => updateVideoSource(index, 'url', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="https://streamtape.com/e/..."
                        />
                        {episodeForm.videoSources.length > 1 && (
                          <button
                            onClick={() => removeVideoSource(index)}
                            type="button"
                            className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleEpisodeSubmit}
                  disabled={submitLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {showEditForm ? 'Đang cập nhật...' : 'Đang thêm...'}
                    </>
                  ) : (
                    showEditForm ? 'Cập nhật' : 'Thêm tập'
                  )}
                </button>
                <button
                  onClick={closeAllForms}
                  disabled={submitLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeManagement;
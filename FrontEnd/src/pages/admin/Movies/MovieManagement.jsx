import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit3, Trash2, X, Search, ChevronLeft, ChevronRight, PlayCircle, Eye, Loader2, Filter, RotateCcw } from 'lucide-react';
import movieApi from '../../../api/movieApi';
import genreApi from '../../../api/genreApi';

const MovieManagement = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [error, setError] = useState('');
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    type: '',
    status: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    releaseYear: '',
    status: 'ongoing',
    country: '',
    type: 'Movies'
  });

  const itemsPerPage = 12;
  const totalPages = Math.ceil(totalMovies / itemsPerPage);
  const token = localStorage.getItem('token');

  // Generate year options (from 1950 to current year + 2)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let year = currentYear + 2; year >= 1950; year--) {
    yearOptions.push(year);
  }

  // Load genres từ API
  const loadGenres = async () => {
    try {
      setGenresLoading(true);
      const response = await genreApi.getAll();
      if (response.data && response.data.data) {
        setGenres(response.data.data);
      }
    } catch (error) {
      console.error('Error loading genres:', error);
      // Nếu không load được từ API, sử dụng default genres
      setGenres([
        { _id: '1', name: 'Action' },
        { _id: '2', name: 'Adventure' },
        { _id: '3', name: 'Animation' },
        { _id: '4', name: 'Comedy' },
        { _id: '5', name: 'Crime' },
        { _id: '6', name: 'Drama' },
        { _id: '7', name: 'Fantasy' },
        { _id: '8', name: 'Horror' },
        { _id: '9', name: 'Romance' },
        { _id: '10', name: 'Sci-Fi' },
        { _id: '11', name: 'Thriller' }
      ]);
    } finally {
      setGenresLoading(false);
    }
  };

  // Load movies từ API
  const loadMovies = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchTerm && { q: searchTerm }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.year && { year: filters.year }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status })
      };

      const response = await movieApi.getAll(params);

      if (response.data) {
        setMovies(response.data.data || response.data);
        setTotalMovies(response.data.total || response.data.totalItems || response.data.length);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      setError('Không thể tải danh sách phim. Vui lòng thử lại.');
      setMovies([]);
      setTotalMovies(0);
    } finally {
      setLoading(false);
    }
  };

  // Load movies khi component mount hoặc khi currentPage thay đổi
  useEffect(() => {
    loadMovies();
    loadGenres();
  }, [currentPage]);

  // Search với debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadMovies();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  // Apply filters
  useEffect(() => {
    if (currentPage === 1) {
      loadMovies();
    } else {
      setCurrentPage(1);
    }
  }, [filters]);

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      type: '',
      status: ''
    });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  const handleMovieSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError('');

      // Validate form
      if (!movieForm.title.trim()) {
        setError('Tên phim không được để trống');
        return;
      }

      const movieData = {
        ...movieForm,
        title: movieForm.title.trim(),
        description: movieForm.description.trim(),
        releaseYear: parseInt(movieForm.releaseYear) || new Date().getFullYear(),
        genres: movieForm.genres.length > 0 ? movieForm.genres : ['Action']
      };

      if (showEditForm && editingMovie) {
        // Update movie
        const movieId = editingMovie.id || editingMovie._id;
        console.log('Updating movie:', movieId, movieData);

        const response = await movieApi.update(movieId, movieData, token);
        console.log('Update response:', response);

        // Reload movies to get fresh data
        await loadMovies();
      } else {
        // Create new movie
        console.log('Creating movie:', movieData);
        const response = await movieApi.create(movieData, token);
        console.log('Create response:', response);

        // Reload movies to get updated list
        await loadMovies();
      }

      // Close form and reset
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingMovie(null);
      resetMovieForm();

    } catch (error) {
      console.error('Error saving movie:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi lưu phim';
      setError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (movie) => {
    console.log('Editing movie:', movie);
    setEditingMovie(movie);

    // Handle genres - convert objects to strings if needed
    let genres = movie.genres || [];
    if (genres.length > 0 && typeof genres[0] === 'object') {
      genres = genres.map(g => g.name || g);
    }

    setMovieForm({
      title: movie.title || '',
      description: movie.description || '',
      posterUrl: movie.posterUrl || movie.poster || '',
      trailerUrl: movie.trailerUrl || movie.trailer || '',
      genres: genres,
      releaseYear: movie.releaseYear || movie.year || '',
      status: movie.status || 'ongoing',
      country: movie.country || '',
      type: movie.type || 'Movies'
    });
    setShowEditForm(true);
  };

  const handleDelete = async (movie) => {
    const movieId = movie.id || movie._id;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phim "${movie.title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('Deleting movie:', movieId);

      await movieApi.delete(movieId, token);

      // Reload movies to get fresh data
      await loadMovies();

    } catch (error) {
      console.error('Error deleting movie:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi xóa phim';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const getGenreName = (genreId) => {
    const genre = genres.find(g => (g._id || g.name) === genreId);
    return genre ? genre.name : genreId;
  };
  // Navigate to episode management page
  const handleManageEpisodes = (movie) => {
    const movieId = movie.id || movie._id;
    navigate(`/admin/movies/${movieId}/episodes`, {
      state: { movieTitle: movie.title }
    });
  };

  const resetMovieForm = () => {
    setMovieForm({
      title: '',
      description: '',
      posterUrl: '',
      trailerUrl: '',
      genres: [],
      releaseYear: '',
      status: 'ongoing',
      country: '',
      type: 'Movies'
    });
  };

  const closeAllForms = () => {
    setShowAddForm(false);
    setShowEditForm(false);
    setEditingMovie(null);
    setError('');
    resetMovieForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Quản lý phim</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm phim mới</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 border border-red-500 rounded-lg p-4">
          <p className="text-white">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 text-red-200 hover:text-white text-sm underline"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium">Bộ lọc</span>
            {hasActiveFilters && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                {Object.values(filters).filter(f => f !== '').length}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-white text-sm flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-400 hover:text-white"
            >
              {showFilters ? 'Thu gọn' : 'Mở rộng'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Thể loại</label>
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map((genre) => (
                  <option key={genre._id || genre.name} value={genre._id || genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Năm phát hành</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tất cả năm</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Loại phim</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tất cả loại</option>
                <option value="Movies">Movies</option>
                <option value="TvSeries">TV Series</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ongoing">Đang chiếu</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.genre && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Thể loại:{getGenreName(filters.genre)}</span>
                <button
                  onClick={() => handleFilterChange('genre', '')}
                  className="hover:bg-red-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.year && (
              <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Năm: {filters.year}</span>
                <button
                  onClick={() => handleFilterChange('year', '')}
                  className="hover:bg-blue-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.type && (
              <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Loại: {filters.type}</span>
                <button
                  onClick={() => handleFilterChange('type', '')}
                  className="hover:bg-green-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="bg-yellow-600 text-white text-xs px-3 py-1 rounded-full flex items-center space-x-1">
                <span>Trạng thái: {filters.status === 'ongoing' ? 'Đang chiếu' : 'Đã hoàn thành'}</span>
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className="hover:bg-yellow-700 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-white">Đang tải...</span>
        </div>
      )}

      {/* Movies Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const movieId = movie.id || movie._id;
            return (
              <div key={movieId} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                <img
                  src={movie.posterUrl || '/api/placeholder/200/300'}
                  alt={movie.title}
                  className="w-full h-64 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleManageEpisodes(movie)}
                  onError={(e) => {
                    e.target.src = '/api/placeholder/200/300';
                  }}
                />
                <div className="p-4">
                  <h3
                    className="text-white font-bold text-lg mb-2 truncate cursor-pointer hover:text-red-400 transition-colors"
                    onClick={() => handleManageEpisodes(movie)}
                  >
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">Năm: {movie.releaseYear}</p>
                  <div className="flex items-center space-x-2 mb-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      {(movie.viewCount || 0).toLocaleString()} lượt xem
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(movie.genres || []).slice(0, 2).map((genre, index) => (
                      <span
                        key={`${movieId}-genre-${index}-${typeof genre === 'object' ? genre.name : genre}`}
                        className="bg-red-600 text-white text-xs px-2 py-1 rounded"
                      >
                        {typeof genre === 'object' ? genre.name : genre}
                      </span>
                    ))}
                    {(movie.genres || []).length > 2 && (
                      <span className="text-gray-400 text-xs">+{movie.genres.length - 2}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs px-2 py-1 rounded ${movie.status === 'completed' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                      }`}>
                      {movie.status === 'completed' ? 'Hoàn thành' : 'Đang chiếu'}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white text-xs transition-colors"
                        title="Chỉnh sửa phim"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleManageEpisodes(movie)}
                        className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs transition-colors"
                        title="Quản lý tập phim"
                      >
                        <PlayCircle className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie)}
                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs transition-colors"
                        title="Xóa phim"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && movies.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">
            {searchTerm || hasActiveFilters ? 'Không tìm thấy phim nào phù hợp' : 'Chưa có phim nào'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              Xóa bộ lọc và hiển thị tất cả
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && movies.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-gray-400">
            Hiển thị trang {currentPage} / {totalPages} ({totalMovies} phim)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 bg-gray-700 text-white rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Movie Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {showEditForm ? 'Chỉnh sửa phim' : 'Thêm phim mới'}
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
                    Tên phim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Nhập tên phim"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Năm ra mắt</label>
                  <input
                    type="number"
                    value={movieForm.releaseYear}
                    onChange={(e) => setMovieForm({ ...movieForm, releaseYear: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear() + 5}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                <textarea
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nhập mô tả phim"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Poster URL</label>
                  <input
                    type="url"
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trailer URL</label>
                  <input
                    type="url"
                    value={movieForm.trailerUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, trailerUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://example.com/trailer.mp4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Thể loại</label>
                {genresLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    <span className="ml-2 text-gray-400 text-sm">Đang tải thể loại...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                    {genres.map((genre) => (
                      <label key={genre._id || genre.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={movieForm.genres.includes(genre.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMovieForm({ ...movieForm, genres: [...movieForm.genres, genre.name] });
                            } else {
                              setMovieForm({ ...movieForm, genres: movieForm.genres.filter(g => g !== genre.name) });
                            }
                          }}
                          className="rounded border-gray-600 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-gray-300 text-sm">{genre.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái</label>
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="ongoing">Đang chiếu</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Đất nước</label>
                  <input
                    type="text"
                    value={movieForm.country}
                    onChange={(e) => setMovieForm({ ...movieForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="USA"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Loại phim</label>
                  <select
                    value={movieForm.type}
                    onChange={(e) => setMovieForm({ ...movieForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Movies">Movies</option>
                    <option value="TvSeries">TV Series</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleMovieSubmit}
                  disabled={submitLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {showEditForm ? 'Đang cập nhật...' : 'Đang thêm...'}
                    </>
                  ) : (
                    showEditForm ? 'Cập nhật' : 'Thêm mới'
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

export default MovieManagement;
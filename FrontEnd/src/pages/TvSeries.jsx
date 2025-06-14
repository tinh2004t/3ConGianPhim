import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import MovieCard from '../components/UI/MovieCard';
import movieApi from '../api/movieApi';
import genreApi from '../api/genreApi';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([{ id: 'all', name: 'All Genres' }]);
  const [loading, setLoading] = useState(true);
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 18; // số phim mỗi trang

  const years = [
    { id: 'all', name: 'All Years' },
    { id: '2024', name: '2024' },
    { id: '2023', name: '2023' },
    { id: '2022', name: '2022' },
    { id: '2021', name: '2021' },
    { id: '2020', name: '2020' },
    { id: '2019', name: '2019' },
    { id: '2018', name: '2018' },
    { id: 'older', name: 'Before 2018' }
  ];

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await genreApi.getAll();
        const data = res.data || res;
        
        // Kiểm tra xem data có phải là array không
        let genreList = [];
        if (Array.isArray(data)) {
          genreList = data;
        } else if (Array.isArray(data.data)) {
          genreList = data.data;
        } else if (Array.isArray(data.genres)) {
          genreList = data.genres;
        } else {
          console.log('Genre data structure:', data);
          genreList = [];
        }
        
        // Đảm bảo mỗi genre có cả id và _id để tương thích
        const processedGenres = genreList.map(genre => ({
          ...genre,
          id: genre._id || genre.id,
          _id: genre._id || genre.id
        }));
        
        setGenres([{ id: 'all', name: 'All Genres' }, ...processedGenres]);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
        // Set genres mặc định nếu có lỗi
        setGenres([{ id: 'all', name: 'All Genres' }]);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies with filters
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const params = {
          type: 'TvSeries',
          page: currentPage,
          limit: limit,
          sort: 'viewCount'
        };

        // Genre filter
        if (genreFilter !== 'all') {
          params.genre = genreFilter;
        }
        
        // Year filter
        if (yearFilter !== 'all') {
          if (yearFilter === 'older') {
            params.yearBefore = 2018;
          } else {
            params.year = yearFilter;
          }
        }

        const res = await movieApi.getAll(params);
        const result = res.data || res;

        // Extract movie list from response
        let movieList = [];
        if (Array.isArray(result.data)) {
          movieList = result.data;
        } else if (Array.isArray(result.movies)) {
          movieList = result.movies;
        } else if (Array.isArray(result)) {
          movieList = result;
        } else {
          console.log('Movie data structure:', result);
          movieList = [];
        }

        // Sort movies based on sortBy
        const sorted = [...movieList].sort((a, b) => {
          switch (sortBy) {
            case 'popularity':
              return (b.viewCount || 0) - (a.viewCount || 0);
            case 'release-date-desc':
              return (b.releaseYear || 0) - (a.releaseYear || 0);
            case 'release-date-asc':
              return (a.releaseYear || 0) - (b.releaseYear || 0);
            case 'title-asc':
              return (a.title || '').localeCompare(b.title || '');
            case 'title-desc':
              return (b.title || '').localeCompare(a.title || '');
            default:
              return 0;
          }
        });

        setMovies(sorted);
        
        // Set total pages
        const totalItems = result.total || result.totalItems || movieList.length;
        const calculatedPages = Math.ceil(totalItems / limit);
        setTotalPages(result.totalPages || calculatedPages || 1);

      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setMovies([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [genreFilter, yearFilter, sortBy, currentPage]);

  const handleClearFilters = () => {
    setGenreFilter('all');
    setYearFilter('all');
    setSortBy('popularity');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top when changing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis1" className="px-2 text-gray-400">...</span>
        );
      }
    }

    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 rounded ${
            currentPage === i
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis2" className="px-2 text-gray-400">...</span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded"
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Phim bộ</h1>

       {/* Filters - Responsive Design */}
      <div className="bg-gray-800 rounded-lg p-3 sm:p-6 mb-6 sm:mb-8">
        {/* Mobile: 2x2 grid layout, Desktop: Flex horizontally */}
        <div className="grid grid-cols-2 gap-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 lg:gap-6">
          {/* Genre */}
          <div className="sm:w-auto sm:min-w-[180px] lg:min-w-[200px]">
            <label className="block text-gray-400 mb-1 sm:mb-2 text-xs sm:text-sm font-medium">Thể loại</label>
            <select
              value={genreFilter}
              onChange={(e) => {
                console.log('Genre filter changed to:', e.target.value);
                setGenreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-2 sm:px-3 py-2 sm:py-2.5 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="sm:w-auto sm:min-w-[140px] lg:min-w-[160px]">
            <label className="block text-gray-400 mb-1 sm:mb-2 text-xs sm:text-sm font-medium">Năm</label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-2 sm:px-3 py-2 sm:py-2.5 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-auto sm:min-w-[200px] lg:min-w-[220px]">
            <label className="block text-gray-400 mb-1 sm:mb-2 text-xs sm:text-sm font-medium">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-2 sm:px-3 py-2 sm:py-2.5 w-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="popularity">Phổ biến</option>
              <option value="release-date-desc">Mới nhất</option>
              <option value="release-date-asc">Cũ nhất</option>
              <option value="title-asc">A-Z</option>
              <option value="title-desc">Z-A</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(genreFilter !== 'all' || yearFilter !== 'all' || sortBy !== 'popularity') && (
            <div className="flex items-end sm:w-auto sm:flex sm:items-end">
              <button
                onClick={handleClearFilters}
                className="w-full sm:w-auto bg-gray-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded hover:bg-gray-500 transition text-xs sm:text-sm font-medium"
              >
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          <p className="text-gray-400 ml-4">Đang tải phim...</p>
        </div>
      ) : movies.length === 0 ? (
        /* No Movies Found */
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-gray-400 text-lg mb-4">Không tìm thấy phim nào phù hợp.</p>
          <button
            onClick={handleClearFilters}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        /* Movies Grid and Pagination */
        <>
          {/* Results Info */}
          <div className="mb-4 text-gray-400">
            Hiển thị {movies.length} phim {totalPages > 1 && `(Trang ${currentPage}/${totalPages})`}
          </div>

          {/* Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-8">
            {movies.map((movie) => (
              <MovieCard
                key={movie._id || movie.id}
                id={movie._id || movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                releaseYear={movie.releaseYear}
                viewCount={movie.viewCount}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 flex-wrap">
              {/* Previous Button */}
              <button
                className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="hidden sm:inline">‹ Prev</span>
                <span className="sm:hidden">‹</span>
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1 sm:gap-2 overflow-x-auto max-w-full">
                {renderPaginationButtons()}
              </div>

              {/* Next Button */}
              <button
                className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="hidden sm:inline">Next ›</span>
                <span className="sm:hidden">›</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;
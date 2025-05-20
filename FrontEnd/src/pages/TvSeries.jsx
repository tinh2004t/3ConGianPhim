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

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await genreApi.getAll();
        const data = res.data || res;
        setGenres([{ id: 'all', name: 'All Genres' }, ...data]);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

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

        if (genreFilter !== 'all') params.genre = genreFilter;
        if (yearFilter !== 'all') {
          if (yearFilter === 'older') {
            params.yearBefore = 2018;
          } else {
            params.year = yearFilter;
          }
        }

        const res = await movieApi.getAll(params);
        const result = res.data || res;
        console.log('API result:', result);

        let movieList = [];

if (Array.isArray(result.data)) {
  movieList = result.data;
} else if (Array.isArray(result.movies)) {
  movieList = result.movies;
} else if (Array.isArray(result)) {
  movieList = result;
} else {
  movieList = [];
}

const sorted = [...movieList].sort((a, b) => {
  if (sortBy === 'popularity') return b.viewCount - a.viewCount;
  if (sortBy === 'release-date-desc') return b.releaseYear - a.releaseYear;
  if (sortBy === 'release-date-asc') return a.releaseYear - b.releaseYear;
  if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
  if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
  return 0;
});

setMovies(sorted);
setTotalPages(result.totalPages || Math.ceil((result.totalItems || 0) / limit));


        setTotalPages(result.totalPages || Math.ceil(result.total / limit));
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
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Phim bộ</h1>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex flex-wrap gap-6">
          {/* Genre */}
          <div className="w-full md:w-auto">
            <label className="block text-gray-400 mb-2">Genre</label>
            <select
              value={genreFilter}
              onChange={(e) => {
                setGenreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-4 py-2 w-full"
            >
              {genres.map((genre) => (
                <option key={genre.id || genre._id} value={genre.id || genre._id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="w-full md:w-auto">
            <label className="block text-gray-400 mb-2">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-4 py-2 w-full"
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-auto">
            <label className="block text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 text-white rounded px-4 py-2 w-full"
            >
              <option value="popularity">Độ phổ biến</option>
              <option value="release-date-desc">Ngày phát hành (Mới nhất)</option>
              <option value="release-date-asc">Ngày phát hành (Cũ nhất)</option>
              <option value="title-asc">Tiêu đề (A-Z)</option>
              <option value="title-desc">Tiêu đề (Z-A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {loading ? (
        <p className="text-gray-400">Đang tải phim...</p>
      ) : movies.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Không tìm thấy phim nào phù hợp.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
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
          <div className="mt-10 flex justify-center items-center gap-2 flex-wrap">
            <button
              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            {[...Array(totalPages).keys()].map((i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 rounded ${
                  currentPage === i + 1
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Movies;

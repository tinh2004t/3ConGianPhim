import React, { useEffect, useState } from 'react';
import userApi from '../api/userApi';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Lấy user
        const userResponse = await userApi.getMe(token);
        setUser(userResponse.data);

        // Lấy favorites
        const favResponse = await userApi.getFavorites(token);
        setFavorites(favResponse.data);

        // Lấy history
        const historyResponse = await userApi.getHistory(token);
        console.log("History data:", historyResponse.data);

        setHistory(historyResponse.data);

      } catch (error) {
        console.error('Lỗi khi gọi API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleRemoveFavorite = async (movieId) => {
    try {
      const token = localStorage.getItem('token');
      await userApi.deleteFavorite(movieId, token);
      setFavorites(favorites.filter(movie => movie._id !== movieId));
    } catch (error) {
      console.error('Lỗi khi xóa phim yêu thích:', error);
    }
  };

  const handlePlayMovie = (movieId, episodeId = null) => {
    if (episodeId) {
      navigate(`/watch/${movieId}/episodes/${episodeId}`);
    } else {
      navigate(`/movies/${movieId}`);
    }
  };


  const formatWatchDate = (dateString) => {
  if (!dateString) return 'Chưa xem';

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} ngày trước`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ trước`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} phút trước`;
  } else {
    return 'Vừa xem';
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-gray-300 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">User not found or not logged in.</p>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-white bg-opacity-20 rounded-full mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-white mb-3">{user.username}</h3>
                <p className="text-red-100 text-xl mb-2">{user.email}</p>
                <p className="text-red-200">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <svg className="w-8 h-8 mx-auto mb-3 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <div className="text-3xl font-bold mb-1">{favorites.length}</div>
                  <div className="text-red-100 text-sm font-medium">Favorites</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <svg className="w-8 h-8 mx-auto mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-3xl font-bold mb-1">{history.length}</div>
                  <div className="text-blue-100 text-sm font-medium">Watched</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <svg className="w-8 h-8 mx-auto mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-3xl font-bold mb-1">
                    {Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-purple-100 text-sm font-medium">Days Active</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-white">Watching History</h3>
              </div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {history.length} items
              </span>
            </div>

            {history && history.length > 0 ? (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all hover:bg-gray-600 overflow-hidden group"
                  >
                    <div className="flex items-center p-4">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0 mr-4">
                        <img
                          src={item.movie?.posterUrl || '/default-movie-poster.png'}
                          alt={item.movie?.title || 'Movie'}
                          className="w-16 h-20 object-cover rounded-md border border-gray-500"
                        />
                      </div>

                      {/* Movie Info */}
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-semibold text-lg leading-tight mb-1">
                              {item.movie?.title || 'Unknown Movie'}
                            </h4>
                            {item.episode && (
                              <p className="text-red-400 text-sm mb-1">
                                Tập {item.episode.episodeNumber}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{item.movie?.releaseYear || 'Unknown Year'}</span>
                              <span>•</span>
                              <span>{formatWatchDate(item.updatedAt)}</span>
                              {item.movie?.genre && (
                                <>
                                  <span>•</span>
                                  <span>{item.movie.genre}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                              onClick={() => handlePlayMovie(item.movie?._id, item.episode?._id)}
                              title="Continue Watching"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                            <button 
                              className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-colors"
                              onClick={() => navigate(`/movies/${item.movie?._id}`)}
                              title="View Movie Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar (if available) */}
                        {item.progress && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{Math.round(item.progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-1">
                              <div 
                                className="bg-red-500 h-1 rounded-full transition-all" 
                                style={{ width: `${item.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-20 w-20 text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h4 className="text-2xl font-semibold text-gray-300 mb-3">No History Yet</h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start watching movies to see your viewing history here.
                </p>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => navigate('/movies')}
                >
                  Browse Movies
                </button>
              </div>
            )}
          </div>
        );

      case 'favorites':
        return (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <h3 className="text-2xl font-bold text-white">My Favorites</h3>
              <span className="ml-auto bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {favorites.length} movies
              </span>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {favorites.map((movie) => (
                  <div key={movie._id} className="group cursor-pointer">
                    <div className="relative overflow-hidden rounded-lg shadow-lg border border-gray-600 transition-all duration-300 hover:border-red-500 hover:shadow-2xl hover:scale-105">
                      <img
                        src={movie.posterUrl || '/default-movie-poster.png'}
                        alt={movie.title}
                        className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayMovie(movie._id);
                              }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </button>
                            <button 
                              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(movie._id);
                              }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-white font-semibold text-sm leading-tight line-clamp-2 group-hover:text-red-400 transition-colors">
                        {movie.title}
                      </h4>
                      {movie.year && (
                        <p className="text-gray-400 text-xs mt-1">{movie.year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg className="mx-auto h-20 w-20 text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <h4 className="text-2xl font-semibold text-gray-300 mb-3">No Favorites Yet</h4>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Discover amazing movies and add them to your favorites to build your personal collection.
                </p>
                <button 
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  onClick={() => navigate('/movies')}
                >
                  Browse Movies
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">My Account</h1>
          <p className="text-gray-400 text-lg">Manage your profile and movie preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-xl p-1 border border-gray-700">
            <div className="flex space-x-1">
              {[
                { key: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                { key: 'history', label: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                { key: 'favorites', label: 'Favorites', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`flex items-center space-x-2 py-3 px-6 font-medium rounded-lg transition-all duration-200 ${activeTab === tab.key
                      ? 'bg-red-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Account;
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import movieApi from '../api/movieApi';
import { useNavigate } from 'react-router-dom';
import episodeApi from '../api/episodeApi';
import userApi from '../api/userApi';


// Component Notification tùy chỉnh
const Notification = ({ notification, onClose }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Tự động đóng sau 4 giây

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600 border-green-500';
      case 'error':
        return 'bg-red-600 border-red-500';
      case 'warning':
        return 'bg-yellow-600 border-yellow-500';
      case 'info':
        return 'bg-blue-600 border-blue-500';
      default:
        return 'bg-gray-600 border-gray-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${getBgColor()} border-l-4 text-white p-4 rounded-lg shadow-lg max-w-sm`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 text-xl">
            {getIcon()}
          </div>
          <div className="flex-grow">
            <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-white hover:text-gray-200 text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

// Component Modal xác nhận
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movieData, setMovieData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeTab, setActiveTab] = useState('episodes');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [maxEpisodesToShow, setMaxEpisodesToShow] = useState(11);
  const navigate = useNavigate();

  // Hàm hiển thị thông báo
  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  // Hàm đóng thông báo
  const closeNotification = () => {
    setNotification(null);
  };

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, episodesRes] = await Promise.all([
          movieApi.getById(id),
          episodeApi.getEpisodesByMovieId(id),
        ]);

        setMovieData(movieRes.data);

        const epList = episodesRes.data?.data || episodesRes.data;
        setEpisodes(Array.isArray(epList) ? epList : []);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết phim hoặc tập phim:', error);
        setEpisodes([]);
        showNotification('error', 'Lỗi tải dữ liệu', 'Không thể tải thông tin phim. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);

  useEffect(() => {
    const updateMaxEpisodes = () => {
      setMaxEpisodesToShow(window.innerWidth <= 768 ? 9 : 11);
    };

    updateMaxEpisodes(); // Cập nhật khi lần đầu render
    window.addEventListener('resize', updateMaxEpisodes);

    return () => window.removeEventListener('resize', updateMaxEpisodes);
  }, []);

  const episodesToDisplay = showAllEpisodes ? episodes : episodes.slice(0, maxEpisodesToShow);
  const hasMoreEpisodes = episodes.length > maxEpisodesToShow && !showAllEpisodes;


  const handleAddToFavorites = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setShowConfirmModal(true);
      return;
    }

    if (!movieData?._id) {
      showNotification('error', 'Lỗi hệ thống', 'Không xác định được phim. Vui lòng thử lại.');
      return;
    }

    setIsAddingFavorite(true);

    try {
      await userApi.addFavorite(movieData._id, token);
      showNotification('success', 'Thành công!', 'Đã thêm phim vào danh sách yêu thích của bạn ❤️');
    } catch (error) {
      console.error('Lỗi khi thêm vào yêu thích:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      showNotification('error', 'Không thể thêm yêu thích', errorMessage);
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleConfirmLogin = () => {
    setShowConfirmModal(false);
    navigate('/login');
  };

  const handleCancelLogin = () => {
    setShowConfirmModal(false);
  };

  const getEpisodeDisplayName = (episode) => {
    if (movieData?.type === 'Movies') {
      return episode.title || episode.name || `Tập ${episode.episodeNumber || episode.number || ''}`;
    } else {
      return episode.episodeNumber || `Tập ${episode.number}`;
    }
  };

  const tabs = [
    { id: 'episodes', label: 'Danh sách tập' },
    { id: 'synopsis', label: 'Nội dung' },
  ];

  if (loading) {
    return (
      <div className="text-center py-10 text-white">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-2">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="text-center py-10 text-red-500">Không tìm thấy thông tin phim.</div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 text-white">
        {/* Tiêu đề phim */}
        <div className="bg-gray-800 p-4 mb-4 rounded-md">
          <h1 className="text-2xl font-bold text-center text-white">{movieData.title}</h1>
        </div>

        {/* Chi tiết phim */}
        <div className="bg-gray-900 p-4 rounded-md mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Poster */}
            <div className="md:col-span-1">
              <img
                src={movieData.posterUrl}
                alt={movieData.title}
                className="w-full max-w-xs mx-auto md:mx-0 h-auto rounded-md shadow-lg"
                style={{ maxHeight: '350px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/230x350?text=No+Image';
                }}
              />
            </div>

            {/* Thông tin */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-400">Thể loại</div>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {(movieData.genres || []).map((genre, idx) => (
                    <span key={idx} className="bg-gray-700 px-2 py-1 rounded text-sm">
                      {genre.name || 'Không rõ'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-400">Trạng thái</div>
                <div className="col-span-2">{movieData.status}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-400">Đất nước</div>
                <div className="col-span-2">{movieData.country}</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-400">Lượt xem</div>
                <div className="col-span-2">{movieData.viewCount} lượt xem</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-400">Phát hành</div>
                <div className="col-span-2">{movieData.releaseYear}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-md mb-4">
          <div className="flex justify-between items-center border-b border-gray-700 px-4">
            <div className="flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 ${activeTab === tab.id ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleAddToFavorites}
              disabled={isAddingFavorite}
              className={`px-4 py-2 rounded transition flex items-center gap-2 ${isAddingFavorite
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {isAddingFavorite ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Đang thêm...</span>
                </>
              ) : (
                <>
                  <span>Yêu Thích</span>
                  <span>❤️</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4">
            {activeTab === 'episodes' && (
              <div>
                {episodes.length === 0 ? (
                  <div>
                    <p className="text-gray-300">Tập phim đang được chúng mình cập nhật, bạn hãy quay lại sau nhé❤️🫶</p>
                    <p className="text-gray-300">Hãy thêm phim vào yêu thích❤️ để nhận được thông báo khi có tập mới🫶</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {episodesToDisplay.map((ep) => (
                      <a
                        key={ep._id}
                        href={`/watch/${movieData._id}/episodes/${ep._id}`}
                        className="bg-gray-800 hover:bg-gray-700 text-center py-3 rounded text-white transition"
                      >
                        {getEpisodeDisplayName(ep)}
                      </a>
                    ))}
                    {hasMoreEpisodes && (
                      <button
                        onClick={() => setShowAllEpisodes(true)}
                        className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-500 transition"
                      >
                        ...
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'synopsis' && (
              <div className="text-gray-300">
                {movieData.description || 'Không có nội dung mô tả.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification notification={notification} onClose={closeNotification} />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={handleConfirmLogin}
        onCancel={handleCancelLogin}
        title="Yêu cầu đăng nhập"
        message="Bạn cần đăng nhập để thêm phim vào danh sách yêu thích."
      />

      {/* CSS cho animation */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default MovieDetail;
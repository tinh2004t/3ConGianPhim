import React, { useEffect, useState } from 'react';
import episodeApi from './../api/episodeApi';
import movieApi from './../api/movieApi';
import { useParams, useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import commentApi from '../api/commentApi';

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
const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = "Xác nhận", cancelText = "Hủy" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="mb-4 text-4xl">🤔</div>
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MoviePlayer = () => {
  const { movieId, episodeId } = useParams();
  const navigate = useNavigate();

  const [movieTitle, setMovieTitle] = useState('');
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedServer, setSelectedServer] = useState('Server #1');
  const [loading, setLoading] = useState(true);
  const [viewCounted, setViewCounted] = useState(new Set());
  
  // States cho notification system
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null });
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Hàm hiển thị thông báo
  const showNotification = (type, title, message) => {
    setNotification({ type, title, message });
  };

  // Hàm đóng thông báo
  const closeNotification = () => {
    setNotification(null);
  };

  // Load danh sách tập và dữ liệu cơ bản
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Load episodes và movie title
        const [epRes, movieRes] = await Promise.all([
          episodeApi.getEpisodesByMovieId(movieId),
          movieApi.getById(movieId)
        ]);
        
        const fetchedEpisodes = epRes.data;
        setEpisodes(fetchedEpisodes);
        setMovieTitle(movieRes.data.title);

        // Load user info
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

      } catch (err) {
        console.error('Lỗi khi tải dữ liệu ban đầu:', err);
        showNotification('error', 'Lỗi tải dữ liệu', 'Không thể tải thông tin phim. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [movieId]);

  // Load episode cụ thể và comments khi episodeId thay đổi
  useEffect(() => {
    const loadEpisodeAndComments = async () => {
      if (!episodes.length) return;

      try {
        let targetEpisodeId = episodeId;
        
        // Nếu không có episodeId trong URL, chọn tập đầu tiên
        if (!episodeId && episodes.length > 0) {
          targetEpisodeId = episodes[0]._id;
          navigate(`/watch/${movieId}/episodes/${targetEpisodeId}`, { replace: true });
          return;
        }

        // Load episode được chọn - SỬ DỤNG API KHÔNG TĂNG VIEW
        if (targetEpisodeId) {
          const episodeRes = await episodeApi.getEpisodeById(targetEpisodeId);
          setSelectedEpisode(episodeRes.data);

          // Add to history
          const token = localStorage.getItem('token');
          if (token) {
            await userApi.addHistory({
              movieId,
              episodeId: targetEpisodeId,
            }, token);
          }

          // Load comments cho episode này
          const commentRes = await commentApi.getComments({
            movieId,
            episodeId: targetEpisodeId,
          });
          setComments(Array.isArray(commentRes.data.comments) ? commentRes.data.comments : []);
        }

      } catch (err) {
        console.error('Lỗi khi tải tập phim:', err);
        showNotification('error', 'Lỗi tải tập phim', 'Không thể tải thông tin tập phim này.');
      }
    };

    loadEpisodeAndComments();
  }, [episodes, episodeId, movieId, navigate]);

  // Tăng lượt xem khi bắt đầu xem video (chỉ tăng 1 lần mỗi tập)
  useEffect(() => {
    const incrementViewCount = async () => {
      if (!selectedEpisode || !movieId || viewCounted.has(selectedEpisode._id)) {
        console.log('⏭️ Skip incrementViewCount:', {
          hasSelectedEpisode: !!selectedEpisode,
          hasMovieId: !!movieId,
          alreadyCounted: viewCounted.has(selectedEpisode?._id)
        });
        return;
      }
      
      try {
        // Đánh dấu ngay lập tức để tránh gọi API nhiều lần
        setViewCounted(prev => new Set([...prev, selectedEpisode._id]));
        
        console.log(`🎬 Calling watchEpisode API for episode: ${selectedEpisode.episodeNumber}`);
        
        // Gọi API watchEpisode để tăng lượt xem
        const response = await episodeApi.watchEpisode(movieId, selectedEpisode._id);
        
        console.log(`✅ Successfully increased view count:`, response.data);
      } catch (error) {
        console.error('❌ Lỗi khi tăng lượt xem:', error);
        // Nếu API thất bại, loại bỏ episodeId khỏi Set để có thể thử lại
        setViewCounted(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedEpisode._id);
          return newSet;
        });
      }
    };

    // Delay một chút để đảm bảo user thực sự bắt đầu xem
    const timer = setTimeout(incrementViewCount, 2000);
    
    return () => clearTimeout(timer);
  }, [selectedEpisode, movieId, viewCounted]);

  // Khi chọn tập - chỉ cần navigate, useEffect sẽ handle việc còn lại
  const handleSelectEpisode = async (episode) => {
    // Reset server về server đầu tiên khi chuyển tập
    setSelectedServer('Server #1');
    
    // Navigate đến URL mới - useEffect sẽ tự động load episode mới
    navigate(`/watch/${movieId}/episodes/${episode._id}`);
    showNotification('info', 'Chuyển tập', `Đang chuyển sang tập ${episode.episodeNumber}`);
  };

  // Tập tiếp theo
  const handleNextEpisode = () => {
    if (!selectedEpisode || !episodes.length) return;
    
    const currentIndex = episodes.findIndex(ep => ep._id === selectedEpisode._id);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      const nextEp = episodes[currentIndex + 1];
      handleSelectEpisode(nextEp);
    } else {
      showNotification('info', 'Hết tập phim', 'Bạn đã xem hết tất cả các tập có sẵn.');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      setConfirmModal({
        isOpen: true,
        type: 'login',
        data: null
      });
      return;
    }

    if (!commentText.trim()) {
      showNotification('warning', 'Nội dung trống', 'Vui lòng nhập nội dung bình luận.');
      return;
    }

    setIsSubmittingComment(true);

    try {
      const data = {
        movieId,
        episodeId: episodeId || null,
        content: commentText,
      };

      const res = await commentApi.createComment(data, token);
      setComments([res.data, ...comments]);
      setCommentText('');
      showNotification('success', 'Gửi thành công', 'Bình luận của bạn đã được đăng tải.');
    } catch (err) {
      console.error('Lỗi gửi bình luận:', err);
      const errorMessage = err.response?.data?.message || 'Gửi bình luận thất bại';
      showNotification('error', 'Lỗi gửi bình luận', errorMessage);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setConfirmModal({
      isOpen: true,
      type: 'deleteComment',
      data: commentId
    });
  };

  const confirmDeleteComment = async () => {
    const commentId = confirmModal.data;
    const token = localStorage.getItem('token');
    
    if (!token) {
      showNotification('error', 'Lỗi xác thực', 'Bạn không có quyền thực hiện thao tác này.');
      return;
    }

    try {
      await commentApi.deleteComment(commentId, token);
      setComments(comments.filter((c) => c._id !== commentId));
      showNotification('success', 'Xóa thành công', 'Bình luận đã được xóa.');
    } catch (err) {
      console.error('Xóa thất bại:', err);
      showNotification('error', 'Xóa thất bại', 'Không thể xóa bình luận này.');
    } finally {
      setConfirmModal({ isOpen: false, type: '', data: null });
    }
  };

  const handleAddToFavorites = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setConfirmModal({
        isOpen: true,
        type: 'login',
        data: null
      });
      return;
    }

    if (!movieId) {
      showNotification('error', 'Lỗi hệ thống', 'Không xác định được phim. Vui lòng thử lại.');
      return;
    }

    setIsAddingFavorite(true);

    try {
      await userApi.addFavorite(movieId, token);
      showNotification('success', 'Thành công!', 'Đã thêm phim vào danh sách yêu thích của bạn ❤️');
    } catch (error) {
      console.error('Lỗi khi thêm vào yêu thích:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
      showNotification('error', 'Không thể thêm yêu thích', errorMessage);
    } finally {
      setIsAddingFavorite(false);
    }
  };

  const handleConfirmAction = () => {
    switch (confirmModal.type) {
      case 'login':
        navigate('/login');
        break;
      case 'deleteComment':
        confirmDeleteComment();
        break;
      default:
        break;
    }
    setConfirmModal({ isOpen: false, type: '', data: null });
  };

  // Lấy URL video theo server
  const getVideoUrl = () => {
    if (!selectedEpisode || !selectedEpisode.videoSources) return '';
    const index = parseInt(selectedServer.replace('Server #', '')) - 1;
    return selectedEpisode.videoSources[index]?.url || selectedEpisode.videoSources[0]?.url;
  };

  if (loading || !selectedEpisode) {
    return (
      <div className="text-center py-10 text-gray-300">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p>Đang tải dữ liệu tập phim...</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative p-4 max-w-7xl mx-auto transition">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-90 z-30 pointer-events-none transition-all duration-500" />

        {/* Thông tin phim */}
        <div className="relative z-40 bg-gray-800 rounded-xl p-4 mb-6 shadow-md">
          <h2 className="text-2xl font-bold">{movieTitle || 'Đang tải tên phim...'}</h2>
          <p className="text-gray-300 mt-1">Đang xem: Tập {selectedEpisode.episodeNumber}</p>

          <div className="mt-3 flex flex-wrap gap-3">
            {selectedEpisode?.videoSources?.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedServer(`Server #${index + 1}`)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition ${selectedServer === `Server #${index + 1}`
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-200'
                  } hover:bg-red-500`}
              >
                Server #{index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Video Player */}
        <div className="relative mb-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-lg z-40">
          <iframe
            key={`${selectedEpisode._id}-${selectedServer}`}
            src={getVideoUrl()}
            title="Video Player"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Điều khiển */}
        <div className="flex flex-col items-center space-y-3 mb-8 z-40 relative">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleNextEpisode}
              disabled={episodes.findIndex(ep => ep._id === selectedEpisode._id) === episodes.length - 1}
              className="bg-gray-800 px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tập tiếp theo
            </button>

            <a
              href={getVideoUrl()}
              download
              className="bg-gray-800 px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Tải về
            </a>

            <button
              onClick={handleAddToFavorites}
              disabled={isAddingFavorite}
              className={`px-4 py-2 rounded transition flex items-center gap-2 ${
                isAddingFavorite 
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
        </div>

        {/* Danh sách tập */}
        <div className="flex flex-col md:flex-row justify-between gap-6 z-40 relative">
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-2">Danh sách tập</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-12 gap-3">

              {episodes.map(ep => (
                <button
                  key={ep._id}
                  onClick={() => handleSelectEpisode(ep)}
                  className={`px-4 py-2 rounded-xl border transition-colors ${
                    selectedEpisode._id === ep._id
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-gray-800 text-gray-300 border-gray-600'
                    } hover:bg-red-500 hover:border-red-500`}
                >
                  {ep.episodeNumber}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bình luận */}
        <div className="mt-8 z-40 relative">
          <h3 className="text-xl font-semibold mb-2">Bình luận</h3>

          {user ? (
            <form className="mb-4" onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Viết bình luận..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className={`mt-2 px-4 py-2 rounded transition flex items-center gap-2 ${
                  isSubmittingComment || !commentText.trim()
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isSubmittingComment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  'Gửi'
                )}
              </button>
            </form>
          ) : (
            <div className="text-gray-300 mb-4">
              <button
                onClick={() => setConfirmModal({ isOpen: true, type: 'login', data: null })}
                className="text-red-500 underline hover:text-red-400"
              >
                Đăng nhập để bình luận
              </button>
            </div>
          )}

          <div className="space-y-4">
            {comments.length === 0 && (
              <div className="text-gray-400">Chưa có bình luận nào.</div>
            )}
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="p-3 bg-gray-800 rounded-xl relative group"
              >
                {/* Username */}
                <p className="text-sm font-semibold">
                  {comment.userId?.username || 'Ẩn danh'}
                </p>
                <p>{comment.content}</p>

                {/* Ba chấm + menu xóa */}
                {user && user._id === comment.user?._id && (
                  <div className="absolute top-2 right-2">
                    <div className="relative inline-block text-left">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === comment._id ? null : comment._id)
                        }
                        className="text-gray-400 hover:text-red-400 focus:outline-none"
                      >
                        ⋮
                      </button>

                      {openMenuId === comment._id && (
                        <div className="absolute right-0 mt-2 w-24 bg-white rounded-md shadow-lg z-50">
                          <button
                            onClick={() => {
                              handleDeleteComment(comment._id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-100 text-left"
                          >
                            Xóa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Component */}
      <Notification notification={notification} onClose={closeNotification} />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal({ isOpen: false, type: '', data: null })}
        title={
          confirmModal.type === 'login' ? 'Yêu cầu đăng nhập' :
          confirmModal.type === 'deleteComment' ? 'Xác nhận xóa' : 'Xác nhận'
        }
        message={
          confirmModal.type === 'login' ? 'Bạn cần đăng nhập để thực hiện chức năng này.' :
          confirmModal.type === 'deleteComment' ? 'Bạn chắc chắn muốn xóa bình luận này?' : 'Bạn có chắc chắn?'
        }
        confirmText={
          confirmModal.type === 'login' ? 'Đăng nhập' :
          confirmModal.type === 'deleteComment' ? 'Xóa' : 'Xác nhận'
        }
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

export default MoviePlayer;
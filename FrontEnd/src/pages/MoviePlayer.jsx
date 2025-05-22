import React, { useEffect, useState } from 'react';
import episodeApi from './../api/episodeApi';
import movieApi from './../api/movieApi';
import { useParams, useNavigate } from 'react-router-dom';
import userApi from '../api/userApi';
import commentApi from '../api/commentApi';

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

        // Load episode được chọn
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
      }
    };

    loadEpisodeAndComments();
  }, [episodes, episodeId, movieId, navigate]);

  // Khi chọn tập - chỉ cần navigate, useEffect sẽ handle việc còn lại
  const handleSelectEpisode = async (episode) => {
    // Reset server về server đầu tiên khi chuyển tập
    setSelectedServer('Server #1');
    
    // Navigate đến URL mới - useEffect sẽ tự động load episode mới
    navigate(`/watch/${movieId}/episodes/${episode._id}`);
  };

  // Tập tiếp theo
  const handleNextEpisode = () => {
    if (!selectedEpisode || !episodes.length) return;
    
    const currentIndex = episodes.findIndex(ep => ep._id === selectedEpisode._id);
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      const nextEp = episodes[currentIndex + 1];
      handleSelectEpisode(nextEp);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) return alert('Vui lòng đăng nhập để bình luận');

    try {
      const data = {
        movieId,
        episodeId: episodeId || null,
        content: commentText,
      };

      const res = await commentApi.createComment(data, token);
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      console.error('Lỗi gửi bình luận:', err);
      alert(err.response?.data?.message || 'Gửi bình luận thất bại');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Bạn không có quyền');

    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;

    try {
      await commentApi.deleteComment(commentId, token);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error('Xóa thất bại:', err);
      alert('Xóa bình luận thất bại');
    }
  };

  const handleAddToFavorites = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích!');
      return navigate('/login');
    }

    if (!movieId) {
      alert('Lỗi: Không xác định được phim!');
      return;
    }

    try {
      await userApi.addFavorite(movieId, token);
      alert('Đã thêm vào danh sách yêu thích!');
    } catch (error) {
      console.error('Lỗi khi thêm vào yêu thích:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
    }
  };

  // Lấy URL video theo server
  const getVideoUrl = () => {
    if (!selectedEpisode || !selectedEpisode.videoSources) return '';
    const index = parseInt(selectedServer.replace('Server #', '')) - 1;
    return selectedEpisode.videoSources[index]?.url || selectedEpisode.videoSources[0]?.url;
  };

  if (loading || !selectedEpisode) {
    return <div className="text-center py-10 text-gray-300">Đang tải dữ liệu tập phim...</div>;
  }

  return (
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
              className={`px-4 py-2 rounded-xl border text-sm font-medium ${selectedServer === `Server #${index + 1}`
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-200'
                } hover:bg-red-500 transition`}
            >
              Server #{index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Video Player */}
      <div className="relative mb-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-lg z-40">
        <iframe
          key={`${selectedEpisode._id}-${selectedServer}`} // Force re-render khi đổi tập hoặc server
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
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition flex items-center gap-2"
          >
            <span>Yêu Thích</span>
            <span>❤️</span>
          </button>
        </div>
      </div>

      {/* Danh sách tập */}
      <div className="flex flex-col md:flex-row justify-between gap-6 z-40 relative">
        <div className="md:w-2/3">
          <h3 className="text-xl font-semibold mb-2">Danh sách tập</h3>
          <div className="flex flex-wrap gap-3">
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
            />
            <button
              type="submit"
              className="mt-2 bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Gửi
            </button>
          </form>
        ) : (
          <div className="text-gray-300 mb-4">
            <a
              href="/login"
              className="text-red-500 underline hover:text-red-400"
            >
              Đăng nhập để bình luận
            </a>
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
  );
};

export default MoviePlayer;
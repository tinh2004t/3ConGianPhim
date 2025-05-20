import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import movieApi from '../api/movieApi';

import episodeApi from '../api/episodeApi';

const MovieDetail = () => {
  const { id } = useParams(); // Lấy ID phim từ URL
  const [movieData, setMovieData] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [activeTab, setActiveTab] = useState('episodes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, episodesRes] = await Promise.all([
          movieApi.getById(id),
          episodeApi.getEpisodesByMovieId(id),
        ]);


        setMovieData(movieRes.data);

        // Đảm bảo dữ liệu tập phim là mảng
        const epList = episodesRes.data?.data || episodesRes.data;
        setEpisodes(Array.isArray(epList) ? epList : []);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết phim hoặc tập phim:', error);
        setEpisodes([]); // fallback để tránh lỗi map
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [id]);




  const tabs = [
    { id: 'episodes', label: 'Danh sách tập' },
    { id: 'synopsis', label: 'Nội dung' },
    { id: 'comments', label: 'Bình luận' }
  ];

  if (loading) {
    return (
      <div className="text-center py-10 text-white">Đang tải dữ liệu...</div>
    );
  }

  if (!movieData) {
    return (
      <div className="text-center py-10 text-red-500">Không tìm thấy thông tin phim.</div>
    );
  }

  return (
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
        <div className="flex border-b border-gray-700">
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

        <div className="p-4">
          {activeTab === 'episodes' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => (
                <a
                  key={ep._id}
                  href={`/watch/${movieData._id}/episodes/${ep._id}`}
                  className="bg-gray-800 hover:bg-gray-700 text-center py-3 rounded text-white"
                >
                  {ep.episodeNumber || `Tập ${ep.number}`}
                </a>
              ))}
            </div>
          )}

          {activeTab === 'synopsis' && (
            <div className="text-gray-300">
              {movieData.description || 'Không có nội dung mô tả.'}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="text-gray-400 italic">Tính năng bình luận đang phát triển.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;

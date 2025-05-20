import React, { useEffect, useState } from 'react';
import episodeApi from './../api/episodeApi';
import movieApi from './../api/movieApi';
import { useParams, useNavigate } from 'react-router-dom';

const MoviePlayer = () => {
  const { movieId, episodeId } = useParams();
  const navigate = useNavigate();

  const [movieTitle, setMovieTitle] = useState('');


  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedServer, setSelectedServer] = useState('Server #1');

  // Load danh sách tập và chọn tập theo URL
useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await episodeApi.getEpisodesByMovieId(movieId);
      const fetchedEpisodes = res.data;
      
      setEpisodes(fetchedEpisodes);

      // ✅ Gọi API lấy tên phim
      const movieRes = await movieApi.getById(movieId);
      setMovieTitle(movieRes.data.title); // ✅ hoặc movieRes.data.name nếu key là 'name'

      if (fetchedEpisodes.length > 0) {
        const firstEpisodeId = fetchedEpisodes[0]._id;
        const firstEpisodeRes = await episodeApi.getEpisodeById(firstEpisodeId);
        setSelectedEpisode(firstEpisodeRes.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu tập phim hoặc tên phim:', err);
    }
  };

  fetchData();
}, [movieId, episodeId, navigate]);

  // Khi chọn tập
  const handleSelectEpisode = async (episode) => {
    try {
      const res = await episodeApi.getEpisodeById(episode._id);
      setSelectedEpisode(res.data);
      navigate(`/watch/${movieId}/episodes/${episode._id}`);
    } catch (err) {
      console.error('Lỗi khi chọn tập phim:', err);
    }
  };

  // Tập tiếp theo
  const handleNextEpisode = () => {
    if (!selectedEpisode) return;
    const index = episodes.findIndex(ep => ep._id === selectedEpisode._id);
    if (index !== -1 && index < episodes.length - 1) {
      const nextEp = episodes[index + 1];
      handleSelectEpisode(nextEp);
    }
  };

  // Lấy URL video theo server
  const getVideoUrl = () => {
    if (!selectedEpisode || !selectedEpisode.videoSources) return '';
    const index = parseInt(selectedServer.replace('Server #', '')) - 1;
    return selectedEpisode.videoSources[index]?.url || selectedEpisode.videoSources[0]?.url;
  };

  if (!selectedEpisode) {
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
            className="bg-gray-800 px-4 py-2 rounded hover:bg-red-600 transition disabled:opacity-50"
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
                className={`px-4 py-2 rounded-xl border ${selectedEpisode._id === ep._id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300'
                  } hover:bg-red-500 transition`}
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
        <form className="mb-4">
          <textarea
            placeholder="Viết bình luận..."
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
        <div className="space-y-4">
          <div className="p-3 bg-gray-800 rounded-xl">
            <p className="text-sm font-semibold">User123</p>
            <p>Phim quá hay, mong phần tiếp theo!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoviePlayer;

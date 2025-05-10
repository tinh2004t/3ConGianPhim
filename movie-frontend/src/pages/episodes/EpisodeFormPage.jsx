import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEpisodesByMovieId } from '../../api/episodeApi';

const EpisodeList = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const res = await getEpisodesByMovieId(movieId);
        const data = res.data;

        // Kiểm tra xem trả về mảng hay object
        const episodeList = Array.isArray(data) ? data : data.episodes;

        setEpisodes(episodeList || []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách tập.');
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [movieId]);

  if (loading) return <p>Đang tải tập phim...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2>Danh sách tập phim</h2>
      <div className="episode-list">
        {episodes.length === 0 ? (
          <p>Chưa có tập nào cho phim này.</p>
        ) : (
          episodes.map((episode) => (
            <div
              key={episode._id}
              className="episode-card"
              onClick={() => navigate(`/watch/${episode._id}`)}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                cursor: 'pointer',
              }}
            >
              <h4>{episode.title}</h4>
              <p>Tập số: {episode.episodeNumber}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EpisodeList;

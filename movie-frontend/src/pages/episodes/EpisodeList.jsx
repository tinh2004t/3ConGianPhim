import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEpisodesByMovieId } from '../../api/episodeApi';
import EpisodeCard from '../../components/EpisodeCard';

const EpisodeList = () => {
  const { movieId } = useParams();
  const [episodes, setEpisodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getEpisodesByMovieId(movieId).then((res) => setEpisodes(res.data));
  }, [movieId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Danh sách tập</h2>
      {episodes.map((ep) => (
        <EpisodeCard
          key={ep._id}
          episode={ep}
          onClick={() => navigate(`/watch/${ep._id}`)}
        />
      ))}
    </div>
  );
};

export default EpisodeList;

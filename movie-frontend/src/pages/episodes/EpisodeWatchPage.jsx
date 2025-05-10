import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEpisodeById } from '../../api/episodeApi';

const EpisodeWatchPage = () => {
  const { episodeId } = useParams();
  const [episode, setEpisode] = useState(null);

  useEffect(() => {
    getEpisodeById(episodeId).then((res) => {
      console.log("Dữ liệu trả về: ", res.data);  // Thêm dòng này để kiểm tra dữ liệu trả về
      setEpisode(res.data);
    });
  }, [episodeId]);

  if (!episode) return <div>Đang tải...</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{episode.title}</h2>

      {episode.videoSources && episode.videoSources.length > 0 ? (
        episode.videoSources.map((source, index) => (
          <div key={index} className="mb-6">
            <h4 className="font-semibold mb-2">{source.name}</h4>
            {source.type === 'iframe' ? (
              <iframe
                src={source.url}
                title={source.name}
                width="100%"
                height="500"
                allowFullScreen
                className="rounded shadow"
              />
            ) : (
              <video width="100%" height="500" controls className="rounded shadow">
                <source src={source.url} type="video/mp4" />
                Trình duyệt không hỗ trợ phát video.
              </video>
            )}
          </div>
        ))
      ) : (
        <p>Không có nguồn video.</p>
      )}

      {episode.description && <p className="mt-4">Mô tả: {episode.description}</p>}
      {episode.duration && <p>Thời lượng: {episode.duration} phút</p>}
    </div>
  );
};

export default EpisodeWatchPage;

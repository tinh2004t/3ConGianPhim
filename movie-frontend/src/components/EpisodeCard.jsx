import React from 'react';

const EpisodeCard = ({ episode, onClick }) => (
  <div onClick={onClick} className="border p-2 mb-2 cursor-pointer hover:bg-gray-100 rounded">
    <h3 className="text-lg font-bold">{episode.title}</h3>
    <p>Thời lượng: {episode.duration} phút</p>
  </div>
);

export default EpisodeCard;

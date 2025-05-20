import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ id, title, posterUrl, releaseYear, viewCount }) => {
  return (
    <div className="group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105">
      <Link to={`/movies/${id}`} aria-label={`Go to details of ${title}`}>
        <div className="relative aspect-[2/3] w-full">
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-semibold text-lg truncate">{title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-300 text-sm">{releaseYear}</span>
                <span className="flex items-center text-yellow-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 4.5C7 4.5 2.73 8.11 1 12c1.73 3.89 6 7.5 11 7.5s9.27-3.61 11-7.5c-1.73-3.89-6-7.5-11-7.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                  </svg>

                  {viewCount}
                </span>
              </div>
            </div>
          </div>
          
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;

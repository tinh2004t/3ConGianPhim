import React, { useState, useRef, useEffect } from 'react';
import MovieCard from '../UI/MovieCard';
import { Link } from 'react-router-dom';

const convertDriveLink = (url) => {
  if (!url) return url;

  // Trường hợp /d/FILE_ID/
  const match1 = url.match(/\/d\/([a-zA-Z0-9_-]+)\//);
  if (match1 && match1[1]) {
    return `https://drive.google.com/uc?export=download&id=${match1[1]}`;
  }

  // Trường hợp ?id=FILE_ID
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return `https://drive.google.com/uc?export=download&id=${match2[1]}`;
  }

  // Nếu không khớp, trả lại link gốc
  return url;
};


const MoviesSlider = ({ title, seeAllLink, movies }) => {
  const sliderRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = sliderRef.current;
    if (!container) return;

    const scrollAmount = direction === 'left' ? -container.offsetWidth / 2 : container.offsetWidth / 2;

    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth',
    });
  };

  const checkArrows = () => {
    const container = sliderRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    setShowRightArrow(container.scrollLeft < maxScrollLeft - 10);
  };

  useEffect(() => {
    // Check arrows visibility on mount and when movies change
    checkArrows();
  }, [movies]);

  return (
    <div className="py-8 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {seeAllLink && (
            <Link
              to={seeAllLink}
              className="text-red-500 hover:text-red-700 transition flex items-center"
            >
              Xem tất cả
              <svg
                className="w-4 h-4 ml-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        <div className="relative overflow-hidden">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 p-3 rounded-full text-white hover:bg-opacity-80 transition"
              aria-label="Scroll movies left"
              tabIndex={0}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            ref={sliderRef}
            className="overflow-x-auto scrollbar-hide flex space-x-4 py-2 no-scrollbar"
            onScroll={checkArrows}
            tabIndex={0} // cho phép dùng bàn phím focus
            role="list" // ARIA role
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="flex-shrink-0 w-48" role="listitem">
                <MovieCard
                  id={movie._id}
                  title={movie.title}
                  posterUrl={convertDriveLink(movie.posterUrl)}
                  releaseYear={movie.releaseYear}
                  viewCount={movie.viewCount}
                  
                />
                
              </div>
            ))}
            
          </div>
          

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black bg-opacity-60 p-3 rounded-full text-white hover:bg-opacity-80 transition"
              aria-label="Scroll movies right"
              tabIndex={0}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
    
  );
};

export default MoviesSlider;
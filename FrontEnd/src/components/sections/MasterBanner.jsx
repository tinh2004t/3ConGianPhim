import React, { useState, useEffect } from "react";
import movieApi from "../../api/movieApi";
import { useNavigate } from "react-router-dom";
import "../../../public/MasterBanner.css"; // Import CSS file

// Chuyển link YouTube thành link nhúng (embed)
const convertToEmbedURL = (url) => {
  try {
    if (url.includes("youtube.com")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`;
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1`;
    }
    return url;
  } catch {
    return url;
  }
};

const MasterBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const navigate = useNavigate();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        setIsLoading(true);
        const res = await movieApi.getTop();
        setSlides(res.data || res);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim top:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMovies();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides]);

  // Reset states when slide changes
  useEffect(() => {
    setIsExpanded(false);
    setMediaError(false);
    setIsVideoLoaded(false);
  }, [currentIndex]);

  if (isLoading) {
    return (
      <div className="master-banner">
        <div className="banner-overlay" />
        <div className="banner-content">
          <div className="content-wrapper">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4 w-full"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const maxLength = isMobile ? 100 : 150;
  const shortDescription = current?.description?.slice(0, maxLength) + "...";
  const isLong = current?.description?.length > maxLength;

  const handleWatchClick = () => {
    navigate(`/movies/${current._id || current.id}`);
  };

  const handleDetailsClick = () => {
    navigate(`/movies/${current._id || current.id}`);
  };

  const handleMediaError = () => {
    setMediaError(true);
  };

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  const isVideoContent = (current.trailerUrl?.includes("youtube.com") || 
                         current.trailerUrl?.includes("youtu.be") || 
                         (current.trailerUrl?.includes("http") && !current.trailerUrl?.includes(".jpg") && !current.trailerUrl?.includes(".png")));

  return (
    <div className="master-banner">
      {/* Background Media với fallback */}
      <div className="video-container">
        {/* Fallback poster image */}
        <img
          className="media-fallback"
          src={current.posterUrl}
          alt={current.title}
          loading="eager"
        />
        
        {/* Video content */}
        {!mediaError && current.trailerUrl && (
          <>
            {current.trailerUrl?.includes("youtube.com") || current.trailerUrl?.includes("youtu.be") ? (
              <iframe
                src={convertToEmbedURL(current.trailerUrl)}
                title={current.title}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={handleVideoLoad}
                onError={handleMediaError}
                style={{
                  opacity: isVideoLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}
              />
            ) : current.trailerUrl?.includes("http") && !current.trailerUrl?.includes(".jpg") && !current.trailerUrl?.includes(".png") ? (
              <video
                src={current.trailerUrl}
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={handleVideoLoad}
                onError={handleMediaError}
                key={current.trailerUrl}
                style={{
                  opacity: isVideoLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease'
                }}
              />
            ) : null}
          </>
        )}
      </div>

      {/* Enhanced Overlay cho video, regular overlay cho image */}
      <div className={(isVideoContent && !mediaError) ? "video-enhanced-overlay" : "banner-overlay"}></div>

      {/* Content */}
      <div className="banner-content">
        <div className="content-wrapper fade-in">
          {/* Title */}
          <h1 className="banner-title">
            {current.title}
          </h1>

          {/* Metadata */}
          <div className="banner-meta">
            {current.country} • {current.releaseYear}
            {current.duration && <span> • {current.duration} phút</span>}
            {current.imdbRating && <span> • IMDb {current.imdbRating}</span>}
          </div>

          {/* Genres */}
          <div className="genres-container">
            {(current.genres || [])
              .slice(0, isMobile ? 2 : 3)
              .map((genre, idx) => (
                <span key={idx} className="genre-tag">
                  {typeof genre === "object" ? genre.name : genre}
                </span>
              ))}
            {(current.genres?.length || 0) > (isMobile ? 2 : 3) && (
              <span className="genre-tag">
                +{current.genres.length - (isMobile ? 2 : 3)}
              </span>
            )}
          </div>

          {/* Description */}
          <div className="banner-description">
            <p>
              {isExpanded || !isLong ? current.description : shortDescription}
            </p>
            {isLong && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="expand-button"
                aria-label={isExpanded ? "Thu gọn mô tả" : "Xem thêm mô tả"}
              >
                {isExpanded ? "Thu gọn ▲" : "Xem thêm ▼"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="button-group">
            <button
              onClick={handleWatchClick}
              className="btn-primary"
              aria-label={`Xem phim ${current.title}`}
            >
              <span>▶</span>
              Xem ngay
            </button>
            <button
              onClick={handleDetailsClick}
              className="btn-secondary"
              aria-label={`Xem chi tiết phim ${current.title}`}
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="nav-controls">
        <button
          onClick={prevSlide}
          className="nav-button"
          aria-label="Slide trước"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="nav-button"
          aria-label="Slide tiếp theo"
        >
          ›
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="dots-container">
        {slides.slice(0, isMobile ? 5 : 10).map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`dot ${idx === currentIndex ? "active" : "inactive"}`}
            aria-label={`Đi tới slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MasterBanner;
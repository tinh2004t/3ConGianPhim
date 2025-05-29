import React, { useState, useEffect } from "react";
import movieApi from "../../api/movieApi";
import { useNavigate } from "react-router-dom";
import "../../../public/MasterBanner.css";

// Convert YouTube URL to embed
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
  const [screenSize, setScreenSize] = useState('desktop');
  const [mediaError, setMediaError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  
  // Touch/Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState('');
  const [slideAnimation, setSlideAnimation] = useState('');
  
  const navigate = useNavigate();

  // Detect screen size with more granular breakpoints
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width <= 480) {
        setScreenSize('mobile');
      } else if (width <= 768) {
        setScreenSize('tablet');
      } else if (width <= 1024) {
        setScreenSize('laptop');
      } else {
        setScreenSize('desktop');
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
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
      <div className={`master-banner ${screenSize}`}>
        <div className="banner-overlay" />
        <div className="banner-content">
          <div className="content-wrapper">
            <div className="loading-skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-meta"></div>
              <div className="skeleton-description"></div>
              <div className="skeleton-buttons">
                <div className="skeleton-btn primary"></div>
                <div className="skeleton-btn secondary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  // Touch handlers for swipe functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSwipeDirection('left');
      handleSwipeNext();
    } else if (isRightSwipe) {
      setSwipeDirection('right');
      handleSwipePrev();
    }
  };

  const handleSwipeNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlideAnimation('slide-left');
    nextSlide();
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideAnimation('');
      setSwipeDirection('');
    }, 600);
  };

  const handleSwipePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSlideAnimation('slide-right');
    prevSlide();
    setTimeout(() => {
      setIsTransitioning(false);
      setSlideAnimation('');
      setSwipeDirection('');
    }, 600);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Dynamic text length based on screen size
  const getMaxLength = () => {
    switch(screenSize) {
      case 'mobile': return 80;
      case 'tablet': return 120;
      case 'laptop': return 160;
      default: return 200;
    }
  };

  const maxLength = getMaxLength();
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

  // Determine display strategy based on screen size and content
  const getDisplayStrategy = () => {
    if (screenSize === 'mobile') {
      return 'poster-priority'; // Poster chính, video background blur
    } else if (screenSize === 'tablet') {
      return 'hybrid'; // Cân bằng giữa poster và video
    } else {
      return 'video-priority'; // Video chính, poster fallback
    }
  };

  const displayStrategy = getDisplayStrategy();

  return (
    <div 
      className={`master-banner ${screenSize} ${displayStrategy} ${slideAnimation} ${isTransitioning ? 'transitioning' : ''}`}
      onTouchStart={screenSize === 'mobile' ? onTouchStart : undefined}
      onTouchMove={screenSize === 'mobile' ? onTouchMove : undefined}
      onTouchEnd={screenSize === 'mobile' ? onTouchEnd : undefined}
    >
      {/* Smart Background Media */}
      <div className="media-container">
        {/* Primary poster layer */}
        <div className="poster-layer">
          <img
            className="poster-image"
            src={current.posterUrl}
            alt={current.title}
            loading="eager"
          />
        </div>
        
        {/* Video layer with smart visibility */}
        {!mediaError && current.trailerUrl && (
          <div className={`video-layer ${isVideoLoaded ? 'loaded' : ''}`}>
            {current.trailerUrl?.includes("youtube.com") || current.trailerUrl?.includes("youtu.be") ? (
              <iframe
                src={convertToEmbedURL(current.trailerUrl)}
                title={current.title}
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
                onLoad={handleVideoLoad}
                onError={handleMediaError}
                className="media-iframe"
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
                className="media-video"
              />
            ) : null}
          </div>
        )}

        {/* Adaptive blur background for mobile */}
        {screenSize === 'mobile' && !mediaError && current.trailerUrl && (
          <div className="blur-background">
            {current.trailerUrl?.includes("youtube.com") || current.trailerUrl?.includes("youtu.be") ? (
              <iframe
                src={convertToEmbedURL(current.trailerUrl)}
                title={`${current.title} background`}
                frameBorder="0"
                allow="autoplay"
                className="blur-iframe"
              />
            ) : (
              <video
                src={current.trailerUrl}
                autoPlay
                muted
                loop
                playsInline
                className="blur-video"
              />
            )}
          </div>
        )}
      </div>

      {/* Responsive overlay system */}
      <div className={`banner-overlay ${displayStrategy} ${isVideoContent && !mediaError ? 'video-active' : 'poster-active'}`}></div>

      {/* Content with responsive layout */}
      <div className="banner-content">
        <div className={`content-wrapper ${screenSize} ${slideAnimation}`}>
          {/* Title with responsive sizing */}
          <h1 className="banner-title">
            {current.title}
          </h1>

          {/* Adaptive metadata */}
          <div className="banner-meta">
            <span className="meta-primary">{current.country}</span>
            <span className="meta-separator">•</span>
            <span className="meta-primary">{current.releaseYear}</span>
            {current.duration && screenSize !== 'mobile' && (
              <>
                <span className="meta-separator">•</span>
                <span className="meta-secondary">{current.duration} phút</span>
              </>
            )}
            {current.imdbRating && (
              <>
                <span className="meta-separator">•</span>
                <span className="meta-rating">IMDb {current.imdbRating}</span>
              </>
            )}
          </div>

          {/* Responsive genres */}
          <div className="genres-container">
            {(current.genres || [])
              .slice(0, screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 3 : 4)
              .map((genre, idx) => (
                <span key={idx} className="genre-tag">
                  {typeof genre === "object" ? genre.name : genre}
                </span>
              ))}
            {(current.genres?.length || 0) > (screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 3 : 4) && (
              <span className="genre-tag more">
                +{current.genres.length - (screenSize === 'mobile' ? 2 : screenSize === 'tablet' ? 3 : 4)}
              </span>
            )}
          </div>

          {/* Smart description */}
          <div className="banner-description">
            <p className={screenSize}>
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

          {/* Responsive action buttons */}
          <div className={`button-group ${screenSize}`}>
            <button
              onClick={handleWatchClick}
              className="btn-primary"
              aria-label={`Xem phim ${current.title}`}
            >
              <span className="btn-icon">▶</span>
              <span className="btn-text">{screenSize === 'mobile' ? 'Xem' : 'Xem ngay'}</span>
            </button>
            <button
              onClick={handleDetailsClick}
              className="btn-secondary"
              aria-label={`Xem chi tiết phim ${current.title}`}
            >
              <span className="btn-text">{screenSize === 'mobile' ? 'Chi Tiết' : 'Chi tiết'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Responsive navigation */}
      {screenSize !== 'mobile' && (
        <div className="nav-controls">
          <button
            onClick={prevSlide}
            className="nav-button prev"
            aria-label="Slide trước"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="nav-button next"
            aria-label="Slide tiếp theo"
          >
            ›
          </button>
        </div>
      )}

      {/* Smart dots indicator */}
      <div className={`dots-container ${screenSize}`}>
        {slides.slice(0, screenSize === 'mobile' ? 5 : screenSize === 'tablet' ? 7 : 10).map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`dot ${idx === currentIndex ? "active" : "inactive"}`}
            aria-label={`Đi tới slide ${idx + 1}`}
          />
        ))}
        {slides.length > (screenSize === 'mobile' ? 5 : screenSize === 'tablet' ? 7 : 10) && (
          <span className="dots-more">+{slides.length - (screenSize === 'mobile' ? 5 : screenSize === 'tablet' ? 7 : 10)}</span>
        )}
      </div>

      {/* Mobile swipe indicator with animation */}
      {screenSize === 'mobile' && (
        <div className="swipe-indicator">
          <div className="swipe-hint">
            <span className="swipe-arrow left">←</span>
            <span className="swipe-text">Vuốt để xem thêm</span>
            <span className="swipe-arrow right">→</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterBanner;
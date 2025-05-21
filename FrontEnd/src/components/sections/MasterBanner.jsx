import React, { useState, useEffect } from "react";
import movieApi from "../../api/movieApi";
import { useNavigate } from "react-router-dom";





// Chuyển link YouTube thành link nhúng (embed)
const convertToEmbedURL = (url) => {
  try {
    if (url.includes("youtube.com")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0`;
    } else if (url.includes("youtu.be")) {
      const videoId = url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0`;
    }
    return url;
  } catch {
    return url;
  }
};

const MasterBanner = () => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const res = await movieApi.getTop(); // API trả về danh sách 10 phim nhiều lượt xem nhất
        setSlides(res.data || res);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim top:", error);
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

  if (slides.length === 0) return null;

  const current = slides[currentIndex];

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Nền video: YouTube, video trực tiếp, hoặc hình ảnh */}
      {current.trailerUrl?.includes("youtube.com") || current.trailerUrl?.includes("youtu.be") ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={convertToEmbedURL(current.trailerUrl)}
          title={current.title}
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : current.trailerUrl?.includes("http") ? (
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={current.trailerUrl}
          autoPlay
          muted
          loop
          playsInline
          key={current.trailerUrl}
        />
      ) : (
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={current.posterUrl}
          alt={current.title}
        />
      )}

      {/* Overlay tối */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10" />

      {/* Nội dung */}
      <div className="relative z-20 flex flex-col justify-center h-full px-8 lg:px-16 text-white transition-all duration-700">
        <div className="max-w-2xl space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
            {current.title}
          </h2>
          <p className="uppercase tracking-wider text-sm text-gray-300">
            {current.country} • {current.releaseYear}
          </p>

          <div className="flex flex-wrap items-center space-x-3 text-sm text-white">
            {(current.genres || []).map((genre, idx) => (
              <span
                key={idx}
                className="bg-white text-black px-2 py-0.5 rounded"
              >
                {typeof genre === "object" ? genre.name : genre}
              </span>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-200">
            {current.description}
          </p>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => navigate(`/movies/${current._id || current.id}`)}
              className="bg-white text-black px-4 py-2 rounded font-semibold hover:bg-gray-200 transition"
            >
              ▶ Xem ngay
            </button>
            <button
              onClick={() => navigate(`/movies/${current._id || current.id}`)}
              className="bg-gray-800 bg-opacity-70 text-white px-4 py-2 rounded font-semibold hover:bg-opacity-100 transition"
            >
              Chi tiết
            </button>
          </div>

        </div>
      </div>

      {/* Điều hướng */}
      <div className="absolute bottom-6 right-6 z-30 flex items-center space-x-2">
        <button
          onClick={prevSlide}
          className="w-10 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="w-10 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition"
        >
          ›
        </button>
      </div>

      {/* Chấm tròn */}
      <div className="absolute bottom-6 left-6 z-30 flex space-x-2">
        {slides.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full ${idx === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default MasterBanner;

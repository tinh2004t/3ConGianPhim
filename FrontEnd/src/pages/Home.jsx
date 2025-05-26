import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import HeroSlider from '../components/sections/HeroSlider';
import MoviesSlider from '../components/sections/MoviesSlider';
import MasterBanner from '../components/sections/MasterBanner';
import movieApi from '../api/movieApi';

// Import CSS file
import '../../public/Home.css';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularTVSeries, setPopularTVSeries] = useState([]);
  const [randomMovies, setRandomMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Sử dụng Promise.all để tải song song, cải thiện performance
        const [trendingRes, tvRes, randomRes] = await Promise.all([
          movieApi.getTopViewByType("Movies"),
          movieApi.getTopViewByType("TvSeries"),
          movieApi.getRandom()
        ]);

        setTrendingMovies(trendingRes.data || trendingRes);
        setPopularTVSeries(tvRes.data || tvRes);
        setRandomMovies(randomRes.data || randomRes);
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Master Banner với responsive */}
      <section className="banner-section">
        <MasterBanner />
      </section>

      {/* Hero Slider với responsive */}
      <section className="hero-section">
        <HeroSlider />
      </section>

      {/* Movies Sections với responsive spacing */}
      <main className="movies-sections">
        <div className="container">
          
          {/* Loading state */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span className="loading-text">Đang tải...</span>
            </div>
          ) : (
            <>
              {/* Trending Movies Section */}
              <section className="movies-slider-section">
                <MoviesSlider 
                  title="Phim thịnh hành" 
                  seeAllLink="/movies?category=trending" 
                  movies={trendingMovies}
                  className="trending-slider"
                />
              </section>

              {/* Popular TV Series Section */}
              <section className="movies-slider-section">
                <MoviesSlider 
                  title="TV Series Phổ biến" 
                  seeAllLink="/tv-series?category=popular" 
                  movies={popularTVSeries}
                  className="tv-series-slider"
                />
              </section>

              {/* Random Movies Section */}
              <section className="movies-slider-section">
                <MoviesSlider 
                  title="Hôm nay xem gì?" 
                  seeAllLink="/movies?category=random" 
                  movies={randomMovies}
                  className="random-slider"
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import HeroSlider from '../components/sections/HeroSlider';
import MoviesSlider from '../components/sections/MoviesSlider';
import MasterBanner from '../components/sections/MasterBanner';
import movieApi from '../api/movieApi';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularTVSeries, setPopularTVSeries] = useState([]);
  const [randomMovies, setRandomMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy Trending Movies (top 12 Movies theo viewCount)
        const trendingRes = await movieApi.getTopViewByType("Movies");
        setTrendingMovies(trendingRes.data || trendingRes);

        // Lấy Popular TV Series (top 12 TvSeries theo viewCount)
        const tvRes = await movieApi.getTopViewByType("TvSeries");
        setPopularTVSeries(tvRes.data || tvRes);

        // Lấy 10 phim ngẫu nhiên
        const randomRes = await movieApi.getRandom();
        setRandomMovies(randomRes.data || randomRes);
      } catch (err) {
        console.error("Error loading movies:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <MasterBanner />
      <HeroSlider />
      <MoviesSlider 
        title="Phim thịnh hành" 
        seeAllLink="/movies?category=trending" 
        movies={trendingMovies} 
      />
      <MoviesSlider 
        title="Tv Series Phổ biến" 
        seeAllLink="/tv-series?category=popular" 
        movies={popularTVSeries} 
      />
      <MoviesSlider 
        title="Hôm nay xem gì?" 
        seeAllLink="/movies?category=random" 
        movies={randomMovies} 
      />
    </>
  );
};

export default Home;

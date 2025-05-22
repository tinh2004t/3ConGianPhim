import React from 'react';
import Slider from '../UI/Slider';
import { Link } from 'react-router-dom';

const featuredContent = [
  {
    id: 1,
    title: "Dune: Part Two",
    description: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    imageUrl: "/assets/p-4.jpg",
    type: "movie",
    releaseYear: 2024,
    rating: 8.7,
  },
  {
    id: 2,
    title: "Fallout",
    description: "In a post-apocalyptic world, the inhabitants of luxury fallout shelters are forced to return to the irradiated hellscape their ancestors left behind.",
    imageUrl: "/assets/p-4.jpg",
    type: "series",
    releaseYear: 2024,
    rating: 8.5,
  },
  {
    id: 3,
    title: "The Batman",
    description: "When the Riddler, a sadistic serial killer, begins murdering key political figures in Gotham, Batman is forced to investigate the city's hidden corruption.",
    imageUrl: "/api/placeholder/1920/800",
    type: "movie",
    releaseYear: 2022,
    rating: 7.8,
  },
];

const SlideItem = ({ item }) => {
  const { id, title, description, imageUrl, type, releaseYear, rating } = item;

  return (
    <div className="relative h-[500px] md:h-[600px]">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-block bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded mb-4">
              {type === 'movie' ? 'Movie' : 'TV Series'}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h2>
            <div className="flex items-center text-gray-300 mb-4">
              <span className="mr-4">{releaseYear}</span>
              <span className="flex items-center mr-4">
                <svg
                  className="w-4 h-4 text-yellow-400 mr-1"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {rating}
              </span>
            </div>
            <p className="text-gray-300 mb-6">{description}</p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={type === 'movie' ? `/movie/${id}` : `/tv-series/${id}`}
                className="bg-red-600 text-white px-6 py-3 rounded font-medium hover:bg-red-700 transition"
                aria-label={`Watch ${title} now`}
              >
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Xem Ngay
                </span>
              </Link>
              <button
                className="bg-gray-800 text-white px-6 py-3 rounded font-medium hover:bg-gray-700 transition"
                aria-label={`More info about ${title}`}
              >
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Thêm thông tin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSlider = () => {
  return <Slider slides={featuredContent.map((item) => <SlideItem key={item.id} item={item} />)} />;
};

export default HeroSlider;

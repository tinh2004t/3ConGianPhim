import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MovieListPage from './pages/MovieListPage';
import MovieDetailPage from './pages/MovieDetailPage';
import MovieSearchPage from './pages/MovieSearchPage';
import MovieFormPage from './pages/MovieFormPage';
import EpisodeList from './pages/episodes/EpisodeList';
import EpisodeWatchPage from './pages/episodes/EpisodeWatchPage';
import EpisodeFormPage from './pages/episodes/EpisodeFormPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MovieListPage />} />
        <Route path="/movies/:id" element={<MovieDetailPage />} />
        <Route path="/search" element={<MovieSearchPage />} />
        <Route path="/admin/movies/new" element={<MovieFormPage />} />
        <Route path="/admin/movies/edit/:id" element={<MovieFormPage />} />

        <Route path="/movies/:movieId/episodes" element={<EpisodeList />} />
        <Route path="/watch/:episodeId" element={<EpisodeWatchPage />} />
        <Route path="/admin/movies/:movieId/episodes/new" element={<EpisodeFormPage />} />
        <Route path="/admin/episodes/:episodeId/edit" element={<EpisodeFormPage />} />
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/admin/AdminLayout';
import RequireAdminRoute from './components/RequireAdminRoute';

// Import các page
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetail from './pages/MovieDetail';
import TvSeries from './pages/TvSeries';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';
import MoviePlayer from './pages/MoviePlayer';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import MovieManagement from './pages/admin/Movies/MovieManagement';
import UserManagement from './pages/admin/Users/UserManagement';
import GenreManagement from './pages/admin/Genres/GenreManagement';
import EpisodeManagement from './pages/admin/Episodes/EpisodeManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* USER LAYOUT */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/tv-series" element={<TvSeries />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/watch/:movieId/episodes/:episodeId" element={<MoviePlayer />} />
        </Route>

        {/* ADMIN LAYOUT */}
        <Route path="/admin" element={<RequireAdminRoute>
          <AdminLayout />
        </RequireAdminRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="movies" element={<MovieManagement />} />
          <Route path="movies/:movieId" element={<MovieManagement />} />
          <Route path="movies/:movieId/episodes" element={<EpisodeManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="genres" element={<GenreManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

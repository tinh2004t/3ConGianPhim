import Home from './pages/Home.jsx';
import Movies from './pages/Movies.jsx';
import TvSeries from './pages/TvSeries.jsx';
import Account from './pages/Account.jsx';
import MovieDetail from './pages/MovieDetail.jsx';
import { Navigate } from 'react-router-dom';
import MoviePlayer from './pages/MoviePlayer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

const routes = [
  { path: '/', component: Home },
  { path: '/movies', component: Movies },
  { path: '/movies/:id', component: MovieDetail },
  { path: '/tv-series', component: TvSeries },
  { path: '/account', component: Account },
  { path: '*', component: () => <Navigate to="/" /> },
{ path: '/moviedetail', component: MovieDetail },
{ path: '/watch/:movieId/episodes/:episodeId', component: MoviePlayer },
{ path: '/login', component: Login },
{ path: '/register', component: Register },


];

export default routes;

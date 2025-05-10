const API_URL = 'http://localhost:5000/api';

export async function getMovies(params = '') {
  const res = await fetch(`${API_URL}/movies${params}`);
  return res.json();
}

export async function getMovieById(id) {
  const res = await fetch(`${API_URL}/movies/${id}`);
  return res.json();
}

export async function searchMovies(query) {
  const res = await fetch(`${API_URL}/movies/search?q=${query}`);
  return res.json();
}

export async function createMovie(data, token) {
  const res = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

const MovieFormPage = () => {
  const { id } = useParams(); // id dùng để kiểm tra: chỉnh sửa hay thêm mới
  const navigate = useNavigate();

  const [movie, setMovie] = useState({
    title: '',
    description: '',
    posterUrl: '',
    trailerUrl: '',
    genres: [],
    releaseYear: '',
    status: '',
    country: '',
    totalEpisodes: '',
  });

  const [genreList, setGenreList] = useState([]);

  // Lấy danh sách thể loại
  useEffect(() => {
    axios.get('/api/genres')
      .then(res => setGenreList(res.data))
      .catch(err => console.error(err));
  }, []);

  // Nếu có id -> chỉnh sửa: load dữ liệu phim hiện tại
  useEffect(() => {
    if (id) {
      axios.get(`/api/movies/${id}`)
        .then(res => setMovie(res.data))
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMovie(prev => ({ ...prev, [name]: value }));
  };

  const handleGenresChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setMovie(prev => ({ ...prev, genres: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await axios.put(`/api/movies/${id}`, movie);
        alert('Cập nhật phim thành công!');
      } else {
        await axios.post('/api/movies', movie);
        alert('Thêm phim mới thành công!');
      }
      navigate('/movies');
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu phim');
    }
  };

  return (
    <Container className="py-4">
      <h2>{id ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tên phim</Form.Label>
              <Form.Control
                name="title"
                value={movie.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trailer URL</Form.Label>
              <Form.Control
                name="trailerUrl"
                value={movie.trailerUrl}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Poster URL</Form.Label>
              <Form.Control
                name="posterUrl"
                value={movie.posterUrl}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                name="description"
                as="textarea"
                rows={3}
                value={movie.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Thể loại</Form.Label>
              <Form.Select
                multiple
                value={movie.genres}
                onChange={handleGenresChange}
              >
                {genreList.map(genre => (
                  <option key={genre._id} value={genre._id}>{genre.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Năm phát hành</Form.Label>
              <Form.Control
                type="number"
                name="releaseYear"
                value={movie.releaseYear}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Control
                name="status"
                value={movie.status}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quốc gia</Form.Label>
              <Form.Control
                name="country"
                value={movie.country}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tổng số tập</Form.Label>
              <Form.Control
                type="number"
                name="totalEpisodes"
                value={movie.totalEpisodes}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button type="submit" className="mt-3">Lưu</Button>
      </Form>
    </Container>
  );
};

export default MovieFormPage;

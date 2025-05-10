import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MovieListPage = () => {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [filters, setFilters] = useState({ genre: '', year: '', status: '', sort: 'viewCount' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    axios.get('/api/genres').then(res => setGenres(res.data));
  }, []);

  useEffect(() => {
    const query = new URLSearchParams({ ...filters, page, limit: 12 }).toString();
    axios.get(`/api/movies?${query}`).then(res => setMovies(res.data));
  }, [filters, page]);

  return (
    <Container className="py-4">
      <h2>Danh sách phim</h2>
      <Form className="mb-3">
        <Row>
          <Col md={3}>
            <Form.Select onChange={e => setFilters({ ...filters, genre: e.target.value })}>
              <option value="">Thể loại</option>
              {genres.map(genre => <option key={genre._id} value={genre._id}>{genre.name}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control type="number" placeholder="Năm" onChange={e => setFilters({ ...filters, year: e.target.value })} />
          </Col>
          <Col md={3}>
            <Form.Select onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">Trạng thái</option>
              <option value="ongoing">Đang chiếu</option>
              <option value="completed">Hoàn thành</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button variant="primary" onClick={() => setPage(1)}>Lọc</Button>
          </Col>
        </Row>
      </Form>

      <Row>
        {movies.map(movie => (
          <Col md={3} key={movie._id} className="mb-4">
            <Card>
              <Card.Img variant="top" src={movie.posterUrl} />
              <Card.Body>
                <Card.Title>{movie.title}</Card.Title>
                <Link to={`/movies/${movie._id}`} className="btn btn-sm btn-outline-primary">Xem chi tiết</Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MovieListPage;

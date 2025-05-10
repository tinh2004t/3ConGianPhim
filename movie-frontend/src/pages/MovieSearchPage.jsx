import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MovieSearchPage = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q') || '';
  const [keyword, setKeyword] = useState(query);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      axios.get(`/api/movies/search?q=${query}`)
        .then(res => setResults(res.data))
        .catch(err => console.error(err));
    }
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      window.location.href = `/search?q=${keyword}`;
    }
  };

  return (
    <Container className="py-4">
      <h2>Tìm kiếm phim</h2>
      <Form onSubmit={handleSearch} className="mb-4 d-flex">
        <Form.Control
          type="text"
          placeholder="Nhập tên phim..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button type="submit" className="ms-2">Tìm</Button>
      </Form>

      <Row>
        {results.length === 0 ? (
          <p>Không tìm thấy kết quả cho "{query}"</p>
        ) : (
          results.map(movie => (
            <Col key={movie._id} md={3} className="mb-3">
              <Card>
                <Link to={`/movies/${movie._id}`}>
                  <Card.Img variant="top" src={movie.posterUrl} />
                </Link>
                <Card.Body>
                  <Card.Title>{movie.title}</Card.Title>
                  <Card.Text>{movie.releaseYear}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default MovieSearchPage;

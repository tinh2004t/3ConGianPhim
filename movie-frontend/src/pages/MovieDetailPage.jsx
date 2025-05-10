import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [episodes, setEpisodes] = useState([]);

  useEffect(() => {
    axios.get(`/api/movies/${id}`).then(res => setMovie(res.data));
    axios.get(`/api/movies/${id}/episodes`).then(res => setEpisodes(res.data));
  }, [id]);

  if (!movie) return <p>Đang tải...</p>;

  return (
    <Container className="py-4">
      <Row>
        <Col md={4}>
          <img src={movie.posterUrl} alt={movie.title} className="img-fluid rounded" />
        </Col>
        <Col md={8}>
          <h2>{movie.title}</h2>
          <p>{movie.description}</p>
          <p><strong>Quốc gia:</strong> {movie.country}</p>
          <p><strong>Năm:</strong> {movie.releaseYear}</p>
          <p><strong>Trạng thái:</strong> {movie.status}</p>
          <p><strong>Số tập:</strong> {movie.totalEpisodes}</p>
          <div>
            <strong>Thể loại: </strong>
            {movie.genres.map(genre => (
              <Badge key={genre._id} bg="info" className="me-1">{genre.name}</Badge>
            ))}
          </div>
        </Col>
      </Row>

      <hr />
      <h4>Danh sách tập</h4>
      <Row>
        {episodes.map((ep, index) => (
          <Col key={ep._id} md={2} className="mb-2">
            <Card>
              <Card.Body className="p-2 text-center">
                <a href={ep.videoUrl} target="_blank" rel="noopener noreferrer">
                  Tập {index + 1}
                </a>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MovieDetailPage;

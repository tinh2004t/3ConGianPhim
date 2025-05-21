import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Modal,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TablePagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  maxHeight: "90vh",
  overflowY: "auto",
};

const initialEpisodeData = {
  movieId: "",
  title: "",
  episodesNumber: "",
  videoSource: "",
};

const demoMovies = [
  { id: 1, title: "Bố Già" },
  { id: 2, title: "Mắt Biếc" },
];

const demoEpisodes = [
  {
    id: 1,
    movieId: 1,
    movieTitle: "Bố Già",
    title: "Tập 1",
    episodesNumber: 1,
    videoSource: "https://example.com/video1.mp4",
  },
  {
    id: 2,
    movieId: 2,
    movieTitle: "Mắt Biếc",
    title: "Tập 1",
    episodesNumber: 1,
    videoSource: "https://example.com/video2.mp4",
  },
];

export default function EpisodesManagement() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialEpisodeData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Filter episodes by search title or movie title
  const filteredEpisodes = demoEpisodes.filter(
    (ep) =>
      ep.title.toLowerCase().includes(search.toLowerCase()) ||
      ep.movieTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = () => {
    setFormData(initialEpisodeData);
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleEdit = (episode) => {
    setFormData({
      movieId: episode.movieId,
      title: episode.title,
      episodesNumber: episode.episodesNumber,
      videoSource: episode.videoSource,
    });
    setIsEditing(true);
    setOpenModal(true);
  };

  return (
    <Box
      sx={{
        padding: 4,
        bgcolor: "#f9fafd",
        minHeight: "100vh",
        ml: { sm: "240px" },
        overflowX: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="#333">
          Quản lý Episodes
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <TextField
            size="small"
            placeholder="Tìm kiếm tập phim hoặc phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 280 }}
          />
          <Button
            variant="contained"
            onClick={handleAddNew}
            sx={{
              minWidth: 140,
              backgroundColor: "#191919",
              color: "#fff",
              "&:hover": { backgroundColor: "#333" },
            }}
          >
            + Thêm Episode
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Tên phim</TableCell>
              <TableCell>Tên tập phim</TableCell>
              <TableCell align="center">Số tập</TableCell>
              <TableCell>Video Source</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEpisodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  Không có dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              filteredEpisodes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ep) => (
                  <TableRow key={ep.id}>
                    <TableCell>{ep.movieTitle}</TableCell>
                    <TableCell>{ep.title}</TableCell>
                    <TableCell align="center">{ep.episodesNumber}</TableCell>
                    <TableCell sx={{ maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ep.videoSource}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="info"
                        onClick={() => handleEdit(ep)}
                        sx={{ mr: 1 }}
                      >
                        Sửa
                      </Button>
                      <Button size="small" color="error">
                        Xóa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredEpisodes.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Số hàng mỗi trang"
        />
      </TableContainer>

      {/* Modal Thêm/Sửa */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle} component="form" noValidate autoComplete="off">
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {isEditing ? "Sửa Episode" : "Thêm Episode"}
            </Typography>
            <IconButton onClick={() => setOpenModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Select Movie */}
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="movie-select-label">Phim</InputLabel>
            <Select
              labelId="movie-select-label"
              value={formData.movieId}
              label="Phim"
              onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
            >
              {demoMovies.map((movie) => (
                <MenuItem key={movie.id} value={movie.id}>
                  {movie.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Tên tập phim"
            required
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            label="Số tập"
            type="number"
            required
            fullWidth
            margin="normal"
            value={formData.episodesNumber}
            onChange={(e) => setFormData({ ...formData, episodesNumber: e.target.value })}
          />
          <TextField
            label="Video Source URL"
            required
            fullWidth
            margin="normal"
            value={formData.videoSource}
            onChange={(e) => setFormData({ ...formData, videoSource: e.target.value })}
          />

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                minWidth: 140,
                py: 1.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: "bold",
                borderRadius: 2,
                boxShadow: 3,
              }}
              // Không có logic xử lý nên chỉ đóng modal
              onClick={() => setOpenModal(false)}
            >
              {isEditing ? "Lưu lại" : "Thêm Episode"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

import { useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Avatar,
  Box,
} from "@mui/material";
import { Add, Edit, Delete, Movie, Theaters } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

// Component Ô hiển thị Phim
const MovieCell = ({ value }) => (
  <MDBox display="flex" alignItems="center">
    <Avatar sx={{ bgcolor: "info.main", mr: 2, width: 32, height: 32 }}>
      <Movie fontSize="small" />
    </Avatar>
    <MDTypography variant="button" fontWeight="medium">
      {value?.title || "N/A"}
    </MDTypography>
  </MDBox>
);

// Component Ô hiển thị Tập phim
const EpisodeCell = ({ value }) => (
  <MDBox display="flex" alignItems="center">
    {value ? (
      <>
        <Avatar sx={{ bgcolor: "warning.main", mr: 2, width: 32, height: 32 }}>
          <Theaters fontSize="small" />
        </Avatar>
        <MDTypography variant="button" fontWeight="medium">
          {value.name}
        </MDTypography>
      </>
    ) : (
      <MDTypography variant="caption" color="text">
        Không có tập
      </MDTypography>
    )}
  </MDBox>
);

// Component Ô hiển thị Người dùng
const UserCell = ({ value }) => (
  <MDBox display="flex" alignItems="center">
    <Avatar sx={{ bgcolor: "success.main", mr: 2, width: 32, height: 32 }}>
      {value.avatar || value.name?.charAt(0)}
    </Avatar>
    <MDTypography variant="button" fontWeight="medium">
      {value.name}
    </MDTypography>
  </MDBox>
);

// Component Nút Sửa/Xóa
const ActionsCell = ({ onEdit, onDelete }) => (
  <MDBox display="flex">
    <IconButton size="small" color="info" onClick={onEdit}>
      <Edit fontSize="small" />
    </IconButton>
    <IconButton size="small" color="error" sx={{ ml: 1 }} onClick={onDelete}>
      <Delete fontSize="small" />
    </IconButton>
  </MDBox>
);

const CommentManagement = () => {
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    movieId: "",
    episodeName: "",
    content: "",
  });

  // Dữ liệu giả lập chỉ để hiển thị
  const comments = [
    {
      id: 1,
      movie: { id: 1, title: "Avengers: Endgame" },
      episode: { id: 1, name: "Phần 1" },
      user: { id: 1, name: "Nguyễn Văn A", avatar: "A" },
      content: "Phim rất hay, diễn xuất tốt",
      createdAt: "2023-05-15",
    },
    {
      id: 2,
      movie: { id: 2, title: "Spider-Man: No Way Home" },
      episode: null,
      user: { id: 2, name: "Trần Thị B", avatar: "B" },
      content: "Hiệu ứng đỉnh cao!",
      createdAt: "2023-05-16",
    },
  ];

  const movies = [
    { id: 1, title: "Avengers: Endgame" },
    { id: 2, title: "Spider-Man: No Way Home" },
  ];

  const handleAdd = () => {
    setFormData({ movieId: "", episodeName: "", content: "" });
    setOpenForm(true);
  };

  const handleEdit = () => {
    setOpenForm(true);
  };

  const handleDelete = () => {
    alert("Chức năng xóa chưa được xử lý");
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "PHIM", accessor: "movie", width: "20%", Cell: MovieCell },
    { Header: "TẬP PHIM", accessor: "episode", width: "15%", Cell: EpisodeCell },
    { Header: "NGƯỜI DÙNG", accessor: "user", width: "20%", Cell: UserCell },
    { Header: "NỘI DUNG", accessor: "content", width: "30%" },
    {
      Header: "THAO TÁC",
      accessor: "actions",
      width: "10%",
      Cell: () => <ActionsCell onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ];

  return (
    <Box sx={{ ml: { sm: "280px" }, width: { sm: "calc(100% - 280px)" }, p: 3 }}>
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={3}
                sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
              >
                <MDTypography variant="h5" fontWeight="bold">
                  QUẢN LÝ BÌNH LUẬN
                </MDTypography>
                <IconButton
                  color="inherit"
                  onClick={handleAdd}
                  sx={{
                    bgcolor: "#191919",
                    color: "#ffffff",
                    "&:hover": { bgcolor: "#333333" },
                  }}
                >
                  <Add />
                </IconButton>
              </MDBox>
              <MDBox p={3}>
                <DataTable
                  table={{ columns, rows: comments }}
                  entriesPerPage={10}
                  canSearch
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle>{formData.movieId ? "Sửa bình luận" : "Thêm bình luận"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Phim"
            name="movieId"
            value={formData.movieId}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          >
            {movies.map((movie) => (
              <MenuItem key={movie.id} value={movie.id}>
                {movie.title}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Tên tập phim"
            name="episodeName"
            value={formData.episodeName}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Nội dung bình luận"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="secondary">
            Hủy
          </Button>
          <Button
            onClick={() => alert("Chưa xử lý lưu dữ liệu")}
            color="primary"
            variant="contained"
          >
            {formData.movieId ? "Cập nhật" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// PropTypes
MovieCell.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
  }),
};

EpisodeCell.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
};

UserCell.propTypes = {
  value: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
};

ActionsCell.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CommentManagement;

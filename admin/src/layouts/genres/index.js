import { useState } from "react";
import {
  Card,
  Grid,
  IconButton,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete, Close, Category } from "@mui/icons-material";

export default function GenreManagementUI() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleOpenDialog = (mode = "add", data = { name: "", description: "" }) => {
    setDialogMode(mode);
    setFormData(data);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    setSnackbar({
      open: true,
      severity: "info",
      message: dialogMode === "add" ? "Đã nhấn thêm mới (giả lập)" : "Đã nhấn cập nhật (giả lập)",
    });
    handleCloseDialog();
  };

  const handleDelete = (name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thể loại "${name}"?`)) {
      setSnackbar({ open: true, message: "Đã nhấn xóa (giả lập)", severity: "warning" });
    }
  };

  // Dữ liệu giả lập
  const genres = [
    { id: 1, name: "Hành động", description: "Phim với nhiều cảnh hành động, kịch tính." },
    { id: 2, name: "Lãng mạn", description: "Phim tình cảm, lãng mạn nhẹ nhàng." },
    { id: 3, name: "Kinh dị", description: "Phim gây sợ hãi, hồi hộp." },
  ];

  return (
    <Box p={3} sx={{ ml: isMobile ? 0 : "240px", width: isMobile ? "100%" : "calc(100% - 240px)" }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3, boxShadow: 3, borderRadius: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight={600}>
                🎬 Quản lý thể loại
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog("add")}
                sx={{
                  backgroundColor: "#191919",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#333333" },
                }}
              >
                Thêm mới
              </Button>
            </Box>

            <Grid container spacing={3}>
              {genres.map((genre) => (
                <Grid item xs={12} sm={6} md={4} key={genre.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      boxShadow: 2,
                      transition: "0.3s",
                      "&:hover": { boxShadow: 5 },
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={1} gap={1}>
                      <Category color="primary" />
                      <Typography variant="h6" fontWeight={500}>
                        {genre.name}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" mb={0.5}>
                      Mô tả: <i>{genre.description}</i>
                    </Typography>

                    <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog("edit", genre)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xóa">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(genre.name)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {dialogMode === "add" ? "➕ Thêm thể loại" : "✏️ Chỉnh sửa thể loại"}
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            margin="normal"
            label="Tên thể loại"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {dialogMode === "add" ? "Thêm" : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

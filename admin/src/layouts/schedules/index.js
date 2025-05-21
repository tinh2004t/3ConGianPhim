import React, { useState } from "react";
import {
  Grid,
  Card,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Sidebar from "./Sidebar";
import PropTypes from "prop-types"; // thêm dòng này ở đầu file

DummyScheduleTable.propTypes = {
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

function DummyScheduleTable({ onEdit, onDelete }) {
  const rows = [
    { id: 1, movie: "Avengers", date: "2025-05-21", time: "19:00", room: "Phòng 1" },
    { id: 2, movie: "Spiderman", date: "2025-05-22", time: "20:00", room: "Phòng 2" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ backgroundColor: "#191919", color: "#fff" }}>
            <th style={{ border: "1px solid #ddd", padding: 12 }}>ID</th>
            <th style={{ border: "1px solid #ddd", padding: 12 }}>Phim</th>
            <th style={{ border: "1px solid #ddd", padding: 12 }}>Ngày chiếu</th>
            <th style={{ border: "1px solid #ddd", padding: 12 }}>Giờ chiếu</th>
            <th style={{ border: "1px solid #ddd", padding: 12 }}>Phòng chiếu</th>
            <th style={{ border: "1px solid #ddd", padding: 12, minWidth: 120 }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ backgroundColor: row.id % 2 === 0 ? "#f5f5f5" : "white" }}>
              <td style={{ border: "1px solid #ddd", padding: 12 }}>{row.id}</td>
              <td style={{ border: "1px solid #ddd", padding: 12 }}>{row.movie}</td>
              <td style={{ border: "1px solid #ddd", padding: 12 }}>{row.date}</td>
              <td style={{ border: "1px solid #ddd", padding: 12 }}>{row.time}</td>
              <td style={{ border: "1px solid #ddd", padding: 12 }}>{row.room}</td>
              <td style={{ border: "1px solid #ddd", padding: 12, textAlign: "center" }}>
                <IconButton color="primary" onClick={() => onEdit(row)}>
                  <Edit />
                </IconButton>
                <IconButton color="error" onClick={() => onDelete(row)}>
                  <Delete />
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}

export default function ScheduleManagement() {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleEditOpen = (row) => {
    setSelectedRow(row);
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedRow(null);
  };

  const handleDeleteOpen = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedRow(null);
  };

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => setAddOpen(false);

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: "250px" }}>
        <MDBox py={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
                  <MDTypography variant="h5" fontWeight="bold">
                    Quản lý lịch chiếu
                  </MDTypography>
                  <IconButton
                    color="inherit"
                    onClick={handleAddOpen}
                    sx={{
                      backgroundColor: "#000000", // màu đen
                      color: "#fff", // chữ màu trắng để nổi bật trên nền đen
                      "&:hover": { backgroundColor: "#333333" }, // màu xám đậm khi hover
                      display: "flex",
                      alignItems: "center",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      gap: 1,
                    }}
                  >
                    <Add />
                    <MDTypography variant="button">Thêm lịch chiếu</MDTypography>
                  </IconButton>
                </MDBox>

                <MDBox p={3}>
                  <DummyScheduleTable onEdit={handleEditOpen} onDelete={handleDeleteOpen} />
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </MDBox>
      </Box>

      {/* Modal Thêm */}
      <Dialog open={addOpen} onClose={handleAddClose} fullWidth maxWidth="sm">
        <DialogTitle>Thêm lịch chiếu mới</DialogTitle>
        <DialogContent dividers>
          <TextField margin="normal" label="Phim" fullWidth />
          <TextField
            margin="normal"
            label="Ngày chiếu"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            margin="normal"
            label="Giờ chiếu"
            type="time"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField margin="normal" label="Phòng chiếu" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleAddClose} variant="contained" color="primary">
            Thêm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Sửa */}
      <Dialog open={editOpen} onClose={handleEditClose} fullWidth maxWidth="sm">
        <DialogTitle>Sửa lịch chiếu</DialogTitle>
        <DialogContent dividers>
          {selectedRow && (
            <>
              <TextField margin="normal" label="Phim" fullWidth defaultValue={selectedRow.movie} />
              <TextField
                margin="normal"
                label="Ngày chiếu"
                type="date"
                fullWidth
                defaultValue={selectedRow.date}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="normal"
                label="Giờ chiếu"
                type="time"
                fullWidth
                defaultValue={selectedRow.time}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="normal"
                label="Phòng chiếu"
                fullWidth
                defaultValue={selectedRow.room}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleEditClose} variant="contained" color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Xóa */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose} fullWidth maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Bạn có chắc muốn xóa lịch chiếu phim &quot;{selectedRow?.movie}&quot; không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="secondary">
            Hủy
          </Button>
          <Button onClick={handleDeleteClose} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

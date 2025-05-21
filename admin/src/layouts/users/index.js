import { useState } from "react";
import {
  Box,
  Card,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";

const roles = [
  { value: "admin", label: "Admin" },
  { value: "user", label: "User" },
  { value: "guest", label: "Guest" },
];

export default function UserManagement() {
  // Giao diện nên có trạng thái giả định
  const [openForm, setOpenForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Dummy users data để demo giao diện bảng
  const [users] = useState([
    {
      id: 1,
      username: "nguyen123",
      passwordHash: "********",
      email: "nguyen123@example.com",
      role: "admin",
    },
    {
      id: 2,
      username: "trang456",
      passwordHash: "********",
      email: "trang456@example.com",
      role: "user",
    },
  ]);

  const handleOpenAdd = () => {
    setCurrentUser(null);
    setOpenForm(true);
  };

  const handleOpenEdit = (user) => {
    setCurrentUser(user);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setCurrentUser(null);
    setOpenForm(false);
  };

  return (
    <Box
      sx={{
        ml: { sm: "280px" },
        width: { sm: "calc(100% - 280px)" },
        p: 3,
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <Typography variant="h5" fontWeight="bold">
                Quản lý Users
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenAdd}
                sx={{
                  backgroundColor: "#191919", // Màu xanh lá cây
                  color: "white",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: 2,
                  boxShadow: 2,
                  px: 2.5,
                  py: 1.25,
                }}
              >
                Thêm mới
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Tên đăng nhập</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Email</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Role</strong>
                    </TableCell>
                    <TableCell align="center">
                      <strong>Hành động</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell sx={{ textTransform: "capitalize", fontWeight: "medium" }}>
                        {user.role}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpenEdit(user)}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog form thêm/sửa user */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{currentUser ? "Chỉnh sửa User" : "Thêm mới User"}</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Tên đăng nhập"
            fullWidth
            margin="normal"
            defaultValue={currentUser?.username || ""}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            fullWidth
            margin="normal"
            placeholder={currentUser ? "Để trống nếu không đổi mật khẩu" : ""}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            defaultValue={currentUser?.email || ""}
          />
          <TextField
            select
            label="Role"
            fullWidth
            margin="normal"
            defaultValue={currentUser?.role || ""}
          >
            {roles.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button variant="contained" color="primary">
            {currentUser ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

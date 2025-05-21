import React, { useState } from "react";
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
  Typography,
} from "@mui/material";
import { Add, Edit, Delete, Person, CheckCircle, Cancel, Close } from "@mui/icons-material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

const ReporterCell = ({ value }) => (
  <MDBox display="flex" alignItems="center">
    <Avatar sx={{ bgcolor: "info.main", mr: 2, width: 32, height: 32 }}>
      <Person fontSize="small" />
    </Avatar>
    <MDTypography variant="button" fontWeight="medium">
      {value}
    </MDTypography>
  </MDBox>
);
ReporterCell.propTypes = { value: PropTypes.string.isRequired };

const StatusCell = ({ value }) => {
  const isResolved = value === "Resolved";
  return (
    <MDBox display="flex" alignItems="center" color={isResolved ? "success.main" : "error.main"}>
      {isResolved ? (
        <CheckCircle fontSize="small" sx={{ mr: 1 }} />
      ) : (
        <Cancel fontSize="small" sx={{ mr: 1 }} />
      )}
      <MDTypography variant="button" fontWeight="medium">
        {isResolved ? "Đã xử lý" : "Chưa xử lý"}
      </MDTypography>
    </MDBox>
  );
};
StatusCell.propTypes = { value: PropTypes.string.isRequired };

const ActionsCell = ({ row, onEdit, onDelete }) => (
  <MDBox display="flex">
    <IconButton color="info" onClick={() => onEdit(row.original)}>
      <Edit fontSize="small" />
    </IconButton>
    <IconButton color="error" sx={{ ml: 1 }} onClick={() => onDelete(row.original)}>
      <Delete fontSize="small" />
    </IconButton>
  </MDBox>
);
ActionsCell.propTypes = {
  row: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

const ReportManagement = () => {
  // State dialog Thêm/Sửa
  const [openForm, setOpenForm] = useState(false);
  // State dialog Xóa
  const [openDelete, setOpenDelete] = useState(false);
  // State báo cáo đang được chỉnh sửa hoặc xóa
  const [currentReport, setCurrentReport] = useState(null);
  // State form
  const [formData, setFormData] = useState({
    title: "",
    reporter: "",
    status: "Pending",
  });

  const columns = [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "TIÊU ĐỀ", accessor: "title", width: "25%" },
    { Header: "NGƯỜI GỬI", accessor: "reporter", width: "20%", Cell: ReporterCell },
    { Header: "TRẠNG THÁI", accessor: "status", width: "15%", Cell: StatusCell },
    { Header: "NGÀY TẠO", accessor: "createdAt", width: "15%" },
    {
      Header: "THAO TÁC",
      accessor: "actions",
      width: "10%",
      Cell: (props) => <ActionsCell {...props} onEdit={handleEdit} onDelete={handleDelete} />,
    },
  ];

  const rows = [
    {
      id: 1,
      title: "Báo cáo vi phạm nội dung",
      reporter: "Nguyễn Văn A",
      status: "Pending",
      createdAt: "2023-05-20",
    },
    {
      id: 2,
      title: "Báo cáo người dùng spam",
      reporter: "Trần Thị B",
      status: "Resolved",
      createdAt: "2023-05-21",
    },
  ];

  // Mở dialog thêm mới
  const handleAdd = () => {
    setCurrentReport(null);
    setFormData({ title: "", reporter: "", status: "Pending" });
    setOpenForm(true);
  };

  // Mở dialog sửa
  function handleEdit(report) {
    setCurrentReport(report);
    setFormData({
      title: report.title,
      reporter: report.reporter,
      status: report.status,
    });
    setOpenForm(true);
  }

  // Mở dialog xóa
  function handleDelete(report) {
    setCurrentReport(report);
    setOpenDelete(true);
  }

  // Đóng dialog thêm/sửa
  function handleCloseForm() {
    setOpenForm(false);
  }

  // Đóng dialog xóa
  function handleCloseDelete() {
    setOpenDelete(false);
  }

  // Thay đổi input form
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Nút Lưu Thêm/Sửa (chưa xử lý logic)
  function handleSave() {
    // Chưa xử lý logic lưu dữ liệu
    setOpenForm(false);
  }

  // Nút Xóa (chưa xử lý logic)
  function handleConfirmDelete() {
    // Chưa xử lý logic xóa dữ liệu
    setOpenDelete(false);
  }

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
                  QUẢN LÝ BÁO CÁO
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
                  table={{ columns, rows }}
                  entriesPerPage={5}
                  canSearch
                  showTotalEntries
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Dialog Thêm / Sửa */}
      <Dialog open={openForm} maxWidth="sm" fullWidth onClose={handleCloseForm}>
        <DialogTitle>
          {currentReport ? "Sửa báo cáo" : "Thêm báo cáo"}
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Tiêu đề"
            name="title"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            label="Người gửi"
            name="reporter"
            fullWidth
            margin="normal"
            value={formData.reporter}
            onChange={handleChange}
          />
          <TextField
            select
            label="Trạng thái"
            name="status"
            fullWidth
            margin="normal"
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="Pending">Chưa xử lý</MenuItem>
            <MenuItem value="Resolved">Đã xử lý</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseForm}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            {currentReport ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Xác nhận xóa */}
      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận xóa báo cáo</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Bạn có chắc chắn muốn xóa báo cáo <strong>{currentReport?.title || ""}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportManagement;

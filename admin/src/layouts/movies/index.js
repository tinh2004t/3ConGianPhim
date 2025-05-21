import { useState } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
const ImageCell = ({ value }) => (
  <MDBox
    component="img"
    src={value}
    alt="Poster phim"
    sx={{
      width: 80,
      height: 120,
      borderRadius: "md",
      objectFit: "cover",
    }}
  />
);

ImageCell.propTypes = {
  value: PropTypes.string.isRequired,
};

function MoviesManagement() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [moviesData, setMoviesData] = useState([
    {
      id: 1,
      title: "Bố Già",
      description: "Phim hài gia đình cảm động",
      posterUrl: "https://example.com/poster-bo-gia.jpg",
      trailerUrl: "https://youtube.com/embed/abc123",
      genres: ["Hài", "Gia đình"],
      releaseYear: 2023,
      status: "completed",
      country: "Việt Nam",
      totalEpisodes: 1,
      viewCount: 15000,
    },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    genres: [],
    releaseYear: new Date().getFullYear(),
    status: "ongoing",
    country: "Việt Nam",
    totalEpisodes: 1,
  });

  // Cấu hình cột bảng
  const columns = [
    {
      Header: "Poster",
      accessor: "posterUrl",
      width: "15%",
      align: "center",
      Cell: ImageCell,
    },
    { Header: "Tiêu đề", accessor: "title", width: "25%", align: "left" },
    {
      Header: "Thể loại",
      accessor: "genres",
      width: "20%",
      align: "left",
      Cell: ({ value }) => value.join(", "),
    },
    { Header: "Trạng thái", accessor: "status", width: "15%", align: "center" },
    { Header: "Tập", accessor: "totalEpisodes", width: "8%", align: "center" },
    { Header: "Lượt xem", accessor: "viewCount", width: "15%", align: "center" },
    {
      Header: "Hành động",
      accessor: "action",
      width: "10%",
      align: "center",
      Cell: () => (
        <MDBox display="flex" gap={1}>
          <MDButton
            component={Link}
            to="/movies/edit/:id"
            variant="gradient"
            color="info"
            size="small"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              py: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            Sửa
          </MDButton>
          <MDButton variant="gradient" color="error" size="small">
            Xóa
          </MDButton>
        </MDBox>
      ),
    },
  ];
  // Tạo rows cho bảng
  const rows = moviesData.map((movie) => ({
    posterUrl: movie.posterUrl,
    title: (
      <MDTypography variant="caption" fontWeight="medium">
        {movie.title}
      </MDTypography>
    ),
    genres: movie.genres,
    status: (
      <MDTypography variant="caption">
        {movie.status === "ongoing" ? "Đang phát" : "Hoàn thành"}
      </MDTypography>
    ),
    totalEpisodes: <MDTypography variant="caption">{movie.totalEpisodes}</MDTypography>,
    viewCount: <MDTypography variant="caption">{movie.viewCount.toLocaleString()}</MDTypography>,
    action: movie.id,
  }));

  return (
    <MDBox
      pt={4}
      pb={3}
      sx={{
        width: "calc(100% - 250px)",
        ml: "250px",
        px: { xs: 2, sm: 3 },
        overflowX: "auto",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <MDTypography
          variant="h4"
          sx={{
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Quản lý Phim
        </MDTypography>

        <MDBox
          display="flex"
          gap={2}
          width={{ xs: "100%", sm: "auto" }}
          flexDirection={{ xs: "column", sm: "row" }}
        >
          <MDInput
            placeholder="Tìm kiếm phim..."
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                py: 1,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              },
            }}
          />
          <MDButton
            component={Link}
            to="/movies/create"
            variant="gradient"
            color="dark"
            fullWidth={{ xs: true, sm: false }}
            sx={{
              py: 1.5,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              whiteSpace: "nowrap",
            }}
          >
            Thêm Phim Mới
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Bảng dữ liệu */}
      <DataTable
        table={{
          columns: columns.map((col) => ({
            ...col,
            width: `${col.width}%`,
          })),
          rows,
        }}
        isSorted={true}
        entriesPerPage={5}
        showTotalEntries={true}
        noEndBorder
        sx={{
          "& .MuiTable-root": {
            minWidth: 800,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
          },
          "& .MuiTableCell-root": {
            py: 1,
            px: { xs: 0.5, sm: 1 },
          },
        }}
      />
    </MDBox>
  );
}

MoviesManagement.propTypes = {
  moviesData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      posterUrl: PropTypes.string.isRequired,
      trailerUrl: PropTypes.string,
      genres: PropTypes.arrayOf(PropTypes.string).isRequired,
      releaseYear: PropTypes.number.isRequired,
      status: PropTypes.oneOf(["ongoing", "completed"]).isRequired,
      country: PropTypes.string.isRequired,
      totalEpisodes: PropTypes.number.isRequired,
      viewCount: PropTypes.number.isRequired,
    })
  ),
};

MoviesManagement.defaultProps = {
  moviesData: [],
};

export default MoviesManagement;

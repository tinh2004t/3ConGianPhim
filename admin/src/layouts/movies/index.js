import { useState } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

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
      width: "10%",
      align: "center",
      Cell: ImageCell,
    },
    { Header: "Tiêu đề", accessor: "title", width: "20%", align: "left" },
    { Header: "Mô tả", accessor: "description", width: "25%", align: "left" },
    {
      Header: "Thể loại",
      accessor: "genres",
      width: "15%",
      align: "left",
      Cell: ({ value }) => value.join(", "),
    },
    { Header: "Năm PH", accessor: "releaseYear", width: "8%", align: "center" },
    { Header: "Trạng thái", accessor: "status", width: "10%", align: "center" },
    { Header: "Tập", accessor: "totalEpisodes", width: "8%", align: "center" },
    { Header: "Lượt xem", accessor: "viewCount", width: "10%", align: "center" },
    {
      Header: "Hành động",
      accessor: "action",
      width: "10%",
      align: "center",
      Cell: () => (
        <MDBox display="flex" gap={1}>
          <MDButton variant="gradient" color="info" size="small">
            Sửa
          </MDButton>
          <MDButton variant="gradient" color="error" size="small">
            Xóa
          </MDButton>
        </MDBox>
      ),
    },
  ];

  // Xử lý thêm phim mới
  const handleAddMovie = () => {
    const newMovie = {
      id: moviesData.length + 1,
      ...formData,
      viewCount: 0,
    };

    setMoviesData([...moviesData, newMovie]);
    setShowForm(false);
    setFormData({
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
  };

  // Tạo rows cho bảng
  const rows = moviesData.map((movie) => ({
    posterUrl: movie.posterUrl,
    title: (
      <MDTypography variant="caption" fontWeight="medium">
        {movie.title}
      </MDTypography>
    ),
    description: <MDTypography variant="caption">{movie.description}</MDTypography>,
    genres: movie.genres,
    releaseYear: <MDTypography variant="caption">{movie.releaseYear}</MDTypography>,
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
    <MDBox pt={4} pb={3} sx={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <MDBox
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <MDTypography variant="h4" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          Quản lý Phim
        </MDTypography>

        <MDBox display="flex" gap={2}>
          <MDInput
            placeholder="Tìm kiếm phim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<i className="fas fa-search" />}
            sx={{
              width: { xs: "100%", sm: 300 },
              "& .MuiInputBase-input": {
                padding: "12px 16px",
              },
            }}
          />
          <MDButton
            variant="gradient"
            color="dark"
            onClick={() => setShowForm(!showForm)}
            sx={{
              padding: "12px 24px",
              fontSize: "0.875rem",
              minWidth: 160,
            }}
          >
            {showForm ? "Đóng Form" : "Thêm Phim Mới"}
          </MDButton>
        </MDBox>
      </MDBox>

      {/* Form thêm mới */}
      {showForm && (
        <MDBox
          mb={3}
          p={3}
          borderRadius="lg"
          bgColor="white"
          shadow="md"
          sx={{
            width: { xs: "100%", md: "80%" },
            margin: "0 auto",
          }}
        >
          <MDTypography variant="h6" mb={3}>
            Thông tin phim mới
          </MDTypography>

          <MDBox
            component="form"
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }}
            gap={3}
          >
            {/* Cột trái */}
            <MDBox>
              <MDInput
                label="Tiêu đề"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <MDInput
                label="Mô tả"
                multiline
                rows={4}
                fullWidth
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mt: 2 }}
              />

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Thể loại</InputLabel>
                <Select
                  multiple
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                >
                  {["Hài", "Hành động", "Tình cảm", "Kinh dị"].map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>

            {/* Cột phải */}
            <MDBox>
              <MDInput
                label="Poster URL"
                fullWidth
                value={formData.posterUrl}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
              />

              <MDInput
                label="Trailer URL"
                fullWidth
                value={formData.trailerUrl}
                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                sx={{ mt: 2 }}
              />

              <MDBox display="flex" gap={2} mt={2}>
                <FormControl fullWidth>
                  <InputLabel>Quốc gia</InputLabel>
                  <Select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  >
                    <MenuItem value="Việt Nam">Việt Nam</MenuItem>
                    <MenuItem value="Hàn Quốc">Hàn Quốc</MenuItem>
                    <MenuItem value="Trung Quốc">Trung Quốc</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="ongoing">Đang phát</MenuItem>
                    <MenuItem value="completed">Hoàn thành</MenuItem>
                  </Select>
                </FormControl>
              </MDBox>

              <MDBox display="flex" gap={2} mt={2}>
                <MDInput
                  label="Năm phát hành"
                  type="number"
                  fullWidth
                  value={formData.releaseYear}
                  onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                />

                <MDInput
                  label="Số tập"
                  type="number"
                  fullWidth
                  value={formData.totalEpisodes}
                  onChange={(e) => setFormData({ ...formData, totalEpisodes: e.target.value })}
                />
              </MDBox>
            </MDBox>
          </MDBox>

          <MDButton
            variant="gradient"
            color="success"
            fullWidth
            sx={{ mt: 3, height: 48 }}
            onClick={handleAddMovie}
          >
            Lưu phim mới
          </MDButton>
        </MDBox>
      )}

      {/* Bảng dữ liệu */}
      <DataTable
        table={{ columns, rows }}
        isSorted={true}
        entriesPerPage={5}
        showTotalEntries={true}
        noEndBorder
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

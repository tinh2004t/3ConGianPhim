import { Link } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

function EditMovie() {
  // Dữ liệu mẫu để hiển thị (có thể thay thế bằng dữ liệu thực từ props hoặc API)
  const sampleData = {
    title: "Bố Già",
    description: "Phim hài gia đình cảm động",
    posterUrl: "https://example.com/poster-bo-gia.jpg",
    trailerUrl: "https://youtube.cohttps://www.youtube.com/watch?v=tqG99soP1XQm/embed/abc123",
    genres: ["Hài", "Gia đình"],
    releaseYear: 2023,
    status: "completed",
    country: "Việt Nam",
    totalEpisodes: 1,
  };

  return (
    <MDBox
      pt={4}
      pb={3}
      sx={{
        width: "calc(100% - 250px)",
        ml: "250px",
        px: { xs: 2, sm: 3 },
        overflowX: "auto",
      }}
    >
      <MDTypography variant="h3" mb={3} textAlign="center">
        Chỉnh Sửa Phim
      </MDTypography>

      <MDBox display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
        {/* Cột trái */}
        <MDBox>
          <MDInput label="Tiêu đề phim" fullWidth defaultValue={sampleData.title} />

          <MDInput
            label="Mô tả"
            multiline
            rows={4}
            fullWidth
            defaultValue={sampleData.description}
            sx={{ mt: 2 }}
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Thể loại</InputLabel>
            <Select
              multiple
              defaultValue={sampleData.genres}
              renderValue={(selected) => selected.join(", ")}
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
          <MDInput label="Poster URL" fullWidth defaultValue={sampleData.posterUrl} />

          <MDInput
            label="Trailer URL"
            fullWidth
            defaultValue={sampleData.trailerUrl}
            sx={{ mt: 2 }}
          />

          <MDBox display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Quốc gia</InputLabel>
              <Select defaultValue={sampleData.country}>
                <MenuItem value="Việt Nam">Việt Nam</MenuItem>
                <MenuItem value="Hàn Quốc">Hàn Quốc</MenuItem>
                <MenuItem value="Trung Quốc">Trung Quốc</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select defaultValue={sampleData.status}>
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
              defaultValue={sampleData.releaseYear}
            />

            <MDInput
              label="Số tập"
              type="number"
              fullWidth
              defaultValue={sampleData.totalEpisodes}
            />
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox display="flex" gap={2} mt={4}>
        <MDButton component={Link} to="/movies" variant="gradient" color="secondary" fullWidth>
          Quay lại
        </MDButton>
        <MDButton variant="gradient" color="success" fullWidth>
          Lưu thay đổi
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default EditMovie;

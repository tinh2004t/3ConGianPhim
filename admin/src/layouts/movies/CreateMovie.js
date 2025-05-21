import { useState } from "react";
import { Link } from "react-router-dom";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

function CreateMovie() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    posterUrl: "",
    trailerUrl: "",
    genres: [],
    country: "",
    status: "ongoing",
    releaseYear: new Date().getFullYear(),
    totalEpisodes: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      genres: typeof value === "string" ? value.split(",") : value,
    }));
  };

  return (
    <MDBox
      component="form"
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
        Thêm Phim Mới
      </MDTypography>

      <MDBox display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }} gap={3}>
        {/* Cột trái */}
        <MDBox>
          <MDInput
            label="Tiêu đề phim"
            fullWidth
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <MDInput
            label="Mô tả"
            multiline
            rows={4}
            fullWidth
            sx={{ mt: 2 }}
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Thể loại</InputLabel>
            <Select
              multiple
              name="genres"
              value={formData.genres}
              onChange={handleMultiSelect}
              renderValue={(selected) => selected.join(", ")}
              required
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
            name="posterUrl"
            value={formData.posterUrl}
            onChange={handleChange}
            required
          />

          <MDInput
            label="Trailer URL"
            fullWidth
            sx={{ mt: 2 }}
            name="trailerUrl"
            value={formData.trailerUrl}
            onChange={handleChange}
          />

          <MDBox display="flex" gap={2} mt={2}>
            <FormControl fullWidth>
              <InputLabel>Quốc gia</InputLabel>
              <Select name="country" value={formData.country} onChange={handleChange} required>
                <MenuItem value="Việt Nam">Việt Nam</MenuItem>
                <MenuItem value="Hàn Quốc">Hàn Quốc</MenuItem>
                <MenuItem value="Trung Quốc">Trung Quốc</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select name="status" value={formData.status} onChange={handleChange} required>
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
              name="releaseYear"
              value={formData.releaseYear}
              onChange={handleChange}
              inputProps={{ min: 1900, max: 2100 }}
              required
            />

            <MDInput
              label="Số tập"
              type="number"
              fullWidth
              name="totalEpisodes"
              value={formData.totalEpisodes}
              onChange={handleChange}
              inputProps={{ min: 1 }}
              required
            />
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox display="flex" gap={2} mt={4}>
        <MDButton component={Link} to="/movies" variant="gradient" color="secondary" fullWidth>
          Quay lại
        </MDButton>
        <MDButton variant="gradient" color="success" fullWidth type="submit">
          Lưu phim mới
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default CreateMovie;

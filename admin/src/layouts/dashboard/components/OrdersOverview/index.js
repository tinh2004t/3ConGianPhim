import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import TimelineItem from "examples/Timeline/TimelineItem";

function TongQuanHoatDong() {
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Hoạt động gần đây
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main }}>arrow_upward</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              15%
            </MDTypography>{" "}
            tăng trưởng lượt xem
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        <TimelineItem
          color="success"
          icon="play_circle"
          title="Phim 'Avengers: Endgame' đạt 1 triệu lượt xem"
          dateTime="22 Th12 19:20"
        />
        <TimelineItem
          color="info"
          icon="movie"
          title="Thêm 5 phim mới vào thư viện"
          dateTime="21 Th12 23:00"
        />
        <TimelineItem
          color="warning"
          icon="person_add"
          title="1.250 người dùng mới đăng ký"
          dateTime="21 Th12 21:34"
        />
        <TimelineItem
          color="primary"
          icon="star"
          title="Phim 'Spider-Man' nhận 500 đánh giá 5 sao"
          dateTime="20 Th12 02:20"
        />
        <TimelineItem
          color="error"
          icon="update"
          title="Cập nhật phiên bản ứng dụng mới"
          dateTime="18 Th12 04:54"
          lastItem
        />
      </MDBox>
    </Card>
  );
}

export default TongQuanHoatDong;

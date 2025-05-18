/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* Bản quyền 2023 Creative Tim (https://www.creative-tim.com)
* Thiết kế bởi www.creative-tim.com
=========================================================
*/

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";

function TongQuanHoatDong() {
  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Tổng quan hoạt động
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon sx={{ color: ({ palette: { success } }) => success.main }}>arrow_upward</Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              24%
            </MDTypography>{" "}
            trong tháng này
          </MDTypography>
        </MDBox>
      </MDBox>
      <MDBox p={2}>
        <TimelineItem
          color="success"
          icon="notifications"
          title="4.000.000đ, Cập nhật thiết kế"
          dateTime="22 Th12 19:20"
        />
        <TimelineItem
          color="error"
          icon="inventory_2"
          title="Đơn hàng mới #1832412"
          dateTime="21 Th12 23:00"
        />
        <TimelineItem
          color="info"
          icon="shopping_cart"
          title="Thanh toán máy chủ cho Tháng 4"
          dateTime="21 Th12 21:34"
        />
        <TimelineItem
          color="warning"
          icon="payment"
          title="Thêm thẻ mới cho đơn hàng #4395133"
          dateTime="20 Th12 02:20"
        />
        <TimelineItem
          color="primary"
          icon="vpn_key"
          title="Thêm phương thức thanh toán mới"
          dateTime="18 Th12 04:54"
          lastItem
        />
      </MDBox>
    </Card>
  );
}

export default TongQuanHoatDong;

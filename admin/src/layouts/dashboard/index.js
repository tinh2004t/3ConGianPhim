/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Trang sản phẩm: https://www.creative-tim.com/product/material-dashboard-react
* Bản quyền 2023 Creative Tim (https://www.creative-tim.com)

* Thiết kế bởi www.creative-tim.com

=========================================================

* Thông báo bản quyền trên phải được bao gồm trong tất cả các bản sao hoặc phần lớn phần mềm.
*/

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

// Dashboard components
import Projects from "layouts/dashboard/components/Projects";
import OrdersOverview from "layouts/dashboard/components/OrdersOverview";

function Dashboard() {
  const { sales, tasks } = reportsLineChartData;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="weekend"
                title="Đặt chỗ"
                count={281}
                percentage={{
                  color: "success",
                  amount: "+55%",
                  label: "so với tuần trước",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Người dùng hôm nay"
                count="2,300"
                percentage={{
                  color: "success",
                  amount: "+3%",
                  label: "so với tháng trước",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Doanh thu"
                count="34k"
                percentage={{
                  color: "success",
                  amount: "+1%",
                  label: "so với hôm qua",
                }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Người theo dõi"
                count="+91"
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Vừa cập nhật",
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Lượt xem website"
                  description="Hiệu suất chiến dịch gần nhất"
                  date="chiến dịch gửi 2 ngày trước"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Doanh thu hàng ngày"
                  description={
                    <>
                      (<strong>+15%</strong>) tăng trưởng so với hôm qua
                    </>
                  }
                  date="cập nhật 4 phút trước"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="Công việc hoàn thành"
                  description="Hiệu suất chiến dịch gần nhất"
                  date="vừa cập nhật"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={8}>
              <Projects />
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <OrdersOverview />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;

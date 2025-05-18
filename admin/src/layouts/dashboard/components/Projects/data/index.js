/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import Tooltip from "@mui/material/Tooltip";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import MDProgress from "components/MDProgress";

// Images
import logoXD from "assets/images/small-logos/logo-xd.svg";
import logoAtlassian from "assets/images/small-logos/logo-atlassian.svg";
import logoSlack from "assets/images/small-logos/logo-slack.svg";
import logoSpotify from "assets/images/small-logos/logo-spotify.svg";
import logoJira from "assets/images/small-logos/logo-jira.svg";
import logoInvesion from "assets/images/small-logos/logo-invision.svg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

export default function data() {
  const avatars = (members) =>
    members.map(([image, name]) => (
      <Tooltip key={name} title={name} placeholder="bottom">
        <MDAvatar
          src={image}
          alt="name"
          size="xs"
          sx={{
            border: ({ borders: { borderWidth }, palette: { white } }) =>
              `${borderWidth[2]} solid ${white.main}`,
            cursor: "pointer",
            position: "relative",

            "&:not(:first-of-type)": {
              ml: -1.25,
            },

            "&:hover, &:focus": {
              zIndex: "10",
            },
          }}
        />
      </Tooltip>
    ));

  const Company = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDAvatar src={image} name={name} size="sm" />
      <MDTypography variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  return {
    columns: [
      { Header: "Công ty", accessor: "congty", width: "45%", align: "left" },
      { Header: "Thành viên", accessor: "thanhvien", width: "10%", align: "left" },
      { Header: "Ngân sách", accessor: "ngansach", align: "center" },
      { Header: "Tiến độ", accessor: "tiendo", align: "center" },
    ],

    rows: [
      {
        congty: <Company image={logoXD} name="Phiên bản Material UI XD" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Nguyễn Văn A"],
              [team2, "Trần Thị B"],
              [team3, "Lê Văn C"],
              [team4, "Phạm Thị D"],
            ])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            322.000.000 VND
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={60} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        congty: <Company image={logoAtlassian} name="Thêm theo dõi tiến trình" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team2, "Trần Thị B"],
              [team4, "Phạm Thị D"],
            ])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            69.000.000 VND
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={10} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        congty: <Company image={logoSlack} name="Sửa lỗi nền tảng" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Nguyễn Văn A"],
              [team3, "Lê Văn C"],
            ])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            Chưa đặt
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={100} color="success" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        congty: <Company image={logoSpotify} name="Ra mắt ứng dụng di động" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team4, "Phạm Thị D"],
              [team3, "Lê Văn C"],
              [team2, "Trần Thị B"],
              [team1, "Nguyễn Văn A"],
            ])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            471.500.000 VND
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={100} color="success" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        congty: <Company image={logoJira} name="Thêm trang giá mới" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([[team4, "Phạm Thị D"]])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            11.500.000 VND
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={25} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
      {
        congty: <Company image={logoInvesion} name="Làm mới cửa hàng online" />,
        thanhvien: (
          <MDBox display="flex" py={1}>
            {avatars([
              [team1, "Nguyễn Văn A"],
              [team4, "Phạm Thị D"],
            ])}
          </MDBox>
        ),
        ngansach: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            46.000.000 VND
          </MDTypography>
        ),
        tiendo: (
          <MDBox width="8rem" textAlign="left">
            <MDProgress value={40} color="info" variant="gradient" label={false} />
          </MDBox>
        ),
      },
    ],
  };
}

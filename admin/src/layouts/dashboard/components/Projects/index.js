import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React examples
import DataTable from "examples/Tables/DataTable";

function MoviesTableUI() {
  const moviesData = [
    {
      id: 1,
      title: "Phim hành động 1",
      genre: "Hành động",
      duration: "120 phút",
      releaseDate: "2023-10-15",
      views: "1.2M",
    },
    {
      id: 2,
      title: "Phim lãng mạn 1",
      genre: "Lãng mạn",
      duration: "105 phút",
      releaseDate: "2023-09-20",
      views: "890K",
    },
    {
      id: 3,
      title: "Phim kinh dị 1",
      genre: "Kinh dị",
      duration: "95 phút",
      releaseDate: "2023-11-05",
      views: "1.5M",
    },
  ];

  const columns = [
    { Header: "ID", accessor: "id", width: "10%" },
    { Header: "TÊN PHIM", accessor: "title", width: "30%" },
    { Header: "THỂ LOẠI", accessor: "genre", width: "15%" },
    { Header: "THỜI LƯỢNG", accessor: "duration", width: "15%" },
    { Header: "NGÀY PHÁT HÀNH", accessor: "releaseDate", width: "15%" },
    { Header: "LƯỢT XEM", accessor: "views", width: "15%" },
  ];

  return (
    <Card>
      <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Danh sách phim
          </MDTypography>
          <MDBox display="flex" alignItems="center" lineHeight={0}>
            <Icon
              sx={{
                fontWeight: "bold",
                color: ({ palette: { info } }) => info.main,
                mt: -0.5,
              }}
            >
              movie
            </Icon>
            <MDTypography variant="button" fontWeight="regular" color="text">
              &nbsp;<strong>{moviesData.length} phim</strong> trong thư viện
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox>
        <DataTable
          table={{ columns, rows: moviesData }}
          showTotalEntries={false}
          isSorted={false}
          noEndBorder
          entriesPerPage={false}
        />
      </MDBox>
    </Card>
  );
}

export default MoviesTableUI;

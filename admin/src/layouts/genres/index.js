import React from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

const genresData = {
  columns: [
    { Header: "Tên thể loại", accessor: "name", width: "70%" },
    { Header: "Số phim", accessor: "count", width: "30%" },
  ],
  rows: [
    { name: "Hành động", count: 45 },
    { name: "Hài hước", count: 32 },
  ],
};

export default function Genres() {
  return (
    <MDBox pt={6} pb={3}>
      <MDTypography variant="h2" mb={3}>
        Quản lý Thể loại
      </MDTypography>
      <DataTable
        table={genresData}
        entriesPerPage={false}
        showTotalEntries={true}
        isSorted={false}
      />
    </MDBox>
  );
}
import { Paper, Typography } from "@mui/material";

export default function Sidebar() {
  return (
    <Paper
      sx={{
        width: 250,
        p: 2,
        height: "100vh",
        position: "fixed",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Menu
      </Typography>
      {[
        "Dashboard",
        "Thể loại",
        "Phim",
        "Tập phim",
        "Lịch chiếu",
        "Người dùng",
        "Bình luận",
        "Báo cáo",
      ].map((item) => (
        <Typography key={item} sx={{ py: 1, cursor: "pointer" }}>
          {item}
        </Typography>
      ))}
    </Paper>
  );
}

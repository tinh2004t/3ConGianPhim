const commentsData = {
  columns: [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "Phim", accessor: "movieTitle", width: "25%" },
    { Header: "Tập", accessor: "episodeNumber", width: "10%" },
    { Header: "Người dùng", accessor: "username", width: "20%" },
    { Header: "Nội dung", accessor: "content", width: "40%" },
  ],
  rows: [
    {
      id: 1,
      movieTitle: "Avengers: Endgame",
      episodeNumber: 1,
      username: "user123",
      content: "Phim rất hay!"
    }
  ],
};
const episodesData = {
  columns: [
    { Header: "ID", accessor: "id", width: "5%" },
    { Header: "Phim", accessor: "movieTitle", width: "25%" },
    { Header: "Tập số", accessor: "episodeNumber", width: "10%" },
    { Header: "Tiêu đề", accessor: "title", width: "30%" },
    { Header: "Nguồn video", accessor: "videoSource", width: "30%" },
  ],
  rows: [
    {
      id: 1,
      movieTitle: "Avengers: Endgame",
      episodeNumber: 1,
      title: "Tập mở đầu",
      videoSource: "https://example.com/video1.mp4"
    }
  ],
};
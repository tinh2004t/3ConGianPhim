/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* Modified for Movie Admin Panel
=========================================================
*/

// Material Dashboard 2 React layouts
import Genres from "./layouts/genres";
import Movies from "./layouts/movies";
import Episodes from "./layouts/episodes";
import Schedules from "./layouts/schedules";
import Comments from "./layouts/comments";
import Reports from "./layouts/reports";
import Users from "./layouts/users";
import Dashboard from "./layouts/dashboard";
import CreateMovie from "layouts/movies/CreateMovie";
import EditMovie from "layouts/movies/EditMovie";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  // Redirect mặc định
  {
    type: "redirect",
    name: "Trang chủ",
    key: "home",
    icon: <Icon fontSize="small">home</Icon>,
    route: "/",
    redirect: "/dashboard",
  },

  // Dashboard
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

  // Quản lý nội dung
  {
    type: "collapse",
    name: "Thể loại",
    key: "genres",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/genres",
    component: <Genres />,
  },
  {
    type: "collapse",
    name: "Phim",
    key: "movies",
    icon: <Icon fontSize="small">movie</Icon>,
    route: "/movies",
    component: <Movies />,
  },
  {
    type: "collapse",
    name: "Tập phim",
    key: "episodes",
    icon: <Icon fontSize="small">video_library</Icon>,
    route: "/episodes",
    component: <Episodes />,
  },

  // Quản lý lịch chiếu
  {
    type: "collapse",
    name: "Lịch chiếu",
    key: "schedules",
    icon: <Icon fontSize="small">schedule</Icon>,
    route: "/schedules",
    component: <Schedules />,
  },

  // Quản lý người dùng
  {
    type: "collapse",
    name: "Người dùng",
    key: "users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/users",
    component: <Users />,
  },

  // Tương tác
  {
    type: "collapse",
    name: "Bình luận",
    key: "comments",
    icon: <Icon fontSize="small">chat</Icon>, // Sửa icon
    route: "/comments",
    component: <Comments />,
  },
  {
    type: "collapse",
    name: "Báo cáo",
    key: "reports",
    icon: <Icon fontSize="small">report</Icon>,
    route: "/reports",
    component: <Reports />,
  },
  // Thêm phim mới
  {
    type: "collapse",
    name: "Thêm phim",
    key: "create-movie",
    icon: <Icon fontSize="small">add_circle</Icon>,
    route: "/movies/create",
    component: <CreateMovie />,
  },

  // Chỉnh sửa phim
  {
    type: "collapse",
    name: "Chỉnh sửa phim",
    key: "edit-movie",
    icon: <Icon fontSize="small">edit_note</Icon>,
    route: "/movies/edit/:id",
    component: <EditMovie />,
  },
];

export default routes;

/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================
* Modified for Movie Admin Panel
=========================================================
*/

// Material Dashboard 2 React layouts
import Genres from "layouts/genres";
import Movies from "layouts/movies";
import Episodes from "layouts/episodes";
import Schedules from "layouts/schedules";
import Comments from "layouts/comments";
import Reports from "layouts/reports";
import Users from "layouts/users";
import Dashboard from "layouts/dashboard";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },

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
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
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
  {
    type: "collapse",
    name: "Lịch chiếu",
    key: "schedules",
    icon: <Icon fontSize="small">schedule</Icon>,
    route: "/schedules",
    component: <Schedules />,
  },

  // Quản lý tương tác
  {
    type: "collapse",
    name: "Bình luận",
    key: "comments",
    icon: <Icon fontSize="small">comment</Icon>,
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

  // Quản lý người dùng
  {
    type: "collapse",
    name: "Người dùng",
    key: "users",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/users",
    component: <Users />,
  },
];

export default routes;
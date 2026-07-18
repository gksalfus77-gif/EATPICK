import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "../pages/LoginPage";
import Membership from "../pages/MembershipPage";
import Layout from "../components/Layout";
import VegaPage   from "../pages/VegaPage";
import StranPage  from "../pages/StranPage";
import ExotPage   from "../pages/ExotPage";
import KidsPage   from "../pages/KidsPage";
import ChefPage   from "../pages/ChefPage";
import MichPage   from "../pages/MichPage";
import LiquPage   from "../pages/LiquPage";
import AniPage    from "../pages/AniPage";
import MapPage    from "../pages/MapPage";
import BlogPage   from "../pages/BlogPage";
import Home       from "../pages/Home";
import Fpage      from "../pages/Fpage";
import Cus        from "../pages/Cus";
import Commu from "../pages/Commu";
import Manager from "../pages/Manager";


const router = createBrowserRouter([
  {
    // ✅ Layout이 모든 페이지를 감쌈
    path: "/",
    element: <Layout />,
    children: [
      // Home — 자체 햄버거 사이드바 보유 (Layout FAB은 숨겨짐)
      { index: true,            element: <Home />       },

      // 지도 / 블로그
      { path: "map",            element: <MapPage />    },
      { path: "blog",           element: <BlogPage />   },

      // 카테고리 페이지들
      { path: "VegaPage",       element: <VegaPage />   },
      { path: "ExotPage",       element: <ExotPage />   },
      { path: "ChefPage",       element: <ChefPage />   },
      { path: "MichPage",       element: <MichPage />   },
      { path: "KidsPage",       element: <KidsPage />   },
      { path: "AniPage",        element: <AniPage />    },
      { path: "StranPage",      element: <StranPage />  },
      { path: "LiquPage",       element: <LiquPage />   },

      // 기타
      { path: "login",          element: <Login />       },
      { path: "membership",     element: <Membership /> },
      { path: "cus",            element: <Cus />        },
      { path: "commu",          element: <Commu />      },
      { path: "fpage/:id",          element: <Fpage />      },
     

    ],
  },
  //  햄버거메뉴 때문에 밖으로 뺏습니다.
   { path: "Manager",         element: <Manager />   },
  // 잘못된 주소 → 홈
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;












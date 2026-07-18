// src/pages/Home.tsx
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../contexts/AuthContext";
import "../assets/css/Home.css";
import vegetarianImg from "../assets/Image/VEGETARIANISM.png";
import mainstreamImg from "../assets/Image/MAINSTREAM.png";
import exoticImg from "../assets/Image/EXOTIC.png";
import eccentricImg from "../assets/Image/ECCENTRIC.png";
import famouschefImg from "../assets/Image/FAMOUSCHEF.png";
import michelinImg from "../assets/Image/MICHELIN.png";
import kidszoneImg from "../assets/Image/KIDSZONE.png";
import petaccessImg from "../assets/Image/PETACCESS.png";
import bacgroundimg from "../assets/Image/bacground.png";
import dog01Img from "../assets/Image/dog01.png";
import apiClient from "../services/apiClient";

const slide1Items = [
  { label: "채식", src: vegetarianImg, path: "/VegaPage" },
  { label: "주류", src: mainstreamImg, path: "Mainstream" },
  { label: "이국요리", src: exoticImg, path: "/ExotPage" },
  { label: "괴식", src: eccentricImg, path: "/StranPage" },
  { label: "유명쉡", src: famouschefImg, path: "/ChefPage" },
  { label: "미슐랭", src: michelinImg, path: "/MichPage" },
  { label: "키즈존", src: kidszoneImg, path: "/KidsPage" },
  { label: "동물출입", src: petaccessImg, path: "/AniPage" },
];

const slide2Items = [
  { label: "유명쉡", src: famouschefImg, path: "/ChefPage" },
  { label: "미슐랭", src: michelinImg, path: "/MichPage" },
  { label: "키즈존", src: kidszoneImg, path: "/KidsPage" },
  { label: "동물출입", src: petaccessImg, path: "/AniPage" },
  { label: "채식", src: vegetarianImg, path: "/VegaPage" },
  { label: "주류", src: mainstreamImg, path: "Mainstream" },
  { label: "이국요리", src: exoticImg, path: "/ExotPage" },
  { label: "괴식", src: eccentricImg, path: "/StranPage" },
];

const foodNavLinks = [
  { label: "채식주의", path: "/VegaPage" },
  { label: "이국요리", path: "/ExotPage" },
  { label: "유명쉐프식당", path: "/ChefPage" },
  { label: "미슐렝", path: "/MichPage" },
  { label: "키즈존식당", path: "/KidsPage" },
  { label: "애견동반식당", path: "/AniPage" },
  { label: "특이한괴식", path: "/StranPage" },
  { label: "세계주류판매", path: "/LiquPage" },
];

const communityNavLinks = [
  { label: "지도 보기", path: "/map" },
  { label: "맛집 블로그", path: "/blog" },
  { label: "커뮤니티", path: "/cummu" },
];

type Notification = {
  id: number;
  message: string; // content 제거 또는 message로 변경
  isRead: boolean;
  // type 필드도 필요하면 추가
  type?: string; 
};

const addr = "http://43.203.165.206:8080"; // TODO AWS 컴퓨터
// const addr = "http://localhost:8080/api"; // PC

export default function Home() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const isLoggedIn = !!auth?.user;

  const [count, setCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [alarmOpen, setAlarmOpen] = useState(false);

  // ESC 키로 햄버거 메뉴 / 알림 닫기
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setAlarmOpen(false);
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  // 읽지 않은 알림 개수 초기 로드
  useEffect(() => {
    apiClient
      .get(addr + "/notifications/unread-count")
      .then((res) => {
        setCount(res.data);
        console.log("알림개수", res.data);
      })
      .catch((err) => {
        console.error("알림 개수를 가져오는 중 오류 발생:", err);
      });
  }, []);

  const go = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleAuthClick = () => {
    if (isLoggedIn) {
      auth?.logoutContext();
      go("/");
    } else {
      go("/login");
    }
  };

  // 알림 배너 열기 / 닫기 토글
  const handleAlarmClick = async () => {
    if (!alarmOpen) {
      const res = await apiClient.get(addr + "/notifications");
      setNotifications(res.data);
      console.log(res.data);
    }
    setAlarmOpen((v) => !v);
  };

  // 개별 알림 읽음 처리
  const handleRead = async (n: Notification) => {
    if (!n.isRead) {
     await apiClient.patch(addr + `/notifications/${n.id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true } : item
        )
      );
      setCount((prev) => Math.max(0, prev - 1));
    }
  };

  // 전체 읽음 처리
  const handleMarkAllRead = async () => {
    await apiClient.put(addr + "/notifications/read-all");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setCount(0);
  };

  return (
    <main className="home-root">
      <img className="home-bg" src={bacgroundimg} alt="배경" />

      <div className="home-hero">
        <img className="home-cat" src={dog01Img} alt="캐릭터" />

        {/* dog-wrapper: 아이콘/뱃지만 포함 */}
        <div className="dog-wrapper" onClick={handleAlarmClick}>
          {count > 0 && <div className="dog-alarm-badge">{count}</div>}
          <div className="dog-alarm-text">알람</div>
        </div>

        <div className="home-title">
          <h1>EATPICK</h1>
          <span>TASTE DORY</span>
        </div>
      </div>

      {/* ✅ alarm-overlay, alarm-panel을 home-hero 완전히 바깥 main 바로 아래로 이동
          → 어떤 부모 요소의 onClick/z-index 간섭도 없이 독립 동작 */}
      {alarmOpen && (
        <div
          className="alarm-overlay"
          onClick={() => setAlarmOpen(false)}
        />
      )}

      {alarmOpen && (
        <div className="alarm-panel">
          <div className="alarm-panel-header">
            <div className="alarm-panel-title">
              <span className="alarm-bell-icon"></span>
              알림
              {count > 0 && (
                <span className="alarm-count-badge">{count}</span>
              )}
            </div>

            <button
              className="alarm-panel-close"
              onClick={() => setAlarmOpen(false)}
              aria-label="알림 닫기"
            >
              ✕
            </button>
          </div>

<div className="alarm-panel-list">
  {notifications.length === 0 ? (
    <div className="alarm-empty">알림이 없어요 😴</div>
  ) : (
    notifications.map((n) => (
      <div
        key={n.id}
        className={`alarm-panel-item ${n.isRead ? "read" : "unread"}`}
        onClick={() => handleRead(n)}
      >
        <span className={`alarm-dot ${n.isRead ? "read" : ""}`} />
        {/* 💡 content 대신 message를 사용하세요! */}
        <span className="alarm-item-text">{n.message}</span> 
      </div>
    ))
  )}
</div>

          {notifications.some((n) => !n.isRead) && (
            <div className="alarm-panel-footer">
              <button onClick={handleMarkAllRead}>모두 읽음 처리</button>
            </div>
          )}
        </div>
      )}


      <div className="main-slide1">
        <div className="slide-track1">
          {[...slide1Items, ...slide1Items].map((item, i) => (
            <button
              key={i}
              className="slide-item-btn"
              onClick={() => go(item.path)}
            >
              <img src={item.src} alt={item.label} />
            </button>
          ))}
        </div>
      </div>

      <div className="main-slide2">
        <div className="slide-track2">
          {[...slide2Items, ...slide2Items].map((item, i) => (
            <button
              key={i}
              className="slide-item-btn"
              onClick={() => go(item.path)}
            >
              <img src={item.src} alt={item.label} />
            </button>
          ))}
        </div>
      </div>

      <button
        className={`home-hamburger${isOpen ? " active" : ""}`}
        aria-label="메뉴"
        onClick={() => setIsOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`nav-overlay${isOpen ? " active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <nav className={`nav-panel${isOpen ? " active" : ""}`}>
        <div className="panel-inner">
          <div className="menu-group">
            <div className="group-label">FOOD</div>
            {foodNavLinks.map((link) => (
              <button
                key={link.label}
                className="menu-item"
                onClick={() => go(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="menu-group">
            <div className="group-label">
              COMMUNITY
              <br />
              CENTER
            </div>
            {communityNavLinks.map((link) => (
              <button
                key={link.label}
                className="menu-item"
                onClick={() => go(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-bottom">
          <button className="bottom-item" onClick={handleAuthClick}>
            {isLoggedIn ? "LOGOUT" : "LOGIN"}
          </button>
          <button className="bottom-item" onClick={handleAuthClick}>
            {isLoggedIn ? "" : "MEMBER"}
          </button>
          {user?.role === "ADMIN" && (
            <button className="bottom-item" onClick={() => go("/manager")}>
              MANAGER
            </button>
          )}
        </div>
      </nav>
    </main>
  );
}
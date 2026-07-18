import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/css/Fpage.css";
import { restaurantService } from "../services/restaurantService";
import type { Restaurant } from "../types/restaurant"; // ✅ 타입 임포트

// --- TypeScript를 위한 카카오 맵 전역 객체 타입 선언 ---
declare global {
  interface Window {
    kakao: any;
  }
}

export default function StoreDetail() {
  const { id } = useParams();
  // ✅ any 대신 명확한 Restaurant 타입 지정
  const [r, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── 데이터 가져오기 Hook ──
  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || id === "undefined" || isNaN(Number(id))) {
        console.error("유효하지 않은 식당 ID입니다:", id);
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await restaurantService.getRestaurantDetail(Number(id));
        setRestaurant(data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // ── 카카오맵 스크립트 로드 Hook ──
  useEffect(() => {
    const existingScript = document.getElementById("kakao-map-script");

    const initializeMap = () => {
      if (window.kakao && window.kakao.maps && r) {
        window.kakao.maps.load(() => {
          const container = document.getElementById("map");
          if (!container) return;

          const options = {
            // ✅ DB에 저장된 lat, lng를 사용하여 지도 중심 좌표 설정
            center: new window.kakao.maps.LatLng(
              r.lat || 37.5012,
              r.lng || 127.0396,
            ),
            level: 3,
          };
          new window.kakao.maps.Map(container, options);
        });
      }
    };

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "kakao-map-script";
      script.type = "text/javascript";
      script.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey=6fc788f54cd9b387a90cf9edbaa8ff93&autoload=false";
      script.onload = () => initializeMap();
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [r]); // r 값이 로드된 후 지도 좌표 세팅

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        식당 정보를 불러오는 중입니다...
      </div>
    );
  if (!r)
    return (
      <div style={{ textAlign: "center", padding: "100px" }}>
        식당 정보를 찾을 수 없습니다.
      </div>
    );

  // ✅ 배너 이미지 고정 (0번째)
  const heroImageUrl =
    r.images && r.images.length > 0
      ? r.images[0].imgUrl
      : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1000";

  return (
    <>
      <div
        className="hero-banner"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${heroImageUrl}') center/cover`,
        }}
      >
        <div className="hero-text">
          <p>{r.category || "카테고리 없음"}</p>
          <h1>{r.name}</h1>
        </div>
      </div>

      <div className="wrapper">
        <main className="content-card">
          <div className="section-header">
            <h2>Chef's Selection</h2>
            <div className="price-tag">
              Price{" "}
              <span className="min">
                {r.minPrice ? r.minPrice.toLocaleString() : 0}원
              </span>{" "}
              ~{" "}
              <span className="max">
                {r.maxPrice ? r.maxPrice.toLocaleString() : 0}원
              </span>
            </div>
          </div>
          <p className="uploaddate">
            등록일 :{" "}
            <span>{r.createdAt?.substring(0, 10) || "2026.05.11"}</span>
          </p>
          <br />
          <p style={{ color: "#666", lineHeight: 2 }}>
            {r.description || "식당 소개가 없습니다."}
          </p>
          <br />
          <br />

          <p>
            평균 음식 가격 :{" "}
            <span className="avg">
              {r.avgPrice ? r.avgPrice.toLocaleString() : 0}원
            </span>
          </p>
          <br />

          <h3>대표 메뉴</h3>
          <br />
          <div className="menu-grid">
            {/* ── 이미지 동적 렌더링 (인덱스 1, 2번 사진) ── */}
            {r.images && r.images.length > 1 ? (
              r.images.slice(1, 3).map((img, idx) => (
                <div className="menu-box-img" key={img.imgId || idx}>
                  <img
                    src={img.imgUrl}
                    alt={`대표메뉴사진${idx + 1}`}
                    className={`img0${idx + 1}`}
                  />
                </div>
              ))
            ) : (
              <div className="menu-box-img">
                <div
                  className="img-placeholder"
                  style={{
                    background: "#eee",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🍽️ 추가 이미지 준비중
                </div>
              </div>
            )}

            {/* ── 대표 메뉴 낮은 menuId 순으로 2개 렌더링 ── */}
            {r.menus &&
              [...r.menus]
                .sort((a, b) => (a.menuId || 0) - (b.menuId || 0)) // 1. 낮은 번호부터 정렬
                .slice(0, 2) // 2. 그중 상위 2개만 추출
                .map((m, index) => (
                  <div className="menu-box" key={m.menuId || index}>
                    <div style={{ fontWeight: 700 }}>{m.pname}</div>
                    <div
                      style={{
                        color: "var(--red)",
                        fontSize: "14px",
                        marginTop: "5px",
                      }}
                    >
                      {m.price ? m.price.toLocaleString() : 0}원
                    </div>
                  </div>
                ))}
          </div>
          <br />
          <br />

          <h3>메뉴 소개</h3>
          <br />
          <p className="pricedate">
            가격 기준 : <span>최근</span>
          </p>
          <br />
          <div className="menu-grid02">
            {/* ── 전체 메뉴 리스트 (menuId 낮은순 정렬) ── */}
            {r.menus && r.menus.length > 0 ? (
              [...r.menus] // 배열을 복사하고
                .sort((a, b) => (a.menuId || 0) - (b.menuId || 0)) // menuId 기준으로 오름차순 정렬
                .map((m, idx) => (
                  <div className="info-item" key={m.menuId || idx}>
                    <span>{m.pname}</span>
                    <span>----</span>
                    <span>{m.price ? m.price.toLocaleString() : 0}원</span>
                  </div>
                ))
            ) : (
              <div className="info-item">등록된 메뉴가 없습니다.</div>
            )}
          </div>

          <h3 style={{ marginTop: "40px" }}>가게 위치</h3>
          <br />
          <div className="map-area">
            <div
              id="map"
              style={{ width: "100%", maxWidth: "700px", height: "300px" }}
            ></div>
          </div>
          <br />
        </main>

        <aside className="sidebar-box">
          <h3>Store Info</h3>
          <div className="info-item">
            <label>Address</label>
            <span>{r.address || "주소 정보 없음"}</span>
          </div>

          <div className="info-item">
            <label>Phone</label>
            <span>{r.phone || "전화번호 없음"}</span>
            {r.phone && (
              <span className="call">
                <a href={`tel:${r.phone}`}>📞통화하기</a>
              </span>
            )}
          </div>

          <div className="info-item">
            <label>Hours</label>
            <span>
              {/* ✅ businessHours 적용 */}
              {r.businessHours
                ? r.businessHours.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))
                : "영업시간 정보 없음"}
            </span>
          </div>

          <div className="info-item">
            <label>Holiday</label>
            {/* ✅ closedDays 적용 */}
            <span>{r.closedDays || "연중무휴"}</span>
          </div>

          <div className="info-item">
            <label>폐업여부</label>
            <span className="closedate">해당없음</span>
          </div>

          {/* ✅ SNS 주소가 텍스트로 바로 보이게 수정 */}
          <div className="info-item">
            <label>인스타그램 및 블로그</label>
            <a
              href={
                r.snsUrl && !r.snsUrl.startsWith("http")
                  ? `https://${r.snsUrl}`
                  : r.snsUrl || "#"
              }
              className="insta-btn"
              target="_blank"
              rel="noreferrer"
            >
              <p className="insta" style={{ wordBreak: "break-all" }}>
                {r.snsUrl || "등록된 주소가 없습니다."}
              </p>
            </a>
          </div>
        </aside>
      </div>
      <br />
      <br />
      <br />
    </>
  );
}

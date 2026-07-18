// ============================================================
// VegaPage.tsx — 비건·친환경 식당 테마 랜딩
// 구조·반응형 유지 / 텍스트·이미지·컬러만 변경
// ============================================================

import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService'; 
import type { Restaurant } from '../types/restaurant';
import ThemeExploreLinks from '../components/ThemeExploreLinks';


// ─── 타입 ────────────────────────────────────────────────────


interface CategoryItem {
  name: string
  count: number
  img: string
}

// ─── 페이지 카피 ─────────────────────────────────────────────
const PAGE_COPY = {
  heroLabel: '🌿 지구와 몸을 살리는 한 끼',
  heroTitleLine1: 'GREEN',
  heroTitleAccent: 'TABLE',

  heroSubtitle:
    '동물성 식재료 없이도 풍성하고 맛있는 식사.\n비건부터 플렉시테리언까지, 모두를 위한 식탁을 만나보세요.',

  ctaMap: '비건 식당 지도 보기',
  ctaBlog: '채식 리뷰 읽기',

  statRestaurants: {
    value: '850',
    unit: '곳',
    label: '비건·채식 식당',
  },

  statCarbon: {
    value: '12',
    unit: '톤',
    label: '월간 탄소 절감량',
  },

  sectionCategories: '유형별 채식 탐색',
  sectionCategoriesMore: '모든 식단 보기 →',

  sectionPicks: '이달의 인기 비건 스팟',
  sectionPicksMore: '전체 랭킹 →',

  bannerMagTitle: '채식 라이프스타일 매거진 →',

  bannerMagSub:
    '지속 가능한 삶을 위한 비건 레시피와 제로웨이스트 팁을 만나보세요.',

  bannerMagBtn: '매거진 읽기',

  bannerMapTitle: '내 주변 비건 옵션 식당 찾기 →',

  bannerMapSub:
    '현재 위치 기반으로 비건 메뉴가 있는 가장 가까운 식당을 바로 안내합니다.',

  bannerMapBtn: '지도 열기',
}

// ─── 카테고리 ────────────────────────────────────────────────
const CATEGORIES: CategoryItem[] = [
  {
    name: '완전 비건',
    count: 42,
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  },
  {
    name: '베지테리언',
    count: 85,
    img: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=600&q=80',
  },
  {
    name: '비건 베이커리',
    count: 120,
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  },
  {
    name: '사찰 음식',
    count: 24,
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
  },
  {
    name: '샐러드 · 그레인볼',
    count: 156,
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
  },
  {
    name: '비건 옵션 식당',
    count: 210,
    img: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=600&q=80',
  },
]

// ─── LIVE FEED ──────────────────────────────────────────────
const LIVE_FEED = [
  '이영희님이 "그린 가든 망원"에 최고의 비건 파스타 리뷰를 남겼어요',
  '성수동 근처 비건 옵션 식당 5곳이 새로 등록되었어요 🌿',
  '박지민님이 비건 베이커리 지도를 업데이트했습니다',
]

// ─── 컬러 토큰 ───────────────────────────────────────────────
const C = {
  accent:    '#2D6A4F',   // 딥 그린 — 주 강조색
  accentMid: '#52B788',   // 밝은 그린
  accentSub: '#95D5B2',   // 연한 민트
  pageBg:    '#F0F7F2',   // 연한 그린 배경
  heroBg1:   '#E8F5EE',
  heroBg2:   '#F7FBF8',
  darkBg:    '#1B4332',   // 다크 그린 배너
  textMain:  '#1B3A2D',
  textSub:   '#F0F7F2',
  textMuted: '#8DB89A',
}

export default function VegaPage() {
  const navigate = useNavigate();
  // ✅ Restaurant 인터페이스를 타입으로 지정
  const [toppicks, setPicks] = useState<Restaurant[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. 서비스에서 데이터를 가져옴
      const data = await restaurantService.getRestaurantListByCategory("VEGETARIAN", 0, 3);
      
      // 2. DB에서 온 데이터를 우리 인터페이스 필드에 맞게 매핑
      // rank나 rating 같은 UI 전용 필드는 필요시 별도 가공
      setPicks(data); 
    };
    loadData();
  }, []);

  return (
    <div
      className="main-page theme-page theme-vega"
      style={{ background: C.pageBg, color: C.textMain }}
    >

      {/* ── HERO ── */}
      <section
        className="hero theme-hero"
        style={{
          background: `linear-gradient(180deg, ${C.heroBg1} 0%, ${C.heroBg2} 100%)`,
          borderBottom: `1px solid rgba(45,106,79,0.15)`,
        }}
      >
        <div className="hero-grid" aria-hidden style={{ opacity: 0.04 }} />

        <div
          className="hero-circle"
          aria-hidden
          style={{
            background: `radial-gradient(circle, rgba(45,106,79,0.28) 0%, transparent 70%)`,
          }}
        />

        <div
          className="hero-bg"
          aria-hidden={true}
          style={{
            backgroundImage: `url('/Image/Copilot_20260518_vegan.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div className="hero-text">
          <div
            className="hero-label"
            style={{ color: C.accent, letterSpacing: '2px', fontWeight: 800 }}
          >
            {PAGE_COPY.heroLabel}
          </div>

          <h1 className="hero-title" style={{ color: C.darkBg }}>
            {PAGE_COPY.heroTitleLine1}
            <br />
            <span style={{ color: C.accent }}>{PAGE_COPY.heroTitleAccent}</span>
          </h1>

          <p className="hero-subtitle" style={{ color: C.textSub }}>
            {PAGE_COPY.heroSubtitle.split('\n').map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </p>

          <div className="hero-cta">
            <button
              type="button"
              className="btn-primary"
              style={{ background: C.accent, color: '#FFFFFF', border: 'none' }}
              onClick={() => navigate('/map?theme=vega')}
            >
              {PAGE_COPY.ctaMap}
            </button>

            <button
              type="button"
              className="btn-ghost"
              style={{ border: `1px solid ${C.accent}`, color: C.accent, background: 'transparent' }}
              onClick={() => navigate('/blog?theme=vega')}
            >
              {PAGE_COPY.ctaBlog}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num" style={{ color: C.accent }}>
              {PAGE_COPY.statRestaurants.value}
              <span>{PAGE_COPY.statRestaurants.unit}</span>
            </div>
            <div className="stat-label" style={{ color: C.textMuted }}>
              {PAGE_COPY.statRestaurants.label}
            </div>
          </div>

          <div className="stat">
            <div className="stat-num" style={{ color: C.accentMid }}>
              {PAGE_COPY.statCarbon.value}
              <span>{PAGE_COPY.statCarbon.unit}</span>
            </div>
            <div className="stat-label" style={{ color: C.textMuted }}>
              {PAGE_COPY.statCarbon.label}
            </div>
          </div>
        </div>
      </section>

      {/* ── LIVE STRIP ── */}
      <div
        className="live-strip"
        style={{
          background: C.accent,
          borderTop: `1px solid rgba(45,106,79,0.2)`,
          borderBottom: `1px solid rgba(45,106,79,0.2)`,
        }}
      >
        <div className="live-dot" aria-hidden style={{ background: C.accentSub }} />
        <span className="live-label" style={{ color: C.accentSub }}>LIVE</span>
        <div className="live-items">
          {LIVE_FEED.map((msg, i) => (
            <span key={i} className="live-item" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ── */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title" style={{ color: C.darkBg }}>
            {PAGE_COPY.sectionCategories}
          </h2>
          <button
            type="button"
            className="section-more"
            style={{ color: C.accent }}
            onClick={() => navigate('/map?theme=vega')}
          >
            {PAGE_COPY.sectionCategoriesMore}
          </button>
        </div>

        <div className="cat-grid">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.name}
              className="cat-card"
              onClick={() => navigate('/map?theme=vega')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=vega')}
              role="button"
              tabIndex={0}
              style={{
                border: `1px solid rgba(45,106,79,0.12)`,
                background: C.heroBg1,
              }}
            >
              <img className="cat-img" src={cat.img} alt={cat.name} loading="lazy" />

              <div
                className="cat-overlay"
                aria-hidden
                style={{
                  background: `linear-gradient(to bottom, transparent, rgba(27,67,50,0.82))`,
                }}
              />

              <span className="cat-name" style={{ color: '#FFFFFF' }}>
                {cat.name}
              </span>

              <span
                className="cat-count"
                style={{
                  color: '#FFFFFF',
                  background: 'rgba(45,106,79,0.75)',
                }}
              >
                {cat.count}개의 장소
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ── TOP PICKS ── */}
      <section className="section section--tight">
        <div className="section-head">
          <h2 className="section-title" style={{ color: C.darkBg }}>
            {PAGE_COPY.sectionPicks}
          </h2>
          <button
            type="button"
            className="section-more"
            style={{ color: C.accent }}
           onClick={() => navigate(`/map?theme=VEGETARIAN`)}
          >
            {PAGE_COPY.sectionPicksMore}
          </button>
        </div>

        <div className="picks-row">
  {toppicks.map((p, index) => (
    <article
      key={p.restId} // 고유 PK인 restId 사용
      className={`pick-card ${index === 0 ? 'featured' : ''}`}
      onClick={() => navigate(`/fpage/${p.restId}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/store/${p.restId}`)}
      role="button"
      tabIndex={0}
      style={{
        background: index === 0 ? C.darkBg : '#FFFFFF', // featured 대신 index === 0 사용
        border: index === 0
          ? `1px solid ${C.accent}`
          : `1px solid rgba(45,106,79,0.12)`,
      }}
    >
      <div className="pick-rank" style={{ color: index === 0 ? C.accentSub : '#C2DACA' }}>
        {(index + 1).toString().padStart(2, '0')}
      </div>

      {/* 태그는 DB 데이터에 맞게 커스텀 태그를 표시합니다 */}
      <span
        className="pick-tag pick-tag--primary"
        style={{
          background: C.accent,
          color: '#FFFFFF',
        }}
      >
        {p.customTag || '추천'}
      </span>

      <div className="pick-name" style={{ color: index === 0 ? '#FFFFFF' : C.textMain }}>
        {p.name}
      </div>

      <div className="pick-cat" style={{ color: index === 0 ? C.accentSub : C.textSub }}>
        {p.address} {/* 카테고리 대신 주소 사용 */}
      </div>

      <div className="pick-bottom">
        <span className="pick-stars" style={{ color: C.accentMid }}>
          {'★'} 4.9 {/* 별점 데이터가 있다면 p.rating 사용 */}
        </span>
        <span className="pick-dist" style={{ color: index === 0 ? C.accentSub : C.textMuted }}>
          {/* 거리 데이터가 있다면 사용 */}
          1.2km
        </span>
      </div>
    </article>
  ))}
</div>
      </section>

      {/* ── BANNERS ── */}
      <div className="theme-banners">
        {/* 블로그 배너 */}
        <div
          className="map-banner"
          style={{
            background: `linear-gradient(135deg, #E8F5EE, #D4EDDA)`,
            border: `1px solid rgba(45,106,79,0.18)`,
          }}
          onClick={() => navigate('/blog?theme=vega')}
          role="button"
          tabIndex={0}
        >
          <div>
            <h3 className="map-banner-title" style={{ color: C.darkBg }}>
              {PAGE_COPY.bannerMagTitle}
            </h3>
            <p className="map-banner-sub" style={{ color: C.textSub }}>
              {PAGE_COPY.bannerMagSub}
            </p>
          </div>
          <button
            type="button"
            className="btn-white"
            style={{ background: C.accent, color: '#FFFFFF', border: 'none' }}
          >
            {PAGE_COPY.bannerMagBtn}
          </button>
        </div>

        {/* 지도 배너 */}
        <div
          className="map-banner"
          style={{
            background: `linear-gradient(135deg, ${C.darkBg}, #2D6A4F)`,
            border: `1px solid rgba(82,183,136,0.2)`,
          }}
          onClick={() => navigate('/map?theme=vega')}
          role="button"
          tabIndex={0}
        >
          <div>
            <h3 className="map-banner-title" style={{ color: '#FFFFFF' }}>
              {PAGE_COPY.bannerMapTitle}
            </h3>
            <p className="map-banner-sub" style={{ color: C.accentSub }}>
              {PAGE_COPY.bannerMapSub}
            </p>
          </div>
          <button
            type="button"
            className="btn-white"
            style={{ background: C.accentMid, color: '#FFFFFF', border: 'none' }}
          >
            {PAGE_COPY.bannerMapBtn}
          </button>
        </div>
      </div>

      <ThemeExploreLinks current="vega" />
    </div>
  )
}
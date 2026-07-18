// ============================================================
// ExotPage.tsx — 세계 테마 요리 랜딩
// 구조: 히어로 → LIVE → 카테고리 → 인기 스팟 → 배너×2
// 스타일: index.css → THEME 01 VEGA (.theme-vega) + .theme-page 공통
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../services/restaurantService'
import ramenImg from '/src/assets/Image/47313974-ramen-10137851.png';
import tacoImg from '/src/assets/Image/yezmin-tacos-pastor-4505032.jpg';
import ThemeExploreLinks from '../components/ThemeExploreLinks'


interface CategoryItem {
  name: string
  count: number
  img: string
}

// ─── 페이지 카피 (문구만 바꿀 때 여기 수정) ───────────────────
const PAGE_COPY = {
  heroLabel: '🌍 한 접시에 담은 세계 여행',
  heroTitleLine1: 'WORLD',
  heroTitleAccent: 'PICK',
  heroSubtitle:
    '일본, 이탈리아, 멕시코, 태국… 각 나라를 대표하는 테마 요리를 파는 맛집을 모았습니다.\n' +
    '현지의 맛을 그대로 재현한 식당부터 퓨전까지, 지도에서 바로 찾아보세요.',
  ctaMap: '테마 맛집 지도',
  ctaBlog: '여행 맛집 리뷰',
  statCountries: { value: '28', unit: '개국', label: '테마 요리 국가' },
  statRestaurants: { value: '1,240', unit: '곳', label: '등록 테마 식당' },
  sectionCategories: '국가별 테마 요리',
  sectionCategoriesMore: '전체 국가 보기 →',
  sectionPicks: '이달의 글로벌 핫플',
  sectionPicksMore: '전체 랭킹 →',
  bannerMagTitle: '세계 테마 맛집 매거진 →',
  bannerMagSub: '현지 셰프 인터뷰, 나라별 시그니처 메뉴 가이드와 여행 코스를 만나보세요',
  bannerMagBtn: '매거진 읽기',
  bannerMapTitle: '내 주변 테마 요리 식당 찾기 →',
  bannerMapSub: '위치 기반으로 가장 가까운 국가별 테마 레스토랑을 안내합니다',
  bannerMapBtn: '지도 열기',
}

// ─── 국가·테마 요리 카테고리 ───────────────────────────────────
const CATEGORIES: CategoryItem[] = [
  { name: '일본 · 스시·라멘', count: 186, img: ramenImg },
  { name: '이탈리아 · 파스타', count: 142, img: 'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=600&q=80' },
  { name: '멕시코 · 타코', count: 98, img: tacoImg },
  { name: '태국 · 스트리트', count: 124, img: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&q=80' },
  { name: '인도 · 커리', count: 87, img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80' },
  { name: '프랑스 · 비스트로', count: 76, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
]

const LIVE_FEED = [
  '김서연님이 "시부야 라멘 Lab"에 별 5개 리뷰를 남겼어요',
  '이번 주 신규 등록: 멕시코 타코 전문점 3곳이 강남에 오픈했습니다',
  '지금 이태원 근처 이탈리아 테마 식당 실시간 예약 12건이 확인됐어요',
]

export default function VegaPage() {
  const navigate = useNavigate();

  // 1. Hook 최상단 배치
  const [picks, setPicks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.getRestaurantListByCategory("EXOTIC", 0, 3);
         if (data && data.length > 0) {
          setPicks(data);
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. 로딩 상태 처리
  if (isLoading) return <div className="theme-page theme-exot"><div style={{ textAlign: 'center', padding: '100px 0', color: '#fff' }}>테마 요리 레스토랑을 불러오는 중...</div></div>;

  return (
    <div className="main-page theme-page theme-exot">

      <section className="hero theme-hero">
        <div className="hero-grid" aria-hidden />
{/* TSX — 배경 이미지만 */}
<div
  className="hero-bg"
  aria-hidden={true}
  style={{ backgroundImage: `url('/Image/Copilot_20260519_113136.png')` }}
/>
        <div className="hero-text">
          <div className="hero-label theme-hero-label">{PAGE_COPY.heroLabel}</div>
          <h1 className="hero-title theme-hero-title">
            {PAGE_COPY.heroTitleLine1}<br />
            <span>{PAGE_COPY.heroTitleAccent}</span>
          </h1>
          <p className="hero-subtitle theme-hero-subtitle">
            {PAGE_COPY.heroSubtitle.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn-primary theme-primary" onClick={() => navigate('/map?theme=exot')}>
              {PAGE_COPY.ctaMap}
            </button>
            <button type="button" className="btn-ghost theme-ghost" onClick={() => navigate('/blog?theme=exot')}>
              {PAGE_COPY.ctaBlog}
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num">{PAGE_COPY.statCountries.value}<span>{PAGE_COPY.statCountries.unit}</span></div>
            <div className="stat-label">{PAGE_COPY.statCountries.label}</div>
          </div>
          <div className="stat">
            <div className="stat-num">{PAGE_COPY.statRestaurants.value}<span>{PAGE_COPY.statRestaurants.unit}</span></div>
            <div className="stat-label">{PAGE_COPY.statRestaurants.label}</div>
          </div>
        </div>
      </section>

      <div className="live-strip theme-live" role="status" aria-live="polite">
        <div className="live-dot" aria-hidden />
        <span className="live-label">LIVE</span>
        <div className="live-items">
          {LIVE_FEED.map((msg, i) => (
            <span key={i} className="live-item">{msg}</span>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <h2 className="section-title">{PAGE_COPY.sectionCategories}</h2>
          <button type="button" className="section-more" onClick={() => navigate('/map?theme=exot')}>
            {PAGE_COPY.sectionCategoriesMore}
          </button>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((cat) => (
            <article
              key={cat.name}
              className="cat-card theme-cat-card"
              onClick={() => navigate('/map?theme=exot')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=exot')}
              role="button"
              tabIndex={0}
            >
              <img className="cat-img" src={cat.img} alt={cat.name} loading="lazy" />
              <div className="cat-overlay" aria-hidden />
              <span className="cat-name">{cat.name}</span>
              <span className="cat-count">{cat.count}개의 장소</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tight">
        <div className="section-head">
          <h2 className="section-title">{PAGE_COPY.sectionPicks}</h2>
          <button type="button" className="section-more" onClick={() => navigate('/map?theme=exot')}>
            {PAGE_COPY.sectionPicksMore}
          </button>
        </div>
        <div className="picks-row">
          {picks.map((p, index) => {
            const isFeatured = index === 0;
            const tagClass = isFeatured ? 'primary' : (index === 1 ? 'soft' : 'warm');

            return (
              <article
                key={p.restId || index}
                className={`pick-card theme-pick-card ${isFeatured ? 'featured' : ''}`}
                onClick={(e) => {
             e.stopPropagation(); // ✅ 클릭 이벤트가 부모로 퍼지지 않게 차단
             p.restId ? navigate(`/fpage/${p.restId}`) : navigate('/Fpage'); }}
                onKeyDown={(e) => e.key === 'Enter' && navigate(p.restId ? `/store/${p.restId}` : '/Fpage')}
                role="button"
                tabIndex={0}
              >
                <div className="pick-rank">{(index + 1).toString().padStart(2, '0')}</div>
                <span className={`pick-tag pick-tag--${p.tagVariant || tagClass}`}>
                  {p.customTag || 'BEST'}
                </span>
                <div className="pick-name">{p.name}</div>
                <div className="pick-cat">{p.address || p.category}</div>
                <div className="pick-bottom">
                  <span className="pick-stars">{'★'.repeat(Math.round(p.rating || 5))} {p.rating || 4.9}</span>
                  <span className="pick-dist">{p.dist || 'NEW'}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="theme-banners">
        <div
          className="map-banner theme-banner theme-banner--soft"
          onClick={() => navigate('/blog?theme=exot')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/blog?theme=exot')}
          role="button"
          tabIndex={0}
        >
          <div>
            <h3 className="map-banner-title">{PAGE_COPY.bannerMagTitle}</h3>
            <p className="map-banner-sub">{PAGE_COPY.bannerMagSub}</p>
          </div>
          <button type="button" className="btn-white" onClick={(e) => { e.stopPropagation(); navigate('/blog?theme=exot') }}>
            {PAGE_COPY.bannerMagBtn}
          </button>
        </div>

        <div
          className="map-banner theme-banner theme-banner--primary"
          onClick={() => navigate('/map?theme=exot')}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=exot')}
          role="button"
          tabIndex={0}
        >
          <div>
            <h3 className="map-banner-title">{PAGE_COPY.bannerMapTitle}</h3>
            <p className="map-banner-sub">{PAGE_COPY.bannerMapSub}</p>
          </div>
          <button type="button" className="btn-white" onClick={(e) => { e.stopPropagation(); navigate('/map?theme=exot') }}>
            {PAGE_COPY.bannerMapBtn}
          </button>
        </div>
      </div>

      <ThemeExploreLinks current="exot" />
    </div>
  )
}
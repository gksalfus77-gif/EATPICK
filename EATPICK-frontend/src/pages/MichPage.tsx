// ============================================================
// MichelinPage.tsx — 미슐랭 가이드 테마 랜딩
// 구조 유지 / 컬러 & 이미지 & 문구 유지 / DB 연동 적용 완벽화
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../services/restaurantService'
import ThemeExploreLinks from '../components/ThemeExploreLinks'

// ─── 타입 ────────────────────────────────────────────────────
interface CategoryItem {
  name: string
  count: number
  img: string
}

// ─── 페이지 카피 ─────────────────────────────────────────────
const PAGE_COPY = {
  heroLabel: 'THE MICHELIN GUIDE SEOUL 2026',
  heroTitleLine1: 'MICHELIN',
  heroTitleAccent: 'DINING',
  heroSubtitle: '세계 최고의 미식 경험을 한곳에서.\n미슐랭 스타 레스토랑과 셰프들의 특별한 다이닝을 만나보세요.',
  ctaMap: '미슐랭 지도 보기',
  ctaBlog: '미식 칼럼 읽기',
  statRestaurants: { value: '65', unit: '곳', label: '스타 레스토랑' },
  statCarbon: { value: '124', unit: '곳', label: '빕 구르망' },
  sectionCategories: '가이드 카테고리',
  sectionCategoriesMore: '전체 가이드 보기 →',
  sectionPicks: 'WEEKLY MICHELIN PICKS',
  sectionPicksMore: '전체 랭킹 →',
  bannerMagTitle: '미슐랭 인스펙터 칼럼 읽기 →',
  bannerMagSub: '셰프 인터뷰부터 다이닝 철학까지, 미식가를 위한 깊이 있는 스토리를 만나보세요.',
  bannerMagBtn: '칼럼 보기',
  bannerMapTitle: '내 주변 미슐랭 레스토랑 찾기 →',
  bannerMapSub: '현재 위치를 기반으로 가장 가까운 스타 레스토랑과 빕 구르망 식당을 안내합니다.',
  bannerMapBtn: '지도 열기',
}

// ─── 데이터 ──────────────────────────────────────────────────
const CATEGORIES: CategoryItem[] = [
  { name: '3 STAR', count: 2, img: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80' },
  { name: '2 STAR', count: 15, img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80' },
  { name: '1 STAR', count: 48, img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80' },
  { name: 'BIB GOURMAND', count: 124, img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80' },
  { name: 'GREEN STAR', count: 8, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80' },
  { name: 'SELECTED', count: 186, img: 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80' },
]

const LIVE_FEED = [
  '미슐랭 서울 2026 신규 스타 레스토랑 3곳이 추가되었습니다',
  '밍글스의 디너 코스 예약이 이번 주 마감되었습니다',
  '가온 셰프 인터뷰가 미식 아카이브에 업로드되었습니다',
]

export default function MichelinPage() {
  const navigate = useNavigate();

  // 1. Hook 최상단 배치
  const [picks, setPicks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.getRestaurantListByCategory("MICHELIN", 0, 3);
         if (data && data.length > 0) {
          setPicks(data);
        }
      } catch (e) {
        console.error("미슐랭 데이터 로드 실패:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. 로딩 상태 처리
  if (isLoading) return <div style={{ color: '#F8F5EF', textAlign: 'center', padding: '100px', background: '#0E1116', minHeight: '100vh' }}>미슐랭 가이드를 불러오는 중...</div>;

  return (
    <div className="main-page theme-page theme-mich" style={{ background: '#0E1116', color: '#F8F5EF' }}>
      
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="hero theme-hero" style={{ background: 'linear-gradient(180deg, #111827 0%, #0B0E13 100%)', borderBottom: '1px solid rgba(201,169,97,0.18)' }}>
        <div className="hero-grid" aria-hidden style={{ opacity: 0.03 }} />
        <div className="hero-circle" aria-hidden style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.28) 0%, transparent 70%)' }} />
        <div className="hero-bg" aria-hidden={true} 
          style={{ backgroundImage: `url('/Image/Copilot_20260519_114408.png')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' }} />
        
        <div className="hero-text">
          <div className="hero-label theme-hero-label" style={{ color: '#C9A961', letterSpacing: '2px', fontWeight: 700 }}>{PAGE_COPY.heroLabel}</div>
          <h1 className="hero-title theme-hero-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.heroTitleLine1}<br /><span style={{ color: '#C9A961' }}>{PAGE_COPY.heroTitleAccent}</span></h1>
          <p className="hero-subtitle theme-hero-subtitle" style={{ color: '#FFFFFF', lineHeight: 1.8 }}>
            {PAGE_COPY.heroSubtitle.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
          
          <div className="hero-cta">
            <button type="button" className="btn-primary theme-primary" style={{ background: '#C9A961', color: '#111827', border: 'none', fontWeight: 700 }} onClick={() => navigate('/map?theme=mich')}>
              {PAGE_COPY.ctaMap}
            </button>
            <button type="button" className="btn-ghost theme-ghost" style={{ border: '1px solid #C9A961', color: '#F8F5EF', background: 'transparent' }} onClick={() => navigate('/blog?theme=mich')}>
              {PAGE_COPY.ctaBlog}
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num" style={{ color: '#D62828' }}>{PAGE_COPY.statRestaurants.value}<span>{PAGE_COPY.statRestaurants.unit}</span></div>
            <div className="stat-label" style={{ color: '#BFB7AA' }}>{PAGE_COPY.statRestaurants.label}</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: '#C9A961' }}>{PAGE_COPY.statCarbon.value}<span>{PAGE_COPY.statCarbon.unit}</span></div>
            <div className="stat-label" style={{ color: '#BFB7AA' }}>{PAGE_COPY.statCarbon.label}</div>
          </div>
        </div>
      </section>

      {/* ── LIVE STRIP ─────────────────────────────────────── */}
      <div className="live-strip theme-live" role="status" aria-live="polite" style={{ background: '#131820', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="live-dot" aria-hidden style={{ background: '#D62828' }} />
        <span className="live-label" style={{ color: '#D62828', fontWeight: 700 }}>GUIDE UPDATE</span>
        <div className="live-items">
          {LIVE_FEED.map((msg, i) => (
            <span key={i} className="live-item" style={{ color: '#E5DED3' }}>{msg}</span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.sectionCategories}</h2>
          <button type="button" className="section-more" style={{ color: '#C9A961' }} onClick={() => navigate('/map?theme=mich')}>
            {PAGE_COPY.sectionCategoriesMore}
          </button>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((cat) => (
            <article key={cat.name} className="cat-card theme-cat-card" onClick={() => navigate('/map?theme=mich')} onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=mich')} role="button" tabIndex={0} style={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img className="cat-img" src={cat.img} alt={cat.name} loading="lazy" />
              <div className="cat-overlay" aria-hidden style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.88))' }} />
              <span className="cat-name" style={{ color: '#FFFFFF', fontWeight: 700 }}>{cat.name}</span>
              <span className="cat-count" style={{ color: '#D8CDB8' }}>{cat.count} Restaurants</span>
            </article>
          ))}
        </div>
      </section>

      {/* ── TOP PICKS (DB 연동) ────────────────────────────── */}
      <section className="section section--tight">
        <div className="section-head">
          <h2 className="section-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.sectionPicks}</h2>
          <button type="button" className="section-more" style={{ color: '#C9A961' }} onClick={() => navigate('/map?theme=mich')}>
            {PAGE_COPY.sectionPicksMore}
          </button>
        </div>

        <div className="picks-row">
          {picks.map((p, index) => {
            const isFeatured = index === 0;
            return (
              <article
                key={p.restId || index}
                className={`pick-card theme-pick-card ${isFeatured ? 'featured' : ''}`}
                style={{
                  background: '#161B22',
                  border: isFeatured ? '1px solid #C9A961' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: isFeatured ? '0 10px 25px rgba(201,169,97,0.08)' : 'none',
                }}
                onClick={(e) => {
             e.stopPropagation(); // ✅ 클릭 이벤트가 부모로 퍼지지 않게 차단
             p.restId ? navigate(`/fpage/${p.restId}`) : navigate('/Fpage'); }}
                onKeyDown={(e) => e.key === 'Enter' && navigate(p.restId ? `/store/${p.restId}` : '/Fpage')}
                role="button"
                tabIndex={0}
              >
                <div className="pick-rank" style={{ color: '#C9A961' }}>
                  {(index + 1).toString().padStart(2, '0')}
                </div>

                <span
                  className="pick-tag"
                  style={{
                    background: '#C9A961',
                    color: '#111827',
                  }}
                >
                  {p.customTag || 'STAR'}
                </span>

                <div className="pick-name" style={{ color: '#FFFFFF', fontWeight: 800 }}>
                  {p.name}
                </div>

                <div className="pick-cat" style={{ color: '#BFB7AA' }}>
                  {p.address || p.category}
                </div>

                <div className="pick-bottom">
                  <span className="pick-stars" style={{ color: '#D62828' }}>
                    {'★'.repeat(Math.round(p.rating || 5))} {p.rating || 4.9}
                  </span>
                  <span className="pick-dist" style={{ color: '#C9A961' }}>
                    {p.dist || 'NEW'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── 하단 배너 ───────────────────────────────────────── */}
      <div className="theme-banners">
        <div className="map-banner theme-banner theme-banner--soft" style={{ background: 'linear-gradient(135deg, #1B2430, #111827)', border: '1px solid rgba(201,169,97,0.15)', color: '#FFFFFF' }} onClick={() => navigate('/blog?theme=mich')} onKeyDown={(e) => e.key === 'Enter' && navigate('/blog?theme=mich')} role="button" tabIndex={0}>
          <div>
            <h3 className="map-banner-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.bannerMagTitle}</h3>
            <p className="map-banner-sub" style={{ color: '#D6D0C5' }}>{PAGE_COPY.bannerMagSub}</p>
          </div>
          <button type="button" className="btn-white" style={{ background: '#C9A961', color: '#111827', border: 'none', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); navigate('/blog?theme=mich'); }}>
            {PAGE_COPY.bannerMagBtn}
          </button>
        </div>

        <div className="map-banner theme-banner theme-banner--primary" style={{ background: 'linear-gradient(135deg, #7A1010, #A11212)', color: '#FFFFFF' }} onClick={() => navigate('/map?theme=mich')} onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=mich')} role="button" tabIndex={0}>
          <div>
            <h3 className="map-banner-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.bannerMapTitle}</h3>
            <p className="map-banner-sub" style={{ color: 'rgba(255,255,255,0.82)' }}>{PAGE_COPY.bannerMapSub}</p>
          </div>
          <button type="button" className="btn-white" style={{ background: '#FFFFFF', color: '#A11212', border: 'none', fontWeight: 700 }} onClick={(e) => { e.stopPropagation(); navigate('/map?theme=mich'); }}>
            {PAGE_COPY.bannerMapBtn}
          </button>
        </div>
      </div>

      <ThemeExploreLinks current="mich" />
    </div>
  )
}
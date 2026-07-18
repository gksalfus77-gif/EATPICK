// ============================================================
// LiquorWorldPage.tsx — 세계 주류 셀렉트샵 테마 랜딩
// ============================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../services/restaurantService'
import sakeImg from '../assets/Image/5558721-rice-wine-8550095_1920.jpg';
import whiskeyImg from '../assets/Image/detonart-whiskey-3874925_1920.jpg';
import ginImg from '../assets/Image/cocktailtime-gin-tonic-4468653.jpg';
import ThemeExploreLinks from '../components/ThemeExploreLinks';

interface CategoryItem {
  name: string
  count: number
  img: string
}

const PAGE_COPY = {
  heroLabel: 'WORLD PREMIUM LIQUOR COLLECTION',
  heroTitleLine1: 'LIQUOR',
  heroTitleAccent: 'ATLAS',
  heroSubtitle:
    '세계 각국을 대표하는 프리미엄 주류를 한곳에서.\n위스키, 와인, 사케, 럼 그리고 희귀 한정판 컬렉션을 만나보세요.',
  ctaMap: '주류 매장 보기',
  ctaBlog: '테이스팅 가이드',
  statRestaurants: { value: '320', unit: '종', label: '프리미엄 주류' },
  statCarbon: { value: '48', unit: '개국', label: '수입 국가' },
  sectionCategories: '주류 카테고리',
  sectionCategoriesMore: '전체 컬렉션 보기 →',
  sectionPicks: '이번 주 인기 셀렉션',
  sectionPicksMore: '전체 랭킹 →',
  bannerMagTitle: '마스터 바텐더 추천 컬렉션 →',
  bannerMagSub: '싱글몰트부터 빈티지 와인까지, 전문가가 추천하는 최고의 한 병.',
  bannerMagBtn: '추천 보기',
  bannerMapTitle: '내 주변 프리미엄 바 & 주류샵 찾기 →',
  bannerMapSub: '현재 위치 기반으로 위스키 바와 와인 셀러를 빠르게 탐색해보세요.',
  bannerMapBtn: '지도 열기',
}

const CATEGORIES: CategoryItem[] = [
  { name: '싱글 몰트 위스키', count: 86, img: whiskeyImg },
  { name: '프리미엄 와인', count: 142, img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80' },
  { name: '일본 사케', count: 58, img: sakeImg },
  { name: '크래프트 진', count: 37, img: ginImg },
  { name: '프리미엄 럼', count: 44, img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80' },
  { name: '한정판 컬렉션', count: 19, img: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&q=80' },
]

const LIVE_FEED = [
  '한정판 야마자키 18년이 신규 입고되었습니다',
  '프랑스 보르도 와인 컬렉션 예약 판매가 시작되었습니다',
  '강남 프리미엄 위스키 바 TOP10 리스트가 업데이트되었습니다',
]

export default function LiquorWorldPage() {
  const navigate = useNavigate();
  const [picks, setPicks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await restaurantService.getRestaurantListByCategory("MAINSTREAM", 0, 3);
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

  if (isLoading) return <div style={{ color: '#F5EFE6', textAlign: 'center', padding: '50px' }}>주류 리스트를 불러오는 중...</div>;

  return (
    <div className="main-page theme-page theme-liqu" style={{ background: '#0B0B0F', color: '#F5EFE6' }}>

      {/* HERO */}
      <section className="hero theme-hero" style={{ background: 'linear-gradient(180deg, #16111A 0%, #0B0B0F 100%)', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div className="hero-grid" aria-hidden style={{ opacity: 0.03 }} />
        <div className="hero-circle" aria-hidden={true} style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, transparent 70%)' }} />
        <div className="hero-bg" aria-hidden={true} style={{ backgroundImage: `url('/Image/Copilot_20260519_114958.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

        <div className="hero-text">
          <div className="hero-label" style={{ color: '#D4AF37', letterSpacing: '2px', fontWeight: 700 }}>{PAGE_COPY.heroLabel}</div>
          <h1 className="hero-title" style={{ color: '#FFFFFF' }}>
            {PAGE_COPY.heroTitleLine1}<br />
            <span style={{ color: '#D4AF37' }}>{PAGE_COPY.heroTitleAccent}</span>
          </h1>
          <p className="hero-subtitle" style={{ color: '#FFFFFF' }}>
            {PAGE_COPY.heroSubtitle.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </p>
          <div className="hero-cta">
            <button type="button" className="btn-primary" style={{ background: '#D4AF37', color: '#111111', border: 'none', fontWeight: 700 }} onClick={() => navigate('/map?theme=liqu')}>
              {PAGE_COPY.ctaMap}
            </button>
            <button type="button" className="btn-ghost" style={{ border: '1px solid #D4AF37', color: '#F5EFE6', background: 'transparent' }} onClick={() => navigate('/blog?theme=liqu')}>
              {PAGE_COPY.ctaBlog}
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <div className="stat-num" style={{ color: '#C58B2A' }}>{PAGE_COPY.statRestaurants.value}<span>{PAGE_COPY.statRestaurants.unit}</span></div>
            <div className="stat-label" style={{ color: '#B8ADA1' }}>{PAGE_COPY.statRestaurants.label}</div>
          </div>
          <div className="stat">
            <div className="stat-num" style={{ color: '#D4AF37' }}>{PAGE_COPY.statCarbon.value}<span>{PAGE_COPY.statCarbon.unit}</span></div>
            <div className="stat-label" style={{ color: '#B8ADA1' }}>{PAGE_COPY.statCarbon.label}</div>
          </div>
        </div>
      </section>

      {/* LIVE */}
      <div className="live-strip" style={{ background: '#121217', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="live-dot" aria-hidden style={{ background: '#D4AF37' }} />
        <span className="live-label" style={{ color: '#D4AF37', fontWeight: 700 }}>NEW ARRIVAL</span>
        <div className="live-items">
          {LIVE_FEED.map((msg, i) => (
            <span key={i} className="live-item" style={{ color: '#E4DDD4' }}>{msg}</span>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="section">
        <div className="section-head">
          <h2 className="section-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.sectionCategories}</h2>
          <button type="button" className="section-more" style={{ color: '#D4AF37' }} onClick={() => navigate('/map?theme=liqu')}>
            {PAGE_COPY.sectionCategoriesMore}
          </button>
        </div>
        <div className="cat-grid">
          {CATEGORIES.map((cat) => (
            <article key={cat.name} className="cat-card" onClick={() => navigate('/map?theme=liqu')} onKeyDown={(e) => e.key === 'Enter' && navigate('/map?theme=liqu')} role="button" tabIndex={0} style={{ background: '#17171D', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img className="cat-img" src={cat.img} alt={cat.name} loading="lazy" />
              <div className="cat-overlay" aria-hidden style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.88))' }} />
              <span className="cat-name" style={{ color: '#FFFFFF' }}>{cat.name}</span>
              <span className="cat-count" style={{ color: '#D8C7A0' }}>{cat.count} Collections</span>
            </article>
          ))}
        </div>
      </section>

      {/* PICKS */}
      <section className="section section--tight">
        <div className="section-head">
          <h2 className="section-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.sectionPicks}</h2>
          <button className="section-more" style={{ color: '#D4AF37' }} onClick={() => navigate('/map?theme=liqu')}>{PAGE_COPY.sectionPicksMore}</button>
        </div>
        <div className="picks-row">
          {picks.map((p, index) => (
            <article
              key={p.restId || index}
              className={`pick-card ${index === 0 ? 'featured' : ''}`}
              onClick={(e) => { e.stopPropagation(); p.restId ? navigate(`/fpage/${p.restId}`) : navigate('/Fpage'); }}
              role="button"
              tabIndex={0}
              style={{ background: '#17171D', border: index === 0 ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="pick-rank" style={{ color: '#D4AF37' }}>{(index + 1).toString().padStart(2, '0')}</div>
              <span className="pick-tag" style={{ background: '#D4AF37', color: '#111111' }}>{p.customTag || 'BEST'}</span>
              <div className="pick-name" style={{ color: '#FFFFFF' }}>{p.name}</div>
              <div className="pick-cat" style={{ color: '#BFB4A8' }}>{p.address || p.category}</div>
              <div className="pick-bottom">
                <span className="pick-stars" style={{ color: '#D4AF37' }}>{'★'.repeat(Math.round(p.rating || 5))} {p.rating || 4.9}</span>
                <span className="pick-dist" style={{ color: '#E0C36A', fontWeight: 700 }}>{p.dist || 'NEW'}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BANNERS */}
      <div className="theme-banners">
        <div className="map-banner" style={{ background: 'linear-gradient(135deg, #1D1823, #131117)', border: '1px solid rgba(212,175,55,0.15)' }} onClick={() => navigate('/blog?theme=liqu')} role="button" tabIndex={0}>
          <div>
            <h3 className="map-banner-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.bannerMagTitle}</h3>
            <p className="map-banner-sub" style={{ color: '#D5CCC0' }}>{PAGE_COPY.bannerMagSub}</p>
          </div>
          <button type="button" className="btn-white" style={{ background: '#D4AF37', color: '#111111', border: 'none', fontWeight: 700 }}>{PAGE_COPY.bannerMagBtn}</button>
        </div>

        <div className="map-banner" style={{ background: 'linear-gradient(135deg, #3B1F12, #24120C)' }} onClick={() => navigate('/map?theme=liqu')} role="button" tabIndex={0}>
          <div>
            <h3 className="map-banner-title" style={{ color: '#FFFFFF' }}>{PAGE_COPY.bannerMapTitle}</h3>
            <p className="map-banner-sub" style={{ color: 'rgba(255,255,255,0.82)' }}>{PAGE_COPY.bannerMapSub}</p>
          </div>
          <button type="button" className="btn-white" style={{ background: '#FFFFFF', color: '#3B1F12', border: 'none', fontWeight: 700 }}>{PAGE_COPY.bannerMapBtn}</button>
        </div>
      </div>

      <ThemeExploreLinks current="liqu" />
    </div>
  )
}
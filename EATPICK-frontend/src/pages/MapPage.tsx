// ============================================================
// src/pages/MapPage.tsx
// 마커 클릭 → 사이드바 상세정보 (네이버 지도 스타일)
// 백엔드: GET /api/restaurants, GET /api/restaurants/{id}
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import type { Restaurant } from '../types/restaurant'
import '../assets/css/MapPage.css'

// ─── 기본 테마 (단일 고정) ───────────────────────────────────
const theme = { primary: '#E8272A', dark: '#0D0D0D', accent: '#B01E20', bg: '#FAF8F4', searchFocus: 'rgba(232,39,42,0.15)', markerActive: '#E8272A' }

// ─── API 클라이언트 ──────────────────────────────────────────
const api = axios.create({ baseURL: 'http://43.203.165.206:8080/api' })

const restaurantApi = {
  getList: (category?: string, keyword?: string, page = 0, size = 100) => {
    if (category && category !== 'ALL') {
      return api.get<{ content: Restaurant[] }>(`/restaurants/category/${category}`, { params: { page, size } })
    }
    return api.get<{ content: Restaurant[] }>('/restaurants', { params: { searchKeyword: keyword, page, size } })
  },
  getDetail: (id: number) => api.get<Restaurant>(`/restaurants/${id}`)
}

type UserLocation = { lat: number; lng: number }

function normalizeRestaurantCoords(r: Pick<Restaurant, 'lat' | 'lng'>): UserLocation | null {
  const lat = Number(r.lat); const lng = Number(r.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132) return { lat, lng }
  if (lng >= 33 && lng <= 39 && lat >= 124 && lat <= 132) return { lat: lng, lng: lat }
  return null
}

function getDistanceKm(from: UserLocation | null, to: Pick<Restaurant, 'lat' | 'lng'>) {
  const target = normalizeRestaurantCoords(to)
  if (!from || !target) return null
  const rad = (v: number) => v * Math.PI / 180
  const dLat = rad(target.lat - from.lat); const dLng = rad(target.lng - from.lng)
  const a = Math.sin(dLat/2)**2 + Math.cos(rad(from.lat))*Math.cos(rad(target.lat))*Math.sin(dLng/2)**2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function formatDistance(km: number | null) {
  if (km === null) return null
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(km < 10 ? 1 : 0)}km`
}

function buildNaverDirectionUrl(r: Restaurant, userLocation: UserLocation | null) {
  const target = normalizeRestaurantCoords(r)
  const destination = target ? `${target.lng},${target.lat},${r.name}` : `${r.address || r.name},${r.name}`
  const origin = userLocation ? `${userLocation.lng},${userLocation.lat},내 위치` : '-'
  return `https://map.naver.com/p/directions/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/-/walk`
}

// 우리 프로젝트의 CategoryType에 맞춘 탭 구성
const CAT_TABS = [
  { label: '전체', value: 'ALL' },
  { label: '🥗 비건', value: 'VEGETARIAN' },
  { label: '🍷 주류', value: 'MAINSTREAM' },
  { label: '🌍 이국요리', value: 'EXOTIC' },
  { label: '😲 괴식', value: 'ECCENTRIC' },
  { label: '👨‍🍳 셰프', value: 'FAMOUSCHEF' },
  { label: '⭐ 미슐랭', value: 'MICHELIN' },
  { label: '🧸 키즈', value: 'KIDSZONE' },
  { label: '🐾 펫', value: 'PETACCESS' },
];

function Stars({ rating = 4.5, size = 12, color }: { rating?: number; size?: number; color?: string }) {
  return (
    <span style={{ display:'flex', alignItems:'center', gap:1, fontSize:size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? (color || '#FAB700') : '#E0E0E0' }}>★</span>
      ))}
    </span>
  )
}

function escapeMarkerText(value: string) {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
}

function makeMarkerHtml(name: string, active: boolean, color: string) {
  const safeName = escapeMarkerText(name)
  return `<div class="mp-restaurant-marker ${active ? 'is-active' : ''}" style="${active ? `--marker-color:${color}` : ''}">
    <span class="mp-restaurant-marker__pin"></span>
    <span class="mp-restaurant-marker__label">${safeName}</span>
  </div>`
}

interface NaverMapProps {
  restaurants: Restaurant[]; selectedId: number | null
  userLocation: UserLocation | null; onMarkerClick: (r: Restaurant) => void
  themeColor: string
}

function NaverMap({ restaurants, selectedId, userLocation, onMarkerClick, themeColor }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<number, any>>({})
  const userMarkerRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
  const readyRef = useRef(false)
  const [mapReady, setMapReady] = useState(false)
  const [geocodedCoords, setGeocodedCoords] = useState<Record<number, UserLocation>>({})

  useEffect(() => {
    if (readyRef.current) return
    let count = 0
    const t = setInterval(() => {
      count++
      const naver = (window as any).naver
      console.log("렌더링할 식당 데이터:", restaurants); // ✅ 이 로그가 찍히나요?
      if (naver?.maps && containerRef.current) {
        clearInterval(t); readyRef.current = true
        mapRef.current = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(userLocation?.lat ?? 37.5560, userLocation?.lng ?? 126.9720),
          zoom: 13, mapTypeControl: false, scaleControl: true,
        })
        setMapReady(true)
      } else if (count > 60) clearInterval(t)
    }, 100)
    return () => clearInterval(t)
  }, [userLocation])

  useEffect(() => {
    const naver = (window as any).naver
    if (!mapReady || !naver?.maps || !mapRef.current || !userLocation) return
    const position = new naver.maps.LatLng(userLocation.lat, userLocation.lng)
    if (!userMarkerRef.current) {
      userMarkerRef.current = new naver.maps.Marker({
        position, map: mapRef.current,
        icon: { content: `<div class="mp-user-marker"><span class="mp-user-marker__pulse"></span><span class="mp-user-marker__dot" style="background:${themeColor}"></span></div>`, anchor: new naver.maps.Point(18, 18) },
        zIndex: 300,
      })
    } else { userMarkerRef.current.setPosition(position) }
    mapRef.current.panTo(position, { duration: 300 })
  }, [mapReady, userLocation, themeColor])

  useEffect(() => {
    const naver = (window as any).naver
    if (!mapReady || !naver?.maps?.Service?.geocode) return
    restaurants.forEach(r => {
      if (normalizeRestaurantCoords(r) || geocodedCoords[r.restId] || !r.address) return
      naver.maps.Service.geocode({ query: r.address }, (status: any, response: any) => {
        if (status !== naver.maps.Service.Status.OK) return
        const first = response?.v2?.addresses?.[0]
        const lng = Number(first?.x); const lat = Number(first?.y)
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
        setGeocodedCoords(prev => ({ ...prev, [r.restId]: { lat, lng } }))
      })
    })
  }, [mapReady, restaurants, geocodedCoords])

  useEffect(() => {
    const naver = (window as any).naver
    if (!mapReady || !naver?.maps || !mapRef.current) return
    Object.values(markersRef.current).forEach((m: any) => m.marker.setMap(null))
    markersRef.current = {}
    const coordCounts: Record<string, number> = {}
    restaurants.forEach(r => {
      const position = normalizeRestaurantCoords(r) ?? geocodedCoords[r.restId]
      if (!position) return
      const coordKey = `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`
      const overlapIndex = coordCounts[coordKey] ?? 0; coordCounts[coordKey] = overlapIndex + 1
      const offset = overlapIndex * 0.00006; const isActive = r.restId === selectedId
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(position.lat + offset, position.lng + offset), map: mapRef.current,
        icon: { content: makeMarkerHtml(r.name, isActive, themeColor), anchor: new naver.maps.Point(18, 44) },
        zIndex: isActive ? 200 : 100,
      })
      naver.maps.Event.addListener(marker, 'click', () => onMarkerClick(r))
      markersRef.current[r.restId] = { marker }
    })
  }, [mapReady, restaurants, selectedId, onMarkerClick, geocodedCoords, themeColor])

  useEffect(() => {
    const naver = (window as any).naver
    if (!mapReady || !naver?.maps || !mapRef.current) return
    const coordCounts: Record<string, number> = {}
    restaurants.forEach(r => {
      const m = markersRef.current[r.restId]; if (!m) return
      const position = normalizeRestaurantCoords(r) ?? geocodedCoords[r.restId]; if (!position) return
      const coordKey = `${position.lat.toFixed(6)},${position.lng.toFixed(6)}`
      const overlapIndex = coordCounts[coordKey] ?? 0; coordCounts[coordKey] = overlapIndex + 1
      const offset = overlapIndex * 0.00006; const isActive = r.restId === selectedId
      m.marker.setPosition(new naver.maps.LatLng(position.lat + offset, position.lng + offset))
      m.marker.setIcon({ content: makeMarkerHtml(r.name, isActive, themeColor), anchor: new naver.maps.Point(18, 44) })
      m.marker.setZIndex(isActive ? 200 : 100)
    })
    if (selectedId) {
      const r = restaurants.find(x => x.restId === selectedId)
      if (r && mapRef.current) {
        const position = normalizeRestaurantCoords(r) ?? geocodedCoords[r.restId]; if (!position) return
        if (infoWindowRef.current) { infoWindowRef.current.close(); infoWindowRef.current = null }
        mapRef.current.panTo(new naver.maps.LatLng(position.lat, position.lng), { duration: 300 })
      }
    }
  }, [mapReady, selectedId, restaurants, geocodedCoords, themeColor])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

function RestaurantCard({ r, active, distance, onClick, themeColor }: {
  r: Restaurant; active: boolean; distance: string | null; onClick: () => void; themeColor: string
}) {
  // ✅ isMain(true)인 이미지를 찾고, 없으면 무조건 0번(첫 번째) 사진 사용
  const mainImage = r.images?.find(img => img.isMain) || r.images?.[0];
  console.log("현재 식당의 이미지 배열:", r.images);
  
  return (
    <div className={`mp-card ${active ? 'mp-card--active' : ''}`} onClick={onClick}
      style={active ? { borderColor: themeColor, boxShadow: `0 0 0 2px ${themeColor}22` } : {}}>
      <div className="mp-card__thumb">
        {mainImage?.imgUrl
          ? <img src={mainImage.imgUrl} alt={r.name} />
          : <div className="mp-card__thumb-empty">🍽️</div>
        }
      </div>
      <div className="mp-card__body">
        <div className="mp-card__name">{r.name}</div>
        <div className="mp-card__meta">
          <span className="mp-card__cat">{r.category}</span>
          {distance && <span className="mp-card__distance">{distance}</span>}
        </div>
        <div className="mp-card__addr">{r.address}</div>
        {r.avgPrice > 0 && <div className="mp-card__price">평균 {r.avgPrice?.toLocaleString()}원</div>}
        <div className="mp-card__footer"><Stars size={11} color={themeColor} /></div>
      </div>
    </div>
  )
}

function DetailPanel({ r, userLocation, onBack, themeColor }: {
  r: Restaurant; userLocation: UserLocation | null; onBack: () => void; themeColor: string
}) {
  const navUrl = buildNaverDirectionUrl(r, userLocation)
  const distance = formatDistance(getDistanceKm(userLocation, r))
  return (
    <div className="mp-detail-side">
      <div className="mp-detail-side__header">
        <button className="mp-detail-side__back" onClick={onBack} style={{ color: themeColor }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          목록으로
        </button>
      </div>

  {/* 이미지 */}
{r.images && r.images.length > 0 ? (
  <div className="mp-detail-side__imgs">
    {(() => {
      // 이제 백엔드에서 이미 주소가 완성된 상태로 옵니다.
      const firstImg = r.images[0];
      let cleanUrl = firstImg.imgUrl;
  if (cleanUrl.includes('http://') && cleanUrl.indexOf('http://') !== 0) {
    cleanUrl = cleanUrl.substring(cleanUrl.lastIndexOf('http://'));
  }
      return (
        <img 
          src={firstImg.imgUrl} 
          alt={r.name} 
        />
      );
    })()}
  </div>
) : (
  <div className="mp-detail-side__no-img">🍽️</div>
)}

      {/* 기본 정보 */}
      <div className="mp-detail-side__body">
        <div className="mp-detail-side__name">{r.name}</div>
        <div className="mp-detail-side__cat">{r.category}</div>
        {distance && <div className="mp-detail-side__distance">내 위치에서 약 {distance}</div>}
        <div className="mp-detail-side__stars">
          <Stars size={14} color={themeColor} />
          <span className="mp-detail-side__rating">4.5</span>
        </div>
        <div className="mp-detail-side__divider" />
        <div className="mp-detail-side__info">
          <div className="mp-detail-side__info-row">
            <span className="mp-detail-side__icon">📍</span><span>{r.address}</span>
          </div>
          {r.avgPrice > 0 && (
            <div className="mp-detail-side__info-row">
              <span className="mp-detail-side__icon">💰</span>
              <span>평균 {r.avgPrice?.toLocaleString()}원</span>
              {r.minPrice && r.maxPrice && (
                <span className="mp-detail-side__price-range">({r.minPrice?.toLocaleString()}~{r.maxPrice?.toLocaleString()}원)</span>
              )}
            </div>
          )}
        </div>
        {r.menus && r.menus.length > 0 && (
          <div className="mp-detail-side__section">
            <div className="mp-detail-side__section-title" style={{ color: themeColor }}>메뉴</div>
            <div className="mp-detail-side__menu-list">
              {r.menus.filter(m => m.menuId).map(m => (
                <div key={m.menuId} className="mp-detail-side__menu-row">
                  <span className="mp-detail-side__menu-name">
                    {m.isRepresentative && <span className="mp-detail-side__rep" style={{ background: themeColor }}>대표</span>}
                    {m.pname || (m as any).pName}
                  </span>
                  <span className="mp-detail-side__menu-price">{m.price?.toLocaleString()}원</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {r.tags && r.tags.length > 0 && (
          <div className="mp-detail-side__section">
            <div className="mp-detail-side__section-title" style={{ color: themeColor }}>태그</div>
            <div className="mp-detail-side__tags">
              {r.tags.map((t,i) => (
                <span key={i} className="mp-detail-side__tag" style={{ background: `${themeColor}18`, color: themeColor, border: `1px solid ${themeColor}44` }}>
                  {t.customTag || `#${t.customTag}`}
                </span>
              ))}
            </div>
          </div>
        )}
        <button className="mp-detail-side__nav-btn" style={{ background: themeColor }}
          onClick={() => window.open(navUrl, '_blank')}>
          <svg width="13" height="17" viewBox="0 0 44 56" fill="none">
            <path d="M22 2C11.5 2 3 10.5 3 21c0 14 19 33 19 33S41 35 41 21C41 10.5 32.5 2 22 2z" fill="white"/>
          </svg>
          {userLocation ? '내 위치에서 길찾기 ↗' : '네이버 지도로 길찾기 ↗'}
        </button>
      </div>
    </div>
  )
}

// ─── MapPage ─────────────────────────────────────────────────
export default function MapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [detail, setDetail] = useState<Restaurant | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus('error'); return }
    setLocationStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => { setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocationStatus('success') },
      err => { console.warn('위치 조회 실패:', err); setLocationStatus('error') },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  }, [])

  useEffect(() => { requestLocation() }, [requestLocation])

  useEffect(() => {
    setLoading(true); setDetail(null); setSelectedId(null)
    restaurantApi.getList(category, search)
      .then(res => { const data = res.data; const list = Array.isArray(data) ? data : (data as any).content ?? []; setRestaurants(list) })
      .catch(err => console.error('목록 조회 실패:', err))
      .finally(() => setLoading(false))
  }, [category])

  const handleSearch = useCallback(() => {
    setLoading(true); setDetail(null); setSelectedId(null)
    restaurantApi.getList('ALL', search)
      .then(res => { const data = res.data; const list = Array.isArray(data) ? data : (data as any).content ?? []; setRestaurants(list) })
      .catch(err => console.error('검색 실패:', err))
      .finally(() => setLoading(false))
  }, [search])

  const handleSelect = useCallback((r: Restaurant) => {
    if (selectedId === r.restId) { setSelectedId(null); setDetail(null); return }
    setSelectedId(r.restId); setDetail(null); setDetailLoading(true); setListOpen(false)
    restaurantApi.getDetail(r.restId)
      .then(res => setDetail(res.data))
      .catch(() => setDetail(r))
      .finally(() => setDetailLoading(false))
  }, [selectedId])

  const handleBack = useCallback(() => { setDetail(null); setSelectedId(null) }, [])

  const filtered = restaurants.filter(r =>
    !search || r.name?.includes(search) || r.address?.includes(search)
  )

  const showDetail = !!(detail || detailLoading) && selectedId !== null

  // CSS 변수 주입
  const rootStyle: React.CSSProperties = {
    '--mp-theme-primary': theme.primary,
    '--mp-theme-dark': theme.dark,
    '--mp-theme-accent': theme.accent,
    '--mp-theme-bg': theme.bg,
    '--mp-theme-focus': theme.searchFocus,
  } as React.CSSProperties

  return (
    <div className="mp-root" style={rootStyle}>
      <div className="mp-topbar">
        <div className="mp-search-row">
          <div className="mp-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input className="mp-search-input" placeholder="식당 이름, 주소 검색"
              value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            {search && <button className="mp-search-clear" onClick={() => { setSearch(''); handleSearch() }}>✕</button>}
          </div>
          <button className="mp-search-btn" onClick={handleSearch}
            style={{ background: theme.primary, color: '#fff' }}>검색</button>
          <div className="mp-count-badge">{filtered.length}개</div>
        </div>
        <div className="mp-cat-tabs">
          {CAT_TABS.map(tab => (
            <button key={tab.value}
              className={`mp-cat-tab ${category === tab.value ? 'on' : ''}`}
              style={category === tab.value ? { borderColor: theme.primary, color: theme.primary, background: `${theme.primary}12` } : {}}
              onClick={() => setCategory(tab.value)}>{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="mp-body">
        <aside className={`mp-list-panel ${listOpen ? 'open' : ''}`}>
          <div className="mp-list-handle" onClick={() => setListOpen(v => !v)} />
          {showDetail ? (
            detailLoading ? (
              <div className="mp-loading" style={{ paddingTop:60 }}>
                <div className="mp-loading-spinner" style={{ borderTopColor: theme.primary }} />
                <span>식당 정보 불러오는 중...</span>
              </div>
            ) : detail ? (
              <DetailPanel r={detail} userLocation={userLocation} onBack={handleBack} themeColor={theme.primary} />
            ) : null
          ) : (
            <>
              <div className="mp-list-head">
                <span className="mp-list-title">주변 맛집</span>
                <span className="mp-list-cnt" style={{ color: theme.primary }}>{filtered.length}개</span>
              </div>
              <div className="mp-list">
                {loading && (
                  <div className="mp-loading">
                    <div className="mp-loading-spinner" style={{ borderTopColor: theme.primary }} />
                    <span>맛집 불러오는 중...</span>
                  </div>
                )}
                {!loading && filtered.length === 0 && <div className="mp-empty">검색 결과가 없어요 😅</div>}
                {!loading && filtered.map(r => (
                  <RestaurantCard key={r.restId} r={r} active={selectedId === r.restId}
                    distance={formatDistance(getDistanceKm(userLocation, r))}
                    onClick={() => handleSelect(r)} themeColor={theme.primary} />
                ))}
              </div>
            </>
          )}
        </aside>

        <main className="mp-map">
          <NaverMap restaurants={filtered} selectedId={selectedId}
            userLocation={userLocation} onMarkerClick={handleSelect} themeColor={theme.markerActive} />

          <div className={`mp-location-status mp-location-status--${locationStatus}`}
            style={locationStatus === 'success' ? { borderColor: theme.primary, color: theme.primary } : {}}>
            <span className="mp-location-status__dot"
              style={locationStatus === 'success' ? { background: theme.primary } : {}} />
            {locationStatus === 'loading' && '내 위치 찾는 중'}
            {locationStatus === 'success' && '내 위치 기준으로 표시 중'}
            {locationStatus === 'error' && '위치 권한을 허용하면 길찾기가 정확해져요'}
            {locationStatus === 'idle' && '내 위치를 사용할 수 있어요'}
          </div>

          <div className="mp-map-controls">
            <button className="mp-map-btn" title="내 위치" onClick={requestLocation}
              style={{ borderColor: `${theme.primary}44` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
              </svg>
            </button>
          </div>

          <button className="mp-mobile-toggle" onClick={() => setListOpen(v => !v)}
            style={{ background: theme.primary }}>
            {listOpen ? '지도 보기 🗺' : showDetail ? `${detail?.name ?? '상세정보'} 보기` : `목록 보기 (${filtered.length})`}
          </button>
        </main>
      </div>
    </div>
  )
}
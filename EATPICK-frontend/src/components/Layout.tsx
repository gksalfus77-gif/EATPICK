// ============================================================
// src/components/Layout.tsx
// ✅ Home.css의 사이드바 클래스명 그대로 사용
//    nav-panel, panel-inner, menu-group, group-label,
//    menu-item, panel-bottom, bottom-item, nav-overlay
// ============================================================
import { useState, useEffect, useContext } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../contexts/AuthContext'
import { FOOD_THEMES, getFoodThemeByPath } from '../constants/themes'

const NAV = [
  { section: 'EXPLORE', items: [
    { label: '홈',          path: '/'         },
    { label: '지도 보기',   path: '/map'      },
    // { label: '맛집 블로그', path: '/blog'     },
  ]},
  { section: 'FOOD', items: FOOD_THEMES.map((t) => ({ label: t.label, path: t.path, themeId: t.id })) },
  { section: 'COMMUNITY\nCENTER', items: [
    { label: '맛집 블로그',   path: '/blog'  },
    { label: '맛집 커뮤니티', path: '/commu' },
  ]},
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // 2. 로그인 상태 가져오기
  const authContext = useContext(AuthContext)
  const { user, logoutContext } = authContext || { user: null, logoutContext: () => {} }
  // Home('/')에서는 햄버거 버튼 숨김 (Home 자체 버튼 사용)
  const isHome = location.pathname === '/'

  /** FOOD 테마 페이지일 때 햄버거·사이드바 액센트를 해당 색으로 */
  const activeFoodTheme = getFoodThemeByPath(location.pathname)
  const layoutThemeClass = activeFoodTheme ? `layout-root--${activeFoodTheme.id}` : ''

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const go = (path: string) => { navigate(path); setOpen(false) }

  // 3. 로그아웃 핸들러
  const handleLogout = () => {
    logoutContext();
    alert("로그아웃 되었습니다.");
    go('/'); // 로그아웃 후 홈으로 이동
  }

  return (
    <div className={`layout-root ${layoutThemeClass}`.trim()}>

      {/* ── 햄버거 버튼 — Home에서만 숨김 ── */}
      {!isHome && (
        <button
          className={`home-hamburger${open ? ' active' : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="메뉴"
        >
          <span /><span /><span />
        </button>
        
      )}

      {/* ── 오버레이 ── */}
      <div
        className={`nav-overlay${open ? ' active' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* ── 사이드바 — Home.css 클래스명 그대로 ── */}
      <nav className={`nav-panel${open ? ' active' : ''}`}>
        <div className="panel-inner">

          {NAV.map(sec => (
            <div key={sec.section} className="menu-group">
              <div className="group-label">
                {sec.section.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < sec.section.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
              {sec.items.map(item => {
                const themeId = 'themeId' in item ? (item as { themeId?: string }).themeId : undefined
                return (
                  <button
                    key={item.label}
                    className={[
                      'menu-item',
                      isActive(item.path) ? 'menu-item--active' : '',
                      themeId ? `menu-item--to-${themeId}` : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => go(item.path)}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>
          ))}

        </div>

        {/* 4. 로그인 상태에 따라 버튼 조건부 렌더링 */}
        <div className="panel-bottom">
          {user ? (
            // 로그인 상태일 때
            <button className="bottom-item" onClick={handleLogout}>LOGOUT</button>
          ) : (
            // 비로그인 상태일 때
            <>
              <button className="bottom-item" onClick={() => go('/login')}>LOGIN</button>
              <button className="bottom-item" onClick={() => go('/membership')}>MEMBER</button>
            </>
          )}
          {/* <button className="bottom-item" onClick={() => go('/cus')}>SUPPORT</button> */}
        </div>
      </nav>

      {/* ── 페이지 콘텐츠 ── */}
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  )
}

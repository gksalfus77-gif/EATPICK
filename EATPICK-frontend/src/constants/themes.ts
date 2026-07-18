// ============================================================
// themes.ts — 8개 FOOD 테마 공통 설정 (경로 ↔ 색상 ↔ CSS 클래스)
// index.css 의 THEME 01~08 색상과 맞춰 두세요.
// ============================================================

export type ThemeId =
  | 'vega'
  | 'exot'
  | 'chef'
  | 'mich'
  | 'kids'
  | 'ani'
  | 'stran'
  | 'liqu'

export interface FoodTheme {
  id: ThemeId
  /** 사이드바·링크에 표시할 이름 */
  label: string
  /** react-router 경로 (선행 슬래시 포함) */
  path: string
  /** 메뉴/탐색 링크 강조색 — index.css --theme-primary 과 동일하게 */
  color: string
  /** 페이지 루트 className: theme-vega, theme-chef … */
  themeClass: string
}

/** FOOD 카테고리 8개 (순서 = Home 슬라이드·사이드바 FOOD 메뉴 권장 순서) */
export const FOOD_THEMES: FoodTheme[] = [
  { id: 'exot',  label: '세계요리식당',     path: '/ExotPage',  color: '#FF0000', themeClass: 'theme-exot'  },
  { id: 'mich',  label: '미슐랭식당',       path: '/MichPage',  color: '#FF6347', themeClass: 'theme-mich'  },
  { id: 'chef',  label: '유명쉐프식당', path: '/ChefPage',  color: '#D2691E', themeClass: 'theme-chef'  },
  { id: 'kids',  label: '키즈존식당',   path: '/KidsPage',  color: '#FFD700', themeClass: 'theme-kids'  },
  { id: 'vega',  label: '채식요리식당',     path: '/VegaPage',  color: '#228B22', themeClass: 'theme-vega'  },
  { id: 'ani',   label: '애견동반식당', path: '/AniPage',   color: '#1E90FF', themeClass: 'theme-ani'   },
  { id: 'liqu',  label: '세계주류판매', path: '/LiquPage',  color: '#0000CD', themeClass: 'theme-liqu'  },
  { id: 'stran', label: '특이괴식식당',   path: '/StranPage', color: '#BA55D3', themeClass: 'theme-stran' },
  ]

const PATH_TO_THEME = new Map(
  FOOD_THEMES.map((t) => [t.path.toLowerCase(), t])
)

/** 현재 URL이 FOOD 테마 페이지면 해당 테마 반환 */
export function getFoodThemeByPath(pathname: string): FoodTheme | null {
  const key = pathname.replace(/\/$/, '').toLowerCase() || '/'
  return PATH_TO_THEME.get(key) ?? null
}

export function getFoodThemeById(id: ThemeId): FoodTheme | undefined {
  return FOOD_THEMES.find((t) => t.id === id)
}

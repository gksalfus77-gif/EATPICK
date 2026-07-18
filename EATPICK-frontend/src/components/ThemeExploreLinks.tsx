// ============================================================
// ThemeExploreLinks — 다른 FOOD 테마 페이지로 이동 (각 링크 = 해당 테마 색)
// 사용: <ThemeExploreLinks current="vega" />
// ============================================================
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { FOOD_THEMES, type ThemeId } from '../constants/themes'

interface Props {
  /** 현재 페이지 테마 (자기 자신 링크는 비활성) */
  current?: ThemeId
  title?: string
}

export default function ThemeExploreLinks({ current, title = '다른 테마 둘러보기' }: Props) {
  return null  // ← 이 한 줄만 추가, 나머지는 그대로 둬도 됨
  const navigate = useNavigate()

  return (
    <section className="theme-explore" aria-label={title}>
      <h2 className="theme-explore-title">{title}</h2>
      <div className="theme-explore-list">
        {FOOD_THEMES.map((t) => {
          const isCurrent = t.id === current
          return (
            <button
              key={t.id}
              type="button"
              className={`theme-explore-link theme-explore-link--${t.id}${isCurrent ? ' is-current' : ''}`}
              style={{ '--link-theme-color': t.color } as CSSProperties}
              disabled={isCurrent}
              onClick={() => navigate(t.path)}
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

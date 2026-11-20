import { describe, expect, it } from 'vitest'
import {
  buildMatchViewTabs,
  DAYS_EACH_SIDE,
  getAdjacentMatchView,
  resolveSwipeDirection,
} from '@/lib/dayViews'

const TODAY = '2026-11-20'
const YESTERDAY = '2026-11-19'
const TOMORROW = '2026-11-21'

describe('buildMatchViewTabs', () => {
  it('incluye Directo exactamente entre Hoy y Mañana', () => {
    const tabs = buildMatchViewTabs(TODAY)
    expect(tabs).toHaveLength(DAYS_EACH_SIDE * 2 + 2)

    const todayIdx = tabs.findIndex((t) => t.key === TODAY)
    const liveIdx = tabs.findIndex((t) => t.key === 'live')
    const tomorrowIdx = tabs.findIndex((t) => t.key === TOMORROW)

    expect(todayIdx).toBe(DAYS_EACH_SIDE)
    expect(liveIdx).toBe(todayIdx + 1)
    expect(tomorrowIdx).toBe(liveIdx + 1)

    expect(tabs[todayIdx - 1]).toMatchObject({ key: YESTERDAY, kind: 'day', label: 'Ayer' })
    expect(tabs[todayIdx]).toMatchObject({ key: TODAY, kind: 'day', label: 'Hoy', isToday: true })
    expect(tabs[liveIdx]).toMatchObject({ key: 'live', kind: 'live', label: 'Directo' })
    expect(tabs[tomorrowIdx]).toMatchObject({ key: TOMORROW, kind: 'day', label: 'Mañana' })
  })
})

describe('getAdjacentMatchView', () => {
  const tabs = buildMatchViewTabs(TODAY)

  it('recorre Ayer <-> Hoy <-> Directo <-> Mañana en ambos sentidos', () => {
    expect(getAdjacentMatchView(tabs, YESTERDAY, 1)).toBe(TODAY)
    expect(getAdjacentMatchView(tabs, TODAY, 1)).toBe('live')
    expect(getAdjacentMatchView(tabs, 'live', 1)).toBe(TOMORROW)

    expect(getAdjacentMatchView(tabs, TOMORROW, -1)).toBe('live')
    expect(getAdjacentMatchView(tabs, 'live', -1)).toBe(TODAY)
    expect(getAdjacentMatchView(tabs, TODAY, -1)).toBe(YESTERDAY)
  })

  it('devuelve null en los extremos de la tira', () => {
    expect(getAdjacentMatchView(tabs, tabs[0].key, -1)).toBeNull()
    expect(getAdjacentMatchView(tabs, tabs[tabs.length - 1].key, 1)).toBeNull()
  })

  it('vuelve al extremo cercano si la fecha actual está fuera de rango', () => {
    expect(getAdjacentMatchView(tabs, '2026-11-01', 1)).toBe(tabs[0].key)
    expect(getAdjacentMatchView(tabs, '2026-11-01', -1)).toBeNull()
    expect(getAdjacentMatchView(tabs, '2026-12-05', -1)).toBe(tabs[tabs.length - 1].key)
    expect(getAdjacentMatchView(tabs, '2026-12-05', 1)).toBeNull()
  })
})

describe('resolveSwipeDirection', () => {
  it('detecta swipe a izquierda (avanzar) y derecha (retroceder)', () => {
    expect(resolveSwipeDirection(-80, 5, 220)).toBe(1)
    expect(resolveSwipeDirection(80, -5, 220)).toBe(-1)
  })

  it('detecta flick rápido horizontal', () => {
    expect(resolveSwipeDirection(-36, 4, 80)).toBe(1)
    expect(resolveSwipeDirection(40, -4, 90)).toBe(-1)
  })

  it('ignora gestos demasiado cortos o lentos', () => {
    expect(resolveSwipeDirection(-25, 0, 120)).toBe(0)
    expect(resolveSwipeDirection(40, 0, 300)).toBe(0)
  })

  it('rechaza desplazamientos verticales o diagonales', () => {
    expect(resolveSwipeDirection(-15, 90, 120)).toBe(0)
    expect(resolveSwipeDirection(-70, 60, 150)).toBe(0)
  })
})

import { toDateKey } from '@/lib/date'

/** Vista seleccionada: los partidos en directo o un día concreto (`YYYY-MM-DD`). */
export type MatchView = 'live' | (string & {})

export interface MatchViewTab {
  key: MatchView
  kind: 'day' | 'live'
  label: string
  day?: number
  isToday?: boolean
}

export const DAYS_EACH_SIDE = 5

const weekdayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

function dayLabel(offset: number, weekday: string): string {
  if (offset === 0) return 'Hoy'
  if (offset === -1) return 'Ayer'
  if (offset === 1) return 'Mañana'
  return weekday
}

/**
 * Construye la secuencia ordenada de pestañas alrededor de `today` con `Directo`
 * situado justo después de `Hoy` (entre `Hoy` y `Mañana`).
 */
export function buildMatchViewTabs(today: string): MatchViewTab[] {
  const [y, m, d] = today.split('-').map(Number)
  const tabs: MatchViewTab[] = []

  for (let offset = -DAYS_EACH_SIDE; offset <= DAYS_EACH_SIDE; offset++) {
    const date = new Date(y, m - 1, d + offset)
    const key = toDateKey(date)
    const weekday = weekdayFormatter.format(date).replace('.', '')
    tabs.push({
      key,
      kind: 'day',
      label: dayLabel(offset, weekday),
      day: date.getDate(),
      isToday: offset === 0,
    })

    if (offset === 0) {
      tabs.push({
        key: 'live',
        kind: 'live',
        label: 'Directo',
      })
    }
  }

  return tabs
}

/** Devuelve la pestaña anterior (`-1`) o siguiente (`1`) en `tabs`, o `null` en los extremos. */
export function getAdjacentMatchView(
  tabs: MatchViewTab[],
  current: MatchView,
  direction: -1 | 1,
): MatchView | null {
  if (tabs.length === 0) return null

  const idx = tabs.findIndex((t) => t.key === current)
  if (idx !== -1) {
    return tabs[idx + direction]?.key ?? null
  }

  // Si la fecha actual queda fuera de la tira (p. ej. "Ver jornada completa"),
  // permitir volver al extremo más cercano al deslizar hacia la tira.
  const firstKey = tabs[0].key
  const lastKey = tabs[tabs.length - 1].key
  if (current < firstKey && direction === 1) return firstKey
  if (current > lastKey && direction === -1) return lastKey
  return null
}

/**
 * Evalúa si un desplazamiento táctil constituye un swipe horizontal válido.
 * Devuelve `1` al deslizar a la izquierda (avanzar), `-1` a la derecha (retroceder) o `0`.
 */
export function resolveSwipeDirection(dx: number, dy: number, elapsedMs: number): -1 | 1 | 0 {
  const absX = Math.abs(dx)
  const absY = Math.abs(dy)
  if (absX <= absY * 1.25) return 0

  const isLongSwipe = absX >= 56
  const isFastFlick = absX >= 32 && elapsedMs > 0 && absX / elapsedMs >= 0.35
  if (!isLongSwipe && !isFastFlick) return 0

  return dx < 0 ? 1 : -1
}

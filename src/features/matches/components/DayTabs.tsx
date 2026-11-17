import clsx from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import { LiveDot } from '@/components/ui/LiveDot'
import { toDateKey } from '@/lib/date'

/** Vista seleccionada: los partidos en directo o un día concreto (`YYYY-MM-DD`). */
export type MatchView = 'live' | (string & {})

const DAYS_EACH_SIDE = 5
const weekdayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'short' })

interface DayTabsProps {
  value: MatchView
  /** Fecha de hoy `YYYY-MM-DD`; el rango de días se calcula a partir de ella. */
  today: string
  liveCount: number
  onChange: (view: MatchView) => void
}

function dayLabel(offset: number, weekday: string): string {
  if (offset === 0) return 'Hoy'
  if (offset === -1) return 'Ayer'
  if (offset === 1) return 'Mañana'
  return weekday
}

export function DayTabs({ value, today, liveCount, onChange }: DayTabsProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)
  const liveActive = value === 'live'

  const days = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number)
    return Array.from({ length: DAYS_EACH_SIDE * 2 + 1 }, (_, i) => {
      const offset = i - DAYS_EACH_SIDE
      const date = new Date(y, m - 1, d + offset)
      return {
        key: toDateKey(date),
        label: dayLabel(offset, weekdayFormatter.format(date).replace('.', '')),
        day: date.getDate(),
      }
    })
  }, [today])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [value])

  return (
    <div role="tablist" aria-label="Partidos" className="flex items-stretch gap-2">
      <button
        role="tab"
        type="button"
        aria-selected={liveActive}
        onClick={() => onChange('live')}
        className={clsx(
          'flex shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border px-3 py-2 transition-colors cursor-pointer',
          liveActive
            ? 'border-accent bg-accent text-canvas font-bold'
            : 'border-border bg-surface text-fg-muted hover:text-fg',
        )}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase">
          <LiveDot className={clsx('size-1.5', liveActive && 'bg-canvas shadow-none')} />
          Directo
        </span>
        <span className="text-lg font-bold tabular-nums">{liveCount}</span>
      </button>

      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {days.map(({ key, label, day }) => {
          const active = key === value
          const isToday = key === today
          return (
            <button
              key={key}
              ref={active ? selectedRef : undefined}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(key)}
              className={clsx(
                'flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-colors cursor-pointer',
                active
                  ? 'border-accent bg-accent-soft text-accent font-semibold'
                  : 'border-border bg-surface text-fg-muted hover:text-fg',
              )}
            >
              <span className={clsx('text-[11px] font-medium uppercase', isToday && !active && 'text-accent font-bold')}>
                {label}
              </span>
              <span className="text-lg font-bold tabular-nums">{day}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

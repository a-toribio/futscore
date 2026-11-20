import clsx from 'clsx'
import { useEffect, useMemo, useRef } from 'react'
import { LiveDot } from '@/components/ui/LiveDot'
import { buildMatchViewTabs, type MatchView, type MatchViewTab } from '@/lib/dayViews'

export type { MatchView }

interface DayTabsProps {
  value: MatchView
  /** Fecha de hoy `YYYY-MM-DD`; el rango de días se calcula a partir de ella. */
  today: string
  liveCount: number
  tabs?: MatchViewTab[]
  onChange: (view: MatchView) => void
}

export function DayTabs({ value, today, liveCount, tabs, onChange }: DayTabsProps) {
  const selectedRef = useRef<HTMLButtonElement>(null)
  const hasMountedRef = useRef(false)

  const resolvedTabs = useMemo(() => tabs ?? buildMatchViewTabs(today), [tabs, today])

  useEffect(() => {
    const behavior: ScrollBehavior = hasMountedRef.current ? 'smooth' : 'auto'
    selectedRef.current?.scrollIntoView({ behavior, inline: 'center', block: 'nearest' })
    hasMountedRef.current = true
  }, [value])

  return (
    <div
      role="tablist"
      aria-label="Partidos"
      className="flex min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      {resolvedTabs.map((tab) => {
        const active = tab.key === value

        if (tab.kind === 'live') {
          return (
            <button
              key={tab.key}
              ref={active ? selectedRef : undefined}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange('live')}
              className={clsx(
                'flex min-w-16 shrink-0 flex-col items-center justify-center rounded-xl border px-3 py-2 transition-colors cursor-pointer',
                active
                  ? 'border-accent bg-accent text-canvas font-bold'
                  : 'border-border bg-surface text-fg-muted hover:text-fg',
              )}
            >
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase">
                <LiveDot className={clsx('size-1.5', active && 'bg-canvas shadow-none')} />
                {tab.label}
              </span>
              <span className="text-lg font-bold tabular-nums">{liveCount}</span>
            </button>
          )
        }

        return (
          <button
            key={tab.key}
            ref={active ? selectedRef : undefined}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'flex min-w-16 shrink-0 flex-col items-center rounded-xl border px-3 py-2 transition-colors cursor-pointer',
              active
                ? 'border-accent bg-accent-soft text-accent font-semibold'
                : 'border-border bg-surface text-fg-muted hover:text-fg',
            )}
          >
            <span
              className={clsx(
                'text-[11px] font-medium uppercase',
                tab.isToday && !active && 'text-accent font-bold',
              )}
            >
              {tab.label}
            </span>
            <span className="text-lg font-bold tabular-nums">{tab.day}</span>
          </button>
        )
      })}
    </div>
  )
}

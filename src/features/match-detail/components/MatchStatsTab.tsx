import clsx from 'clsx'
import { TeamCrest } from '@/components/ui/TeamCrest'
import type { MatchStatItem, Team } from '@/types'

interface MatchStatsTabProps {
  stats: MatchStatItem[]
  homeTeam: Team
  awayTeam: Team
}

export function MatchStatsTab({ stats, homeTeam, awayTeam }: MatchStatsTabProps) {
  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-fg-muted">
        <p className="font-medium text-fg">Estadísticas no disponibles aún</p>
        <p className="mt-1 max-w-xs text-xs text-fg-subtle">
          Las métricas detalladas del encuentro (posesión, remates, córners y pases) se actualizan en cuanto arranca el partido.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Cabecera comparativa de equipos */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold">
        <div className="flex items-center gap-2 min-w-0">
          <TeamCrest team={homeTeam} className="size-5" />
          <span className="truncate text-fg">{homeTeam.name}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0 text-right">
          <span className="truncate text-fg">{awayTeam.name}</span>
          <TeamCrest team={awayTeam} className="size-5" />
        </div>
      </div>

      {/* Lista de barras de estadísticas */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        {stats.map((stat) => {
          const total = stat.homeNumeric + stat.awayNumeric
          const homePct = total > 0 ? Math.round((stat.homeNumeric / total) * 100) : 50
          const awayPct = 100 - homePct
          const homeLeads = stat.homeNumeric > stat.awayNumeric
          const awayLeads = stat.awayNumeric > stat.homeNumeric

          return (
            <div key={stat.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span
                  className={clsx(
                    'tabular-nums font-bold',
                    homeLeads ? 'text-accent' : 'text-fg',
                  )}
                >
                  {stat.homeValue}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
                  {stat.label}
                </span>
                <span
                  className={clsx(
                    'tabular-nums font-bold',
                    awayLeads ? 'text-accent' : 'text-fg',
                  )}
                >
                  {stat.awayValue}
                </span>
              </div>

              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface gap-1">
                <div
                  className={clsx(
                    'h-full rounded-l-full transition-all duration-500',
                    homeLeads ? 'bg-accent' : 'bg-fg-subtle/40',
                  )}
                  style={{ width: `${homePct}%` }}
                />
                <div
                  className={clsx(
                    'h-full rounded-r-full transition-all duration-500',
                    awayLeads ? 'bg-accent' : 'bg-fg-subtle/40',
                  )}
                  style={{ width: `${awayPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

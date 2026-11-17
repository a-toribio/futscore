import clsx from 'clsx'
import { useEffect, useState } from 'react'
import {
  findMatchInTvSchedule,
  isSpanishNetwork,
  loadRealSpanishTvSchedule,
  resolveSpanishBroadcasters,
  type SpanishBroadcast,
} from '@/lib/broadcasters'
import { formatKickoff } from '@/lib/format'
import type { League, Match, MatchInfo } from '@/types'

interface MatchInfoTabProps {
  info: MatchInfo
  match: Match
  league?: League
}

export function MatchInfoTab({ info, match, league }: MatchInfoTabProps) {
  const [guideBroadcasters, setGuideBroadcasters] = useState<SpanishBroadcast[] | null>(null)

  useEffect(() => {
    let active = true
    loadRealSpanishTvSchedule().then((schedule) => {
      if (!active || schedule.length === 0) return
      const found = findMatchInTvSchedule(
        match.homeTeam.name,
        match.awayTeam.name,
        schedule,
      )
      if (found) {
        setGuideBroadcasters(found)
      }
    })
    return () => {
      active = false
    }
  }, [match.homeTeam.name, match.awayTeam.name])

  const kickoffDate = new Date(match.kickoff)
  const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const broadcasters =
    guideBroadcasters ?? resolveSpanishBroadcasters(match.leagueId, info.broadcast, match)
  const hasForeignBroadcast = info.broadcast && !isSpanishNetwork(info.broadcast)
  const isVerifiedGuide = broadcasters.some((b) => b.verifiedFromGuide)

  return (
    <div className="flex flex-col gap-3 py-2">
      {/* Estadio */}
      <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
          Estadio
        </h4>
        <div className="mt-2 space-y-1">
          <p className="text-sm font-semibold text-fg">
            {info.venue?.name || 'Estadio por confirmar'}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
            {info.venue?.city && (
              <span>
                Ciudad: <span className="font-medium text-fg">{info.venue.city}</span>
              </span>
            )}
            {info.venue?.capacity && (
              <span>
                Capacidad:{' '}
                <span className="font-medium text-fg">
                  {info.venue.capacity.toLocaleString('es-ES')} espectadores
                </span>
              </span>
            )}
            {info.attendance && (
              <span>
                Asistencia:{' '}
                <span className="font-medium text-fg">
                  {info.attendance.toLocaleString('es-ES')} espectadores
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Televisión en España */}
      <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
            Televisión en España
          </h4>
          <span className="text-[10px] text-fg-subtle">
            {isVerifiedGuide ? 'Parrilla TV confirmada' : 'Asignación por partido'}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {broadcasters.map((b) => (
            <span
              key={b.channel}
              title={b.details}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-colors',
                b.noTv
                  ? 'border-border bg-surface text-fg-muted'
                  : b.isFreeToAir
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-accent/30 bg-accent-soft text-accent',
              )}
            >
              {!b.noTv && (
                <span
                  className={clsx(
                    'inline-block size-1.5 rounded-full',
                    b.isFreeToAir ? 'bg-emerald-400' : 'bg-accent animate-pulse',
                  )}
                />
              )}
              <span>{b.channel}</span>
              {b.isFreeToAir && (
                <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                  En abierto
                </span>
              )}
            </span>
          ))}
        </div>
        {hasForeignBroadcast && (
          <p className="mt-2.5 text-[11px] text-fg-subtle">
            Señal internacional original:{' '}
            <span className="font-medium text-fg-muted">{info.broadcast}</span>
          </p>
        )}
      </div>

      {/* Fecha y hora */}
      <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
          Fecha y hora
        </h4>
        <div className="mt-2 space-y-1 text-xs">
          <p className="text-sm font-medium capitalize text-fg">
            {fullDateFormatter.format(kickoffDate)}
          </p>
          <p className="text-fg-muted">
            Hora de inicio:{' '}
            <span className="font-bold tabular-nums text-accent">
              {formatKickoff(match.kickoff)}h
            </span>{' '}
            (hora local peninsular)
          </p>
        </div>
      </div>

      {/* Competición */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted">
          Competición
        </h4>
        <p className="mt-2 text-sm font-semibold text-fg">
          {league ? `${league.flag ? league.flag + ' ' : ''}${league.name}` : 'Torneo Oficial'}
        </p>
        {info.round && (
          <p className="mt-0.5 text-xs text-fg-subtle">{info.round}</p>
        )}
      </div>

      {/* Cuotas */}
      {info.odds && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-fg-muted">
            Cuotas
          </h4>
          <p className="mt-2 font-mono text-xs text-accent">{info.odds}</p>
        </div>
      )}
    </div>
  )
}

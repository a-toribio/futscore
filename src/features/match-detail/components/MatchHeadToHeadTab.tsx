import clsx from 'clsx'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { areSameTeamH2H } from '@/services/real/h2h'
import type { HeadToHeadSummary, Team } from '@/types'

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

function formatH2HDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return dateFormatter.format(d)
  } catch {
    return dateStr
  }
}

function createH2HTeam(name: string, logoUrl?: string): Team {
  return {
    id: name,
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    logoUrl,
  }
}

interface MatchHeadToHeadTabProps {
  summary?: HeadToHeadSummary
  homeTeam: Team
  awayTeam: Team
  isPending?: boolean
}

export function MatchHeadToHeadTab({
  summary,
  homeTeam,
  awayTeam,
  isPending,
}: MatchHeadToHeadTabProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
        <span className="inline-block size-3 animate-ping rounded-full bg-accent mb-3" />
        <span>Consultando historial de enfrentamientos directos...</span>
      </div>
    )
  }

  if (!summary || summary.totalMatches === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center my-4">
        <div className="flex items-center gap-4 mb-3">
          <TeamCrest team={homeTeam} className="size-10 sm:size-12" size="md" />
          <span className="text-xs font-bold text-fg-subtle">VS</span>
          <TeamCrest team={awayTeam} className="size-10 sm:size-12" size="md" />
        </div>
        <h3 className="text-sm font-bold text-fg">Primer duelo directo en la historia registrada</h3>
        <p className="mt-1.5 max-w-sm text-xs text-fg-subtle leading-relaxed">
          No constan enfrentamientos directos previos registrados entre {homeTeam.name} y{' '}
          {awayTeam.name} en las competiciones oficiales de nuestro archivo.
        </p>
      </div>
    )
  }

  const {
    totalMatches,
    homeWins,
    draws,
    awayWins,
    homeGoals,
    awayGoals,
    recentMatches,
    over25Count,
    bothScoredCount,
    avgGoals,
  } = summary

  const homePct = totalMatches > 0 ? (homeWins / totalMatches) * 100 : 0
  const drawPct = totalMatches > 0 ? (draws / totalMatches) * 100 : 0
  const awayPct = totalMatches > 0 ? (awayWins / totalMatches) * 100 : 0

  const bothScoredPct = totalMatches > 0 ? Math.round((bothScoredCount / totalMatches) * 100) : 0
  const over25Pct = totalMatches > 0 ? Math.round((over25Count / totalMatches) * 100) : 0

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* 1. Tarjeta principal del balance H2H */}
      <div className="rounded-2xl border border-border bg-gradient-to-b from-surface/70 to-card p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs text-fg-muted mb-3">
          <span className="font-bold uppercase tracking-wider text-[11px] text-accent">
            Cara a cara · Balance general
          </span>
          <span className="text-[11px] text-fg-subtle">
            {totalMatches >= 5
              ? 'Últimos 5 enfrentamientos oficiales'
              : totalMatches === 1
                ? '1 único duelo registrado en el historial'
                : `${totalMatches} únicos duelos registrados en el historial`}
          </span>
        </div>

        {/* Enfrentamiento visual y contadores */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center my-2">
          {/* Lado Local */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <TeamCrest team={homeTeam} className="size-9 sm:size-10" size="md" />
            <span className="truncate text-xs font-bold text-fg max-w-[110px] sm:max-w-none">
              {homeTeam.name}
            </span>
            <div className="text-xl sm:text-2xl font-black text-accent tabular-nums">
              {homeWins}
            </div>
            <span className="text-[10px] uppercase font-bold text-fg-subtle">
              {homeWins === 1 ? 'Victoria' : 'Victorias'}
            </span>
          </div>

          {/* Empates en el centro */}
          <div className="flex flex-col items-center justify-center px-2">
            <span className="text-[10px] uppercase font-bold text-fg-subtle tracking-wide">
              Empates
            </span>
            <div className="text-lg sm:text-xl font-black text-fg-muted tabular-nums my-0.5">
              {draws}
            </div>
            <span className="text-[10px] text-fg-subtle">{drawPct.toFixed(0)}%</span>
          </div>

          {/* Lado Visitante */}
          <div className="flex flex-col items-center gap-1 min-w-0">
            <TeamCrest team={awayTeam} className="size-9 sm:size-10" size="md" />
            <span className="truncate text-xs font-bold text-fg max-w-[110px] sm:max-w-none">
              {awayTeam.name}
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-400 tabular-nums">
              {awayWins}
            </div>
            <span className="text-[10px] uppercase font-bold text-fg-subtle">
              {awayWins === 1 ? 'Victoria' : 'Victorias'}
            </span>
          </div>
        </div>

        {/* Barra tricolor segmentada proporcional */}
        <div className="mt-4 space-y-1.5">
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface border border-border/50">
            {homePct > 0 && (
              <div
                style={{ width: `${homePct}%` }}
                title={`${homeTeam.name}: ${homeWins} victorias (${homePct.toFixed(0)}%)`}
                className="bg-accent transition-all duration-300"
              />
            )}
            {drawPct > 0 && (
              <div
                style={{ width: `${drawPct}%` }}
                title={`Empates: ${draws} (${drawPct.toFixed(0)}%)`}
                className="bg-fg-muted/40 transition-all duration-300"
              />
            )}
            {awayPct > 0 && (
              <div
                style={{ width: `${awayPct}%` }}
                title={`${awayTeam.name}: ${awayWins} victorias (${awayPct.toFixed(0)}%)`}
                className="bg-sky-400 transition-all duration-300"
              />
            )}
          </div>
          <div className="flex justify-between text-[10px] font-semibold text-fg-subtle">
            <span>{homePct.toFixed(0)}% victoria local</span>
            <span>{awayPct.toFixed(0)}% victoria visitante</span>
          </div>
        </div>
      </div>

      {/* 2. Grid de estadísticas clave del enfrentamiento */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">
            Goles marcados
          </span>
          <div className="mt-1 text-base sm:text-lg font-extrabold text-fg tabular-nums">
            <span className="text-accent">{homeGoals}</span> -{' '}
            <span className="text-sky-400">{awayGoals}</span>
          </div>
          <span className="text-[10px] text-fg-subtle">Balance total</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">
            Promedio goles
          </span>
          <div className="mt-1 text-base sm:text-lg font-extrabold text-fg tabular-nums">
            {avgGoals}
          </div>
          <span className="text-[10px] text-fg-subtle">Goles / partido</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">
            Ambos marcan
          </span>
          <div className="mt-1 text-base sm:text-lg font-extrabold text-accent tabular-nums">
            {bothScoredPct}%
          </div>
          <span className="text-[10px] text-fg-subtle">
            {bothScoredCount} de {totalMatches} partidos
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-subtle">
            Más de 2.5 goles
          </span>
          <div className="mt-1 text-base sm:text-lg font-extrabold text-sky-400 tabular-nums">
            {over25Pct}%
          </div>
          <span className="text-[10px] text-fg-subtle">
            {over25Count} de {totalMatches} partidos
          </span>
        </div>
      </div>

      {/* 3. Lista de los últimos enfrentamientos directos */}
      <div className="space-y-2 mt-1">
        <h4 className="px-1 text-xs font-bold uppercase tracking-wider text-fg-muted">
          {totalMatches >= 5
            ? 'Historial de los últimos 5 duelos directos'
            : totalMatches === 1
              ? 'Duelo directo registrado en el historial (1)'
              : `Historial de duelos directos registrados (${recentMatches.length})`}
        </h4>

        <div className="space-y-2">
          {recentMatches.map((m) => {
            const isMatchHomeCurrentHome = areSameTeamH2H(m.homeTeamName, homeTeam.name)
            const isMatchHomeCurrentAway = areSameTeamH2H(m.homeTeamName, awayTeam.name)

            const homeIsWinner = m.score.home > m.score.away
            const awayIsWinner = m.score.away > m.score.home
            const isDraw = m.score.home === m.score.away

            return (
              <div
                key={m.id}
                className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-border/80"
              >
                {/* Cabecera del encuentro (Fecha y Competición) */}
                <div className="flex items-center justify-between border-b border-border bg-surface/60 px-3.5 py-1.5 text-[11px] font-medium text-fg-muted">
                  <span>{formatH2HDate(m.date)}</span>
                  <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[10px] font-bold text-fg-subtle">
                    {m.competition}
                  </span>
                </div>

                {/* Marcador y equipos */}
                <div className="p-3 space-y-2">
                  {/* Fila Equipo Local del partido */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest
                        team={createH2HTeam(m.homeTeamName, m.homeTeamLogo)}
                        className="size-5"
                      />
                      <span
                        className={clsx(
                          'truncate font-semibold',
                          homeIsWinner ? 'text-fg font-bold' : 'text-fg-muted',
                        )}
                      >
                        {m.homeTeamName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'size-6 flex items-center justify-center rounded-md text-xs font-bold tabular-nums',
                          homeIsWinner
                            ? isMatchHomeCurrentHome
                              ? 'bg-accent/20 text-accent font-extrabold'
                              : 'bg-sky-400/20 text-sky-400 font-extrabold'
                            : 'bg-surface text-fg-muted',
                        )}
                      >
                        {m.score.home}
                      </span>
                    </div>
                  </div>

                  {/* Fila Equipo Visitante del partido */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest
                        team={createH2HTeam(m.awayTeamName, m.awayTeamLogo)}
                        className="size-5"
                      />
                      <span
                        className={clsx(
                          'truncate font-semibold',
                          awayIsWinner ? 'text-fg font-bold' : 'text-fg-muted',
                        )}
                      >
                        {m.awayTeamName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={clsx(
                          'size-6 flex items-center justify-center rounded-md text-xs font-bold tabular-nums',
                          awayIsWinner
                            ? isMatchHomeCurrentAway
                              ? 'bg-accent/20 text-accent font-extrabold'
                              : 'bg-sky-400/20 text-sky-400 font-extrabold'
                            : 'bg-surface text-fg-muted',
                        )}
                      >
                        {m.score.away}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pie del resultado */}
                <div className="border-t border-border/50 bg-surface/30 px-3.5 py-1 text-[10px] text-right font-medium">
                  {homeIsWinner && (
                    <span
                      className={
                        isMatchHomeCurrentHome
                          ? 'text-accent font-bold'
                          : isMatchHomeCurrentAway
                            ? 'text-sky-400 font-bold'
                            : 'text-fg-muted'
                      }
                    >
                      Ganó {m.homeTeamName}
                    </span>
                  )}
                  {awayIsWinner && (
                    <span
                      className={
                        !isMatchHomeCurrentHome
                          ? 'text-sky-400 font-bold'
                          : isMatchHomeCurrentAway
                            ? 'text-accent font-bold'
                            : 'text-fg-muted'
                      }
                    >
                      Ganó {m.awayTeamName}
                    </span>
                  )}
                  {isDraw && <span className="text-fg-subtle">Empate</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

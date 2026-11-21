import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { LiveDot } from '@/components/ui/LiveDot'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { useMatchDetail } from '@/features/match-detail/hooks/useMatchDetail'
import { useHeadToHead } from '@/features/match-detail/hooks/useHeadToHead'
import { formatKickoff, formatMatchStatus } from '@/lib/format'
import { leagues } from '@/services/leagueCatalog'
import type { Match, Player, Team } from '@/types'
import { MatchEventsTab } from './MatchEventsTab'
import { MatchHeadToHeadTab } from './MatchHeadToHeadTab'
import { MatchInfoTab } from './MatchInfoTab'
import { MatchLineupsTab } from './MatchLineupsTab'
import { MatchStatsTab } from './MatchStatsTab'

type DetailTab = 'events' | 'stats' | 'lineups' | 'h2h' | 'info'

interface MatchDetailModalProps {
  match: Match | null
  onClose: () => void
  onOpenStandings?: (leagueId: string, highlightTeamIds: string[]) => void
  onOpenTeam?: (team: Team, leagueId?: string) => void
  onOpenPlayer?: (player: Player, team?: Team) => void
}

export function MatchDetailModal({
  match,
  onClose,
  onOpenStandings,
  onOpenTeam,
  onOpenPlayer,
}: MatchDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('events')
  const { data: detail, isPending, isError } = useMatchDetail(match)
  const { data: h2hData, isPending: isH2hPending } = useHeadToHead(match)

  // Cerrar con la tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Prevenir scroll en el fondo cuando el modal está abierto
  useEffect(() => {
    if (match) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [match])

  if (!match) return null

  const league = leagues.find((l) => l.id === match.leagueId)
  const isLive = match.status === 'live'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:items-center sm:p-4"
    >
      {/* Fondo clickeable para cerrar */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Contenedor del Modal / Hoja inferior */}
      <div className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        {/* Barra superior de control (shrink-0 evita que colapse con contenido alto) */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/80 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              if (!onOpenStandings) return
              onOpenStandings(match.leagueId, [
                match.homeTeam.id,
                match.awayTeam.id,
              ])
            }}
            title="Ver clasificación y partidos de la liga"
            className="flex items-center gap-2 text-xs font-semibold text-fg-muted transition-colors hover:text-accent truncate min-w-0 cursor-pointer"
          >
            {league?.flag && <span>{league.flag}</span>}
            <span className="truncate underline-offset-2 hover:underline">
              {league?.name || 'Partido'}
            </span>
            <span className="text-fg-subtle">·</span>
            <span className="text-fg-subtle truncate">{league?.country}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-fg-muted transition-colors hover:bg-card-hover hover:text-fg cursor-pointer"
            aria-label="Cerrar detalle"
          >
            ✕
          </button>
        </div>

        {/* Cabecera del partido (shrink-0 mantiene su altura intacta en todas las pestañas) */}
        <div className="shrink-0 border-b border-border bg-gradient-to-b from-surface/50 to-card px-4 py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
            {/* Equipo Local */}
            <button
              type="button"
              onClick={() => {
                onOpenTeam?.(match.homeTeam, match.leagueId)
              }}
              title={`Ver ficha de ${match.homeTeam.name}`}
              className="group flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <TeamCrest team={match.homeTeam} className="size-14 sm:size-16" size="lg" />
              <span className="text-xs sm:text-sm font-bold text-fg leading-tight group-hover:text-accent group-hover:underline underline-offset-2">
                {match.homeTeam.name}
              </span>
            </button>

            {/* Marcador central y Estado */}
            <div className="flex flex-col items-center justify-center px-2">
              <div
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums',
                  isLive ? 'bg-accent/15 text-accent border border-accent/30' : 'text-fg-muted',
                )}
              >
                {isLive && <LiveDot className="size-1.5" />}
                {formatMatchStatus(match)}
              </div>

              <div className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-fg">
                {match.score ? `${match.score.home} - ${match.score.away}` : formatKickoff(match.kickoff)}
              </div>

              <div className="mt-1 text-[11px] text-fg-subtle">
                {match.status === 'scheduled' ? 'Programado' : match.status === 'finished' ? 'Finalizado' : 'En juego'}
              </div>
            </div>

            {/* Equipo Visitante */}
            <button
              type="button"
              onClick={() => {
                onOpenTeam?.(match.awayTeam, match.leagueId)
              }}
              title={`Ver ficha de ${match.awayTeam.name}`}
              className="group flex flex-col items-center gap-1.5 cursor-pointer"
            >
              <TeamCrest team={match.awayTeam} className="size-14 sm:size-16" size="lg" />
              <span className="text-xs sm:text-sm font-bold text-fg leading-tight group-hover:text-accent group-hover:underline underline-offset-2">
                {match.awayTeam.name}
              </span>
            </button>
          </div>
        </div>

        {/* Pestañas de navegación (shrink-0 evita que se oculten o recorten a la mitad) */}
        <div className="grid shrink-0 grid-cols-5 border-b border-border bg-surface px-1 sm:px-3 pt-1 text-center">
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={clsx(
              'border-b-2 py-3 px-1 text-center text-xs font-bold transition-colors cursor-pointer truncate',
              activeTab === 'events'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Eventos ({detail?.events.length ?? 0})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={clsx(
              'border-b-2 py-3 px-1 text-center text-xs font-bold transition-colors cursor-pointer truncate',
              activeTab === 'stats'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Estadísticas
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lineups')}
            className={clsx(
              'border-b-2 py-3 px-1 text-center text-xs font-bold transition-colors cursor-pointer truncate',
              activeTab === 'lineups'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Alineaciones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('h2h')}
            className={clsx(
              'border-b-2 py-3 px-1 text-center text-xs font-bold transition-colors cursor-pointer truncate',
              activeTab === 'h2h'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Cara a cara
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={clsx(
              'border-b-2 py-3 px-1 text-center text-xs font-bold transition-colors cursor-pointer truncate',
              activeTab === 'info'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Información
          </button>
        </div>

        {/* Cuerpo del contenido (min-h-0 flex-1 overflow-y-auto garantiza scroll interno limpio) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 [scrollbar-width:thin]">
          {activeTab === 'h2h' ? (
            <MatchHeadToHeadTab
              summary={h2hData}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              isPending={isH2hPending}
            />
          ) : (
            <>
              {isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
                  <span className="inline-block size-3 animate-ping rounded-full bg-accent mb-3" />
                  <span>Cargando detalles oficiales del encuentro...</span>
                </div>
              )}

              {isError && (
                <div className="rounded-xl border border-danger/40 bg-card p-4 text-center text-xs text-danger">
                  No se pudieron obtener los detalles del encuentro en este momento.
                </div>
              )}

              {!isPending && !isError && detail && (
                <>
                  {activeTab === 'events' && (
                    <MatchEventsTab
                      events={detail.events}
                      homeTeamName={match.homeTeam.name}
                      awayTeamName={match.awayTeam.name}
                      onSelectPlayerName={(name, isHome) =>
                        onOpenPlayer?.(
                          { id: '', name, starter: true },
                          isHome ? match.homeTeam : match.awayTeam,
                        )
                      }
                    />
                  )}

                  {activeTab === 'stats' && (
                    <MatchStatsTab
                      stats={detail.stats}
                      homeTeam={match.homeTeam}
                      awayTeam={match.awayTeam}
                    />
                  )}

                  {activeTab === 'lineups' && (
                    <MatchLineupsTab
                      home={detail.lineups.home}
                      away={detail.lineups.away}
                      onSelectPlayer={(p, team) => onOpenPlayer?.(p, team)}
                    />
                  )}

                  {activeTab === 'info' && (
                    <MatchInfoTab info={detail.info} match={match} league={league} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

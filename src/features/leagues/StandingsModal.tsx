import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { FavoriteStar } from '@/features/favorites/FavoriteStar'
import { useFavoritesStore } from '@/features/favorites/favoritesStore'
import { MatchCard } from '@/features/matches/components/MatchCard'
import { useTabSwipe } from '@/hooks/useTabSwipe'
import { groupMatchesByDateLabel } from '@/lib/groupMatches'
import { leagues } from '@/services/leagueCatalog'
import { getRfefGroups, isRfefLeague } from '@/services/real/rfef'
import type { Match, QualificationZone, Team } from '@/types'
import { hasStandingsTable, useLeagueMatches, useStandings } from './useStandings'

function zoneBadgeClass(zone: QualificationZone): string {
  switch (zone) {
    case 'champions':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    case 'europa':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    case 'conference':
      return 'bg-teal-500/20 text-teal-400 border-teal-500/40'
    case 'promotion':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    case 'relegation':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    default:
      return 'bg-surface text-fg-muted border-border'
  }
}

type LeagueModalTab = 'standings' | 'matches'

interface StandingsModalProps {
  openLeagueId: string | null
  highlightTeamIds?: string[]
  onClose: () => void
  onSelectMatch?: (match: Match) => void
  onOpenTeam?: (team: Team, leagueId?: string) => void
}

export function StandingsModal({
  openLeagueId,
  highlightTeamIds = [],
  onClose,
  onSelectMatch,
  onOpenTeam,
}: StandingsModalProps) {
  const favLeagueIds = useFavoritesStore((s) => s.leagueIds)
  const toggleLeague = useFavoritesStore((s) => s.toggleLeague)
  const canShowTable = openLeagueId ? hasStandingsTable(openLeagueId) : true
  const [selectedTab, setSelectedTab] = useState<LeagueModalTab>('standings')
  const [selectedGroup, setSelectedGroup] = useState<string>('g1')
  const [matchesSubFilter, setMatchesSubFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [matchTeamQuery, setMatchTeamQuery] = useState('')

  const activeTab: LeagueModalTab = canShowTable ? selectedTab : 'matches'
  const availableTabs: readonly LeagueModalTab[] = useMemo(
    () => (canShowTable ? ['standings', 'matches'] : ['matches']),
    [canShowTable],
  )
  const { offsetX, isDragging, handlers } = useTabSwipe({
    tabs: availableTabs,
    activeTab,
    onTabChange: setSelectedTab,
    disabled: !canShowTable,
  })
  const rfefGroups = openLeagueId && isRfefLeague(openLeagueId) ? getRfefGroups(openLeagueId) : []
  const activeGroupCode =
    rfefGroups.length > 0
      ? rfefGroups.some((g) => g.code === selectedGroup)
        ? selectedGroup
        : rfefGroups[0].code
      : undefined

  useEffect(() => {
    if (!openLeagueId) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openLeagueId, onClose])

  useEffect(() => {
    if (openLeagueId) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [openLeagueId])

  const standingsQuery = useStandings(openLeagueId, activeGroupCode)
  const matchesQuery = useLeagueMatches(openLeagueId, activeGroupCode)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const firstUpcomingRef = useRef<HTMLElement>(null)

  const normQuery = matchTeamQuery.trim().toLowerCase()
  const allUpcoming = useMemo(
    () =>
      [...(matchesQuery.data?.upcomingMatches ?? [])].sort(
        (a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff),
      ),
    [matchesQuery.data?.upcomingMatches],
  )
  const allPast = useMemo(
    () =>
      [...(matchesQuery.data?.pastMatches ?? [])].sort(
        (a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff),
      ),
    [matchesQuery.data?.pastMatches],
  )

  const filteredUpcoming = useMemo(
    () =>
      normQuery
        ? allUpcoming.filter(
            (m) =>
              m.homeTeam.name.toLowerCase().includes(normQuery) ||
              m.awayTeam.name.toLowerCase().includes(normQuery),
          )
        : allUpcoming,
    [allUpcoming, normQuery],
  )

  const filteredPast = useMemo(
    () =>
      normQuery
        ? allPast.filter(
            (m) =>
              m.homeTeam.name.toLowerCase().includes(normQuery) ||
              m.awayTeam.name.toLowerCase().includes(normQuery),
          )
        : allPast,
    [allPast, normQuery],
  )

  const pastCount = filteredPast.length
  const upcomingCount = filteredUpcoming.length

  useEffect(() => {
    if (!openLeagueId) return
    const container = scrollContainerRef.current
    if (!container) return

    if (activeTab !== 'matches') {
      container.scrollTop = 0
      return
    }
    if (matchesQuery.isPending || matchesQuery.isError) return

    const rafId = requestAnimationFrame(() => {
      if (matchesSubFilter === 'all' && pastCount > 0 && upcomingCount > 0 && firstUpcomingRef.current) {
        const containerRect = container.getBoundingClientRect()
        const targetRect = firstUpcomingRef.current.getBoundingClientRect()
        const targetTop = targetRect.top - containerRect.top + container.scrollTop
        container.scrollTop = Math.max(0, targetTop - container.clientHeight * 0.42)
      } else if (matchesSubFilter === 'past' && pastCount > 0) {
        container.scrollTop = container.scrollHeight
      } else {
        container.scrollTop = 0
      }
    })

    return () => cancelAnimationFrame(rafId)
  }, [
    openLeagueId,
    activeGroupCode,
    activeTab,
    matchesSubFilter,
    matchesQuery.isPending,
    matchesQuery.isError,
    pastCount,
    upcomingCount,
  ])

  if (!openLeagueId) return null

  const activeLeague = leagues.find((l) => l.id === openLeagueId)
  const isUefaLeaguePhase =
    openLeagueId === 'ucl' || openLeagueId === 'europa' || openLeagueId === 'conf'
  const isSegunda = openLeagueId === 'segunda'
  const isRfef = isRfefLeague(openLeagueId)

  const upcomingGroups = groupMatchesByDateLabel(filteredUpcoming)
  const pastGroups = groupMatchesByDateLabel(filteredPast)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="standings-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:items-center sm:p-4"
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-canvas shadow-2xl sm:rounded-2xl">
        {/* Cabecera */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl">{activeLeague?.flag}</span>
            <div className="min-w-0">
              <h2 id="standings-modal-title" className="truncate text-sm font-bold text-fg">
                {activeLeague?.name || 'Competición'}
              </h2>
              <p className="text-[11px] text-fg-subtle">
                {activeLeague?.country}
                {standingsQuery.data?.seasonName ? ` · ${standingsQuery.data.seasonName}` : ''}
              </p>
            </div>
          </div>
          {activeLeague && (
            <FavoriteStar
              active={favLeagueIds.includes(activeLeague.id)}
              label={activeLeague.name}
              onToggle={() => toggleLeague(activeLeague.id)}
              className="mr-2"
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar competición"
            className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-fg-muted transition-colors hover:bg-card-hover hover:text-fg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Selector de grupos para 1ª RFEF, 2ª RFEF y 3ª RFEF */}
        {rfefGroups.length > 0 && (
          <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-border bg-surface/60 px-4 py-2 [scrollbar-width:thin]">
            {rfefGroups.map((grp) => {
              const active = grp.code === activeGroupCode
              return (
                <button
                  key={grp.code}
                  type="button"
                  onClick={() => setSelectedGroup(grp.code)}
                  className={clsx(
                    'shrink-0 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer',
                    active
                      ? 'border-accent bg-accent text-canvas'
                      : 'border-border bg-card text-fg-muted hover:border-accent/40 hover:text-fg',
                  )}
                >
                  {grp.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Pestañas: Clasificación y Partidos */}
        <div className="flex shrink-0 border-b border-border bg-surface px-4 pt-1">
          {canShowTable && (
            <button
              type="button"
              onClick={() => setSelectedTab('standings')}
              className={clsx(
                'flex-1 border-b-2 py-3 text-xs font-bold transition-colors cursor-pointer',
                activeTab === 'standings'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-fg-muted hover:text-fg',
              )}
            >
              Clasificación
            </button>
          )}
          <button
            type="button"
            onClick={() => setSelectedTab('matches')}
            className={clsx(
              'flex-1 border-b-2 py-3 text-xs font-bold transition-colors cursor-pointer',
              activeTab === 'matches'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Partidos
          </button>
        </div>

        {/* Contenido scrollable */}
        <div
          ref={scrollContainerRef}
          className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 [scrollbar-width:thin]"
        >
          <div
            {...handlers}
            style={offsetX !== 0 ? { transform: `translateX(${offsetX}px)` } : undefined}
            className={clsx(
              'min-h-full touch-pan-y',
              !isDragging && 'transition-transform duration-200 ease-out',
            )}
          >
            {activeTab === 'standings' && (
            <>
              {standingsQuery.isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
                  <span className="inline-block size-3 animate-ping rounded-full bg-accent mb-3" />
                  <span>Cargando clasificación oficial...</span>
                </div>
              )}

              {standingsQuery.isError && (
                <div className="rounded-xl border border-danger/40 bg-card p-4 text-center text-xs">
                  <p className="font-semibold text-danger">
                    No se pudo cargar la clasificación en este momento.
                  </p>
                  <button
                    type="button"
                    onClick={() => standingsQuery.refetch()}
                    className="mt-3 rounded-lg bg-accent px-3 py-1.5 font-semibold text-canvas cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!standingsQuery.isPending &&
                !standingsQuery.isError &&
                standingsQuery.data &&
                standingsQuery.data.rows.length > 0 && (
                  <>
                    <div className="overflow-x-auto rounded-xl border border-border bg-card">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                            <th className="py-2.5 pl-3 pr-1.5 text-center w-9">#</th>
                            <th className="py-2.5 px-2">Equipo</th>
                            <th className="py-2.5 px-1.5 text-center" title="Partidos jugados">
                              PJ
                            </th>
                            <th
                              className="py-2.5 px-1.5 text-center hidden sm:table-cell"
                              title="Partidos ganados"
                            >
                              PG
                            </th>
                            <th
                              className="py-2.5 px-1.5 text-center hidden sm:table-cell"
                              title="Partidos empatados"
                            >
                              PE
                            </th>
                            <th
                              className="py-2.5 px-1.5 text-center hidden sm:table-cell"
                              title="Partidos perdidos"
                            >
                              PP
                            </th>
                            <th
                              className="py-2.5 px-1.5 text-center hidden md:table-cell"
                              title="Goles a favor y en contra"
                            >
                              GF:GC
                            </th>
                            <th className="py-2.5 px-1.5 text-center" title="Diferencia de goles">
                              DG
                            </th>
                            <th
                              className="py-2.5 pl-1.5 pr-3 text-center font-extrabold text-accent"
                              title="Puntos"
                            >
                              PTS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {standingsQuery.data.rows.map((row) => {
                            const isHighlighted = highlightTeamIds.includes(row.team.id)

                            return (
                              <tr
                                key={row.team.id}
                                className={clsx(
                                  'transition-colors hover:bg-surface/70',
                                  isHighlighted && 'bg-accent-soft/40',
                                )}
                              >
                                <td className="py-2 pl-3 pr-1.5 text-center">
                                  <span
                                    title={row.zoneLabel}
                                    className={clsx(
                                      'inline-flex size-5 items-center justify-center rounded-md border text-[11px] font-bold tabular-nums',
                                      zoneBadgeClass(row.zone),
                                    )}
                                  >
                                    {row.rank}
                                  </span>
                                </td>
                                <td className="py-2 px-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onOpenTeam?.(row.team, openLeagueId)
                                    }}
                                    title={`Ver ficha de ${row.team.name}`}
                                    className="group flex min-w-0 max-w-full items-center gap-2 text-left cursor-pointer"
                                  >
                                    <TeamCrest team={row.team} className="size-5" />
                                    <span
                                      className={clsx(
                                        'truncate font-medium group-hover:text-accent group-hover:underline underline-offset-2',
                                        isHighlighted ? 'font-bold text-accent' : 'text-fg',
                                      )}
                                    >
                                      {row.team.name}
                                    </span>
                                  </button>
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted">
                                  {row.played}
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                                  {row.wins}
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                                  {row.draws}
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                                  {row.losses}
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums text-fg-subtle hidden md:table-cell">
                                  {row.goalsFor}:{row.goalsAgainst}
                                </td>
                                <td className="py-2 px-1.5 text-center tabular-nums font-medium text-fg">
                                  {row.goalDiff}
                                </td>
                                <td className="py-2 pl-1.5 pr-3 text-center tabular-nums font-extrabold text-accent text-sm">
                                  {row.points}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Leyenda adaptada a la competición */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 px-1 text-[11px] text-fg-muted">
                      {isUefaLeaguePhase ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-blue-500/60" />
                            Octavos de final (1º - 8º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs (9º - 24º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Eliminado (25º - 36º)
                          </span>
                        </>
                      ) : isSegunda ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-emerald-500/60" />
                            Ascenso directo a LaLiga (1º - 2º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs de ascenso (3º - 6º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso a 1ª RFEF (19º - 22º)
                          </span>
                        </>
                      ) : openLeagueId === 'championship' ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-emerald-500/60" />
                            Ascenso directo a Premier League (1º - 2º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs de ascenso (3º - 6º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso a League One (22º - 24º)
                          </span>
                        </>
                      ) : openLeagueId === 'league_one' ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-emerald-500/60" />
                            Ascenso directo a Championship (1º - 2º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs de ascenso (3º - 6º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso a League Two (21º - 24º)
                          </span>
                        </>
                      ) : openLeagueId === 'league_two' ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-emerald-500/60" />
                            Ascenso directo a League One (1º - 3º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs de ascenso (4º - 7º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso a National League (23º - 24º)
                          </span>
                        </>
                      ) : isRfef ? (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-emerald-500/60" />
                            Ascenso directo (1º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Playoffs de ascenso (2º - 5º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-blue-500/60" />
                            Champions League (1º - 4º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-amber-500/60" />
                            Europa League (5º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-teal-500/60" />
                            Conference League (6º)
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="size-2.5 rounded-xs bg-rose-500/60" />
                            Descenso
                          </span>
                        </>
                      )}
                    </div>
                  </>
                )}
            </>
          )}

          {activeTab === 'matches' && (
            <div
              className={clsx(
                'flex flex-col gap-4',
                matchesSubFilter === 'all' &&
                  pastGroups.length > 0 &&
                  upcomingGroups.length > 0 &&
                  'pb-[35dvh]',
              )}
            >
              {matchesQuery.isPending && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
                  <span className="inline-block size-3 animate-ping rounded-full bg-accent mb-3" />
                  <span>Cargando calendario completo de la competición...</span>
                </div>
              )}

              {matchesQuery.isError && (
                <div className="rounded-xl border border-danger/40 bg-card p-4 text-center text-xs">
                  <p className="font-semibold text-danger">
                    No se pudieron cargar los partidos de la competición.
                  </p>
                  <button
                    type="button"
                    onClick={() => matchesQuery.refetch()}
                    className="mt-3 rounded-lg bg-accent px-3 py-1.5 font-semibold text-canvas cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {!matchesQuery.isPending && !matchesQuery.isError && (
                <>
                  {/* Selector de tipo de partidos y buscador rápido por club */}
                  <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface/95 p-2 backdrop-blur-xs shadow-xs">
                    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-0.5">
                      <button
                        type="button"
                        onClick={() => setMatchesSubFilter('all')}
                        className={clsx(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                          matchesSubFilter === 'all'
                            ? 'bg-accent text-canvas font-bold shadow-xs'
                            : 'text-fg-muted hover:text-fg',
                        )}
                      >
                        Todos ({allUpcoming.length + allPast.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchesSubFilter('upcoming')}
                        className={clsx(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                          matchesSubFilter === 'upcoming'
                            ? 'bg-accent text-canvas font-bold shadow-xs'
                            : 'text-fg-muted hover:text-fg',
                        )}
                      >
                        Próximos ({allUpcoming.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setMatchesSubFilter('past')}
                        className={clsx(
                          'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer',
                          matchesSubFilter === 'past'
                            ? 'bg-accent text-canvas font-bold shadow-xs'
                            : 'text-fg-muted hover:text-fg',
                        )}
                      >
                        Resultados ({allPast.length})
                      </button>
                    </div>

                    <div className="relative min-w-[140px] flex-1 sm:max-w-xs">
                      <input
                        type="text"
                        value={matchTeamQuery}
                        onChange={(e) => setMatchTeamQuery(e.target.value)}
                        placeholder="Filtrar por club..."
                        className="w-full rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-fg placeholder:text-fg-subtle focus:border-accent focus:outline-hidden"
                      />
                      {matchTeamQuery && (
                        <button
                          type="button"
                          onClick={() => setMatchTeamQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-fg-subtle hover:text-fg cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Partidos anteriores / Resultados (hacia arriba) */}
                  {matchesSubFilter !== 'upcoming' && (
                    <section className="space-y-2">
                      <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-fg-muted">
                        Resultados anteriores ({filteredPast.length})
                      </h3>
                      {pastGroups.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-fg-muted">
                          {matchTeamQuery
                            ? `No hay resultados anteriores para "${matchTeamQuery}".`
                            : 'No hay resultados anteriores registrados.'}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {pastGroups.map((group) => (
                            <div
                              key={group.dateLabel}
                              className="overflow-hidden rounded-xl border border-border bg-card"
                            >
                              <div className="bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                                {group.dateLabel}
                              </div>
                              <ul className="divide-y divide-border">
                                {group.items.map((m) => (
                                  <MatchCard
                                    key={m.id}
                                    match={m}
                                    onClick={() => {
                                      onSelectMatch?.(m)
                                    }}
                                  />
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Próximos partidos (desde la mitad hacia abajo) */}
                  {matchesSubFilter !== 'past' && (
                    <section ref={firstUpcomingRef} className="space-y-2">
                      <h3 className="px-1 text-xs font-bold uppercase tracking-wider text-accent">
                        Próximos encuentros ({filteredUpcoming.length})
                      </h3>
                      {upcomingGroups.length === 0 ? (
                        <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-fg-muted">
                          {matchTeamQuery
                            ? `No hay próximos encuentros para "${matchTeamQuery}".`
                            : 'No hay próximos encuentros programados.'}
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {upcomingGroups.map((group) => (
                            <div
                              key={group.dateLabel}
                              className="overflow-hidden rounded-xl border border-border bg-card"
                            >
                              <div className="bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                                {group.dateLabel}
                              </div>
                              <ul className="divide-y divide-border">
                                {group.items.map((m) => (
                                  <MatchCard
                                    key={m.id}
                                    match={m}
                                    onClick={() => {
                                      onSelectMatch?.(m)
                                    }}
                                  />
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

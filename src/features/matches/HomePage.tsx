import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { useFavoritesStore } from '@/features/favorites/favoritesStore'
import { useAppNavigation } from '@/features/navigation/navigationContext'
import { useHorizontalSwipe } from '@/hooks/useHorizontalSwipe'
import { toDateKey } from '@/lib/date'
import { buildMatchViewTabs, getAdjacentMatchView, type MatchView } from '@/lib/dayViews'
import { splitFavoriteMatches } from '@/lib/favorites'
import type { LeagueMatches } from '@/types'
import { DayTabs } from './components/DayTabs'
import { LeagueSection } from './components/LeagueSection'
import { MatchCard } from './components/MatchCard'
import { useMatchesByDate } from './hooks/useMatchesByDate'

function onlyLive(groups: LeagueMatches[]): LeagueMatches[] {
  return groups
    .map((g) => ({ ...g, matches: g.matches.filter((m) => m.status === 'live') }))
    .filter((g) => g.matches.length > 0)
}

/** Calcula la fecha del último domingo con jornada europea completa */
function getRecentMatchdayDate(todayIso: string): string {
  const [y, m, d] = todayIso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() - 1)
  }
  return toDateKey(date)
}

export function HomePage() {
  const [today] = useState(() => toDateKey(new Date()))
  const [view, setView] = useState<MatchView>(today)
  const { openMatch, openLeague } = useAppNavigation()

  const tabs = useMemo(() => buildMatchViewTabs(today), [today])
  const prevView = useMemo(() => getAdjacentMatchView(tabs, view, -1), [tabs, view])
  const nextView = useMemo(() => getAdjacentMatchView(tabs, view, 1), [tabs, view])

  const { offsetX, isDragging, handlers } = useHorizontalSwipe({
    canSwipePrev: prevView !== null,
    canSwipeNext: nextView !== null,
    onSwipePrev: () => {
      if (prevView) setView(prevView)
    },
    onSwipeNext: () => {
      if (nextView) setView(nextView)
    },
  })

  // Los directos son siempre de hoy. React Query comparte la caché si ambas claves coinciden.
  const todayQuery = useMatchesByDate(today, today)
  const dayQuery = useMatchesByDate(view === 'live' ? today : view, today)
  const { data, isPending, isError, isPlaceholderData, refetch } =
    view === 'live' ? todayQuery : dayQuery

  const liveGroups = useMemo(() => onlyLive(todayQuery.data ?? []), [todayQuery.data])
  const liveCount = useMemo(() => liveGroups.reduce((n, g) => n + g.matches.length, 0), [liveGroups])
  const favTeamIds = useFavoritesStore((s) => s.teamIds)
  const favLeagueIds = useFavoritesStore((s) => s.leagueIds)
  const { favoriteTeamMatches, groups } = useMemo(
    () =>
      splitFavoriteMatches(view === 'live' ? liveGroups : (data ?? []), {
        teamIds: favTeamIds,
        leagueIds: favLeagueIds,
      }),
    [view, liveGroups, data, favTeamIds, favLeagueIds],
  )

  const recentSunday = useMemo(() => getRecentMatchdayDate(today), [today])

  return (
    <div className="flex flex-col gap-4">
      <DayTabs
        value={view}
        today={today}
        liveCount={liveCount}
        tabs={tabs}
        onChange={setView}
      />

      <div className="overflow-x-hidden">
        <div
          {...handlers}
          style={offsetX !== 0 ? { transform: `translateX(${offsetX}px)` } : undefined}
          className={clsx(
            'flex min-h-[60dvh] flex-col gap-4 touch-pan-y',
            !isDragging && 'transition-transform duration-200 ease-out',
            isPlaceholderData && view !== 'live' && 'opacity-65',
          )}
        >
          {isPending && (
            <div className="flex flex-col gap-3" aria-busy="true">
              <div className="flex items-center justify-center py-4 text-xs text-accent">
                <span className="inline-block size-2 animate-ping rounded-full bg-accent mr-2" />
                Cargando partidos reales...
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-danger/40 bg-card p-4 text-sm">
              <p className="text-danger font-semibold">No se pudieron cargar los partidos.</p>
              <p className="mt-1 text-xs text-fg-subtle">
                Verifica tu conexión a Internet o intenta nuevamente.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-accent/90"
              >
                Reintentar
              </button>
            </div>
          )}

          {!isPending && !isError && groups.length === 0 && favoriteTeamMatches.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-fg-muted">
              <p className="text-base font-semibold text-fg">
                {view === 'live' ? 'No hay partidos en directo en este momento' : 'No hay partidos programados para esta fecha'}
              </p>
              <p className="mt-1 text-xs text-fg-subtle max-w-md">
                {view === 'live'
                  ? 'Cuando comience a jugarse un partido en cualquiera de las competiciones seguidas, aparecerá aquí con su marcador y minuto en vivo.'
                  : 'Las competiciones de liga juegan principalmente fines de semana y copas entre semana. Usa la lupa para consultar cualquier competición o club.'}
              </p>
              {view !== 'live' && recentSunday !== view && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setView(recentSunday)}
                    className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-canvas transition-colors cursor-pointer"
                  >
                    Ver jornada completa (Domingo con LaLiga, 2ª, 1ª/2ª/3ª RFEF, etc.)
                  </button>
                </div>
              )}
            </div>
          )}

          {favoriteTeamMatches.length > 0 && (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {favoriteTeamMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onClick={() => openMatch(match)}
                />
              ))}
            </ul>
          )}

          {groups.length > 0 && (
            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <LeagueSection
                  key={group.league.id}
                  {...group}
                  onSelectMatch={openMatch}
                  onOpenStandings={(leagueId) => openLeague(leagueId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

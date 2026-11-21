import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Match, Player, SearchResult, SquadPlayer, Team } from '@/types'
import { NavigationContext, type NavigationApi } from './navigationContext'
import { getUrlForStack, type NavEntry } from './navigationUrls'

// Las vistas superpuestas se cargan bajo demanda
const StandingsModal = lazy(() =>
  import('@/features/leagues/StandingsModal').then((m) => ({ default: m.StandingsModal })),
)
const MatchDetailModal = lazy(() =>
  import('@/features/match-detail/components/MatchDetailModal').then((m) => ({ default: m.MatchDetailModal })),
)
const PlayerDetailModal = lazy(() =>
  import('@/features/players/PlayerDetailModal').then((m) => ({ default: m.PlayerDetailModal })),
)
const SearchModal = lazy(() =>
  import('@/features/search/SearchModal').then((m) => ({ default: m.SearchModal })),
)
const TeamModal = lazy(() => import('@/features/teams/TeamModal').then((m) => ({ default: m.TeamModal })))

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<NavEntry[]>([])

  // Sincronización con la History API del navegador y Capacitor (Android)
  useEffect(() => {
    if (!history.state || !history.state.__futscore) {
      history.replaceState({ __futscore: true, depth: 0 }, '', window.location.pathname + window.location.search)
    }

    function handlePopState(e: PopStateEvent) {
      const depth = e.state && typeof e.state.depth === 'number' ? e.state.depth : 0
      setStack((prev) => (depth < prev.length ? prev.slice(0, depth) : prev))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Bloqueo de scroll en el fondo cuando hay alguna vista abierta
  useEffect(() => {
    if (stack.length > 0) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [stack.length])

  // Cierre de la vista superior delegando a history.back()
  const closeTop = useCallback(() => {
    if (stack.length > 0) {
      history.back()
    }
  }, [stack.length])

  // Apertura de una nueva vista en la pila
  const pushEntry = useCallback((entry: NavEntry) => {
    setStack((prev) => {
      // Si venimos del buscador, sustituir la entrada del buscador por la nueva
      const base = prev.filter((e) => e.type !== 'search')
      const next = [...base, entry]
      const url = getUrlForStack(next)
      history.pushState({ __futscore: true, depth: next.length }, '', url)
      return next
    })
  }, [])

  const openMatch = useCallback(
    (match: Match) => {
      pushEntry({ type: 'match', match })
    },
    [pushEntry],
  )

  const openLeague = useCallback(
    (leagueId: string, highlightTeamIds: string[] = []) => {
      pushEntry({ type: 'league', leagueId, highlightTeamIds })
    },
    [pushEntry],
  )

  const openTeam = useCallback(
    (team: Team, leagueId?: string) => {
      pushEntry({ type: 'team', teamRef: { team, leagueId } })
    },
    [pushEntry],
  )

  const openPlayer = useCallback(
    (
      player:
        | Player
        | SquadPlayer
        | { id?: string; name: string; jersey?: string; position?: string; photoUrl?: string },
      team?: Team,
      leagueId?: string,
    ) => {
      pushEntry({ type: 'player', playerRef: { player, team, leagueId } })
    },
    [pushEntry],
  )

  const openSearch = useCallback(() => {
    setStack((prev) => {
      if (prev.some((e) => e.type === 'search')) return prev
      const next: NavEntry[] = [...prev, { type: 'search' }]
      const url = getUrlForStack(next)
      history.pushState({ __futscore: true, depth: next.length }, '', url)
      return next
    })
  }, [])

  const api = useMemo<NavigationApi>(
    () => ({ openMatch, openLeague, openTeam, openPlayer, openSearch }),
    [openMatch, openLeague, openTeam, openPlayer, openSearch],
  )

  const handleSearchSelect = (result: SearchResult) => {
    if (result.kind === 'league') api.openLeague(result.id)
    else if (result.kind === 'player') api.openPlayer(result.ref.player, result.ref.team, result.ref.leagueId)
    else api.openTeam(result.ref.team, result.ref.leagueId)
  }

  return (
    <NavigationContext.Provider value={api}>
      {children}

      <Suspense fallback={null}>
        {stack.map((entry, index) => {
          const isTop = index === stack.length - 1
          const zIndex = 50 + index
          const handleClose = isTop ? closeTop : () => {}

          switch (entry.type) {
            case 'match':
              return (
                <div key={`match-${entry.match?.id}-${index}`} style={{ position: 'relative', zIndex }}>
                  <MatchDetailModal
                    match={entry.match!}
                    onClose={handleClose}
                    onOpenStandings={(leagueId, highlightTeamIds) => api.openLeague(leagueId, highlightTeamIds)}
                    onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
                    onOpenPlayer={(p, team) => api.openPlayer(p, team, entry.match!.leagueId)}
                  />
                </div>
              )
            case 'team':
              return (
                <div key={`team-${entry.teamRef?.team.id}-${index}`} style={{ position: 'relative', zIndex }}>
                  <TeamModal
                    teamRef={entry.teamRef!}
                    onClose={handleClose}
                    onSelectMatch={(m) => api.openMatch(m)}
                    onSelectPlayer={(p) => api.openPlayer(p, entry.teamRef!.team, entry.teamRef!.leagueId)}
                    onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
                    onOpenLeague={(leagueId, highlightTeamIds) => api.openLeague(leagueId, highlightTeamIds)}
                  />
                </div>
              )
            case 'player':
              return (
                <div
                  key={`player-${entry.playerRef?.player.id || entry.playerRef?.player.name}-${index}`}
                  style={{ position: 'relative', zIndex }}
                >
                  <PlayerDetailModal
                    playerRef={entry.playerRef!}
                    onClose={handleClose}
                    onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
                  />
                </div>
              )
            case 'league':
              return (
                <div key={`league-${entry.leagueId}-${index}`} style={{ position: 'relative', zIndex }}>
                  <StandingsModal
                    openLeagueId={entry.leagueId!}
                    highlightTeamIds={entry.highlightTeamIds}
                    onClose={handleClose}
                    onSelectMatch={(m) => api.openMatch(m)}
                    onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
                  />
                </div>
              )
            case 'search':
              return (
                <div key={`search-${index}`} style={{ position: 'relative', zIndex }}>
                  <SearchModal open onClose={handleClose} onSelect={handleSearchSelect} />
                </div>
              )
            default:
              return null
          }
        })}
      </Suspense>
    </NavigationContext.Provider>
  )
}

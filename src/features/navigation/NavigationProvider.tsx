import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { StandingsModal } from '@/features/leagues/StandingsModal'
import { MatchDetailModal } from '@/features/match-detail/components/MatchDetailModal'
import { PlayerDetailModal } from '@/features/players/PlayerDetailModal'
import { SearchModal } from '@/features/search/SearchModal'
import { TeamModal } from '@/features/teams/TeamModal'
import type { Match, Player, PlayerRef, SearchResult, SquadPlayer, Team, TeamRef } from '@/types'
import { NavigationContext, type NavigationApi } from './navigationContext'

/**
 * Gestiona las vistas superpuestas (buscador, competición, club, jugador y partido) para que
 * cualquier componente pueda abrirlas con `useAppNavigation()`.
 */
export function NavigationProvider({ children }: { children: ReactNode }) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [teamRef, setTeamRef] = useState<TeamRef | null>(null)
  const [playerRef, setPlayerRef] = useState<PlayerRef | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [leagueState, setLeagueState] = useState<{
    leagueId: string | null
    highlightTeamIds: string[]
  }>({ leagueId: null, highlightTeamIds: [] })

  const closeLeague = useCallback(() => setLeagueState({ leagueId: null, highlightTeamIds: [] }), [])
  const closeMatch = useCallback(() => setSelectedMatch(null), [])
  const closeTeam = useCallback(() => setTeamRef(null), [])
  const closePlayer = useCallback(() => setPlayerRef(null), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  const api = useMemo<NavigationApi>(
    () => ({
      openMatch: (match: Match) => setSelectedMatch(match),
      openLeague: (leagueId: string, highlightTeamIds: string[] = []) => {
        setSearchOpen(false)
        setTeamRef(null)
        setPlayerRef(null)
        setLeagueState({ leagueId, highlightTeamIds })
      },
      openTeam: (team: Team, leagueId?: string) => {
        setSearchOpen(false)
        setSelectedMatch(null)
        setPlayerRef(null)
        setLeagueState({ leagueId: null, highlightTeamIds: [] })
        setTeamRef({ team, leagueId })
      },
      openPlayer: (
        player: Player | SquadPlayer | { id?: string; name: string; jersey?: string; position?: string; photoUrl?: string },
        team?: Team,
        leagueId?: string,
      ) => {
        setSearchOpen(false)
        setPlayerRef({ player, team, leagueId })
      },
      openSearch: () => setSearchOpen(true),
    }),
    [],
  )

  const handleSearchSelect = (result: SearchResult) => {
    if (result.kind === 'league') api.openLeague(result.id)
    else if (result.kind === 'player') api.openPlayer(result.ref.player, result.ref.team, result.ref.leagueId)
    else api.openTeam(result.ref.team, result.ref.leagueId)
  }

  return (
    <NavigationContext.Provider value={api}>
      {children}

      <StandingsModal
        openLeagueId={leagueState.leagueId}
        highlightTeamIds={leagueState.highlightTeamIds}
        onClose={closeLeague}
        onSelectMatch={setSelectedMatch}
        onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
      />

      <TeamModal
        key={teamRef?.team.id ?? 'none'}
        teamRef={teamRef}
        onClose={closeTeam}
        onSelectMatch={setSelectedMatch}
        onSelectPlayer={(p) => api.openPlayer(p, teamRef?.team, teamRef?.leagueId)}
      />

      <MatchDetailModal
        match={selectedMatch}
        onClose={closeMatch}
        onOpenStandings={(leagueId, highlightTeamIds) => api.openLeague(leagueId, highlightTeamIds)}
        onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
        onOpenPlayer={(p, team) => api.openPlayer(p, team, selectedMatch?.leagueId)}
      />

      <PlayerDetailModal
        key={playerRef ? `${playerRef.player.id || playerRef.player.name}` : 'none'}
        playerRef={playerRef}
        onClose={closePlayer}
        onOpenTeam={(team, leagueId) => api.openTeam(team, leagueId)}
      />

      <SearchModal open={searchOpen} onClose={closeSearch} onSelect={handleSearchSelect} />
    </NavigationContext.Provider>
  )
}

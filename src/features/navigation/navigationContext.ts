import { createContext, useContext } from 'react'
import type { Match, Player, SquadPlayer, Team } from '@/types'

export interface NavigationApi {
  openMatch: (match: Match) => void
  openLeague: (leagueId: string, highlightTeamIds?: string[]) => void
  openTeam: (team: Team, leagueId?: string) => void
  openPlayer: (
    player: Player | SquadPlayer | { id?: string; name: string; jersey?: string; position?: string; photoUrl?: string },
    team?: Team,
    leagueId?: string,
  ) => void
  openSearch: () => void
}

export const NavigationContext = createContext<NavigationApi | null>(null)

export function useAppNavigation(): NavigationApi {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useAppNavigation debe usarse dentro de NavigationProvider')
  return ctx
}

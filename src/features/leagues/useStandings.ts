import { useQuery } from '@tanstack/react-query'
import { leagues } from '@/services/leagueCatalog'
import { fetchEspnLeagueMatches, fetchEspnStandings, type LeagueScheduleResult } from '@/services/real/espn'
import type { LeagueStandings } from '@/types'

const CUP_ONLY_IDS = new Set(['copadelrey', 'eflcup', 'coppaitalia', 'dfbpokal', 'friendly'])
export const STANDINGS_LEAGUES = leagues.filter((l) => !CUP_ONLY_IDS.has(l.id))

export function hasStandingsTable(leagueId: string): boolean {
  return !CUP_ONLY_IDS.has(leagueId)
}

export function useStandings(leagueId: string | null, groupCode?: string) {
  return useQuery<LeagueStandings>({
    queryKey: ['standings', leagueId, groupCode ?? 'default'],
    queryFn: () => {
      if (!leagueId) throw new Error('Sin competición seleccionada')
      return fetchEspnStandings(leagueId, fetch, groupCode)
    },
    enabled: !!leagueId && hasStandingsTable(leagueId),
    staleTime: 2 * 60_000,
  })
}

export function useLeagueMatches(leagueId: string | null, groupCode?: string) {
  return useQuery<LeagueScheduleResult>({
    queryKey: ['league-matches', leagueId, groupCode ?? 'default'],
    queryFn: () => {
      if (!leagueId) throw new Error('Sin competición seleccionada')
      return fetchEspnLeagueMatches(leagueId, fetch, groupCode)
    },
    enabled: !!leagueId,
    staleTime: 2 * 60_000,
  })
}

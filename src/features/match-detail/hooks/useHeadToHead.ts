import { useQuery } from '@tanstack/react-query'
import { getHeadToHead } from '@/services/real/h2h'
import type { HeadToHeadSummary, Match } from '@/types'

export function useHeadToHead(match: Match | null) {
  return useQuery<HeadToHeadSummary>({
    queryKey: ['h2h', match?.homeTeam.id, match?.awayTeam.id, match?.leagueId],
    queryFn: () => getHeadToHead(match!.homeTeam, match!.awayTeam, match!.leagueId),
    enabled: !!match,
    staleTime: 5 * 60_000,
  })
}

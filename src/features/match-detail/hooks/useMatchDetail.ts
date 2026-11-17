import { useQuery } from '@tanstack/react-query'
import { matchesProvider } from '@/services'
import type { Match, MatchDetail } from '@/types'

export function useMatchDetail(match: Match | null) {
  return useQuery<MatchDetail>({
    queryKey: ['matchDetail', match?.id],
    queryFn: () => matchesProvider.getMatchDetail(match!),
    enabled: !!match,
    refetchInterval: match?.status === 'live' ? 15_000 : false,
    staleTime: 10_000,
  })
}

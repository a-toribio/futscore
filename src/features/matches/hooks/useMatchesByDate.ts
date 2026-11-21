import { useQuery } from '@tanstack/react-query'
import { matchesProvider } from '@/services'

const OTHER_DAY_STALE_TIME_MS = 5 * 60_000
const TODAY_STALE_TIME_MS = 10_000
const MATCHES_CACHE_MAX_AGE_MS = 24 * 60 * 60_000

export function matchesByDateQueryOptions(date: string, today: string) {
  return {
    queryKey: ['matches', date] as const,
    queryFn: () => matchesProvider.getMatchesByDate({ date }),
    staleTime: date === today ? TODAY_STALE_TIME_MS : OTHER_DAY_STALE_TIME_MS,
    gcTime: MATCHES_CACHE_MAX_AGE_MS,
  }
}

/**
 * Partidos de un día (`YYYY-MM-DD`) agrupados por liga.
 * Solo hace polling si el día es `today`, que es cuando puede haber directos.
 */
export function useMatchesByDate(date: string, today: string) {
  const isToday = date === today

  return useQuery({
    ...matchesByDateQueryOptions(date, today),
    refetchInterval: isToday ? matchesProvider.liveRefetchMs : false,
    placeholderData: (previous) => previous,
  })
}

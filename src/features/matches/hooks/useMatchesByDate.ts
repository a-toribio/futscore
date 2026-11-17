import { useQuery } from '@tanstack/react-query'
import { matchesProvider } from '@/services'

/**
 * Partidos de un día (`YYYY-MM-DD`) agrupados por liga.
 * Solo hace polling si el día es `today`, que es cuando puede haber directos.
 */
export function useMatchesByDate(date: string, today: string) {
  const isToday = date === today

  return useQuery({
    queryKey: ['matches', date],
    queryFn: () => matchesProvider.getMatchesByDate({ date }),
    refetchInterval: isToday ? matchesProvider.liveRefetchMs : false,
    placeholderData: (previous) => previous,
  })
}

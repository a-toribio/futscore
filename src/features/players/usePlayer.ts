import { useQuery } from '@tanstack/react-query'
import { fetchPlayerProfile } from '@/services/real/players'
import type { PlayerProfile, PlayerRef } from '@/types'

export function usePlayerProfile(ref: PlayerRef | null) {
  return useQuery<PlayerProfile>({
    queryKey: ['player-profile', ref?.player.id, ref?.player.name, ref?.team?.id],
    queryFn: () => fetchPlayerProfile(ref!),
    enabled: Boolean(ref && ref.player && ref.player.name),
    staleTime: 10 * 60 * 1000,
  })
}

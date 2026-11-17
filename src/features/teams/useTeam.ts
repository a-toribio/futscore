import { useQuery } from '@tanstack/react-query'
import { fetchTeamProfile, loadTeamIndex, type TeamIndexEntry } from '@/services/real/teams'
import type { TeamProfile, TeamRef } from '@/types'

export function useTeamProfile(ref: TeamRef | null) {
  return useQuery<TeamProfile>({
    queryKey: ['team-profile', ref?.team.id ?? null],
    queryFn: () => {
      if (!ref) throw new Error('Sin club seleccionado')
      return fetchTeamProfile(ref)
    },
    enabled: !!ref,
    staleTime: 5 * 60_000,
  })
}

/** Índice de todos los clubes para el buscador (se descarga una sola vez). */
export function useTeamIndex(enabled: boolean) {
  return useQuery<TeamIndexEntry[]>({
    queryKey: ['team-index'],
    queryFn: () => loadTeamIndex(),
    enabled,
    staleTime: Infinity,
  })
}

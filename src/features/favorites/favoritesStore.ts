import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  teamIds: string[]
  leagueIds: string[]
  toggleTeam: (teamId: string) => void
  toggleLeague: (leagueId: string) => void
}

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
}

/** Equipos y competiciones favoritos (persistidos en el dispositivo). Solo sirven para ordenar. */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      teamIds: [],
      leagueIds: [],
      toggleTeam: (teamId) => set((s) => ({ teamIds: toggle(s.teamIds, teamId) })),
      toggleLeague: (leagueId) => set((s) => ({ leagueIds: toggle(s.leagueIds, leagueId) })),
    }),
    { name: 'futscore-favorites' },
  ),
)
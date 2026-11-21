import type { Match, PlayerRef, TeamRef } from '@/types'

export interface NavEntry {
  type: 'match' | 'team' | 'player' | 'league' | 'search'
  match?: Match | null
  teamRef?: TeamRef | null
  playerRef?: PlayerRef | null
  leagueId?: string | null
  highlightTeamIds?: string[]
}

/**
 * Genera la URL con parámetros de búsqueda para representar de forma única
 * el estado y la vista superior de la pila de navegación.
 */
export function getUrlForStack(entries: NavEntry[]): string {
  if (entries.length === 0) return '/'
  const top = entries[entries.length - 1]
  const params = new URLSearchParams()
  if (top.type === 'match' && top.match) {
    params.set('match', top.match.id)
  } else if (top.type === 'team' && top.teamRef) {
    params.set('team', top.teamRef.team.id)
    if (top.teamRef.leagueId) params.set('league', top.teamRef.leagueId)
  } else if (top.type === 'player' && top.playerRef) {
    params.set('player', top.playerRef.player.name)
    if (top.playerRef.team?.id) params.set('team', top.playerRef.team.id)
  } else if (top.type === 'league' && top.leagueId) {
    params.set('league', top.leagueId)
  } else if (top.type === 'search') {
    params.set('search', '1')
  }
  const q = params.toString()
  return q ? `/?${q}` : '/'
}

import type { LeagueMatches, Match } from '@/types'

export interface FavoriteIds {
  teamIds: string[]
  leagueIds: string[]
}

export function isFavoriteMatch(match: Match, fav: FavoriteIds): boolean {
  return (
    fav.leagueIds.includes(match.leagueId) ||
    fav.teamIds.includes(match.homeTeam.id) ||
    fav.teamIds.includes(match.awayTeam.id)
  )
}

/**
 * Coloca primero los partidos favoritos (de una competición o equipo marcado) sin cambiar
 * el orden relativo del resto. Las competiciones con algún favorito suben primero, y dentro
 * de cada competición los partidos favoritos van antes.
 */
export function sortByFavorites(groups: LeagueMatches[], fav: FavoriteIds): LeagueMatches[] {
  if (fav.teamIds.length === 0 && fav.leagueIds.length === 0) return groups

  const ranked = groups.map((group) => {
    const matches = [...group.matches].sort(
      (a, b) => Number(isFavoriteMatch(b, fav)) - Number(isFavoriteMatch(a, fav)),
    )
    const leagueFav = fav.leagueIds.includes(group.league.id)
    const hasFav = leagueFav || matches.some((m) => isFavoriteMatch(m, fav))
    return { group: { ...group, matches }, rank: leagueFav ? 0 : hasFav ? 1 : 2 }
  })
  // Array.prototype.sort es estable: el orden original se conserva dentro de cada rango.
  return ranked.sort((a, b) => a.rank - b.rank).map((r) => r.group)
}
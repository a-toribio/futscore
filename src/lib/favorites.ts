import type { LeagueMatches, Match } from '@/types'

export interface FavoriteIds {
  teamIds: string[]
  leagueIds: string[]
}

export function isFavoriteTeamMatch(match: Match, teamIds: string[]): boolean {
  return teamIds.includes(match.homeTeam.id) || teamIds.includes(match.awayTeam.id)
}

export function isFavoriteMatch(match: Match, fav: FavoriteIds): boolean {
  return fav.leagueIds.includes(match.leagueId) || isFavoriteTeamMatch(match, fav.teamIds)
}

/**
 * Extrae al inicio los partidos donde juega algún club favorito (primero del día, sin repetirlos
 * dentro de su competición) y ordena después las competiciones dejando primero las favoritas.
 */
export function splitFavoriteMatches(
  groups: LeagueMatches[],
  fav: FavoriteIds,
): { favoriteTeamMatches: Match[]; groups: LeagueMatches[] } {
  if (fav.teamIds.length === 0 && fav.leagueIds.length === 0) {
    return { favoriteTeamMatches: [], groups }
  }

  const favoriteTeamMatches: Match[] = []
  const remainingGroups: LeagueMatches[] = []

  for (const group of groups) {
    if (fav.teamIds.length === 0) {
      remainingGroups.push(group)
      continue
    }

    const favInGroup: Match[] = []
    const restInGroup: Match[] = []
    for (const match of group.matches) {
      if (isFavoriteTeamMatch(match, fav.teamIds)) {
        favInGroup.push(match)
      } else {
        restInGroup.push(match)
      }
    }

    favoriteTeamMatches.push(...favInGroup)
    if (restInGroup.length > 0) {
      remainingGroups.push({ ...group, matches: restInGroup })
    }
  }

  favoriteTeamMatches.sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))

  const sortedGroups =
    fav.leagueIds.length === 0
      ? remainingGroups
      : [...remainingGroups].sort(
          (a, b) =>
            Number(fav.leagueIds.includes(b.league.id)) -
            Number(fav.leagueIds.includes(a.league.id)),
        )

  return { favoriteTeamMatches, groups: sortedGroups }
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
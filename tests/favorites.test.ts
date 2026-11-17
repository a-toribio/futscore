import { describe, expect, it } from 'vitest'
import { sortByFavorites, splitFavoriteMatches } from '@/lib/favorites'
import type { LeagueMatches, Match } from '@/types'

function m(id: string, leagueId: string, home: string, away: string, kickoff = '2026-01-01T10:00:00Z'): Match {
  return {
    id,
    leagueId,
    homeTeam: { id: home, name: home, shortName: home },
    awayTeam: { id: away, name: away, shortName: away },
    kickoff,
    status: 'scheduled',
  } as Match
}
const league = (id: string) => ({ id, name: id, country: '', flag: '' })
const groups: LeagueMatches[] = [
  { league: league('a'), matches: [m('1', 'a', 'x', 'y'), m('2', 'a', 'z', 'w', '2026-01-01T14:00:00Z')] },
  { league: league('b'), matches: [m('3', 'b', 'p', 'q')] },
  { league: league('c'), matches: [m('4', 'c', 'r', 's'), m('5', 'c', 'w', 't', '2026-01-01T12:00:00Z')] },
]

describe('sortByFavorites', () => {
  it('sin favoritos no cambia nada', () => {
    expect(sortByFavorites(groups, { teamIds: [], leagueIds: [] })).toBe(groups)
  })
  it('sube la competición favorita', () => {
    const r = sortByFavorites(groups, { teamIds: [], leagueIds: ['b'] })
    expect(r.map((g) => g.league.id)).toEqual(['b', 'a', 'c'])
  })
  it('sube el equipo favorito dentro y entre competiciones', () => {
    const r = sortByFavorites(groups, { teamIds: ['w'], leagueIds: [] })
    expect(r.map((g) => g.league.id)).toEqual(['a', 'c', 'b'])
    expect(r[0].matches.map((x) => x.id)).toEqual(['2', '1'])
    expect(r[1].matches.map((x) => x.id)).toEqual(['5', '4'])
  })
})

describe('splitFavoriteMatches', () => {
  it('sin favoritos devuelve lista vacía de equipos y los grupos intactos', () => {
    const res = splitFavoriteMatches(groups, { teamIds: [], leagueIds: [] })
    expect(res.favoriteTeamMatches).toEqual([])
    expect(res.groups).toBe(groups)
  })

  it('extrae los partidos de clubes favoritos como los primeros del día sin duplicarlos en su competición', () => {
    const res = splitFavoriteMatches(groups, { teamIds: ['w'], leagueIds: [] })
    expect(res.favoriteTeamMatches.map((x) => x.id)).toEqual(['5', '2'])
    expect(res.groups.map((g) => g.league.id)).toEqual(['a', 'b', 'c'])
    expect(res.groups[0].matches.map((x) => x.id)).toEqual(['1'])
    expect(res.groups[2].matches.map((x) => x.id)).toEqual(['4'])
  })

  it('descarta la competición si todos sus partidos pertenecen a clubes favoritos', () => {
    const res = splitFavoriteMatches(groups, { teamIds: ['p'], leagueIds: [] })
    expect(res.favoriteTeamMatches.map((x) => x.id)).toEqual(['3'])
    expect(res.groups.map((g) => g.league.id)).toEqual(['a', 'c'])
  })

  it('prioriza las competiciones favoritas en los grupos restantes', () => {
    const res = splitFavoriteMatches(groups, { teamIds: ['w'], leagueIds: ['c'] })
    expect(res.favoriteTeamMatches.map((x) => x.id)).toEqual(['5', '2'])
    expect(res.groups.map((g) => g.league.id)).toEqual(['c', 'a', 'b'])
  })
})

import { describe, expect, it } from 'vitest'
import { sortByFavorites } from '@/lib/favorites'
import type { LeagueMatches, Match } from '@/types'

function m(id: string, leagueId: string, home: string, away: string): Match {
  return {
    id,
    leagueId,
    homeTeam: { id: home, name: home, shortName: home },
    awayTeam: { id: away, name: away, shortName: away },
    kickoff: '2026-01-01T10:00:00Z',
    status: 'scheduled',
  } as Match
}
const league = (id: string) => ({ id, name: id, country: '', flag: '' })
const groups: LeagueMatches[] = [
  { league: league('a'), matches: [m('1', 'a', 'x', 'y'), m('2', 'a', 'z', 'w')] },
  { league: league('b'), matches: [m('3', 'b', 'p', 'q')] },
  { league: league('c'), matches: [m('4', 'c', 'r', 's'), m('5', 'c', 'w', 't')] },
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
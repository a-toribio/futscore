import { describe, expect, it } from 'vitest'
import { fetchTeamProfile, loadTeamIndex } from '@/services/real/teams'

/** Pruebas contra APIs reales. Solo con `LIVE_TESTS=1`. */
describe.skipIf(!process.env.LIVE_TESTS)('Fichas de club (APIs reales)', () => {
  it('índice de clubes incluye ESPN y RFEF', async () => {
    const idx = await loadTeamIndex()
    expect(idx.length).toBeGreaterThan(300)
    expect(idx.some((e) => e.ref.team.id.startsWith('rfef-'))).toBe(true)
    expect(idx.some((e) => e.ref.team.name === 'Real Madrid')).toBe(true)
  }, 60_000)

  it('ficha ESPN: Real Madrid', async () => {
    const p = await fetchTeamProfile({ team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' }, leagueId: 'ucl' })
    console.log(JSON.stringify({ ...p, squad: p.squad.slice(0, 3), pastMatches: p.pastMatches.slice(0, 2), upcomingMatches: p.upcomingMatches.slice(0, 2) }, null, 1))
    expect(p.squad.length).toBeGreaterThan(15)
    expect(p.leagueId).toBe('laliga')
    expect(p.venue?.name).toBeTruthy()
    expect(p.pastMatches.length + p.upcomingMatches.length).toBeGreaterThan(0)
  }, 60_000)

  it('ficha RFEF: CD Lugo', async () => {
    const p = await fetchTeamProfile({ team: { id: 'rfef-cd-lugo', name: 'CD Lugo', shortName: 'LUG' }, leagueId: 'primera_rfef' })
    console.log(JSON.stringify({ ...p, squad: p.squad.slice(0, 3), pastMatches: p.pastMatches.slice(0, 2), upcomingMatches: p.upcomingMatches.slice(0, 2) }, null, 1))
    expect(p.venue?.name).toBe('Anxo Carro')
    expect(p.squad.length).toBeGreaterThan(10)
    expect(p.pastMatches.length).toBeGreaterThan(5)
  }, 60_000)
})

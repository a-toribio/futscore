import { describe, expect, it } from 'vitest'
import { toDateKey } from '@/lib/date'
import { createMockMatchesProvider } from '@/services/mock/mockMatchesProvider'

function setup() {
  let t = new Date(2026, 10, 10, 12, 0, 0).getTime()
  const provider = createMockMatchesProvider({
    tickMs: 1000,
    latencyMs: 0,
    now: () => new Date(t),
    rng: () => 0.99, // sin goles
  })
  return { provider, advance: (ms: number) => (t += ms), today: toDateKey(new Date(t)) }
}

describe('mockMatchesProvider', () => {
  it('agrupa por liga y solo devuelve ligas con partidos', async () => {
    const { provider, today } = setup()
    const groups = await provider.getMatchesByDate({ date: today })
    expect(groups.map((g) => g.league.id)).toEqual(['ucl', 'laliga', 'premier', 'seriea', 'bundesliga', 'ligue1'])
    for (const g of groups) expect(g.matches.every((m) => m.leagueId === g.league.id)).toBe(true)
  })

  it('hoy contiene directos, terminados y programados', async () => {
    const { provider, today } = setup()
    const statuses = new Set((await provider.getMatchesByDate({ date: today })).flatMap((g) => g.matches.map((m) => m.status)))
    expect(statuses).toEqual(new Set(['live', 'finished', 'scheduled']))
  })

  it('filtra por estado', async () => {
    const { provider, today } = setup()
    const groups = await provider.getMatchesByDate({ date: today, status: 'live' })
    expect(groups.flatMap((g) => g.matches).every((m) => m.status === 'live')).toBe(true)
  })

  it('avanza los minutos según el tiempo transcurrido', async () => {
    const { provider, advance } = setup()
    const before = (await provider.getLiveMatches()).find((m) => m.id === 't1')!
    advance(5000) // 5 ticks
    const after = (await provider.getLiveMatches()).find((m) => m.id === 't1')!
    expect(after.minute).toBe(before.minute! + 5)
  })

  it('un partido programado a segundos pasa a directo', async () => {
    const { provider, advance } = setup()
    expect((await provider.getLiveMatches()).some((m) => m.id === 't9')).toBe(false)
    advance(30_000)
    expect((await provider.getLiveMatches()).some((m) => m.id === 't9')).toBe(true)
  })
})

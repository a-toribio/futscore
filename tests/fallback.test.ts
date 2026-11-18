import { describe, expect, it, vi } from 'vitest'
import { ProviderError } from '@/services/errors'
import { createFallbackProvider, type SourceInfo } from '@/services/fallbackProvider'
import type { MatchesProvider } from '@/services/matchesProvider'
import { createRealProvider } from '@/services/real/createRealProvider'
import type { Match } from '@/types'

const group = [{ league: { id: 'x', name: 'X', country: 'Y' }, matches: [] }]

const ok = (): MatchesProvider => ({
  liveRefetchMs: 1000,
  getMatchesByDate: vi.fn().mockResolvedValue(group),
  getLiveMatches: vi.fn().mockResolvedValue([]),
  getMatchDetail: vi.fn().mockResolvedValue({} as any),
})
const failing = (error: Error): MatchesProvider => ({
  liveRefetchMs: 1000,
  getMatchesByDate: vi.fn().mockRejectedValue(error),
  getLiveMatches: vi.fn().mockRejectedValue(error),
  getMatchDetail: vi.fn().mockRejectedValue(error),
})

describe('createFallbackProvider', () => {
  it('usa la primera fuente si funciona y no toca las demás', async () => {
    const [a, b] = [ok(), ok()]
    const onSourceChange = vi.fn()
    const provider = createFallbackProvider([{ name: 'A', provider: a }, { name: 'B', provider: b }], { onSourceChange })
    await provider.getMatchesByDate({ date: '2026-11-10' })
    expect(b.getMatchesByDate).not.toHaveBeenCalled()
    expect(onSourceChange).toHaveBeenCalledWith({ name: 'A', simulated: false, degraded: false, reason: undefined })
  })

  it('pasa a la siguiente fuente si falla y avisa del motivo', async () => {
    const sources: SourceInfo[] = []
    const provider = createFallbackProvider(
      [
        { name: 'A', provider: failing(new ProviderError('http', 'HTTP 500')) },
        { name: 'B', provider: ok() },
      ],
      { onSourceChange: (s) => sources.push(s) },
    )
    await expect(provider.getMatchesByDate({ date: '2026-11-10' })).resolves.toEqual(group)
    expect(sources[0]).toMatchObject({ name: 'B', degraded: true, reason: 'A: HTTP 500' })
  })

  it('aparta una fuente caída durante el cooldown y la reintenta después', async () => {
    let t = 0
    const a = failing(new ProviderError('http', 'boom'))
    const provider = createFallbackProvider([{ name: 'A', provider: a }, { name: 'B', provider: ok() }], { cooldownMs: 1000, now: () => t })

    await provider.getMatchesByDate({ date: 'd' })
    await provider.getMatchesByDate({ date: 'd' })
    expect(a.getMatchesByDate).toHaveBeenCalledTimes(1)

    t = 1500
    await provider.getMatchesByDate({ date: 'd' })
    expect(a.getMatchesByDate).toHaveBeenCalledTimes(2)
  })

  it('aparta más tiempo una fuente sin cuota', async () => {
    let t = 0
    const a = failing(new ProviderError('quota', '429'))
    const provider = createFallbackProvider([{ name: 'A', provider: a }, { name: 'B', provider: ok() }], { cooldownMs: 1000, quotaCooldownMs: 100_000, now: () => t })

    await provider.getMatchesByDate({ date: 'd' })
    t = 50_000
    await provider.getMatchesByDate({ date: 'd' })
    expect(a.getMatchesByDate).toHaveBeenCalledTimes(1)
  })

  it('marca como simulados los datos del mock final', async () => {
    const sources: SourceInfo[] = []
    const provider = createFallbackProvider(
      [
        { name: 'A', provider: failing(new ProviderError('network', 'offline')) },
        { name: 'Mock', provider: ok(), simulated: true },
      ],
      { onSourceChange: (s) => sources.push(s) },
    )
    await provider.getLiveMatches()
    expect(sources[0]).toMatchObject({ name: 'Mock', simulated: true, degraded: true })
  })

  it('no repite avisos mientras la fuente activa no cambia', async () => {
    const onSourceChange = vi.fn()
    const provider = createFallbackProvider([{ name: 'A', provider: ok() }], { onSourceChange })
    await provider.getLiveMatches()
    await provider.getLiveMatches()
    expect(onSourceChange).toHaveBeenCalledTimes(1)
  })
})

describe('createRealProvider', () => {
  const NOW = new Date(2026, 10, 10, 12, 0, 0)
  const match = (id: string, leagueId: string, hour: number, status: Match['status'] = 'scheduled'): Match => ({
    id,
    leagueId,
    homeTeam: { id: 'h', name: 'H', shortName: 'H' },
    awayTeam: { id: 'a', name: 'A', shortName: 'A' },
    kickoff: new Date(2026, 10, 10, hour).toISOString(),
    status,
    score: status === 'scheduled' ? null : { home: 0, away: 0 },
  })

  it('agrupa por liga en el orden del catálogo, filtra por día y ordena por hora', async () => {
    const fetchMatches = vi.fn().mockResolvedValue([
      match('b', 'laliga', 21),
      match('a', 'laliga', 18),
      match('c', 'ucl', 20),
      { ...match('old', 'laliga', 12), kickoff: new Date(2026, 10, 9, 12).toISOString() },
      match('unknown', 'mls', 20),
    ])
    const provider = createRealProvider({ name: 'T', fetchMatches, liveRefetchMs: 1, ttlMs: { today: 1000, other: 1000 }, now: () => NOW })
    const groups = await provider.getMatchesByDate({ date: '2026-11-10' })
    expect(groups.map((g) => g.league.id)).toEqual(['laliga', 'ucl'])
    expect(groups[0].matches.map((m) => m.id)).toEqual(['a', 'b'])
  })

  it('cachea dentro del TTL y vuelve a pedir pasado el TTL', async () => {
    let t = NOW.getTime()
    const fetchMatches = vi.fn().mockResolvedValue([])
    const provider = createRealProvider({ name: 'T', fetchMatches, liveRefetchMs: 1, ttlMs: { today: 1000, other: 1000 }, now: () => new Date(t) })
    await provider.getMatchesByDate({ date: '2026-11-10' })
    await provider.getLiveMatches()
    expect(fetchMatches).toHaveBeenCalledTimes(1)
    t += 1500
    await provider.getLiveMatches()
    expect(fetchMatches).toHaveBeenCalledTimes(2)
  })

  it('no cachea los fallos', async () => {
    const fetchMatches = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue([])
    const provider = createRealProvider({ name: 'T', fetchMatches, liveRefetchMs: 1, ttlMs: { today: 60_000, other: 60_000 }, now: () => NOW })
    await expect(provider.getLiveMatches()).rejects.toThrow('x')
    await expect(provider.getLiveMatches()).resolves.toEqual([])
  })

  it('getLiveMatches devuelve solo los directos', async () => {
    const fetchMatches = vi.fn().mockResolvedValue([match('l', 'ucl', 11, 'live'), match('f', 'ucl', 9, 'finished')])
    const provider = createRealProvider({ name: 'T', fetchMatches, liveRefetchMs: 1, ttlMs: { today: 1000, other: 1000 }, now: () => NOW })
    expect((await provider.getLiveMatches()).map((m) => m.id)).toEqual(['l'])
  })
})

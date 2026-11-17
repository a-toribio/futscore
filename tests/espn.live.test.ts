import { describe, expect, it } from 'vitest'
import { createEspnProvider } from '@/services/real/espn'

/**
 * Prueba contra la API real de ESPN. Solo se ejecuta con `LIVE_TESTS=1`:
 *   $env:LIVE_TESTS=1; npm test
 */
describe.skipIf(!process.env.LIVE_TESTS)('ESPN (API real)', () => {
  const provider = createEspnProvider()

  it('devuelve partidos reales de Copa del Rey para hoy (10 nov 2026)', async () => {
    const groups = await provider.getMatchesByDate({ date: '2026-11-10' })
    expect(groups.length).toBeGreaterThan(0)
    const copa = groups.find((g) => g.league.id === 'copadelrey')
    expect(copa).toBeDefined()
    expect(copa?.matches.length).toBeGreaterThanOrEqual(6)
    expect(copa?.matches.some((m) => m.awayTeam.name.includes('Alavés'))).toBe(true)
  }, 30_000)

  it('obtiene el detalle ampliado (estadio, tv, alineaciones) de un partido real', async () => {
    const groups = await provider.getMatchesByDate({ date: '2026-11-10' })
    const copa = groups.find((g) => g.league.id === 'copadelrey')!
    const match = copa.matches[0]
    const detail = await provider.getMatchDetail(match)

    expect(detail).toBeDefined()
    expect(detail.match.id).toBe(match.id)
    expect(detail.info.venue?.name).toBeTruthy()
  }, 30_000)

  it('devuelve partidos reales de liga para el domingo pasado (8 nov 2026)', async () => {
    const groups = await provider.getMatchesByDate({ date: '2026-11-08' })
    expect(groups.length).toBeGreaterThanOrEqual(5)
    const laliga = groups.find((g) => g.league.id === 'laliga')
    expect(laliga).toBeDefined()
    expect(laliga?.matches.length).toBeGreaterThan(0)
  }, 30_000)
})

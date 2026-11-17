import { describe, expect, it } from 'vitest'
import { areSameTeamH2H, getHeadToHead, normalizeTeamNameForH2H } from '../src/services/real/h2h'
import type { Team } from '../src/types'

describe('Head-to-Head (H2H)', () => {
  it('normaliza nombres de clubes para matching tolerante', () => {
    expect(normalizeTeamNameForH2H('Real Madrid CF')).toBe('realmadrid')
    expect(normalizeTeamNameForH2H('FC Barcelona')).toBe('barcelona')
    expect(normalizeTeamNameForH2H('Club Atlético de Madrid S.A.D.')).toBe('atleticodemadrid')
    expect(normalizeTeamNameForH2H('Real Betis Balompié')).toBe('realbetis')
  })

  it('identifica correctamente si dos nombres corresponden al mismo club', () => {
    expect(areSameTeamH2H('Real Madrid', 'Real Madrid CF')).toBe(true)
    expect(areSameTeamH2H('FC Barcelona', 'Barcelona')).toBe(true)
    expect(areSameTeamH2H('Sevilla FC', 'Sevilla')).toBe(true)
    expect(areSameTeamH2H('Real Madrid', 'FC Barcelona')).toBe(false)
  })

  it('calcula el balance exacto y los últimos 5 partidos entre Real Madrid y Barcelona', async () => {
    const realMadrid: Team = { id: 'rm', name: 'Real Madrid', shortName: 'RMA' }
    const barcelona: Team = { id: 'fcb', name: 'FC Barcelona', shortName: 'BAR' }

    const h2h = await getHeadToHead(realMadrid, barcelona)

    expect(h2h.totalMatches).toBe(5)
    expect(h2h.recentMatches).toHaveLength(5)
    // El partido más reciente fue el 26-10-2024 (0-4 para Barça)
    expect(h2h.recentMatches[0].date).toBe('2024-10-26')
    expect(h2h.recentMatches[0].score).toEqual({ home: 0, away: 4 })

    // Comprobar la suma de victorias + empates
    expect(h2h.homeWins + h2h.draws + h2h.awayWins).toBe(5)
    expect(h2h.homeGoals).toBeGreaterThan(0)
    expect(h2h.awayGoals).toBeGreaterThan(0)
    expect(h2h.avgGoals).toBeGreaterThan(0)
  })

  it('encuentra enfrentamientos históricos entre otros clubes como Real Sociedad y Villarreal', async () => {
    const laReal: Team = { id: 'rso', name: 'Real Sociedad', shortName: 'RSO' }
    const villarreal: Team = { id: 'vil', name: 'Villarreal CF', shortName: 'VIL' }

    const h2h = await getHeadToHead(laReal, villarreal)

    expect(h2h.totalMatches).toBe(5)
    expect(h2h.recentMatches).toHaveLength(5)
    expect(h2h.homeWins + h2h.draws + h2h.awayWins).toBe(5)
  })

  it('soporta clubes que se han enfrentado menos de 5 veces mostrando todos los partidos registrados', async () => {
    // Getafe y Leganés
    const getafe: Team = { id: 'get', name: 'Getafe CF', shortName: 'GET' }
    const leganes: Team = { id: 'leg', name: 'CD Leganés', shortName: 'LEG' }

    const h2h = await getHeadToHead(getafe, leganes)

    expect(h2h.totalMatches).toBeGreaterThanOrEqual(1)
    expect(h2h.totalMatches).toBeLessThanOrEqual(5)
    expect(h2h.recentMatches.length).toBe(h2h.totalMatches)
  })

  it('invierte la perspectiva relativa cuando cambia el equipo local', async () => {
    const realMadrid: Team = { id: 'rm', name: 'Real Madrid', shortName: 'RMA' }
    const barcelona: Team = { id: 'fcb', name: 'FC Barcelona', shortName: 'BAR' }

    const h2hRMHome = await getHeadToHead(realMadrid, barcelona)
    const h2hFCBHome = await getHeadToHead(barcelona, realMadrid)

    expect(h2hRMHome.homeWins).toBe(h2hFCBHome.awayWins)
    expect(h2hRMHome.awayWins).toBe(h2hFCBHome.homeWins)
    expect(h2hRMHome.homeGoals).toBe(h2hFCBHome.awayGoals)
    expect(h2hRMHome.awayGoals).toBe(h2hFCBHome.homeGoals)
    expect(h2hRMHome.draws).toBe(h2hFCBHome.draws)
  })

  it('devuelve estructura vacía coherente si nunca se han enfrentado en la historia', async () => {
    const teamA: Team = { id: 't1', name: 'Club Inédito A', shortName: 'CIA' }
    const teamB: Team = { id: 't2', name: 'Club Inédito B', shortName: 'CIB' }

    const h2h = await getHeadToHead(teamA, teamB)

    expect(h2h.totalMatches).toBe(0)
    expect(h2h.homeWins).toBe(0)
    expect(h2h.draws).toBe(0)
    expect(h2h.awayWins).toBe(0)
    expect(h2h.homeGoals).toBe(0)
    expect(h2h.awayGoals).toBe(0)
    expect(h2h.recentMatches).toEqual([])
    expect(h2h.avgGoals).toBe(0)
  })
})

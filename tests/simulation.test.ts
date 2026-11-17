import { describe, expect, it } from 'vitest'
import type { Match } from '@/types'
import { HALFTIME_TICKS, tickSimulation, type SimulationState } from '@/services/mock/simulation'

const team = (id: string) => ({ id, name: id, shortName: id.toUpperCase() })
const base = { leagueId: 'x', homeTeam: team('a'), awayTeam: team('b') }
const NOW = new Date('2026-11-10T12:00:00Z')
/** rng que nunca marca gol. */
const noGoal = () => 0.99

const stateOf = (...matches: Match[]): SimulationState => ({ matches, halftimeLeft: {} })

const live = (over: Partial<Match> = {}): Match => ({
  ...base,
  id: 'm',
  kickoff: NOW.toISOString(),
  status: 'live',
  score: { home: 0, away: 0 },
  minute: 10,
  phase: 'first_half',
  ...over,
})

describe('tickSimulation', () => {
  it('avanza un minuto sin goles', () => {
    const next = tickSimulation(stateOf(live()), NOW, noGoal).matches[0]
    expect(next.minute).toBe(11)
    expect(next.score).toEqual({ home: 0, away: 0 })
  })

  it('marca gol local o visitante según el rng', () => {
    expect(tickSimulation(stateOf(live()), NOW, () => 0).matches[0].score).toEqual({ home: 1, away: 0 })
    expect(tickSimulation(stateOf(live()), NOW, () => 0.02).matches[0].score).toEqual({ home: 0, away: 1 })
  })

  it('no muta el estado de entrada', () => {
    const state = stateOf(live())
    tickSimulation(state, NOW, () => 0)
    expect(state.matches[0].minute).toBe(10)
    expect(state.matches[0].score).toEqual({ home: 0, away: 0 })
  })

  it('pasa al descanso en el 45 y lo reanuda tras HALFTIME_TICKS', () => {
    let state = tickSimulation(stateOf(live({ minute: 45 })), NOW, noGoal)
    expect(state.matches[0].phase).toBe('half_time')

    for (let i = 0; i < HALFTIME_TICKS - 1; i++) state = tickSimulation(state, NOW, noGoal)
    expect(state.matches[0].phase).toBe('half_time')

    state = tickSimulation(state, NOW, noGoal)
    expect(state.matches[0].phase).toBe('second_half')
    expect(state.matches[0].minute).toBe(46)
  })

  it('termina el partido en el 90 y limpia minuto y fase', () => {
    const done = tickSimulation(stateOf(live({ minute: 90, phase: 'second_half' })), NOW, noGoal).matches[0]
    expect(done.status).toBe('finished')
    expect(done.minute).toBeUndefined()
    expect(done.phase).toBeUndefined()
  })

  it('inicia un partido programado cuando llega su hora', () => {
    const scheduled: Match = { ...base, id: 's', status: 'scheduled', score: null, kickoff: NOW.toISOString() }
    const later: Match = { ...scheduled, id: 'l', kickoff: new Date(NOW.getTime() + 60_000).toISOString() }
    const [started, waiting] = tickSimulation(stateOf(scheduled, later), NOW, noGoal).matches
    expect(started).toMatchObject({ status: 'live', minute: 1, phase: 'first_half', score: { home: 0, away: 0 } })
    expect(waiting.status).toBe('scheduled')
  })

  it('no toca los partidos terminados', () => {
    const finished: Match = { ...base, id: 'f', kickoff: NOW.toISOString(), status: 'finished', score: { home: 2, away: 1 } }
    expect(tickSimulation(stateOf(finished), NOW, () => 0).matches[0]).toEqual(finished)
  })
})

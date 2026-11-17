import type { Match } from '@/types'

/** Ticks que dura el descanso. */
export const HALFTIME_TICKS = 4
/** Probabilidad de gol por tick y equipo (~2.7 goles por partido). */
export const GOAL_PROBABILITY = 0.015

export interface SimulationState {
  matches: Match[]
  /** Ticks restantes de descanso por id de partido. */
  halftimeLeft: Record<string, number>
}

export type Rng = () => number

/**
 * Avanza la simulación un tick (= 1 minuto de juego). Función pura:
 * no muta el estado recibido, lo que la hace fácil de testear.
 */
export function tickSimulation(
  state: SimulationState,
  now: Date,
  rng: Rng = Math.random,
): SimulationState {
  const halftimeLeft = { ...state.halftimeLeft }

  const matches = state.matches.map((match): Match => {
    // Programado → directo cuando llega su hora.
    if (match.status === 'scheduled') {
      if (Date.parse(match.kickoff) > now.getTime()) return match
      return { ...match, status: 'live', score: { home: 0, away: 0 }, minute: 1, phase: 'first_half' }
    }

    if (match.status !== 'live' || !match.score || match.minute === undefined) return match

    // Descanso.
    if (match.phase === 'half_time') {
      const left = (halftimeLeft[match.id] ?? HALFTIME_TICKS) - 1
      if (left > 0) {
        halftimeLeft[match.id] = left
        return match
      }
      delete halftimeLeft[match.id]
      return { ...match, phase: 'second_half', minute: 46 }
    }

    // Fin de la primera parte.
    if (match.phase === 'first_half' && match.minute >= 45) {
      halftimeLeft[match.id] = HALFTIME_TICKS
      return { ...match, phase: 'half_time', minute: 45 }
    }

    // Final del partido.
    if (match.minute >= 90) {
      return { id: match.id, leagueId: match.leagueId, homeTeam: match.homeTeam, awayTeam: match.awayTeam, kickoff: match.kickoff, status: 'finished', score: match.score }
    }

    // Minuto normal, con posibilidad de gol.
    const r = rng()
    const score = { ...match.score }
    if (r < GOAL_PROBABILITY) score.home += 1
    else if (r < GOAL_PROBABILITY * 2) score.away += 1

    return { ...match, minute: match.minute + 1, score }
  })

  return { matches, halftimeLeft }
}

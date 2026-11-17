import { buildSeedMatches } from '@/mocks/data/matches'
import { leagues } from '@/services/leagueCatalog'
import { toDateKey } from '@/lib/date'
import type { GetMatchesParams, MatchesProvider } from '@/services/matchesProvider'
import type { LeagueMatches, Match, MatchDetail } from '@/types'
import { createDefaultMatchDetail } from '@/services/real/createRealProvider'
import { tickSimulation, type Rng, type SimulationState } from './simulation'

export interface MockProviderOptions {
  /** Duración real de un tick (1 minuto de juego). */
  tickMs?: number
  /** Latencia simulada de red. */
  latencyMs?: number
  now?: () => Date
  rng?: Rng
}

/** Máximo de ticks a recuperar tras una pausa larga (pestaña en segundo plano). */
const MAX_CATCHUP_TICKS = 120

/**
 * Provider con datos locales. La simulación avanza de forma perezosa:
 * cada llamada calcula cuántos ticks han transcurrido desde la anterior,
 * así no hay timers que limpiar y el estado es coherente entre consultas.
 */
export function createMockMatchesProvider(options: MockProviderOptions = {}): MatchesProvider {
  const { tickMs = 2000, latencyMs = 150, now = () => new Date(), rng = Math.random } = options

  let state: SimulationState = { matches: buildSeedMatches(now()), halftimeLeft: {} }
  let lastTickAt = now().getTime()

  function advance(): Match[] {
    const current = now()
    const elapsed = Math.floor((current.getTime() - lastTickAt) / tickMs)
    if (elapsed > 0) {
      const ticks = Math.min(elapsed, MAX_CATCHUP_TICKS)
      for (let i = 0; i < ticks; i++) state = tickSimulation(state, current, rng)
      lastTickAt = elapsed > MAX_CATCHUP_TICKS ? current.getTime() : lastTickAt + ticks * tickMs
    }
    return state.matches
  }

  const delay = () => new Promise<void>((resolve) => setTimeout(resolve, latencyMs))

  return {
    liveRefetchMs: tickMs,

    async getMatchesByDate({ date, status }: GetMatchesParams): Promise<LeagueMatches[]> {
      await delay()
      const day = advance().filter(
        (m) => toDateKey(new Date(m.kickoff)) === date && (!status || m.status === status),
      )
      return leagues
        .map((league) => ({
          league,
          matches: day
            .filter((m) => m.leagueId === league.id)
            .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff)),
        }))
        .filter((group) => group.matches.length > 0)
    },

    async getLiveMatches(): Promise<Match[]> {
      await delay()
      return advance().filter((m) => m.status === 'live')
    },

    async getMatchDetail(match: Match): Promise<MatchDetail> {
      await delay()
      return createDefaultMatchDetail(match)
    },
  }
}

import { notifyMatchesUpdated } from '@/services/updates'
import { toDateKey } from '@/lib/date'
import type { GetMatchesParams, MatchesProvider } from '@/services/matchesProvider'
import { leagues } from '@/services/leagueCatalog'
import type { LeagueMatches, Match, MatchDetail } from '@/types'

export interface RealProviderConfig {
  name: string
  /** Descarga los partidos de las competiciones soportadas para un día (`YYYY-MM-DD`). */
  /**
   * onLate avisa de que llegaron datos tardíos (fuentes lentas que no se esperaron):
   * invalida la caché del día y notifica a la UI para refrescar.
   */
  fetchMatches: (date: string, onLate?: () => void) => Promise<Match[]>
  fetchMatchDetail?: (match: Match) => Promise<MatchDetail>
  liveRefetchMs: number
  /** Tiempo de vida de la caché: protege la cuota de la API. */
  ttlMs: { today: number; other: number }
  now?: () => Date
}

/** Deriva siglas de 3 letras cuando la API no las ofrece (usa la palabra más larga). */
export function deriveShortName(name: string): string {
  const longest = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z ]/g, '')
    .split(/\s+/)
    .reduce((best, word) => (word.length > best.length ? word : best), '')
  return longest.slice(0, 3).toUpperCase()
}

/** Construye una estructura básica de detalle cuando una fuente no tiene eventos ampliados. */
export function createDefaultMatchDetail(match: Match): MatchDetail {
  return {
    match,
    events: [],
    stats: [],
    lineups: {
      home: { team: match.homeTeam, starters: [], substitutes: [] },
      away: { team: match.awayTeam, starters: [], substitutes: [] },
    },
    info: {
      venue: { name: 'Estadio por confirmar' },
      round: 'Partido regular',
    },
  }
}

/**
 * Construye un `MatchesProvider` a partir de una función que descarga los partidos de un día.
 * Aporta caché con TTL (deduplicando peticiones en curso), filtro por día local y estado,
 * y agrupación por liga siguiendo el orden del catálogo.
 */
export function createRealProvider(config: RealProviderConfig): MatchesProvider {
  const { fetchMatches, fetchMatchDetail, liveRefetchMs, ttlMs, now = () => new Date() } = config
  const cache = new Map<string, { at: number; promise: Promise<Match[]> }>()
  const detailCache = new Map<string, { at: number; promise: Promise<MatchDetail> }>()

  function load(date: string): Promise<Match[]> {
    const current = now()
    const ttl = date === toDateKey(current) ? ttlMs.today : ttlMs.other
    const hit = cache.get(date)
    if (hit && current.getTime() - hit.at < ttl) return hit.promise

    const promise = fetchMatches(date, () => {
      cache.delete(date)
      notifyMatchesUpdated(date)
    })
    cache.set(date, { at: current.getTime(), promise })
    promise.catch(() => {
      if (cache.get(date)?.promise === promise) cache.delete(date)
    })
    return promise
  }

  return {
    liveRefetchMs,

    async getMatchesByDate({ date, status }: GetMatchesParams): Promise<LeagueMatches[]> {
      const day = (await load(date)).filter(
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
      const matches = await load(toDateKey(now()))
      return matches.filter((m) => m.status === 'live')
    },

    async getMatchDetail(match: Match): Promise<MatchDetail> {
      if (!fetchMatchDetail) {
        return createDefaultMatchDetail(match)
      }
      const current = now()
      const hit = detailCache.get(match.id)
      const ttl = match.status === 'live' ? 10_000 : 5 * 60_000
      if (hit && current.getTime() - hit.at < ttl) return hit.promise

      const promise = fetchMatchDetail(match)
      detailCache.set(match.id, { at: current.getTime(), promise })
      promise.catch(() => {
        if (detailCache.get(match.id)?.promise === promise) detailCache.delete(match.id)
      })
      return promise
    },
  }
}

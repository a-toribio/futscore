import { fetchJson, ProviderError, type FetchFn } from '@/services/errors'
import { leagueCatalog } from '@/services/leagueCatalog'
import type { MatchesProvider } from '@/services/matchesProvider'
import type { LivePhase, Match } from '@/types'
import { createRealProvider, deriveShortName } from './createRealProvider'

interface FootballDataTeam {
  id?: number
  name?: string
  shortName?: string
  tla?: string
  crest?: string
}
interface FootballDataMatch {
  id?: number
  utcDate?: string
  status?: string
  minute?: number | string | null
  competition?: { code?: string }
  homeTeam?: FootballDataTeam
  awayTeam?: FootballDataTeam
  score?: { fullTime?: { home?: number | null; away?: number | null } }
}
interface FootballDataResponse {
  matches?: FootballDataMatch[]
}

/** Estima el minuto cuando el plan gratuito no lo incluye (descuenta ~15 min de descanso). */
export function estimateLiveMinute(kickoffIso: string, nowMs: number): { minute: number; phase: LivePhase } {
  const elapsed = Math.floor((nowMs - Date.parse(kickoffIso)) / 60_000)
  if (elapsed <= 45) return { minute: Math.max(1, elapsed), phase: 'first_half' }
  return { minute: Math.min(90, Math.max(46, elapsed - 15)), phase: 'second_half' }
}

/** Convierte un partido de football-data.org en `Match`; `null` si no aplica. */
export function mapFootballDataMatch(item: FootballDataMatch, nowMs = Date.now()): Match | null {
  const leagueId = leagueCatalog.find((l) => l.sources.footballData === item.competition?.code)?.id
  const { homeTeam: home, awayTeam: away, status } = item
  if (!leagueId || !item.id || !item.utcDate || !status || !home?.name || !away?.name) return null

  const team = (t: FootballDataTeam) => ({
    id: `fd-${t.id ?? t.name}`,
    name: t.name ?? 'Equipo',
    shortName: t.tla ?? deriveShortName(t.name ?? ''),
    logoUrl: t.crest,
  })
  const base = {
    id: `fd-${item.id}`,
    leagueId,
    homeTeam: team(home),
    awayTeam: team(away),
    kickoff: new Date(item.utcDate).toISOString(),
  }
  const score = {
    home: item.score?.fullTime?.home ?? 0,
    away: item.score?.fullTime?.away ?? 0,
  }

  switch (status) {
    case 'SCHEDULED':
    case 'TIMED':
      return { ...base, status: 'scheduled', score: null }
    case 'FINISHED':
    case 'AWARDED':
      return { ...base, status: 'finished', score }
    case 'PAUSED':
      return { ...base, status: 'live', score, phase: 'half_time', minute: 45 }
    case 'IN_PLAY':
    case 'LIVE': {
      const given = Number.parseInt(String(item.minute ?? ''), 10)
      const estimated = estimateLiveMinute(base.kickoff, nowMs)
      const minute = Number.isFinite(given) && given > 0 ? given : estimated.minute
      const phase: LivePhase = Number.isFinite(given) && given > 0 ? (given > 45 ? 'second_half' : 'first_half') : estimated.phase
      return { ...base, status: 'live', score, phase, minute }
    }
    default:
      return null // POSTPONED, SUSPENDED, CANCELLED…
  }
}

export interface FootballDataProviderOptions {
  baseUrl?: string
  fetchFn?: FetchFn
  now?: () => Date
}

export function createFootballDataProvider({
  baseUrl = '/api/footballdata',
  fetchFn,
  now = () => new Date(),
}: FootballDataProviderOptions = {}): MatchesProvider {
  const codes = leagueCatalog
    .map((l) => l.sources.footballData)
    .filter((x): x is string => typeof x === 'string' && x.length > 0)
    .join(',')

  return createRealProvider({
    name: 'football-data.org',
    liveRefetchMs: 30_000,
    // Plan gratuito: 10 peticiones/min.
    ttlMs: { today: 30_000, other: 10 * 60_000 },
    now,
    async fetchMatches(date) {
      // `dateTo` es exclusivo en parte de los planes y la API trabaja en UTC: se pide ±1 día y se filtra por día local.
      const [y, m, d] = date.split('-').map(Number)
      const key = (offset: number) => {
        const dt = new Date(y, m - 1, d + offset)
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
      }
      const url = `${baseUrl}/matches?dateFrom=${key(-1)}&dateTo=${key(1)}&competitions=${codes}`
      const data = await fetchJson<FootballDataResponse>(url, fetchFn)
      if (!Array.isArray(data.matches)) throw new ProviderError('schema', 'football-data.org: respuesta inesperada')
      const nowMs = now().getTime()
      return data.matches.map((x) => mapFootballDataMatch(x, nowMs)).filter((x): x is Match => x !== null)
    },
  })
}

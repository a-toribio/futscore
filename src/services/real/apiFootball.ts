import { fetchJson, ProviderError, type FetchFn } from '@/services/errors'
import { leagueCatalog } from '@/services/leagueCatalog'
import type { MatchesProvider } from '@/services/matchesProvider'
import type { LivePhase, Match } from '@/types'
import { createRealProvider, deriveShortName } from './createRealProvider'

interface ApiFootballFixture {
  fixture?: { id?: number; date?: string; status?: { short?: string; elapsed?: number | null } }
  league?: { id?: number }
  teams?: {
    home?: { id?: number; name?: string; logo?: string }
    away?: { id?: number; name?: string; logo?: string }
  }
  goals?: { home?: number | null; away?: number | null }
}
interface ApiFootballResponse {
  errors?: unknown[] | Record<string, string>
  response?: ApiFootballFixture[]
}

const SCHEDULED = new Set(['TBD', 'NS'])
const FINISHED = new Set(['FT', 'AET', 'PEN'])
const LIVE = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'])

/** Convierte un partido de API-Football en `Match`; `null` si no aplica (aplazado, cancelado…). */
export function mapApiFootballFixture(item: ApiFootballFixture): Match | null {
  const leagueId = leagueCatalog.find((l) => l.sources.apiFootball === item.league?.id)?.id
  const short = item.fixture?.status?.short
  const { home, away } = item.teams ?? {}
  if (!leagueId || !item.fixture?.id || !item.fixture.date || !short || !home?.name || !away?.name) return null

  const team = (t: { id?: number; name?: string; logo?: string }) => ({
    id: `apif-${t.id ?? t.name}`,
    name: t.name ?? 'Equipo',
    shortName: deriveShortName(t.name ?? ''),
    logoUrl: t.logo,
  })
  const base = {
    id: `apif-${item.fixture.id}`,
    leagueId,
    homeTeam: team(home),
    awayTeam: team(away),
    kickoff: new Date(item.fixture.date).toISOString(),
  }
  const score = { home: item.goals?.home ?? 0, away: item.goals?.away ?? 0 }

  if (SCHEDULED.has(short)) return { ...base, status: 'scheduled', score: null }
  if (FINISHED.has(short)) return { ...base, status: 'finished', score }
  if (LIVE.has(short)) {
    const elapsed = Math.max(1, item.fixture.status?.elapsed ?? 1)
    const phase: LivePhase =
      short === 'HT' || short === 'BT' ? 'half_time' : short === '2H' ? 'second_half' : short === '1H' ? 'first_half' : elapsed > 90 ? 'extra_time' : elapsed > 45 ? 'second_half' : 'first_half'
    return { ...base, status: 'live', score, phase, minute: phase === 'half_time' ? 45 : elapsed }
  }
  return null // PST, CANC, ABD, SUSP, INT, AWD, WO…
}

export interface ApiFootballProviderOptions {
  baseUrl?: string
  fetchFn?: FetchFn
  now?: () => Date
  timezone?: string
}

export function createApiFootballProvider({
  baseUrl = '/api/apifootball',
  fetchFn,
  now,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone,
}: ApiFootballProviderOptions = {}): MatchesProvider {
  const supported = new Set(
    leagueCatalog
      .map((l) => l.sources.apiFootball)
      .filter((x): x is number => typeof x === 'number'),
  )

  return createRealProvider({
    name: 'API-Football',
    liveRefetchMs: 60_000,
    // Plan gratuito: 100 peticiones/día → caché generosa (1 petición por día consultado).
    ttlMs: { today: 5 * 60_000, other: 30 * 60_000 },
    now,
    async fetchMatches(date) {
      const url = `${baseUrl}/fixtures?date=${date}&timezone=${encodeURIComponent(timezone)}`
      const data = await fetchJson<ApiFootballResponse>(url, fetchFn)

      // API-Football responde 200 con `errors` rellenado cuando hay problemas (cuota, plan, clave…).
      const errors = data.errors
      const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && Object.keys(errors).length > 0
      if (hasErrors) {
        const text = JSON.stringify(errors)
        throw new ProviderError(/request|limit|rate/i.test(text) ? 'quota' : 'http', `API-Football: ${text}`)
      }
      if (!Array.isArray(data.response)) throw new ProviderError('schema', 'API-Football: respuesta inesperada')

      return data.response
        .filter((f) => f.league?.id !== undefined && supported.has(f.league.id))
        .map(mapApiFootballFixture)
        .filter((m): m is Match => m !== null)
    },
  })
}

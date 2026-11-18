import { resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import type { FetchFn } from '@/services/errors'
import type { Match, MatchEvent, MatchStatItem, MatchVenue, Player, TeamLineup } from '@/types'

/**
 * Datos de eventos, estadísticas y alineaciones de los partidos de 1ª/2ª/3ª RFEF.
 * futbolme.com los carga desde su propio front con dos endpoints POST (`id` = id de evento
 * que aparece en `attr-id-evento` de cada partido).
 */
const PUBLIC_BASE = 'https://futbolme.com'
const PROXY_BASE = '/api/futbolme'

interface BetsapiEventsResult {
  success?: number
  results?: {
    home?: { name?: string }
    away?: { name?: string }
    stats?: Record<string, string[]>
    extra?: { stadium_data?: { name?: string; city?: string; capacity?: string } }
    events?: { id?: string; text?: string }[]
    has_lineup?: string | number
  }[]
}

interface BetsapiLineupPlayer {
  shirtnumber?: string | number
  pos?: string
  player?: { id?: string | number; name?: string }
}
interface BetsapiLineupResult {
  results?:
    | unknown[]
    | {
        home?: { startinglineup?: BetsapiLineupPlayer[]; substitutes?: BetsapiLineupPlayer[] }
        away?: { startinglineup?: BetsapiLineupPlayer[]; substitutes?: BetsapiLineupPlayer[] }
      }
}

async function postForm<T>(path: string, id: string, fetchFn: FetchFn): Promise<T | undefined> {
  const isNative = typeof window !== 'undefined' && 'Capacitor' in window
  const urls = isNative
    ? [`${PUBLIC_BASE}${path}`, `${PROXY_BASE}${path}`]
    : typeof window !== 'undefined'
      ? [`${PROXY_BASE}${path}`, `${PUBLIC_BASE}${path}`]
      : [`${PUBLIC_BASE}${path}`]

  for (const url of urls) {
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}`,
        signal: typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(10_000) : undefined,
      })
      if (!res.ok) continue
      return JSON.parse(await res.text()) as T
    } catch {
      // Se prueba la siguiente URL
    }
  }
  return undefined
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function normWords(s: string): string[] {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
}

function scoreTeamSimilarity(rawEventTeam: string, candidates: (string | undefined)[]): number {
  const evNorm = norm(rawEventTeam)
  const evWords = normWords(rawEventTeam)
  let best = 0

  for (const candRaw of candidates) {
    if (!candRaw) continue
    const cNorm = norm(candRaw)
    if (!cNorm) continue
    if (evNorm === cNorm) return 100

    const cWords = normWords(candRaw)
    const commonWords = evWords.filter((w) => cWords.includes(w))
    const wordScore =
      commonWords.length > 0
        ? (commonWords.reduce((sum, w) => sum + w.length, 0) * 60) /
          Math.max(evNorm.length, cNorm.length)
        : 0
    best = Math.max(best, wordScore)

    if (evNorm.length >= 4 && (cNorm.includes(evNorm) || evNorm.includes(cNorm))) {
      const lenRatio = Math.min(evNorm.length, cNorm.length) / Math.max(evNorm.length, cNorm.length)
      best = Math.max(best, 40 + lenRatio * 40)
    }
  }

  return best
}

function resolveBetsapiEventIsHome(
  rawEventTeam: string,
  homeName: string,
  awayName: string | undefined,
  match: Match,
): boolean {
  const homeCrest = resolveSpanishTeamCrest(match.homeTeam.name, match.homeTeam.logoUrl)
  const awayCrest = resolveSpanishTeamCrest(match.awayTeam.name, match.awayTeam.logoUrl)
  const eventCrest = resolveSpanishTeamCrest(rawEventTeam)

  if (eventCrest && homeCrest && awayCrest && homeCrest !== awayCrest) {
    if (eventCrest === homeCrest) return true
    if (eventCrest === awayCrest) return false
  }

  const homeCandidates = [match.homeTeam.name, match.homeTeam.shortName, homeName]
  const awayCandidates = [match.awayTeam.name, match.awayTeam.shortName, awayName]

  const homeScore = scoreTeamSimilarity(rawEventTeam, homeCandidates)
  const awayScore = scoreTeamSimilarity(rawEventTeam, awayCandidates)
  return homeScore >= awayScore
}

function sortValue(minute: string): number {
  const m = /(\d+)(?:\+(\d+))?/.exec(minute)
  return m ? Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0) : 9999
}

/** Convierte los textos de eventos de futbolme (tarjetas) en eventos de partido. Los goles se toman de la web (traen goleador). */
export function parseBetsapiCards(
  events: { id?: string; text?: string }[],
  homeName: string,
  match: Match,
  awayName?: string,
): MatchEvent[] {
  const out: MatchEvent[] = []
  for (const [i, ev] of events.entries()) {
    const text = ev.text ?? ''
    const m =
      /^(\d+(?:\+\d+)?)'\s*~\s*(?:\d+(?:st|nd|rd|th)\s+)?(Yellow Card|Red Card|Yellow\/Red Card|Yellowred Card)\s*~\s*([\s\S]*?)\(([^()]+)\)\s*$/i.exec(
        text.trim(),
      )
    if (!m) continue
    const rawMiddle = m[3].replace(/~/g, ' ').replace(/\s+/g, ' ').trim()
    const player = rawMiddle.length >= 2 ? rawMiddle : undefined
    const rawEventTeam = m[4].trim()
    const isHome = resolveBetsapiEventIsHome(rawEventTeam, homeName, awayName, match)
    const kind = m[2].toLowerCase()
    const type = kind === 'yellow card' ? 'yellow_card' : 'red_card'
    const team = isHome ? match.homeTeam : match.awayTeam
    const minute = `${m[1]}'`
    const label =
      type === 'yellow_card' ? 'Tarjeta amarilla' : kind === 'red card' ? 'Tarjeta roja' : 'Doble amarilla'
    out.push({
      id: `rfef-card-${ev.id ?? i}`,
      minute,
      type,
      teamId: team.id,
      isHome,
      player,
      text: `${minute} ${label} (${team.name})`,
    })
  }
  return out.sort((a, b) => sortValue(a.minute) - sortValue(b.minute))
}

const STAT_DEFS: { key: string; label: string; field: string; pct?: boolean }[] = [
  { key: 'possessionPct', label: 'Posesión', field: 'possession_rt', pct: true },
  { key: 'totalShots', label: 'Remates totales', field: 'goalattempts' },
  { key: 'shotsOnTarget', label: 'Remates a puerta', field: 'on_target' },
  { key: 'shotsOffTarget', label: 'Remates fuera', field: 'off_target' },
  { key: 'blockedShots', label: 'Remates bloqueados', field: 'shots_blocked' },
  { key: 'wonCorners', label: 'Saques de esquina', field: 'corners' },
  { key: 'foulsCommitted', label: 'Faltas cometidas', field: 'fouls' },
  { key: 'offsides', label: 'Fueras de juego', field: 'offsides' },
  { key: 'yellowCards', label: 'Tarjetas amarillas', field: 'yellowcards' },
  { key: 'redCards', label: 'Tarjetas rojas', field: 'redcards' },
  { key: 'saves', label: 'Paradas', field: 'saves' },
  { key: 'attacks', label: 'Ataques', field: 'attacks' },
  { key: 'dangerousAttacks', label: 'Ataques peligrosos', field: 'dangerous_attacks' },
]

export function parseBetsapiStats(stats?: Record<string, string[]>): MatchStatItem[] {
  if (!stats) return []
  const items: MatchStatItem[] = []
  for (const def of STAT_DEFS) {
    const pair = stats[def.field]
    if (!Array.isArray(pair) || pair.length < 2) continue
    const hn = Number(pair[0])
    const an = Number(pair[1])
    if (Number.isNaN(hn) || Number.isNaN(an)) continue
    items.push({
      key: def.key,
      label: def.label,
      homeValue: def.pct ? `${hn}%` : String(hn),
      awayValue: def.pct ? `${an}%` : String(an),
      homeNumeric: hn,
      awayNumeric: an,
      isPercentage: def.pct,
    })
  }
  return items
}

function toPlayers(list: BetsapiLineupPlayer[] | undefined, starter: boolean, team: Match['homeTeam']): Player[] {
  return (list ?? []).map((p, i) => ({
    id: String(p.player?.id ?? `${team.id}-${starter ? 's' : 'b'}-${i}`),
    name: p.player?.name ?? 'Jugador',
    jersey: p.shirtnumber !== undefined ? String(p.shirtnumber) : undefined,
    position: p.pos,
    starter,
    teamId: team.id,
    teamName: team.name,
  }))
}

export interface RfefExtraDetail {
  cards: MatchEvent[]
  stats: MatchStatItem[]
  venue?: MatchVenue
  lineups?: { home: TeamLineup; away: TeamLineup }
}

/** Descarga eventos (tarjetas), estadísticas, estadio y, si existen, alineaciones de un partido RFEF. */
export async function fetchRfefExtraDetail(
  betsapiId: string,
  match: Match,
  fetchFn: FetchFn = fetch,
): Promise<RfefExtraDetail | undefined> {
  const data = await postForm<BetsapiEventsResult>('/apiBetsapiEventos.php', betsapiId, fetchFn)
  const res = data?.results?.[0]
  if (!res) return undefined

  const stadium = res.extra?.stadium_data
  const capacity = Number(stadium?.capacity)
  const detail: RfefExtraDetail = {
    cards: parseBetsapiCards(
      res.events ?? [],
      res.home?.name ?? match.homeTeam.name,
      match,
      res.away?.name ?? match.awayTeam.name,
    ),
    stats: parseBetsapiStats(res.stats),
    venue: stadium?.name
      ? { name: stadium.name, city: stadium.city, capacity: capacity > 0 ? capacity : undefined }
      : undefined,
  }

  if (res.has_lineup && String(res.has_lineup) !== '0') {
    const lu = await postForm<BetsapiLineupResult>('/apiBetsapi.php', betsapiId, fetchFn)
    const r = lu?.results
    if (r && !Array.isArray(r) && r.home?.startinglineup?.length) {
      detail.lineups = {
        home: {
          team: match.homeTeam,
          starters: toPlayers(r.home.startinglineup, true, match.homeTeam),
          substitutes: toPlayers(r.home.substitutes, false, match.homeTeam),
        },
        away: {
          team: match.awayTeam,
          starters: toPlayers(r.away?.startinglineup, true, match.awayTeam),
          substitutes: toPlayers(r.away?.substitutes, false, match.awayTeam),
        },
      }
    }
  }
  return detail
}
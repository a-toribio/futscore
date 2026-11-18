import { translatePosition } from '@/lib/positions'
import {
  buildFutbolmeCrestUrl,
  registerSpanishTeamCrest,
  resolveSpanishTeamCrest,
} from '@/lib/spanishCrests'
import type { FetchFn } from '@/services/errors'
import { leagueCatalog } from '@/services/leagueCatalog'
import type {
  LeagueStandings,
  Match,
  MatchDetail,
  MatchEvent,
  QualificationZone,
  SquadPlayer,
  StandingRow,
  TeamProfile,
  TeamRef,
  TeamVenue,
} from '@/types'
import { createDefaultMatchDetail, deriveShortName } from './createRealProvider'
import { fetchRfefExtraDetail } from './futbolmeApi'
import { RFEF_CLUB_INDEX } from './rfefClubIndex'
import { fetchClubDescription } from './wikipedia'

export interface RfefGroupConfig {
  code: string
  name: string
  shortName: string
  region?: string
  tournamentSlug: string
  tournamentId: number
}

export const RFEF_GROUPS_BY_LEAGUE: Record<string, RfefGroupConfig[]> = {
  primera_rfef: [
    {
      code: 'g1',
      name: 'Grupo 1',
      shortName: 'G1',
      region: 'Norte / Oeste',
      tournamentSlug: 'primera-federacion-grupo-1',
      tournamentId: 3055,
    },
    {
      code: 'g2',
      name: 'Grupo 2',
      shortName: 'G2',
      region: 'Sur / Este',
      tournamentSlug: 'primera-federacion-grupo-2',
      tournamentId: 3056,
    },
  ],
  segunda_rfef: [
    {
      code: 'g1',
      name: 'Grupo 1',
      shortName: 'G1',
      region: 'Noroeste',
      tournamentSlug: 'segunda-federacion-grupo-1',
      tournamentId: 3057,
    },
    {
      code: 'g2',
      name: 'Grupo 2',
      shortName: 'G2',
      region: 'Norte / Aragón',
      tournamentSlug: 'segunda-federacion-grupo-2',
      tournamentId: 3058,
    },
    {
      code: 'g3',
      name: 'Grupo 3',
      shortName: 'G3',
      region: 'Mediterráneo',
      tournamentSlug: 'segunda-federacion-grupo-3',
      tournamentId: 3059,
    },
    {
      code: 'g4',
      name: 'Grupo 4',
      shortName: 'G4',
      region: 'Sur / Murcia',
      tournamentSlug: 'segunda-federacion-grupo-4',
      tournamentId: 3060,
    },
    {
      code: 'g5',
      name: 'Grupo 5',
      shortName: 'G5',
      region: 'Centro / Canarias',
      tournamentSlug: 'segunda-federacion-grupo-5',
      tournamentId: 3061,
    },
  ],
  tercera_rfef: [
    { code: 'g1', name: 'Grupo 1 (Galicia)', shortName: 'G1', region: 'Galicia', tournamentSlug: 'tercera-federacion-grupo-1', tournamentId: 3076 },
    { code: 'g2', name: 'Grupo 2 (Asturias)', shortName: 'G2', region: 'Asturias', tournamentSlug: 'tercera-federacion-grupo-2', tournamentId: 3067 },
    { code: 'g3', name: 'Grupo 3 (Cantabria)', shortName: 'G3', region: 'Cantabria', tournamentSlug: 'tercera-federacion-grupo-3', tournamentId: 3063 },
    { code: 'g4', name: 'Grupo 4 (País Vasco)', shortName: 'G4', region: 'País Vasco', tournamentSlug: 'tercera-federacion-grupo-4', tournamentId: 3064 },
    { code: 'g5', name: 'Grupo 5 (Cataluña)', shortName: 'G5', region: 'Cataluña', tournamentSlug: 'tercera-federacion-grupo-5', tournamentId: 3070 },
    { code: 'g6', name: 'Grupo 6 (C. Valenciana)', shortName: 'G6', region: 'C. Valenciana', tournamentSlug: 'tercera-federacion-grupo-6', tournamentId: 3078 },
    { code: 'g7', name: 'Grupo 7 (Madrid)', shortName: 'G7', region: 'Madrid', tournamentSlug: 'tercera-federacion-grupo-7', tournamentId: 3073 },
    { code: 'g8', name: 'Grupo 8 (Castilla y León)', shortName: 'G8', region: 'Castilla y León', tournamentSlug: 'tercera-federacion-grupo-8', tournamentId: 3068 },
    { code: 'g9', name: 'Grupo 9 (Andalucía Or.)', shortName: 'G9', region: 'Andalucía Oriental', tournamentSlug: 'tercera-federacion-grupo-9', tournamentId: 3079 },
    { code: 'g10', name: 'Grupo 10 (Andalucía Occ.)', shortName: 'G10', region: 'Andalucía Occidental', tournamentSlug: 'tercera-federacion-grupo-10', tournamentId: 3080 },
    { code: 'g11', name: 'Grupo 11 (Baleares)', shortName: 'G11', region: 'Islas Baleares', tournamentSlug: 'tercera-federacion-grupo-11', tournamentId: 3065 },
    { code: 'g12', name: 'Grupo 12 (Canarias)', shortName: 'G12', region: 'Canarias', tournamentSlug: 'tercera-federacion-grupo-12', tournamentId: 3077 },
    { code: 'g13', name: 'Grupo 13 (Murcia)', shortName: 'G13', region: 'Región de Murcia', tournamentSlug: 'tercera-federacion-grupo-13', tournamentId: 3074 },
    { code: 'g14', name: 'Grupo 14 (Extremadura)', shortName: 'G14', region: 'Extremadura', tournamentSlug: 'tercera-federacion-grupo-14', tournamentId: 3069 },
    { code: 'g15', name: 'Grupo 15 (Navarra)', shortName: 'G15', region: 'Navarra', tournamentSlug: 'tercera-federacion-grupo-15', tournamentId: 3075 },
    { code: 'g16', name: 'Grupo 16 (La Rioja)', shortName: 'G16', region: 'La Rioja', tournamentSlug: 'tercera-federacion-grupo-16', tournamentId: 3081 },
    { code: 'g17', name: 'Grupo 17 (Aragón)', shortName: 'G17', region: 'Aragón', tournamentSlug: 'tercera-federacion-grupo-17', tournamentId: 3071 },
    { code: 'g18', name: 'Grupo 18 (Castilla-La Mancha)', shortName: 'G18', region: 'Castilla-La Mancha', tournamentSlug: 'tercera-federacion-grupo-18', tournamentId: 3066 },
  ],
}

export function isRfefLeague(leagueId: string): boolean {
  return leagueId in RFEF_GROUPS_BY_LEAGUE
}

/** Id estable de un club RFEF a partir de su nombre. */
export function rfefTeamId(name: string): string {
  return `rfef-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export function getRfefGroups(leagueId: string): RfefGroupConfig[] {
  return RFEF_GROUPS_BY_LEAGUE[leagueId] ?? []
}

function classifyRfefZone(
  leagueId: string,
  rank: number,
  totalRows: number,
): { zone: QualificationZone; label?: string } {
  // En 1ª RFEF, 2ª RFEF y 3ª RFEF:
  // 1º: Ascenso directo
  // 2º a 5º: Playoffs de ascenso
  // Últimos 5 (en grupos de 18-20) o últimos 3-4: Descenso
  if (rank === 1) {
    return { zone: 'promotion', label: 'Ascenso directo' }
  }
  if (rank >= 2 && rank <= 5) {
    return { zone: 'europa', label: 'Playoffs de ascenso' }
  }
  const relegationSpots = leagueId === 'tercera_rfef' ? 3 : 5
  if (totalRows >= 14 && rank > totalRows - relegationSpots) {
    return { zone: 'relegation', label: 'Descenso' }
  }
  return { zone: 'none' }
}

interface ParsedRfefMatchExtra {
  match: Match
  venue?: { name: string; city?: string }
  round?: string
  events: MatchEvent[]
  /** Id de evento de futbolme (attr-id-evento) para pedir estadísticas y tarjetas. */
  betsapiId?: string
}

export interface ParsedFutbolmeTournament {
  standings: StandingRow[]
  matches: ParsedRfefMatchExtra[]
  jornadaNumber?: number
  prevJornadaPath?: string
  nextJornadaPath?: string
}

/** Almacén en memoria de los detalles de partidos RFEF para abrir el modal al instante */
const rfefMatchDetailsStore = new Map<string, ParsedRfefMatchExtra>()

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function parseGoalSide(
  htmlBlock: string,
  isHome: boolean,
  teamId: string,
  startIdx: number,
): MatchEvent[] {
  const events: MatchEvent[] = []
  const iContent = /<i>([\s\S]*?)<\/i>/i.exec(htmlBlock)?.[1] ?? ''
  const parts = iContent
    .split(/<br\s*\/?>/i)
    .map((p) => p.trim())
    .filter(Boolean)

  parts.forEach((part, offset) => {
    const playerMatch = /<a[^>]*>([\s\S]*?)<\/a>/i.exec(part)
    const rawPlayer = playerMatch
      ? decodeHtmlEntities(playerMatch[1].replace(/<[^>]+>/g, ''))
      : undefined
    const minMatch = /(\d+(?:\+\d+)?)\s*[´'’]/i.exec(part)
    const minute = minMatch ? `${minMatch[1]}'` : ''

    if (!rawPlayer && !minute) return

    const isPenalty = /\((?:pen\.?|p\.?)\)/i.test(part)
    const isOwnGoal = /\((?:p\.?\s*p\.?|propia)\)/i.test(part)

    events.push({
      id: `rfef-goal-${startIdx + offset}-${isHome ? 'h' : 'a'}`,
      minute,
      type: 'goal',
      teamId,
      isHome,
      text: `${minute} Gol de ${rawPlayer ?? 'Jugador'}`,
      player: rawPlayer ?? 'Jugador',
      isPenalty,
      isOwnGoal,
    })
  })

  return events
}

function minuteToSortValue(minStr: string): number {
  const m = /(\d+)(?:\+(\d+))?/.exec(minStr)
  if (!m) return 999
  return Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0)
}

export function parseFutbolmeTournamentHtml(
  html: string,
  leagueId: string,
  group: RfefGroupConfig,
): ParsedFutbolmeTournament {
  // 1. Extraer tabla de clasificación y registrar todos los escudos reales
  const trBlocks = html.split('<tr data-bk="white"').slice(1)
  const rawStandings: {
    rawRank: number
    teamName: string
    shortName: string
    logoUrl?: string
    points: number
    played: number
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
    diffNum: number
  }[] = []

  for (const [idx, block] of trBlocks.entries()) {
    const rowHtml = block.split('</tr>')[0] ?? ''
    const rankMatch = /celda-posicion[^>]*>([\s\S]*?)<\/td>/i.exec(rowHtml)
    const rawRank = Number(rankMatch?.[1]?.replace(/<[^>]+>/g, '').trim()) || idx + 1

    const imgMatch = /<img\s+src="([^"]*escudo\d+\.png)"[^>]*alt="escudo\s+([^"]+)"/i.exec(rowHtml)
    const fullSpan = /<span class="d-none d-sm-inline-block">([\s\S]*?)<\/span>/i.exec(rowHtml)?.[1]
    const shortSpan = /<span class="d-inline-block d-sm-none">([\s\S]*?)<\/span>/i.exec(rowHtml)?.[1]

    const teamName = decodeHtmlEntities(fullSpan || imgMatch?.[2] || shortSpan || `Equipo ${rawRank}`)
    const shortName = decodeHtmlEntities(shortSpan || deriveShortName(teamName))

    let rawLogo = imgMatch?.[1]?.trim()
    if (rawLogo) {
      if (rawLogo.startsWith('//')) rawLogo = `https:${rawLogo}`
      else if (rawLogo.startsWith('/')) rawLogo = `https://futbolme.com${rawLogo}`
      registerSpanishTeamCrest(teamName, rawLogo)
      if (shortName) registerSpanishTeamCrest(shortName, rawLogo)
    }

    const logoUrl = resolveSpanishTeamCrest(teamName, rawLogo)

    // Extraer las 8 celdas numéricas: PTS, PJ, PG, PE, PP, GF, GC, DG
    const centerCells = [...rowHtml.matchAll(/<td class="text-center"[^>]*>([\s\S]*?)<\/td>/gi)].map(
      (m) => {
        const clean = m[1].replace(/<[^>]+>/g, '').trim()
        return Number(clean) || 0
      },
    )

    const points = centerCells[0] ?? 0
    const played = centerCells[1] ?? 0
    const wins = centerCells[2] ?? 0
    const draws = centerCells[3] ?? 0
    const losses = centerCells[4] ?? 0
    const goalsFor = centerCells[5] ?? 0
    const goalsAgainst = centerCells[6] ?? 0
    const diffNum = centerCells[7] ?? goalsFor - goalsAgainst

    rawStandings.push({
      rawRank,
      teamName,
      shortName,
      logoUrl,
      points,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      diffNum,
    })
  }

  rawStandings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.diffNum !== a.diffNum) return b.diffNum - a.diffNum
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.rawRank - b.rawRank
  })

  const totalRows = rawStandings.length
  const standings: StandingRow[] = rawStandings.map((item, idx) => {
    const rank = idx + 1
    const { zone, label } = classifyRfefZone(leagueId, rank, totalRows)
    const goalDiff = item.diffNum > 0 ? `+${item.diffNum}` : String(item.diffNum)
    return {
      rank,
      team: {
        id: rfefTeamId(item.teamName),
        name: item.teamName,
        shortName: item.shortName,
        logoUrl: item.logoUrl,
      },
      played: item.played,
      wins: item.wins,
      draws: item.draws,
      losses: item.losses,
      goalsFor: item.goalsFor,
      goalsAgainst: item.goalsAgainst,
      goalDiff,
      points: item.points,
      zone,
      zoneLabel: label,
    }
  })

  // 2. Detectar enlaces a jornada actual, previa y posterior
  const jornadaHrefs = [...html.matchAll(/href="(?:https?:\/\/futbolme\.com)?(\/resultados-directo\/torneo\/[^"]+\/jornada\/(\d+))"/gi)]
  const jornadaNums = [...new Set(jornadaHrefs.map((m) => Number(m[2])).filter(Boolean))].sort((a, b) => a - b)

  let jornadaNumber: number | undefined
  let prevJornadaPath: string | undefined
  let nextJornadaPath: string | undefined

  if (jornadaNums.length >= 2) {
    // Normalmente aparecen [N-1, N, N+1] o [N-1, N+1]
    const basePrefix = `/resultados-directo/torneo/${group.tournamentSlug}/${group.tournamentId}/jornada/`
    if (jornadaNums.length === 3) {
      jornadaNumber = jornadaNums[1]
      prevJornadaPath = `${basePrefix}${jornadaNums[0]}`
      nextJornadaPath = `${basePrefix}${jornadaNums[2]}`
    } else {
      prevJornadaPath = `${basePrefix}${jornadaNums[0]}`
      nextJornadaPath = `${basePrefix}${jornadaNums[jornadaNums.length - 1]}`
      if (jornadaNums[jornadaNums.length - 1] - jornadaNums[0] === 2) {
        jornadaNumber = jornadaNums[0] + 1
      }
    }
  }

  const matches = parseMatchBlocks(html, leagueId, group, jornadaNumber)

  return {
    standings,
    matches,
    jornadaNumber,
    prevJornadaPath,
    nextJornadaPath,
  }
}

/** Extrae los partidos (`cajaPartido`) de cualquier página de futbolme.com (torneo o calendario de equipo). */
export function parseMatchBlocks(
  html: string,
  leagueId: string,
  group: Pick<RfefGroupConfig, 'code' | 'name' | 'tournamentId'>,
  jornadaFallback?: number,
): ParsedRfefMatchExtra[] {
  const matchBlocks = html.split('<div class="cajaPartido"').slice(1)
  const matches: ParsedRfefMatchExtra[] = []

  for (const [idx, block] of matchBlocks.entries()) {
    const idMatch = /mostrarColor\((\d+)\)/.exec(block)
    const rawId = idMatch?.[1] ?? `${group.tournamentId}-${idx}`

    const metaName = /<meta itemprop="name" content="([^"]+)"/i.exec(block)?.[1]
    const localBlock = /equipoPartidoLocal[\s\S]*?<span class="d-none d-sm-block"[^>]*>([\s\S]*?)<\/span>/i.exec(block)?.[1]
    const visitBlock = /equipoPartidoVisitante[\s\S]*?<span class="d-none d-sm-block"[^>]*>([\s\S]*?)<\/span>/i.exec(block)?.[1]

    const [metaHome, metaAway] = (metaName ?? '').split(' - ').map((s) => decodeHtmlEntities(s))
    const homeName = decodeHtmlEntities(localBlock || metaHome || 'Local')
    const awayName = decodeHtmlEntities(visitBlock || metaAway || 'Visitante')

    if (!homeName || !awayName) continue

    const startIsoRaw = /<meta itemprop="startDate" content="([^"]+)"/i.exec(block)?.[1]
    if (!startIsoRaw) continue

    const parsedDate = new Date(startIsoRaw)
    if (Number.isNaN(parsedDate.getTime())) continue

    const kickoff = parsedDate.toISOString()

    // Comprobar resultado / estado
    const resHtml = /<div class="col-2 resultadoPartido">([\s\S]*?)<\/div>/i.exec(block)?.[1] ?? ''
    const scoreSpans = [...resHtml.matchAll(/<span[^>]*>\s*(\d+)\s*<\/span>/gi)]

    const homeTeam = {
      id: rfefTeamId(homeName),
      name: homeName,
      shortName: deriveShortName(homeName),
      logoUrl: resolveSpanishTeamCrest(homeName),
    }

    const awayTeam = {
      id: rfefTeamId(awayName),
      name: awayName,
      shortName: deriveShortName(awayName),
      logoUrl: resolveSpanishTeamCrest(awayName),
    }

    const matchId = `rfef-${rawId}`

    let match: Match
    if (scoreSpans.length >= 2) {
      const homeScore = Number(scoreSpans[0][1]) || 0
      const awayScore = Number(scoreSpans[1][1]) || 0
      match = {
        id: matchId,
        leagueId,
        homeTeam,
        awayTeam,
        kickoff,
        status: 'finished',
        score: { home: homeScore, away: awayScore },
      }
    } else {
      match = {
        id: matchId,
        leagueId,
        homeTeam,
        awayTeam,
        kickoff,
        status: 'scheduled',
        score: null,
      }
    }

    // Extraer estadio y localidad
    const locMatch =
      /<span itemprop="location"[\s\S]*?<meta itemprop="name" content="([^"]*)"[\s\S]*?<meta itemprop="address" content="([^"]*)"/i.exec(
        block,
      )
    const venueName = decodeHtmlEntities(locMatch?.[1] ?? '')
    const venueCity = decodeHtmlEntities(locMatch?.[2] ?? '')
    const venue = venueName ? { name: venueName, city: venueCity || undefined } : undefined

    // Extraer goles reales (observacionesGoles)
    const obsMatch = /<div class="row observacionesGoles">([\s\S]*?)<\/div>\s*<\/div>/i.exec(block)?.[1] ?? ''
    const colBlocks = obsMatch.split('<div class="col-6 nopadding">').slice(1)
    const homeEvents = colBlocks[0] ? parseGoalSide(colBlocks[0], true, homeTeam.id, 0) : []
    const awayEvents = colBlocks[1] ? parseGoalSide(colBlocks[1], false, awayTeam.id, 100) : []
    const events = [...homeEvents, ...awayEvents].sort(
      (a, b) => minuteToSortValue(a.minute) - minuteToSortValue(b.minute),
    )

    const inBlockRound = Number(/Jornada\s+(\d+)/i.exec(block)?.[1])
    const jornada = jornadaFallback ?? (inBlockRound || undefined)
    const roundLabel = jornada ? `Jornada ${jornada} · ${group.name}` : group.name

    const betsapiId = /attr-id-evento="(\d{3,})"/.exec(block)?.[1]

    const extra: ParsedRfefMatchExtra = {
      match,
      venue,
      round: roundLabel,
      events,
      betsapiId,
    }

    rfefMatchDetailsStore.set(matchId, extra)
    matches.push(extra)
  }

  return matches
}

export const FUTBOLME_PUBLIC_BASE = 'https://futbolme.com'
export const FUTBOLME_PROXY_BASE = '/api/futbolme'

async function fetchFutbolmeHtml(
  path: string,
  fetchFn: FetchFn = fetch,
  marker = 'cajaPartido',
): Promise<string> {
  const isNative = typeof window !== 'undefined' && 'Capacitor' in window
  const urls = isNative
    ? [`${FUTBOLME_PUBLIC_BASE}${path}`, `${FUTBOLME_PROXY_BASE}${path}`]
    : typeof window !== 'undefined'
      ? [`${FUTBOLME_PROXY_BASE}${path}`, `${FUTBOLME_PUBLIC_BASE}${path}`]
      : [`${FUTBOLME_PUBLIC_BASE}${path}`]

  let lastErr: unknown
  for (const url of urls) {
    try {
      const res = await fetchFn(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const text = await res.text()
      if (text && text.includes(marker)) {
        return text
      }
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr ?? new Error(`No se pudo cargar ${path}`)
}

interface CachedGroupBundle {
  at: number
  promise: Promise<{
    standings: StandingRow[]
    allMatches: Match[]
  }>
}

const groupBundleCache = new Map<string, CachedGroupBundle>()

/**
 * Carga y cachea para un grupo RFEF su clasificación y los partidos tanto de la jornada actual
 * como de la jornada siguiente/anterior para cubrir fechas pasadas y próximas.
 */
async function loadGroupBundle(
  leagueId: string,
  group: RfefGroupConfig,
  fetchFn: FetchFn = fetch,
): Promise<{ standings: StandingRow[]; allMatches: Match[] }> {
  const cacheKey = `${leagueId}:${group.code}`
  const now = Date.now()
  const hit = groupBundleCache.get(cacheKey)
  if (hit && now - hit.at < 3 * 60_000) return hit.promise

  const load = async () => {
    const mainPath = `/resultados-directo/torneo/${group.tournamentSlug}/${group.tournamentId}/`
    const mainHtml = await fetchFutbolmeHtml(mainPath, fetchFn)
    const mainParsed = parseFutbolmeTournamentHtml(mainHtml, leagueId, group)

    const allExtras: ParsedRfefMatchExtra[] = [...mainParsed.matches]

    // Cargamos jornadas previas y posteriores para disponer de un amplio calendario de partidos
    const basePrefix = `/resultados-directo/torneo/${group.tournamentSlug}/${group.tournamentId}/jornada/`
    const extraPaths: string[] = []

    if (mainParsed.jornadaNumber) {
      const currentJ = mainParsed.jornadaNumber
      for (let offset = -3; offset <= 3; offset++) {
        if (offset !== 0) {
          const j = currentJ + offset
          if (j >= 1 && j <= 38) {
            extraPaths.push(`${basePrefix}${j}`)
          }
        }
      }
    } else {
      if (mainParsed.nextJornadaPath) extraPaths.push(mainParsed.nextJornadaPath)
      if (mainParsed.prevJornadaPath) extraPaths.push(mainParsed.prevJornadaPath)
    }

    if (extraPaths.length > 0) {
      const extraResults = await Promise.allSettled(
        extraPaths.map(async (p) => {
          const h = await fetchFutbolmeHtml(p, fetchFn)
          return parseFutbolmeTournamentHtml(h, leagueId, group)
        }),
      )
      for (const r of extraResults) {
        if (r.status === 'fulfilled') {
          allExtras.push(...r.value.matches)
        }
      }
    }

    const seen = new Set<string>()
    const allMatches: Match[] = []
    for (const item of allExtras) {
      if (!seen.has(item.match.id)) {
        seen.add(item.match.id)
        allMatches.push(item.match)
      }
    }

    return {
      standings: mainParsed.standings,
      allMatches,
    }
  }

  const promise = load()
  groupBundleCache.set(cacheKey, { at: now, promise })
  promise.catch(() => {
    if (groupBundleCache.get(cacheKey)?.promise === promise) {
      groupBundleCache.delete(cacheKey)
    }
  })

  return promise
}

/**
 * Obtiene los partidos de una liga RFEF (1ª RFEF, 2ª RFEF o 3ª RFEF) para una fecha YYYY-MM-DD.
 */
export async function fetchRfefMatchesByDate(
  leagueId: string,
  dateIso: string,
  fetchFn: FetchFn = fetch,
): Promise<Match[]> {
  const groups = getRfefGroups(leagueId)
  if (groups.length === 0) return []

  // Para 1ª RFEF (2 grupos) y 2ª RFEF (5 grupos) consultamos todos los grupos.
  // Para 3ª RFEF (18 grupos) en la portada diaria consultamos los primeros 6 grupos más cualquier otro ya en caché,
  // manteniendo tiempos de respuesta instantáneos; al abrir la liga están disponibles los 18 grupos.
  const targetGroups =
    leagueId === 'tercera_rfef'
      ? groups.filter((g, idx) => idx < 6 || groupBundleCache.has(`${leagueId}:${g.code}`))
      : groups

  const results = await Promise.allSettled(
    targetGroups.map((g) => loadGroupBundle(leagueId, g, fetchFn)),
  )

  const matchesForDate: Match[] = []
  for (const res of results) {
    if (res.status !== 'fulfilled') continue
    for (const m of res.value.allMatches) {
      // Comparar fecha en zona horaria española / UTC día del kickoff
      const matchDate = m.kickoff.slice(0, 10)
      if (matchDate === dateIso) {
        matchesForDate.push(m)
      }
    }
  }

  return matchesForDate.sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
}

/**
 * Obtiene la tabla de clasificación oficial de un grupo de 1ª RFEF, 2ª RFEF o 3ª RFEF.
 */
export async function fetchRfefStandings(
  leagueId: string,
  groupCode?: string,
  fetchFn: FetchFn = fetch,
): Promise<LeagueStandings> {
  const groups = getRfefGroups(leagueId)
  const selectedGroup = groups.find((g) => g.code === groupCode) ?? groups[0]
  if (!selectedGroup) {
    throw new Error(`Grupo RFEF no encontrado para ${leagueId}`)
  }

  const bundle = await loadGroupBundle(leagueId, selectedGroup, fetchFn)
  const leagueNames: Record<string, string> = {
    primera_rfef: '1ª Federación (1ª RFEF)',
    segunda_rfef: '2ª Federación (2ª RFEF)',
    tercera_rfef: '3ª Federación (3ª RFEF)',
  }

  return {
    leagueId,
    leagueName: `${leagueNames[leagueId] ?? leagueId} · ${selectedGroup.name}`,
    seasonName: `Temporada 2025-26 · ${selectedGroup.name}`,
    rows: bundle.standings,
  }
}

/**
 * Obtiene los partidos pasados y próximos de un grupo de 1ª RFEF, 2ª RFEF o 3ª RFEF.
 */
export async function fetchRfefLeagueMatches(
  leagueId: string,
  groupCode?: string,
  fetchFn: FetchFn = fetch,
): Promise<{ pastMatches: Match[]; upcomingMatches: Match[] }> {
  const groups = getRfefGroups(leagueId)
  const selectedGroup = groups.find((g) => g.code === groupCode) ?? groups[0]
  if (!selectedGroup) {
    return { pastMatches: [], upcomingMatches: [] }
  }

  const bundle = await loadGroupBundle(leagueId, selectedGroup, fetchFn)

  const pastMatches = bundle.allMatches
    .filter((m) => m.status === 'finished')
    .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))

  const upcomingMatches = bundle.allMatches
    .filter((m) => m.status !== 'finished')
    .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))

  return { pastMatches, upcomingMatches }
}

/**
 * Construye el detalle de un partido RFEF (goles, goleadores, estadio, localidad y jornada).
 */
export async function getRfefMatchDetail(match: Match, fetchFn: FetchFn = fetch): Promise<MatchDetail> {
  const stored = rfefMatchDetailsStore.get(match.id)
  const base = createDefaultMatchDetail(match)
  if (!stored) return base

  const goals = stored.events
  const detail: MatchDetail = {
    ...base,
    match,
    events: goals,
    info: { venue: stored.venue, round: stored.round },
  }
  if (!stored.betsapiId) return detail

  // Estadísticas, tarjetas, estadio y alineaciones (si existen) desde el API de futbolme.
  const extra = await fetchRfefExtraDetail(stored.betsapiId, match, fetchFn)
  if (!extra) return detail

  return {
    ...detail,
    events: [...goals, ...extra.cards].sort(
      (a, b) => minuteToSortValue(a.minute) - minuteToSortValue(b.minute),
    ),
    stats: extra.stats,
    lineups: extra.lineups ?? detail.lineups,
    info: {
      ...detail.info,
      venue: stored.venue
        ? { ...extra.venue, ...stored.venue, capacity: extra.venue?.capacity }
        : extra.venue,
    },
  }
}


// ── Ficha de club RFEF (datos, plantilla y calendario desde futbolme.com) ──

export interface RfefClub {
  name: string
  slug: string
  futbolmeId: number
  leagueId: string
  groupCode: string
  crestId: number
}

const rfefClubs: RfefClub[] = RFEF_CLUB_INDEX.map(
  ([name, slug, futbolmeId, leagueId, groupCode, crestId]) => ({
    name,
    slug,
    futbolmeId,
    leagueId,
    groupCode,
    crestId,
  }),
)

export function listRfefClubs(): RfefClub[] {
  return rfefClubs
}

export function findRfefClub(teamId: string): RfefClub | undefined {
  return rfefClubs.find((c) => rfefTeamId(c.name) === teamId)
}

const stripTags = (s: string) =>
  decodeHtmlEntities(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())

export interface RfefTeamData {
  venue?: TeamVenue
  fullName?: string
  founded?: string
  website?: string
  kit?: string
}

/** Extrae estadio y datos del club de la pestaña «Datos» de un equipo en futbolme.com. */
export function parseRfefTeamData(html: string): RfefTeamData {
  const out: RfefTeamData = {}

  const venueMatch =
    /<div class="col-6">\s*<h3>([\s\S]*?)<\/h3>\s*<span>([\s\S]*?)<\/span>([\s\S]*?)<\/div>\s*<\/div>/i.exec(
      html.slice(html.indexOf('contenedorSuperiorEquipo')),
    )
  if (venueMatch) {
    const name = stripTags(venueMatch[1])
    const address = stripTags(venueMatch[2]).replace(/\s+-\s*$/, '')
    const city = address.includes(' - ') ? address.split(' - ').pop()?.trim() : undefined
    const rest = stripTags(venueMatch[3])
    const opened = /Año de inauguración:\s*(\d{4})/i.exec(rest)?.[1]
    const capacity = Number(/Capacidad:\s*(\d+)/i.exec(rest)?.[1])
    if (name) {
      out.venue = {
        name,
        address: address || undefined,
        city,
        opened,
        capacity: capacity > 0 ? capacity : undefined,
      }
    }
  }

  const clubBlock = html.slice(html.indexOf('<h3>Datos del club</h3>'))
  if (clubBlock.length > 30) {
    out.fullName = /<strong>([\s\S]*?)<\/strong>/i.exec(clubBlock)?.[1]?.trim()
    out.founded = /Fundado en\s*(\d{4})/i.exec(clubBlock)?.[1]
    out.website = /<a href='([^']+)'/i.exec(clubBlock)?.[1]
    const kit = /Equipación:\s*([\s\S]*?)<\/div>/i.exec(clubBlock)?.[1]
    if (kit) out.kit = stripTags(kit)
    if (out.fullName) out.fullName = decodeHtmlEntities(out.fullName)
  }

  return out
}

/** Extrae la plantilla (agrupada por demarcación) de la pestaña «Plantilla». */
export function parseRfefSquad(html: string): SquadPlayer[] {
  const sections = html.split('<h2 class="subtitulo">').slice(1)
  const players: SquadPlayer[] = []

  for (const section of sections) {
    const label = stripTags(section.split('</h2>')[0] ?? '')
    const position = /sin demarc/i.test(label) ? undefined : translatePosition(label).label
    const rows = section.split('<div class="row" style="margin-bottom: 10px;">').slice(1)

    for (const row of rows) {
      const name = /font-size: 15px'>\s*([^<]+?)\s*<\/span>/i.exec(row)?.[1]
      if (!name) continue
      const id = /jugador\/[^/']+\/(\d+)/i.exec(row)?.[1] ?? name
      const jersey = /class="badge"[^>]*>\s*(\d+)\s*<\/span>/i.exec(row)?.[1]
      const goals = Number(/<br \/>\s*(\d+)\s*<\/div>/i.exec(row)?.[1])
      players.push({
        id,
        name: decodeHtmlEntities(name),
        jersey,
        position,
        goals: Number.isFinite(goals) ? goals : undefined,
      })
    }
  }

  return players
}

/** Ficha completa de un club de 1ª, 2ª o 3ª RFEF a partir de su id (`rfef-...`). */
export async function fetchRfefTeamProfile(
  ref: TeamRef,
  fetchFn: FetchFn = fetch,
): Promise<TeamProfile> {
  const club = findRfefClub(ref.team.id)
  const description = fetchClubDescription(ref.team.name, fetchFn)

  if (!club) {
    return {
      team: ref.team,
      squad: [],
      pastMatches: [],
      upcomingMatches: [],
      description: await description,
    }
  }

  const group = getRfefGroups(club.leagueId).find((g) => g.code === club.groupCode)
  const base = `/resultados-directo/equipo/${club.slug}/${club.futbolmeId}`
  const team = {
    ...ref.team,
    logoUrl: ref.team.logoUrl ?? buildFutbolmeCrestUrl(club.crestId),
  }

  const [datos, plantilla, calendario, bundle, desc] = await Promise.allSettled([
    fetchFutbolmeHtml(`${base}/datos`, fetchFn, 'Datos del club'),
    fetchFutbolmeHtml(`${base}/plantilla`, fetchFn, 'contenedorSuperiorEquipo'),
    fetchFutbolmeHtml(`${base}/calendario`, fetchFn, 'cajaPartido'),
    group ? loadGroupBundle(club.leagueId, group, fetchFn) : Promise.reject(new Error('sin grupo')),
    description,
  ])

  const data = datos.status === 'fulfilled' ? parseRfefTeamData(datos.value) : {}
  const squad = plantilla.status === 'fulfilled' ? parseRfefSquad(plantilla.value) : []

  let matches: Match[] = []
  if (group && calendario.status === 'fulfilled') {
    matches = parseMatchBlocks(calendario.value, club.leagueId, group).map((m) => m.match)
  } else if (bundle.status === 'fulfilled') {
    const id = rfefTeamId(club.name)
    matches = bundle.value.allMatches.filter(
      (m) => m.homeTeam.id === id || m.awayTeam.id === id,
    )
  }

  let standingSummary: string | undefined
  if (bundle.status === 'fulfilled') {
    const row = bundle.value.standings.find((r) => r.team.id === rfefTeamId(club.name))
    if (row) standingSummary = `${row.rank}º · ${row.points} pts · ${row.played} PJ`
  }

  const leagueName = leagueCatalog.find((l) => l.id === club.leagueId)?.name
  // clubRegistry pesa ~128 kB: se carga solo al abrir la ficha de un club RFEF.
  const { getVerifiedClubInfo } = await import('./clubRegistry')
  const verified = getVerifiedClubInfo(ref.team.name, ref.team.id)
  const venue = data.venue ?? verified?.venue
  const city = venue?.city ?? data.venue?.city ?? verified?.location

  const finalDescription =
    (desc.status === 'fulfilled' ? desc.value : undefined) ??
    verified?.description ?? {
      text: `${club.name} compite en ${leagueName ?? 'categorías nacionales'}. Entidad histórica del fútbol español.`,
    }

  return {
    team,
    leagueId: club.leagueId,
    leagueName: group ? `${leagueName} · ${group.name}` : leagueName,
    groupCode: club.groupCode,
    fullName: data.fullName ?? verified?.fullName ?? club.name,
    founded: data.founded ?? verified?.founded,
    location: city,
    website: data.website ?? verified?.website,
    kit: data.kit ?? verified?.kit,
    venue,
    standingSummary,
    description: finalDescription,
    squad,
    pastMatches: matches
      .filter((m) => m.status === 'finished')
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))
      .slice(0, 10),
    upcomingMatches: matches
      .filter((m) => m.status !== 'finished')
      .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
      .slice(0, 10),
  }
}

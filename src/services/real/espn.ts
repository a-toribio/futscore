import { toCompactDate } from '@/lib/date'
import { isNationalTeamLeague, translateNationalTeamName } from '@/lib/nationalTeams'
import { resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import { fetchJson, ProviderError, type FetchFn } from '@/services/errors'
import { leagueCatalog } from '@/services/leagueCatalog'
import type { MatchesProvider } from '@/services/matchesProvider'
import type {
  LeagueStandings,
  LivePhase,
  Match,
  MatchDetail,
  MatchEvent,
  MatchEventType,
  MatchStatItem,
  Player,
  QualificationZone,
  StandingRow,
  TeamLineup,
} from '@/types'
import {
  createDefaultMatchDetail,
  createRealProvider,
  deriveShortName,
} from './createRealProvider'
import { registerDynamicPlayers } from './playerIndex'
import { getPlayerPhotoSync } from './playerPhotos'
import {
  fetchRfefLeagueMatches,
  fetchRfefMatchesByDate,
  fetchRfefStandings,
  getRfefMatchDetail,
  isRfefLeague,
} from './rfef'

// ── Tipos mínimos de la respuesta de ESPN ──
interface EspnStatus {
  clock?: number
  displayClock?: string
  period?: number
  type?: { name?: string; state?: 'pre' | 'in' | 'post' }
}
interface EspnCompetitor {
  homeAway?: 'home' | 'away'
  score?: string
  team?: { id?: string; abbreviation?: string; displayName?: string; logo?: string }
}
interface EspnEvent {
  id?: string
  date?: string
  status?: EspnStatus
  competitions?: { status?: EspnStatus; competitors?: EspnCompetitor[] }[]
}
interface EspnScoreboard {
  events?: EspnEvent[]
  leagues?: {
    calendar?: (string | { value?: string })[]
  }[]
}

// ── Tipos para el resumen del partido (Match Detail) ──
interface EspnKeyEvent {
  id?: string
  text?: string
  clock?: { displayValue?: string }
  type?: { id?: string; text?: string }
  team?: { id?: string }
}

interface EspnRosterItem {
  starter?: boolean
  jersey?: string
  athlete?: {
    id?: string
    displayName?: string
    shortName?: string
    headshot?: { href?: string }
    photoUrl?: string
  }
  position?: { abbreviation?: string; name?: string }
}

interface EspnTeamRoster {
  team?: { id?: string; displayName?: string }
  formation?: string
  roster?: EspnRosterItem[]
  coach?: { displayName?: string }[]
}

interface EspnOfficial {
  displayName?: string
  fullName?: string
}

interface EspnSummaryResponse {
  keyEvents?: EspnKeyEvent[]
  rosters?: EspnTeamRoster[]
  gameInfo?: {
    venue?: { fullName?: string; capacity?: number; address?: { city?: string } }
    attendance?: number
    officials?: EspnOfficial[]
  }
  header?: {
    competitions?: {
      broadcast?: string
      broadcasts?: { names?: string[]; media?: { shortName?: string } }[]
      notes?: { headline?: string }[]
      officials?: EspnOfficial[]
    }[]
  }
  boxscore?: {
    officials?: EspnOfficial[]
    teams?: {
      team?: { id?: string; displayName?: string }
      statistics?: { name?: string; displayValue?: string; label?: string }[]
    }[]
  }
  news?: {
    articles?: {
      headline?: string
      description?: string
      story?: string
    }[]
  }
  odds?: { details?: string }[]
}

/** Estados que no son partidos jugables (se descartan de la lista). */
const SKIPPED_STATUSES = /POSTPONED|CANCELED|CANCELLED|ABANDONED|DELAYED/

function parseMinute(status: EspnStatus): number {
  const fromDisplay = /^(\d+)/.exec(status.displayClock ?? '')
  if (fromDisplay) return Math.max(1, Number(fromDisplay[1]))
  return Math.max(1, Math.floor((status.clock ?? 0) / 60))
}

function livePhase(status: EspnStatus): LivePhase {
  const name = status.type?.name ?? ''
  if (name.includes('HALFTIME')) return 'half_time'
  if ((status.period ?? 1) >= 3 || name.includes('EXTRA') || name.includes('SHOOTOUT')) return 'extra_time'
  return (status.period ?? 1) >= 2 ? 'second_half' : 'first_half'
}

/** Convierte un evento de ESPN en `Match`; devuelve `null` si no es válido o no aplica. */
export function mapEspnEvent(event: EspnEvent, leagueId: string): Match | null {
  const competition = event.competitions?.[0]
  const status = event.status ?? competition?.status
  const home = competition?.competitors?.find((c) => c.homeAway === 'home')
  const away = competition?.competitors?.find((c) => c.homeAway === 'away')
  const state = status?.type?.state

  if (!event.id || !event.date || !status || !state || !home?.team || !away?.team) return null
  if (SKIPPED_STATUSES.test(status.type?.name ?? '')) return null

  const team = (c: EspnCompetitor) => {
    const rawName = c.team?.displayName ?? 'Equipo'
    const isNat = isNationalTeamLeague(leagueId) || Boolean(c.team?.logo?.includes('/countries/'))
    const name = isNat ? translateNationalTeamName(rawName, true) : rawName
    return {
      id: `espn-${c.team?.id ?? rawName}`,
      name,
      shortName: c.team?.abbreviation ?? deriveShortName(name),
      logoUrl: resolveSpanishTeamCrest(name, c.team?.logo),
    }
  }

  const base = {
    id: `espn-${event.id}`,
    leagueId,
    homeTeam: team(home),
    awayTeam: team(away),
    kickoff: new Date(event.date).toISOString(),
  }
  const score = { home: Number(home.score ?? 0) || 0, away: Number(away.score ?? 0) || 0 }

  if (state === 'pre') return { ...base, status: 'scheduled', score: null }
  if (state === 'post') return { ...base, status: 'finished', score }

  const phase = livePhase(status)
  return {
    ...base,
    status: 'live',
    score,
    phase,
    minute: phase === 'half_time' ? 45 : parseMinute(status),
  }
}

function mapEventType(typeText = ''): MatchEventType {
  const lower = typeText.toLowerCase()
  if (lower.includes('goal') || lower.includes('gol')) return 'goal'
  if (lower.includes('yellow card') || lower.includes('amarilla')) return 'yellow_card'
  if (lower.includes('red card') || lower.includes('roja')) return 'red_card'
  if (lower.includes('substitution') || lower.includes('cambio')) return 'substitution'
  if (lower.includes('penalty') || lower.includes('penalti')) return 'penalty'
  if (lower.includes('var')) return 'var'
  return 'other'
}

/**
 * Parsea el texto del evento de ESPN para extraer de forma limpia el jugador,
 * asistente, sustitución, etc., evitando frases largas en inglés.
 */
export function parseEspnEventDetails(text: string, rawType = '') {
  let type = mapEventType(rawType)
  let player: string | undefined
  let assistPlayer: string | undefined
  let subIn: string | undefined
  let subOut: string | undefined
  let isPenalty = false
  let isOwnGoal = false

  const clean = text.trim()

  // 1. Gol en propia puerta: "Own Goal by Sergio Ramos (Sevilla)."
  const ownGoalMatch = /Own Goal by\s+([^(.]+)/i.exec(clean)
  if (ownGoalMatch) {
    type = 'goal'
    isOwnGoal = true
    player = ownGoalMatch[1].trim()
  } else {
    // 2. Gol normal o penalti: "Goal! Elche 0, Real Betis 2. Marc Bartra (Real Betis)..."
    const goalMatch = /Goal!\s+[^.]+\.\s+([^(]+)\s*\([^)]*\)/i.exec(clean)
    if (goalMatch) {
      type = 'goal'
      player = goalMatch[1].trim()
      if (/converts the penalty|penalty shot|penalty/i.test(clean)) {
        isPenalty = true
      }
      const assistMatch = /Assisted by\s+([^.]+?)(?:\s+with|\s+following|\.|$)/i.exec(clean)
      if (assistMatch) {
        assistPlayer = assistMatch[1].trim()
      }
    }
  }

  // 3. Tarjetas: "Federico Redondo (Elche) is shown the yellow card..."
  const cardMatch = /^([^(]+)\s*\([^)]*\)\s+is shown the (yellow|red) card/i.exec(clean)
  if (cardMatch) {
    player = cardMatch[1].trim()
    type = cardMatch[2].toLowerCase() === 'red' ? 'red_card' : 'yellow_card'
  }

  // 4. Sustituciones: "Substitution, Real Betis. Dani Ceballos replaces Pablo Fornals."
  const subMatch = /Substitution,[^.]*\.\s+([^.]+?)\s+replaces\s+([^.]+?)(?:\s+because|\.|$)/i.exec(clean)
  if (subMatch) {
    type = 'substitution'
    subIn = subMatch[1].trim()
    subOut = subMatch[2].trim()
    player = subIn
  }

  // Fallback si no encajó en las anteriores
  if (!player && !subIn) {
    const parenMatch = /^([^(]+)\s*\(/i.exec(clean)
    if (parenMatch) {
      player = parenMatch[1].trim()
    } else {
      player = clean
    }
  }

  return { type, player, assistPlayer, subIn, subOut, isPenalty, isOwnGoal }
}

export function mapEspnSummary(data: EspnSummaryResponse, match: Match): MatchDetail {
  const homeEspnId = match.homeTeam.id.replace(/^espn-/, '')

  // 1. Mapear Eventos limpios
  const events: MatchEvent[] = (data.keyEvents ?? [])
    .filter((e) => e.text && e.text.trim().length > 0)
    .map((e, index) => {
      const parsed = parseEspnEventDetails(e.text || '', e.type?.text)
      const minute = e.clock?.displayValue || ''
      const isHome = e.team?.id ? e.team.id === homeEspnId : undefined

      return {
        id: e.id || `event-${index}`,
        minute,
        type: parsed.type,
        teamId: e.team?.id,
        isHome,
        text: e.text || '',
        player: parsed.player,
        assistPlayer: parsed.assistPlayer,
        subIn: parsed.subIn,
        subOut: parsed.subOut,
        isPenalty: parsed.isPenalty,
        isOwnGoal: parsed.isOwnGoal,
      }
    })

  // 2. Mapear Alineaciones
  const mapRoster = (raw?: EspnTeamRoster, fallbackTeam = match.homeTeam): TeamLineup => {
    const starters: Player[] = []
    const substitutes: Player[] = []

    for (const item of raw?.roster ?? []) {
      const rawAthlete = item.athlete
      const athleteId = rawAthlete?.id
      const playerName = rawAthlete?.displayName || rawAthlete?.shortName || 'Jugador'
      const photoUrl =
        rawAthlete?.headshot?.href ||
        rawAthlete?.photoUrl ||
        getPlayerPhotoSync(playerName)

      const player: Player = {
        id: athleteId || rawAthlete?.displayName || Math.random().toString(),
        name: playerName,
        jersey: item.jersey,
        position: item.position?.abbreviation || item.position?.name,
        starter: !!item.starter,
        photoUrl,
        teamId: fallbackTeam.id,
        teamName: fallbackTeam.name,
      }
      if (item.starter) {
        starters.push(player)
      } else {
        substitutes.push(player)
      }
    }

    return {
      team: fallbackTeam,
      formation: raw?.formation,
      starters,
      substitutes,
      coach: raw?.coach?.[0]?.displayName,
    }
  }

  const rosters = data.rosters ?? []
  const homeRoster = rosters.find((r) => r.team?.id === homeEspnId) || rosters[0]
  const awayRoster = rosters.find((r) => r !== homeRoster) || rosters[1]

  const lineups = {
    home: mapRoster(homeRoster, match.homeTeam),
    away: mapRoster(awayRoster, match.awayTeam),
  }

  // Registrar jugadores en el índice de búsqueda
  if (lineups.home.starters.length > 0 || lineups.home.substitutes.length > 0) {
    registerDynamicPlayers(
      [...lineups.home.starters, ...lineups.home.substitutes],
      match.homeTeam,
      match.leagueId,
    )
  }
  if (lineups.away.starters.length > 0 || lineups.away.substitutes.length > 0) {
    registerDynamicPlayers(
      [...lineups.away.starters, ...lineups.away.substitutes],
      match.awayTeam,
      match.leagueId,
    )
  }

  // 3. Mapear Información (Estadio, TV, etc.)
  const comp = data.header?.competitions?.[0]
  const broadcastItem = comp?.broadcasts?.[0]
  const broadcast =
    broadcastItem?.media?.shortName ||
    broadcastItem?.names?.join(', ') ||
    comp?.broadcast ||
    undefined

  // Extracción exhaustiva del árbitro/colegiado
  const findReferee = (): string | undefined => {
    const fromGame =
      data.gameInfo?.officials?.[0]?.displayName ||
      data.gameInfo?.officials?.[0]?.fullName
    if (fromGame && fromGame.trim()) return fromGame.trim()

    const fromComp =
      comp?.officials?.[0]?.displayName ||
      comp?.officials?.[0]?.fullName
    if (fromComp && fromComp.trim()) return fromComp.trim()

    const fromBox =
      data.boxscore?.officials?.[0]?.displayName ||
      data.boxscore?.officials?.[0]?.fullName
    if (fromBox && fromBox.trim()) return fromBox.trim()

    for (const art of data.news?.articles ?? []) {
      const text = `${art.headline ?? ''} ${art.description ?? ''} ${art.story ?? ''}`
      const m = /(?:[Rr]eferee|[Áá]rbitro|[Aa]rbitro|[Cc]olegiado)\s*:?\s*([A-ZÁÉÍÓÚ][a-záéíóú]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóú]+){1,3})/.exec(text)
      if (m && m[1]) return m[1].trim()
    }

    return undefined
  }

  // 4. Mapear Estadísticas del encuentro (boxscore.teams)
  const statDefinitions: { key: string; label: string; isPercentage?: boolean }[] = [
    { key: 'possessionPct', label: 'Posesión', isPercentage: true },
    { key: 'totalShots', label: 'Remates totales' },
    { key: 'shotsOnTarget', label: 'Remates a puerta' },
    { key: 'wonCorners', label: 'Saques de esquina' },
    { key: 'foulsCommitted', label: 'Faltas cometidas' },
    { key: 'offsides', label: 'Fueras de juego' },
    { key: 'saves', label: 'Paradas del portero' },
    { key: 'yellowCards', label: 'Tarjetas amarillas' },
    { key: 'redCards', label: 'Tarjetas rojas' },
    { key: 'accuratePasses', label: 'Pases completados' },
    { key: 'totalPasses', label: 'Pases totales' },
    { key: 'effectiveTackles', label: 'Entradas con éxito' },
    { key: 'blockedShots', label: 'Disparos bloqueados' },
    { key: 'effectiveClearance', label: 'Despejes' },
  ]

  const boxTeams = data.boxscore?.teams ?? []
  const homeBox = boxTeams.find((t) => t.team?.id === homeEspnId) || boxTeams[0]
  const awayBox = boxTeams.find((t) => t !== homeBox) || boxTeams[1]

  const stats: MatchStatItem[] = []
  if (homeBox?.statistics?.length && awayBox?.statistics?.length) {
    const homeMap = new Map(homeBox.statistics.map((s) => [s.name ?? '', s.displayValue ?? '0']))
    const awayMap = new Map(awayBox.statistics.map((s) => [s.name ?? '', s.displayValue ?? '0']))

    for (const def of statDefinitions) {
      const hRaw = homeMap.get(def.key)
      const aRaw = awayMap.get(def.key)
      if (hRaw !== undefined && aRaw !== undefined) {
        const hNum = parseFloat(hRaw.replace('%', '')) || 0
        const aNum = parseFloat(aRaw.replace('%', '')) || 0
        stats.push({
          key: def.key,
          label: def.label,
          homeValue: def.isPercentage ? `${Math.round(hNum)}%` : hRaw,
          awayValue: def.isPercentage ? `${Math.round(aNum)}%` : aRaw,
          homeNumeric: hNum,
          awayNumeric: aNum,
          isPercentage: def.isPercentage,
        })
      }
    }
  }

  const info = {
    venue: data.gameInfo?.venue?.fullName
      ? {
          name: data.gameInfo.venue.fullName,
          city: data.gameInfo.venue.address?.city,
          capacity: data.gameInfo.venue.capacity,
        }
      : undefined,
    broadcast,
    referee: findReferee(),
    attendance: data.gameInfo?.attendance,
    round: comp?.notes?.[0]?.headline,
    odds: data.odds?.[0]?.details,
  }

  return {
    match,
    events,
    stats,
    lineups,
    info,
  }
}

// ── Clasificación en vivo (Standings) ──

interface EspnStandingEntry {
  team?: {
    id?: string
    displayName?: string
    shortDisplayName?: string
    abbreviation?: string
    logos?: { href?: string }[]
  }
  note?: {
    color?: string
    description?: string
    rank?: number
  }
  stats?: {
    name?: string
    displayValue?: string
    value?: number
  }[]
}

export interface EspnStandingsResponse {
  name?: string
  season?: { displayName?: string }
  children?: {
    name?: string
    standings?: {
      entries?: EspnStandingEntry[]
    }
  }[]
  standings?: {
    entries?: EspnStandingEntry[]
  }
}

function classifyZone(
  leagueId: string,
  rank: number,
  totalRows = 20,
): { zone: QualificationZone; label?: string } {
  // 1. Fase de Liga UEFA (Champions, Europa League, Conference League - 36 equipos)
  if (leagueId === 'ucl' || leagueId === 'europa' || leagueId === 'conf') {
    if (rank >= 1 && rank <= 8) {
      return { zone: 'champions', label: 'Octavos de final (Directo)' }
    }
    if (rank >= 9 && rank <= 24) {
      return { zone: 'europa', label: 'Playoffs eliminatorios' }
    }
    if (rank >= 25) {
      return { zone: 'relegation', label: 'Eliminado' }
    }
    return { zone: 'none' }
  }

  // 2. Segunda División de España (LaLiga Hypermotion - 22 equipos)
  if (leagueId === 'segunda') {
    if (rank >= 1 && rank <= 2) {
      return { zone: 'promotion', label: 'Ascenso directo a LaLiga' }
    }
    if (rank >= 3 && rank <= 6) {
      return { zone: 'europa', label: 'Playoffs de ascenso' }
    }
    if (totalRows >= 18 && rank > totalRows - 4) {
      return { zone: 'relegation', label: 'Descenso a 1ª RFEF' }
    }
    return { zone: 'none' }
  }

  // 3. EFL Championship (Inglaterra - 24 equipos)
  if (leagueId === 'championship') {
    if (rank >= 1 && rank <= 2) {
      return { zone: 'promotion', label: 'Ascenso directo a Premier League' }
    }
    if (rank >= 3 && rank <= 6) {
      return { zone: 'europa', label: 'Playoffs de ascenso' }
    }
    if (totalRows >= 20 && rank > totalRows - 3) {
      return { zone: 'relegation', label: 'Descenso a League One' }
    }
    return { zone: 'none' }
  }

  // 4. EFL League One (Inglaterra - 24 equipos)
  if (leagueId === 'league_one') {
    if (rank >= 1 && rank <= 2) {
      return { zone: 'promotion', label: 'Ascenso directo a Championship' }
    }
    if (rank >= 3 && rank <= 6) {
      return { zone: 'europa', label: 'Playoffs de ascenso' }
    }
    if (totalRows >= 20 && rank > totalRows - 4) {
      return { zone: 'relegation', label: 'Descenso a League Two' }
    }
    return { zone: 'none' }
  }

  // 5. EFL League Two (Inglaterra - 24 equipos)
  if (leagueId === 'league_two') {
    if (rank >= 1 && rank <= 3) {
      return { zone: 'promotion', label: 'Ascenso directo a League One' }
    }
    if (rank >= 4 && rank <= 7) {
      return { zone: 'europa', label: 'Playoffs de ascenso' }
    }
    if (totalRows >= 20 && rank > totalRows - 2) {
      return { zone: 'relegation', label: 'Descenso a National League' }
    }
    return { zone: 'none' }
  }

  // 3. Grandes ligas europeas (LaLiga, Premier, Serie A, Bundesliga, Ligue 1)
  if (
    leagueId === 'laliga' ||
    leagueId === 'premier' ||
    leagueId === 'seriea' ||
    leagueId === 'bundesliga' ||
    leagueId === 'ligue1'
  ) {
    if (rank >= 1 && rank <= 4) {
      return { zone: 'champions', label: 'Champions League' }
    }
    if (rank === 5) {
      return { zone: 'europa', label: 'Europa League' }
    }
    if (rank === 6) {
      return { zone: 'conference', label: 'Conference League' }
    }
    if (totalRows >= 16 && rank > totalRows - 3) {
      return { zone: 'relegation', label: 'Descenso' }
    }
    return { zone: 'none' }
  }

  // 4. Competiciones de selecciones nacionales
  if (leagueId === 'worldq_conmebol') {
    if (rank >= 1 && rank <= 6) {
      return { zone: 'champions', label: 'Clasificación directa al Mundial' }
    }
    if (rank === 7) {
      return { zone: 'europa', label: 'Repesca internacional' }
    }
    return { zone: 'none' }
  }
  if (isNationalTeamLeague(leagueId)) {
    return { zone: 'none' }
  }

  // 5. Otras ligas nacionales (Argentina, Brasil, México, MLS)
  if (rank >= 1 && rank <= 4) {
    return { zone: 'champions', label: 'Clasificación continental / Playoffs' }
  }
  if (rank >= 5 && rank <= 8) {
    return { zone: 'europa', label: 'Fase clasificatoria' }
  }
  if (totalRows >= 16 && rank > totalRows - 3) {
    return { zone: 'relegation', label: 'Descenso' }
  }

  return { zone: 'none' }
}

export function mapEspnStandings(data: EspnStandingsResponse, leagueId: string): LeagueStandings {
  const catalogEntry = leagueCatalog.find((l) => l.id === leagueId)
  const rawEntries =
    data.children && data.children.length > 1
      ? data.children.flatMap((c) => c.standings?.entries ?? [])
      : (data.children?.[0]?.standings?.entries ?? data.standings?.entries ?? [])

  const isNatLeague = isNationalTeamLeague(leagueId)
  const totalRows = rawEntries.length
  const parsed = rawEntries.map((entry, idx) => {
    const statMap = new Map(
      (entry.stats ?? []).map((s) => [s.name ?? '', { display: s.displayValue ?? '0', val: s.value ?? 0 }]),
    )
    const getNum = (name: string) => Number(statMap.get(name)?.display ?? statMap.get(name)?.val ?? 0) || 0
    const rawRank = getNum('rank') || idx + 1
    const rawTeamName = entry.team?.displayName ?? entry.team?.shortDisplayName ?? 'Equipo'
    const logoHref = entry.team?.logos?.[0]?.href
    const isNat = isNatLeague || Boolean(logoHref?.includes('/countries/'))
    const teamName = isNat ? translateNationalTeamName(rawTeamName, true) : rawTeamName

    const diffRaw = statMap.get('pointDifferential')?.display ?? '0'
    const diffNum = Number(diffRaw) || 0
    const goalDiff = diffNum > 0 && !diffRaw.startsWith('+') ? `+${diffNum}` : String(diffRaw)

    return {
      rawRank,
      diffNum,
      team: {
        id: `espn-${entry.team?.id ?? rawTeamName}`,
        name: teamName,
        shortName: entry.team?.abbreviation ?? deriveShortName(teamName),
        logoUrl: resolveSpanishTeamCrest(teamName, logoHref),
      },
      played: getNum('gamesPlayed'),
      wins: getNum('wins'),
      draws: getNum('ties'),
      losses: getNum('losses'),
      goalsFor: getNum('pointsFor'),
      goalsAgainst: getNum('pointsAgainst'),
      goalDiff,
      points: getNum('points'),
    }
  })

  // Ordenar estrictamente por puntos DESC, diferencia de goles DESC, goles a favor DESC y rank original
  parsed.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.diffNum !== a.diffNum) return b.diffNum - a.diffNum
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
    return a.rawRank - b.rawRank
  })

  const rows: StandingRow[] = parsed.map((item, index) => {
    const rank = index + 1
    const { zone, label } = classifyZone(leagueId, rank, totalRows)
    return {
      rank,
      team: item.team,
      played: item.played,
      wins: item.wins,
      draws: item.draws,
      losses: item.losses,
      goalsFor: item.goalsFor,
      goalsAgainst: item.goalsAgainst,
      goalDiff: item.goalDiff,
      points: item.points,
      zone,
      zoneLabel: label,
    }
  })

  return {
    leagueId,
    leagueName: catalogEntry?.name ?? data.name ?? 'Clasificación',
    seasonName: data.season?.displayName,
    rows,
  }
}

export const ESPN_STANDINGS_PUBLIC_BASE = 'https://site.api.espn.com/apis/v2/sports/soccer'
export const ESPN_STANDINGS_PROXY_BASE = '/api/espn-v2'

const standingsCache = new Map<string, { at: number; promise: Promise<LeagueStandings> }>()

export async function fetchEspnStandings(
  leagueId: string,
  fetchFn: FetchFn = fetch,
  groupCode?: string,
): Promise<LeagueStandings> {
  if (isRfefLeague(leagueId)) {
    return fetchRfefStandings(leagueId, groupCode, fetchFn)
  }

  const now = Date.now()
  const hit = standingsCache.get(leagueId)
  if (hit && now - hit.at < 2 * 60_000) return hit.promise

  const entry = leagueCatalog.find((l) => l.id === leagueId)
  const slug = entry?.sources.espn ?? 'esp.1'
  const path = `/${slug}/standings`

  const load = async (): Promise<LeagueStandings> => {
    try {
      const data = await fetchJson<EspnStandingsResponse>(`${ESPN_STANDINGS_PUBLIC_BASE}${path}`, fetchFn)
      return mapEspnStandings(data, leagueId)
    } catch (primaryErr) {
      if (typeof window !== 'undefined') {
        const data = await fetchJson<EspnStandingsResponse>(`${ESPN_STANDINGS_PROXY_BASE}${path}`, fetchFn)
        return mapEspnStandings(data, leagueId)
      }
      throw primaryErr
    }
  }

  const promise = load()
  standingsCache.set(leagueId, { at: now, promise })
  promise.catch(() => {
    if (standingsCache.get(leagueId)?.promise === promise) standingsCache.delete(leagueId)
  })
  return promise
}

export interface LeagueScheduleResult {
  pastMatches: Match[]
  upcomingMatches: Match[]
}

const leagueMatchesCache = new Map<string, { at: number; promise: Promise<LeagueScheduleResult> }>()

/**
 * Obtiene tanto los partidos recientes ya jugados como los próximos encuentros de una competición
 * usando el calendario oficial de jornadas de ESPN para esa liga.
 */
export async function fetchEspnLeagueMatches(
  leagueId: string,
  fetchFn: FetchFn = fetch,
  groupCode?: string,
): Promise<LeagueScheduleResult> {
  if (isRfefLeague(leagueId)) {
    return fetchRfefLeagueMatches(leagueId, groupCode, fetchFn)
  }

  const now = Date.now()
  const hit = leagueMatchesCache.get(leagueId)
  if (hit && now - hit.at < 2 * 60_000) return hit.promise

  const entry = leagueCatalog.find((l) => l.id === leagueId)
  const slug = entry?.sources.espn ?? 'esp.1'

  async function fetchScoreboard(path: string): Promise<EspnScoreboard> {
    try {
      return await fetchJson<EspnScoreboard>(`${ESPN_PUBLIC_BASE}${path}`, fetchFn)
    } catch (primaryErr) {
      if (typeof window !== 'undefined') {
        return await fetchJson<EspnScoreboard>(`${ESPN_PROXY_BASE}${path}`, fetchFn)
      }
      throw primaryErr
    }
  }

  const load = async (): Promise<LeagueScheduleResult> => {
    const baseData = await fetchScoreboard(`/${slug}/scoreboard`)

    // Calcular los años de la temporada actual (ej. 2025-2026 o 2026-2027)
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1..12

    const seasonYears =
      currentMonth >= 7 ? [currentYear, currentYear + 1] : [currentYear - 1, currentYear]

    // Consultamos los scoreboards anuales de ESPN para ambos años con limit=1000.
    // Esto obtiene todas las jornadas de la temporada completa (desde agosto hasta mayo/junio).
    const boards = await Promise.allSettled([
      fetchScoreboard(`/${slug}/scoreboard?dates=${seasonYears[0]}&limit=1000`),
      fetchScoreboard(`/${slug}/scoreboard?dates=${seasonYears[1]}&limit=1000`),
    ])

    const allEvents: EspnEvent[] = [...(baseData.events ?? [])]
    let seasonEventsLoaded = false

    for (const res of boards) {
      if (res.status === 'fulfilled' && Array.isArray(res.value.events)) {
        if (res.value.events.length > 0) {
          seasonEventsLoaded = true
        }
        allEvents.push(...res.value.events)
      }
    }

    // Si la API anual no devolvió eventos adicionales (ej. torneos de copa eliminatorios),
    // consultamos las fechas provistas en el calendario oficial de la competición.
    if (!seasonEventsLoaded) {
      const rawCalendar = baseData.leagues?.[0]?.calendar ?? []
      const calDates = rawCalendar
        .map((c) => (typeof c === 'string' ? c : c.value ?? '').slice(0, 10).replace(/-/g, ''))
        .filter((d) => /^\d{8}$/.test(d))

      if (calDates.length > 0) {
        const calendarBoards = await Promise.allSettled(
          calDates.map((d) => fetchScoreboard(`/${slug}/scoreboard?dates=${d}`)),
        )
        for (const res of calendarBoards) {
          if (res.status === 'fulfilled' && Array.isArray(res.value.events)) {
            allEvents.push(...res.value.events)
          }
        }
      }
    }

    const seen = new Set<string>()
    const matches: Match[] = []
    for (const ev of allEvents) {
      const m = mapEspnEvent(ev, leagueId)
      if (m && !seen.has(m.id)) {
        seen.add(m.id)
        matches.push(m)
      }
    }

    const pastMatches = matches
      .filter((m) => m.status === 'finished')
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))

    const upcomingMatches = matches
      .filter((m) => m.status !== 'finished')
      .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))

    return { pastMatches, upcomingMatches }
  }

  const promise = load()
  leagueMatchesCache.set(leagueId, { at: now, promise })
  promise.catch(() => {
    if (leagueMatchesCache.get(leagueId)?.promise === promise) leagueMatchesCache.delete(leagueId)
  })
  return promise
}

const seasonMatchesCache = new Map<string, Promise<Match[]>>()

/**
 * Consulta y cachea todos los partidos finalizados de un año/temporada completa de una competición.
 * Permite encontrar todos los enfrentamientos previos entre dos clubes en temporadas anteriores.
 */
export async function fetchEspnSeasonMatches(
  leagueId: string,
  year: number,
  fetchFn: FetchFn = fetch,
): Promise<Match[]> {
  const cacheKey = `${leagueId}:${year}`
  const hit = seasonMatchesCache.get(cacheKey)
  if (hit) return hit

  const entry = leagueCatalog.find((l) => l.id === leagueId)
  const slug = entry?.sources.espn ?? 'esp.1'

  async function fetchScoreboard(path: string): Promise<EspnScoreboard> {
    try {
      return await fetchJson<EspnScoreboard>(`${ESPN_PUBLIC_BASE}${path}`, fetchFn)
    } catch (primaryErr) {
      if (typeof window !== 'undefined') {
        return await fetchJson<EspnScoreboard>(`${ESPN_PROXY_BASE}${path}`, fetchFn)
      }
      throw primaryErr
    }
  }

  const load = async (): Promise<Match[]> => {
    try {
      const data = await fetchScoreboard(`/${slug}/scoreboard?dates=${year}&limit=1000`)
      if (!Array.isArray(data.events)) return []

      const matches: Match[] = []
      for (const ev of data.events) {
        const m = mapEspnEvent(ev, leagueId)
        if (m && m.status === 'finished' && m.score) {
          matches.push(m)
        }
      }
      return matches
    } catch {
      return []
    }
  }

  const p = load()
  seasonMatchesCache.set(cacheKey, p)
  p.catch(() => {
    if (seasonMatchesCache.get(cacheKey) === p) seasonMatchesCache.delete(cacheKey)
  })
  return p
}

export interface EspnProviderOptions {
  /** URL base para las peticiones de ESPN. Por defecto usa la API pública con CORS abierto. */
  baseUrl?: string
  fetchFn?: FetchFn
  now?: () => Date
}

/** Tiempo máximo que la portada espera a las ligas RFEF (scraping lento) antes de mostrar el resto. */
const RFEF_GRACE_MS = 4000

/**
 * Espera a promise como mucho ms. Si tarda más, resuelve con [] para no bloquear la portada
 * y avisa con onLate cuando termine, para que la UI recargue con esos datos.
 */
function withGrace(promise: Promise<Match[]>, ms: number, onLate?: () => void): Promise<Match[]> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      resolve([])
      promise.then(() => onLate?.(), () => {})
    }, ms)
    promise.then(
      (value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

export const ESPN_PUBLIC_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer'
export const ESPN_PROXY_BASE = '/api/espn'

export function createEspnProvider({
  baseUrl,
  fetchFn = fetch,
  now,
}: EspnProviderOptions = {}): MatchesProvider {
  async function fetchWithProxyFallback<T>(path: string): Promise<T> {
    const primary = baseUrl ? `${baseUrl}${path}` : `${ESPN_PUBLIC_BASE}${path}`
    try {
      return await fetchJson<T>(primary, fetchFn)
    } catch (primaryErr) {
      if (!baseUrl && typeof window !== 'undefined') {
        try {
          return await fetchJson<T>(`${ESPN_PROXY_BASE}${path}`, fetchFn)
        } catch {
          // Fallo secundario ignorado, se lanza el original
        }
      }
      throw primaryErr
    }
  }

  return createRealProvider({
    name: 'ESPN',
    liveRefetchMs: 15_000,
    ttlMs: { today: 15_000, other: 5 * 60_000 },
    now,
    async fetchMatches(date, onLate) {
      const compactDate = toCompactDate(date)

      const results = await Promise.allSettled(
        leagueCatalog.map(async ({ id, sources }) => {
          if (isRfefLeague(id)) {
            if (baseUrl) return []
            return withGrace(fetchRfefMatchesByDate(id, date, fetchFn), RFEF_GRACE_MS, onLate)
          }
          const path = `/${sources.espn}/scoreboard?dates=${compactDate}`
          const data = await fetchWithProxyFallback<EspnScoreboard>(path)
          if (!Array.isArray(data.events)) {
            throw new ProviderError('schema', `ESPN: respuesta inesperada para ${sources.espn}`)
          }
          return data.events.map((e) => mapEspnEvent(e, id)).filter((m): m is Match => m !== null)
        }),
      )

      const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      if (failures.length === results.length) {
        throw failures[0].reason
      }
      return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    },

    async fetchMatchDetail(match: Match): Promise<MatchDetail> {
      if (isRfefLeague(match.leagueId) || match.id.startsWith('rfef-')) {
        return getRfefMatchDetail(match, fetchFn)
      }
      const rawId = match.id.replace(/^espn-/, '')
      const entry = leagueCatalog.find((l) => l.id === match.leagueId)
      const slug = entry?.sources.espn ?? 'esp.1'
      const path = `/${slug}/summary?event=${rawId}`

      try {
        const data = await fetchWithProxyFallback<EspnSummaryResponse>(path)
        return mapEspnSummary(data, match)
      } catch {
        return createDefaultMatchDetail(match)
      }
    },
  })
}

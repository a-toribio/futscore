import {
  ALL_KNOWN_NATIONAL_TEAMS,
  getVerifiedNationalTeamInfo,
  isNationalTeam,
  isNationalTeamLeague,
  translateNationalTeamName,
} from '@/lib/nationalTeams'
import { translatePosition } from '@/lib/positions'
import { buildFutbolmeCrestUrl, resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import { fetchJson, type FetchFn } from '@/services/errors'
import { leagueCatalog } from '@/services/leagueCatalog'
import type {
  Match,
  SearchResult,
  SquadPlayer,
  Team,
  TeamProfile,
  TeamRef,
  TeamVenue,
} from '@/types'
import { getVerifiedClubInfo } from './clubRegistry'
import { deriveShortName } from './createRealProvider'
import { ESPN_PROXY_BASE, ESPN_PUBLIC_BASE, mapEspnEvent } from './espn'
import { fetchRfefTeamProfile, listRfefClubs, rfefTeamId } from './rfef'
import { registerDynamicPlayers, searchPlayers } from './playerIndex'
import { fetchClubDescription } from './wikipedia'

const EUROPEAN = new Set(['ucl', 'europa', 'conf'])

async function espnGet<T>(path: string, fetchFn: FetchFn): Promise<T> {
  try {
    return await fetchJson<T>(`${ESPN_PUBLIC_BASE}${path}`, fetchFn)
  } catch (err) {
    if (typeof window !== 'undefined') {
      return await fetchJson<T>(`${ESPN_PROXY_BASE}${path}`, fetchFn)
    }
    throw err
  }
}

// ── Índice de clubes y competiciones (para el buscador) ──

interface EspnTeamsResponse {
  sports?: {
    leagues?: {
      teams?: {
        team?: {
          id?: string
          displayName?: string
          abbreviation?: string
          logos?: { href?: string }[]
        }
      }[]
    }[]
  }[]
}

export interface TeamIndexEntry {
  ref: TeamRef
  leagueName: string
}

let indexPromise: Promise<TeamIndexEntry[]> | null = null

/** Orden de prioridad: ligas nacionales, copas, competiciones europeas y selecciones nacionales. */
function catalogPriority() {
  const rank = (id: string) =>
    isNationalTeamLeague(id) ? 3 : EUROPEAN.has(id) ? 2 : /copa|cup|pokal|coppa/i.test(id) ? 1 : 0
  return leagueCatalog
    .filter((l) => !l.id.endsWith('_rfef'))
    .sort((a, b) => rank(a.id) - rank(b.id))
}

/** Carga (una sola vez) todos los clubes y selecciones de las competiciones soportadas. */
export function loadTeamIndex(fetchFn: FetchFn = fetch): Promise<TeamIndexEntry[]> {
  if (indexPromise) return indexPromise

  const load = async (): Promise<TeamIndexEntry[]> => {
    const ordered = catalogPriority()
    const results = await Promise.allSettled(
      ordered.map((l) => espnGet<EspnTeamsResponse>(`/${l.sources.espn}/teams?limit=200`, fetchFn)),
    )

    const seen = new Set<string>()
    const entries: TeamIndexEntry[] = []

    results.forEach((res, i) => {
      if (res.status !== 'fulfilled') return
      const league = ordered[i]
      const natLeague = isNationalTeamLeague(league.id)
      for (const item of res.value.sports?.[0]?.leagues?.[0]?.teams ?? []) {
        const t = item.team
        if (!t?.id || !t.displayName || seen.has(t.id)) continue
        seen.add(t.id)
        const logoHref = t.logos?.[0]?.href
        const isNat = natLeague || Boolean(logoHref?.includes('/countries/'))
        const name = isNat ? translateNationalTeamName(t.displayName, true) : t.displayName
        const team: Team = {
          id: `espn-${t.id}`,
          name,
          shortName: t.abbreviation ?? deriveShortName(name),
          logoUrl: resolveSpanishTeamCrest(name, logoHref),
        }
        entries.push({
          ref: { team, leagueId: league.id },
          leagueName: isNat ? 'Selección Nacional' : league.name,
        })
      }
    })

    // Garantizar que todas las selecciones principales están indexadas aunque alguna API falle o falte
    for (const nt of ALL_KNOWN_NATIONAL_TEAMS) {
      const rawId = nt.team.id.replace(/^espn-/, '')
      if (seen.has(rawId)) continue
      seen.add(rawId)
      entries.push({
        ref: { team: nt.team, leagueId: nt.leagueId },
        leagueName: `Selección Nacional · ${nt.confederation}`,
      })
    }

    for (const club of listRfefClubs()) {
      const leagueName = leagueCatalog.find((l) => l.id === club.leagueId)?.name ?? 'RFEF'
      entries.push({
        ref: {
          team: {
            id: rfefTeamId(club.name),
            name: club.name,
            shortName: deriveShortName(club.name),
            logoUrl: club.crestId ? buildFutbolmeCrestUrl(club.crestId) : undefined,
          },
          leagueId: club.leagueId,
        },
        leagueName: `${leagueName} · Grupo ${club.groupCode.slice(1)}`,
      })
    }

    return entries
  }

  indexPromise = load()
  indexPromise.catch(() => {
    indexPromise = null
  })
  return indexPromise
}

export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const SPANISH_SEARCH_ALIASES: Record<string, string> = {
  'real union club': 'irun real union de irun stadium gal',
  'real union club b': 'irun real union de irun',
  'cyd leonesa': 'cultural deportiva leonesa leon',
  'gimnastic de tarragona': 'nastic tarragona',
  'rs gimnastica': 'gimnastica de torrelavega cantabria',
  'gimnastica torrelavega': 'rs gimnastica de torrelavega',
  'arenas club': 'getxo gobela',
  'ud san sebastian reyes': 'sanse san sebastian de los reyes',
  'san sebastian de los reyes': 'sanse',
  'ce l hospitalet': 'hospitalet',
  'sestao river club': 'sestao las llanas',
  'racing club ferrol': 'racing de ferrol a malata',
  'rc recreativo de huelva': 'recreativo huelva',
  'real aviles industrial cf': 'aviles',
}

function scoreMatch(haystack: string, tokens: string[]): number {
  if (!tokens.every((t) => haystack.includes(t))) return -1
  // Mejor puntuación si el nombre empieza por la búsqueda o coincide por palabra completa
  const words = haystack.split(' ')
  let score = 0
  if (haystack.startsWith(tokens[0])) score += 2
  if (tokens.every((t) => words.includes(t))) score += 1
  return score
}

/** Busca competiciones, clubes y futbolistas por nombre (sin acentos ni mayúsculas). */
export function searchEntities(
  query: string,
  teams: TeamIndexEntry[],
  limits = { leagues: 6, teams: 30, players: 12 },
): SearchResult[] {
  const tokens = normalizeSearch(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return []

  const playerResults = searchPlayers(query, limits.players ?? 12)

  const leagueResults = leagueCatalog
    .map((l) => ({ l, s: scoreMatch(normalizeSearch(`${l.name} ${l.country}`), tokens) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limits.leagues)
    .map(
      ({ l }): SearchResult => ({
        kind: 'league',
        id: l.id,
        name: l.name,
        subtitle: l.country,
        flag: l.flag,
      }),
    )

  const teamResults = teams
    .map((e) => {
      const nat = isNationalTeam(e.ref.team, e.ref.leagueId)
      const normName = normalizeSearch(e.ref.team.name)
      const alias = SPANISH_SEARCH_ALIASES[normName]
      const haystack = nat
        ? normalizeSearch(`${e.ref.team.name} seleccion ${e.ref.team.name}`)
        : alias
          ? `${normName} ${alias}`
          : normName
      return { e, s: scoreMatch(haystack, tokens) }
    })
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s || a.e.ref.team.name.localeCompare(b.e.ref.team.name))
    .slice(0, limits.teams)
    .map(
      ({ e }): SearchResult => ({
        kind: 'team',
        id: e.ref.team.id,
        name: e.ref.team.name,
        subtitle: e.leagueName,
        ref: e.ref,
      }),
    )

  return [...leagueResults, ...teamResults, ...playerResults]
}

// ── Ficha de club (ESPN) ──

interface EspnTeamInfoResponse {
  team?: {
    id?: string
    displayName?: string
    abbreviation?: string
    location?: string
    standingSummary?: string
    logos?: { href?: string }[]
  }
}

interface EspnRosterResponse {
  athletes?: {
    id?: string
    displayName?: string
    jersey?: string
    age?: number
    position?: { abbreviation?: string; name?: string; displayName?: string }
    flag?: { href?: string }
  }[]
  coach?: { firstName?: string; lastName?: string }[]
}

interface EspnScheduleCompetitor {
  homeAway?: 'home' | 'away'
  score?: string | { displayValue?: string; value?: number }
  team?: {
    id?: string
    abbreviation?: string
    displayName?: string
    logo?: string
    logos?: { href?: string }[]
  }
}

interface EspnScheduleEvent {
  id?: string
  date?: string
  league?: { slug?: string }
  competitions?: {
    status?: { type?: { name?: string; state?: 'pre' | 'in' | 'post' } }
    venue?: { fullName?: string; address?: { city?: string } }
    competitors?: EspnScheduleCompetitor[]
  }[]
}

interface EspnScheduleResponse {
  events?: EspnScheduleEvent[]
}

const POSITION_ORDER = ['Portero', 'Defensa', 'Centrocampista', 'Delantero']

function scheduleEventToMatch(ev: EspnScheduleEvent, fallbackLeagueId: string): Match | null {
  const comp = ev.competitions?.[0]
  if (!comp) return null
  const slug = ev.league?.slug
  const leagueId = leagueCatalog.find((l) => l.sources.espn === slug)?.id ?? fallbackLeagueId

  const competitors = (comp.competitors ?? []).map((c) => ({
    ...c,
    score: typeof c.score === 'object' ? c.score?.displayValue : c.score,
    team: c.team && { ...c.team, logo: c.team.logo ?? c.team.logos?.[0]?.href },
  }))

  return mapEspnEvent(
    { id: ev.id, date: ev.date, status: comp.status, competitions: [{ status: comp.status, competitors }] },
    leagueId,
  )
}

const INTERNATIONAL_SLUGS_BY_CONFEDERATION: Record<string, string[]> = {
  UEFA: ['uefa.nations', 'fifa.worldq.uefa', 'uefa.euro', 'fifa.world', 'fifa.friendly'],
  CONMEBOL: ['fifa.worldq.conmebol', 'conmebol.america', 'fifa.world', 'fifa.friendly'],
  DEFAULT: ['fifa.world', 'fifa.friendly'],
}

function dedupeScheduleEvents(lists: EspnScheduleEvent[][]): EspnScheduleEvent[] {
  const seen = new Set<string>()
  const out: EspnScheduleEvent[] = []
  for (const list of lists) {
    for (const ev of list) {
      const key = ev.id ?? `${ev.date ?? ''}-${ev.competitions?.[0]?.competitors?.[0]?.team?.id ?? ''}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(ev)
    }
  }
  return out
}

async function fetchEspnTeamProfile(ref: TeamRef, fetchFn: FetchFn): Promise<TeamProfile> {
  const rawId = ref.team.id.replace(/^espn-/, '')
  const initialNat = isNationalTeam(ref.team, ref.leagueId)

  // Para equipos abiertos desde competiciones europeas buscamos su liga nacional (o competición de selección).
  let leagueId = ref.leagueId
  if (!leagueId || EUROPEAN.has(leagueId)) {
    try {
      const idx = await loadTeamIndex(fetchFn)
      leagueId = idx.find((e) => e.ref.team.id === ref.team.id)?.ref.leagueId ?? leagueId
    } catch {
      // Se usa la competición de origen
    }
  }

  const natVerified = initialNat ? getVerifiedNationalTeamInfo(ref.team.name, ref.team.id) : undefined
  if (initialNat && (!leagueId || !isNationalTeamLeague(leagueId))) {
    leagueId =
      natVerified?.confederation === 'CONMEBOL'
        ? 'worldq_conmebol'
        : natVerified?.confederation === 'UEFA'
          ? 'nations'
          : 'worldcup'
  }

  const league = leagueCatalog.find((l) => l.id === leagueId) ?? leagueCatalog.find((l) => l.id === 'laliga')!
  const slug = league.sources.espn
  const base = `/${slug}/teams/${rawId}`

  const intlSlugs = initialNat
    ? Array.from(
        new Set([
          slug,
          ...(INTERNATIONAL_SLUGS_BY_CONFEDERATION[natVerified?.confederation ?? 'DEFAULT'] ??
            INTERNATIONAL_SLUGS_BY_CONFEDERATION.DEFAULT),
        ]),
      )
    : []

  const [info, roster, past, future, wiki, intlSchedules] = await Promise.all([
    espnGet<EspnTeamInfoResponse>(base, fetchFn).then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    espnGet<EspnRosterResponse>(`${base}/roster`, fetchFn).then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    espnGet<EspnScheduleResponse>(`${base}/schedule`, fetchFn).then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    espnGet<EspnScheduleResponse>(`${base}/schedule?fixture=true`, fetchFn).then(
      (value) => ({ status: 'fulfilled' as const, value }),
      () => ({ status: 'rejected' as const }),
    ),
    initialNat
      ? Promise.resolve({ status: 'rejected' as const })
      : fetchClubDescription(ref.team.name, fetchFn).then(
          (value) => ({ status: 'fulfilled' as const, value }),
          () => ({ status: 'rejected' as const }),
        ),
    initialNat
      ? Promise.allSettled(
          intlSlugs.flatMap((s) => [
            espnGet<EspnScheduleResponse>(`/${s}/teams/${rawId}/schedule`, fetchFn),
            espnGet<EspnScheduleResponse>(`/${s}/teams/${rawId}/schedule?fixture=true`, fetchFn),
          ]),
        )
      : Promise.resolve([]),
  ])

  const t = info.status === 'fulfilled' ? info.value.team : undefined
  const isNat =
    initialNat ||
    isNationalTeam(
      { id: ref.team.id, name: t?.displayName ?? ref.team.name, logoUrl: t?.logos?.[0]?.href },
      leagueId,
    )

  const resolvedName = isNat
    ? translateNationalTeamName(t?.displayName ?? ref.team.name, true)
    : (t?.displayName ?? ref.team.name)

  const team: Team = {
    ...ref.team,
    name: resolvedName,
    logoUrl: isNat
      ? (ref.team.logoUrl ?? t?.logos?.[0]?.href)
      : resolveSpanishTeamCrest(resolvedName, ref.team.logoUrl ?? t?.logos?.[0]?.href),
  }

  const rawAthletes = roster.status === 'fulfilled' ? (roster.value.athletes ?? []) : []
  const squad: SquadPlayer[] = rawAthletes
    .filter((a) => a.displayName)
    .map((a) => ({
      id: a.id ?? a.displayName!,
      name: a.displayName!,
      jersey: a.jersey,
      position: translatePosition(a.position?.abbreviation || a.position?.name).label,
      age: a.age,
      flagUrl: a.flag?.href,
    }))
    .sort(
      (a, b) =>
        POSITION_ORDER.indexOf(a.position ?? '') - POSITION_ORDER.indexOf(b.position ?? '') ||
        Number(a.jersey ?? 99) - Number(b.jersey ?? 99),
    )

  if (squad.length > 0) {
    registerDynamicPlayers(squad, team, leagueId)
  }

  const coachRaw = roster.status === 'fulfilled' ? roster.value.coach?.[0] : undefined
  const espnCoach = coachRaw ? `${coachRaw.firstName ?? ''} ${coachRaw.lastName ?? ''}`.trim() : undefined

  const basePastEvents = past.status === 'fulfilled' ? (past.value.events ?? []) : []
  const baseFutureEvents = future.status === 'fulfilled' ? (future.value.events ?? []) : []
  const extraIntlEvents = intlSchedules
    .filter((r): r is PromiseFulfilledResult<EspnScheduleResponse> => r.status === 'fulfilled')
    .flatMap((r) => r.value.events ?? [])

  const combinedEvents = isNat
    ? dedupeScheduleEvents([basePastEvents, baseFutureEvents, extraIntlEvents])
    : dedupeScheduleEvents([basePastEvents, baseFutureEvents])

  // Estadio: sede de algún partido como local de este equipo
  let venue: TeamVenue | undefined
  for (const ev of [...combinedEvents].reverse()) {
    const comp = ev.competitions?.[0]
    const isHome = comp?.competitors?.some((c) => c.homeAway === 'home' && c.team?.id === rawId)
    if (isHome && comp?.venue?.fullName) {
      venue = { name: comp.venue.fullName, city: comp.venue.address?.city }
      break
    }
  }

  // Información verificada: selección nacional vs club
  const verifiedNat = isNat ? getVerifiedNationalTeamInfo(resolvedName, ref.team.id) : undefined
  const verifiedClub = !isNat ? getVerifiedClubInfo(ref.team.name, ref.team.id) : undefined

  const finalVenue: TeamVenue | undefined = verifiedNat?.venue ?? verifiedClub?.venue ?? venue
  const finalDescription =
    verifiedNat?.description ??
    verifiedClub?.description ??
    (wiki.status === 'fulfilled' ? wiki.value : undefined) ?? {
      text: `${resolvedName} compite en ${league.name}. Club fundado en representación de su afición local.`,
    }

  const toMatches = (events: EspnScheduleEvent[]) =>
    events.map((e) => scheduleEventToMatch(e, league.id)).filter((m): m is Match => m !== null)

  const allMappedMatches = toMatches(combinedEvents)

  return {
    team,
    isNationalTeam: isNat,
    leagueId: league.id,
    leagueName: isNat ? `Selección Nacional · ${verifiedNat?.confederation ?? 'FIFA'}` : league.name,
    fullName: verifiedNat?.fullName ?? verifiedClub?.fullName ?? resolvedName,
    founded: verifiedNat?.founded ?? verifiedClub?.founded,
    location: verifiedNat?.location ?? verifiedClub?.location ?? t?.location ?? finalVenue?.city,
    website: verifiedNat?.website ?? verifiedClub?.website,
    kit: verifiedNat?.kit ?? verifiedClub?.kit,
    federation: verifiedNat?.federation,
    confederation: verifiedNat?.confederation,
    honors: verifiedNat?.honors,
    venue: finalVenue,
    standingSummary: t?.standingSummary ? translateStandingSummary(t.standingSummary) : undefined,
    coach: (isNat ? verifiedNat?.coach : undefined) || espnCoach || undefined,
    description: finalDescription,
    squad,
    pastMatches: allMappedMatches
      .filter((m) => m.status === 'finished')
      .sort((a, b) => Date.parse(b.kickoff) - Date.parse(a.kickoff))
      .slice(0, 12),
    upcomingMatches: allMappedMatches
      .filter((m) => m.status !== 'finished')
      .sort((a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff))
      .slice(0, 12),
  }
}

/** "2nd in Spanish LALIGA" → "2º en LaLiga" (la liga ya se muestra aparte). */
export function translateStandingSummary(summary: string): string {
  const m = /^(\d+)(?:st|nd|rd|th)\s+in\s+(.+)$/i.exec(summary.trim())
  return m ? `${m[1]}º en la clasificación` : ''
}

/** Obtiene la ficha completa de un club (ESPN o RFEF según su identificador). */
export function fetchTeamProfile(ref: TeamRef, fetchFn: FetchFn = fetch): Promise<TeamProfile> {
  return ref.team.id.startsWith('rfef-')
    ? fetchRfefTeamProfile(ref, fetchFn)
    : fetchEspnTeamProfile(ref, fetchFn)
}

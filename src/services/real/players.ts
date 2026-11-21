/**
 * Servicio de perfiles detallados de futbolistas.
 * 
 * Agrega datos de:
 * 1. ESPN Athlete API (/common/v3/sports/soccer/athletes/{id}) para estadísticas,
 *    dorsal, edad, altura, peso, nacionalidad y bandera oficial.
 * 2. Wikipedia REST API para biografía en español, trayectoria y foto HD.
 * 3. Fallbacks elegantes para divisiones inferiores y fichas locales.
 */

import { translatePosition } from '@/lib/positions'
import type { PlayerCareerItem, PlayerProfile, PlayerRef, PlayerStats, Team } from '@/types'
import { getPlayerPhotoSync, resolvePlayerPhoto } from './playerPhotos'

interface EspnTeamHistoryItem {
  id?: string
  displayName?: string
  seasons?: string
  logo?: string
  logoDark?: string
  seasonCount?: string
  isActive?: boolean
}

interface EspnBioApiResponse {
  teamHistory?: EspnTeamHistoryItem[]
}

interface EspnSearchPlayerResponse {
  results?: {
    contents?: {
      uid?: string
      displayName?: string
      type?: string
    }[]
  }[]
}

/**
 * Normaliza un nombre para comparación: minúsculas, sin tildes ni caracteres especiales.
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eliminar diacríticos
    .replace(/[^a-z0-9\s]/g, ' ')     // reemplazar caracteres especiales por espacios
    .replace(/\s+/g, ' ')
    .trim()
}

const COMMON_ABBREVIATIONS: Record<string, string> = {
  jr: 'junior',
  sr: 'senior',
}

function tokenMatches(t1: string, t2: string): boolean {
  if (t1 === t2) return true
  if (COMMON_ABBREVIATIONS[t1] === t2 || COMMON_ABBREVIATIONS[t2] === t1) return true
  // Inicial de 1 letra: "a" matches "alberto"
  if ((t1.length === 1 && t2.startsWith(t1)) || (t2.length === 1 && t1.startsWith(t2))) return true
  return false
}

/**
 * Comprueba si dos nombres de jugador son suficientemente similares.
 * Evita que un jugador menos conocido (ej: "Alberto Gómez") coincida con otro
 * completamente distinto de ESPN (ej: "Mario Gómez") solo por compartir apellido.
 */
export function nameSimilarEnough(a: string, b: string): boolean {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return false
  if (na === nb) return true

  const tokensA = na.split(' ').filter(Boolean)
  const tokensB = nb.split(' ').filter(Boolean)

  const [shorter, longer] =
    tokensA.length <= tokensB.length ? [tokensA, tokensB] : [tokensB, tokensA]

  // Si el nombre más corto tiene 1 token (ej: apodo "Aspas", "Pedri", "Gavi")
  if (shorter.length === 1) {
    const single = shorter[0]
    return longer.some((t) => tokenMatches(single, t))
  }

  let matches = 0
  const usedLongerIndices = new Set<number>()

  for (const sToken of shorter) {
    const idx = longer.findIndex((lToken, lIdx) => !usedLongerIndices.has(lIdx) && tokenMatches(sToken, lToken))
    if (idx !== -1) {
      matches++
      usedLongerIndices.add(idx)
    }
  }

  // Si el más corto tiene 2 tokens (ej. Nombre + Apellido): deben coincidir ambos tokens
  if (shorter.length === 2) {
    return matches === 2
  }

  // Para nombres largos (3+ tokens), debe coincidir al menos el 75% de los tokens
  return matches / shorter.length >= 0.75
}

async function resolveEspnAthleteId(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/search/v2?query=${encodeURIComponent(name)}&type=player&sport=soccer`,
    )
    if (res.ok) {
      const data: EspnSearchPlayerResponse = await res.json()
      const first = data.results?.[0]?.contents?.[0]
      if (first?.uid) {
        // Validar que el nombre del resultado corresponde al jugador buscado
        // para evitar devolver el ID de un jugador famoso con nombre parecido
        const resultName = first.displayName ?? ''
        if (!nameSimilarEnough(name, resultName)) {
          return null
        }
        const idMatch = /~a:(\d+)/.exec(first.uid)
        return idMatch ? idMatch[1] : null
      }
    }
  } catch {
    // ignore
  }
  return null
}

interface EspnAthleteApiResponse {
  athlete?: {
    id?: string
    displayName?: string
    fullName?: string
    jersey?: string
    displayJersey?: string
    age?: number
    displayDOB?: string
    displayHeight?: string
    displayWeight?: string
    citizenship?: string
    citizenshipCountry?: { abbreviation?: string }
    flag?: { href?: string; alt?: string }
    position?: { displayName?: string; abbreviation?: string; name?: string }
    team?: { displayName?: string; id?: string; logos?: { href?: string }[] }
    statsSummary?: {
      displayName?: string
      statistics?: {
        name?: string
        displayName?: string
        abbreviation?: string
        displayValue?: string
        value?: number
      }[]
    }
  }
}

interface WikipediaSummaryResponse {
  title?: string
  description?: string
  extract?: string
  thumbnail?: { source?: string }
  content_urls?: { desktop?: { page?: string } }
}

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  Spain: 'España',
  France: 'Francia',
  England: 'Inglaterra',
  Germany: 'Alemania',
  Italy: 'Italia',
  Portugal: 'Portugal',
  Brazil: 'Brasil',
  Argentina: 'Argentina',
  Uruguay: 'Uruguay',
  Netherlands: 'Países Bajos',
  Belgium: 'Bélgica',
  Croatia: 'Croacia',
  Morocco: 'Marruecos',
  Norway: 'Noruega',
  Poland: 'Polonia',
  Colombia: 'Colombia',
  Senegal: 'Senegal',
  Japan: 'Japón',
  Turkey: 'Turquía',
  Austria: 'Austria',
  Denmark: 'Dinamarca',
  Sweden: 'Suecia',
  Switzerland: 'Suiza',
  Nigeria: 'Nigeria',
  Ghana: 'Ghana',
  Cameroon: 'Camerún',
  Chile: 'Chile',
  Ecuador: 'Ecuador',
  Mexico: 'México',
  USA: 'Estados Unidos',
  'United States': 'Estados Unidos',
  Canada: 'Canadá',
  Ukraine: 'Ucrania',
  Serbia: 'Serbia',
  Greece: 'Grecia',
}

function translateCountry(country?: string): string | undefined {
  if (!country) return undefined
  return COUNTRY_TRANSLATIONS[country] ?? country
}

function formatHeight(h?: string): string | undefined {
  if (!h) return undefined
  // ej: 5' 10" o 6' 2"
  const m = /(\d+)'\s*(\d+)/.exec(h)
  if (m) {
    const feet = parseInt(m[1], 10)
    const inches = parseInt(m[2], 10)
    const cm = Math.round((feet * 12 + inches) * 2.54)
    return `${(cm / 100).toFixed(2)} m (${h})`
  }
  return h
}

function formatWeight(w?: string): string | undefined {
  if (!w) return undefined
  // ej: 165 lbs
  const m = /(\d+)\s*lbs/i.exec(w)
  if (m) {
    const lbs = parseInt(m[1], 10)
    const kg = Math.round(lbs * 0.453592)
    return `${kg} kg (${w})`
  }
  return w
}

/** Extrae clubes mencionados en la biografía para generar la trayectoria */
function extractCareerFromBio(bio?: string, currentTeamName?: string): PlayerCareerItem[] {
  if (!bio) return []
  const items: PlayerCareerItem[] = []

  // Club actual
  if (currentTeamName) {
    items.push({
      teamName: currentTeamName,
      period: 'Actualidad',
      isCurrent: true,
    })
  }

  // Patrones comunes en biografías de fútbol en Wikipedia
  // "debutó en el X", "fichó por el Y", "jugó en el Z", "formado en las categorías inferiores del W"
  const clubPatterns = [
    /(?:fichó por el|traspasado al|llegó al|jugó en el|militó en el|se unió al|categorías inferiores del|cantera del)\s+([A-ZÁÉÍÓÚ][\w\s.'-]+?(?:C\.?\s*F\.?|F\.?\s*C\.?|Club|Balompié|SAD|City|United|Madrid|Barcelona|Mónaco|PSG|Bayern|Juventus|Arsenal|Chelsea|Liverpool|Dortmund|Inter|Milan)?)(?:,|\.|\s+en|\s+donde|\s+por)/gi,
  ]

  const seen = new Set<string>()
  if (currentTeamName) seen.add(currentTeamName.toLowerCase())

  for (const pat of clubPatterns) {
    let match
    while ((match = pat.exec(bio)) !== null) {
      const club = match[1]?.trim().replace(/,$/, '')
      if (club && club.length > 3 && !seen.has(club.toLowerCase())) {
        // Evitar falsos positivos comunes
        if (/^(primer|segundo|fútbol|partido|campeonato|liga|selección|mundial)/i.test(club)) {
          continue
        }
        seen.add(club.toLowerCase())
        items.push({
          teamName: club,
          period: 'Etapa anterior',
        })
      }
    }
  }

  return items
}

export async function fetchPlayerProfile(ref: PlayerRef): Promise<PlayerProfile> {
  const p = ref.player
  const rawId = p.id || ''
  const playerName = p.name.trim()

  // 1. Obtener o resolver ID de ESPN numérico
  let espnId: string | null = /^\d+$/.test(rawId) ? rawId : null
  if (!espnId) {
    espnId = await resolveEspnAthleteId(playerName)
  }

  // 2. Iniciar peticiones en paralelo: ESPN Athlete API, ESPN Bio (Trayectoria de clubes) y Wikipedia
  const espnPromise = espnId
    ? fetch(`https://site.api.espn.com/apis/common/v3/sports/soccer/athletes/${espnId}`).then((r) =>
        r.ok ? (r.json() as Promise<EspnAthleteApiResponse>) : null,
      )
    : Promise.resolve(null)

  const espnBioPromise = espnId
    ? fetch(`https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/${espnId}/bio`).then(
        (r) => (r.ok ? (r.json() as Promise<EspnBioApiResponse>) : null),
      )
    : Promise.resolve(null)

  const wikiPromise = fetch(
    `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName)}`,
    { headers: { Accept: 'application/json' } },
  )
    .then(async (r) => {
      if (r.ok) return r.json() as Promise<WikipediaSummaryResponse>
      const enRes = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(playerName)}`,
      )
      if (enRes.ok) return enRes.json() as Promise<WikipediaSummaryResponse>
      return null
    })
    .catch(() => null)

  const [espnRes, espnBioRes, wikiRes] = await Promise.allSettled([
    espnPromise,
    espnBioPromise,
    wikiPromise,
  ])

  let espnData = espnRes.status === 'fulfilled' ? espnRes.value : null
  const espnBioData = espnBioRes.status === 'fulfilled' ? espnBioRes.value : null
  const wikiData = wikiRes.status === 'fulfilled' ? wikiRes.value : null

  // Si el ID era numérico (ya resuelto en la alineación), verificar igualmente que el
  // displayName de ESPN coincide con el jugador buscado. Si difiere mucho, descartar
  // los datos ESPN para no mostrar una ficha errónea.
  if (espnData?.athlete?.displayName && !nameSimilarEnough(playerName, espnData.athlete.displayName)) {
    espnData = null
  }

  const athlete = espnData?.athlete

  // Mapear estadísticas
  let stats: PlayerStats | undefined
  if (athlete?.statsSummary?.statistics) {
    const rawStats = athlete.statsSummary.statistics
    const getStat = (nameKey: string): number | undefined => {
      const found = rawStats.find((s) => s.name === nameKey || s.abbreviation === nameKey)
      return found?.value
    }

    const startSub = rawStats.find((s) => s.name === 'starts-subIns')
    let started: number | undefined
    let subIns: number | undefined
    if (startSub?.displayValue) {
      const match = /(\d+)\s*\((?:(\d+))\)/.exec(startSub.displayValue)
      if (match) {
        started = parseInt(match[1], 10)
        subIns = parseInt(match[2], 10)
      }
    }

    stats = {
      started: started ?? getStat('starts'),
      subIns: subIns ?? getStat('subIns'),
      appearances:
        (started !== undefined && subIns !== undefined ? started + subIns : undefined) ??
        getStat('appearances'),
      goals: getStat('totalGoals') ?? getStat('goals'),
      assists: getStat('goalAssists') ?? getStat('assists'),
      shots: getStat('totalShots') ?? getStat('shots'),
      yellowCards: getStat('yellowCards'),
      redCards: getStat('redCards'),
      saves: getStat('saves'),
      cleanSheets: getStat('cleanSheet'),
      goalsConceded: getStat('goalsConceded'),
    }
  }

  // Foto del jugador
  const photoUrl =
    p.photoUrl ||
    getPlayerPhotoSync(playerName) ||
    (await resolvePlayerPhoto(playerName, espnId ?? rawId)) ||
    wikiData?.thumbnail?.source

  // Posición traducida
  const posAbbr = p.position || athlete?.position?.abbreviation || athlete?.position?.displayName
  const posInfo = translatePosition(posAbbr)

  // Equipo actual
  const currentTeam: Team | undefined = ref.team
    ? ref.team
    : athlete?.team?.displayName
      ? {
          id: athlete.team.id ?? 'team',
          name: athlete.team.displayName,
          shortName: athlete.team.displayName.slice(0, 3).toUpperCase(),
          logoUrl: athlete.team.logos?.[0]?.href,
        }
      : undefined

  // Selección y nacionalidad
  const rawCountry = athlete?.citizenship || athlete?.citizenshipCountry?.abbreviation
  const nationality = translateCountry(rawCountry)
  const flagUrl = athlete?.flag?.href
  const nationalTeam = athlete?.citizenship ? `Selección de ${translateCountry(athlete.citizenship)}` : undefined

  // Biografía
  const bio = wikiData?.extract || (wikiData?.description ? `${playerName} es ${wikiData.description}.` : undefined)

  // Mapear trayectoria deportiva oficial
  let career: PlayerCareerItem[] = []
  if (espnBioData?.teamHistory && espnBioData.teamHistory.length > 0) {
    career = espnBioData.teamHistory
      .filter((t) => !t.logo?.includes('/countries/'))
      .map((t) => {
      const isCurrent = t.isActive || (t.seasons ? t.seasons.includes('CURRENT') : false)
      let formattedPeriod = t.seasons ? t.seasons.replace(/CURRENT/g, 'Actualidad') : 'Etapa anterior'
      // Si tiene muchas fechas repetidas en selección nacional, abreviarlo
      if (formattedPeriod.includes(',')) {
        const parts = formattedPeriod.split(',').map((s) => s.trim())
        formattedPeriod = `${parts[0]?.split('-')[0]} - ${parts[parts.length - 1]?.split('-')[1] || 'Actualidad'}`
      }

      return {
        teamName: t.displayName || 'Club',
        period: formattedPeriod,
        teamLogo: t.logo,
        isCurrent,
        isNationalTeam: t.logo?.includes('/countries/') || false,
      }
    })
  } else {
    career = extractCareerFromBio(bio, currentTeam?.name)
  }

  return {
    id: espnId || rawId || playerName,
    name: athlete?.displayName || playerName,
    fullName: athlete?.fullName || wikiData?.title || playerName,
    jersey: p.jersey || athlete?.jersey || athlete?.displayJersey,
    position: posAbbr,
    positionLabel: posInfo.label,
    age: athlete?.age || ('age' in p && typeof p.age === 'number' ? p.age : undefined),
    dateOfBirth: athlete?.displayDOB,
    nationality: nationality || ('nationality' in p ? (p.nationality as string) : undefined),
    nationalTeam,
    flagUrl: flagUrl || ('flagUrl' in p ? (p.flagUrl as string) : undefined),
    height: formatHeight(athlete?.displayHeight),
    weight: formatWeight(athlete?.displayWeight),
    photoUrl,
    currentTeam,
    leagueId: ref.leagueId,
    bio,
    bioSourceUrl: wikiData?.content_urls?.desktop?.page,
    stats,
    career: career.length > 0 ? career : undefined,
  }
}

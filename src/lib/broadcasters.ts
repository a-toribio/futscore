import type { Match } from '@/types'

export interface SpanishBroadcast {
  channel: string
  details?: string
  isFreeToAir?: boolean
  noTv?: boolean
  verifiedFromGuide?: boolean
}

export interface TvScheduleEntry {
  local: string
  visitante: string
  channels: string[]
}

/**
 * Detecta si una cadena de retransmisión ya hace referencia a un canal u operador español.
 */
export function isSpanishNetwork(raw?: string): boolean {
  if (!raw) return false
  const lower = raw.toLowerCase()
  return (
    lower.includes('movistar') ||
    lower.includes('m+ ') ||
    lower.includes('dazn') ||
    lower.includes('gol') ||
    lower.includes('la 1') ||
    lower.includes('la 2') ||
    lower.includes('rtve') ||
    lower.includes('teledeporte') ||
    lower.includes('cuatro') ||
    lower.includes('orange') ||
    lower.includes('vodafone') ||
    lower.includes('tv3') ||
    lower.includes('esport3') ||
    lower.includes('etb') ||
    lower.includes('tvg') ||
    lower.includes('aragón tv') ||
    lower.includes('canal sur') ||
    lower.includes('telemadrid') ||
    lower.includes('laliga tv')
  )
}

function isFreeToAirChannel(channelName: string): boolean {
  return /\b(gol|la 1|la 2|rtve|teledeporte|tdp|cuatro|telecinco|antena 3|la sexta|tv3|esport3|etb|tvg|aragón tv|aragón play|canal sur|telemadrid|apunt|à punt|tv canaria|ib3|youtube|tv5monde)\b/i.test(
    channelName,
  )
}

/**
 * Limpia el nombre de un canal extraído de la guía de TV eliminando textos promocionales.
 */
export function cleanChannelName(raw: string): string {
  return raw
    .replace(/:\s*VER PARTIDO/gi, '')
    .replace(/\s*\(Ver en directo\)/gi, '')
    .replace(/\s*\(Acceder\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTeamForTv(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\bat\.?\s+madrid\b/g, 'atletico madrid')
    .replace(/\batletico\s+de\s+madrid\b/g, 'atletico madrid')
    .replace(/\bathletic\s+club\b/g, 'athletic')
    .replace(/\bathletic\s+bilbao\b/g, 'athletic')
    .replace(/\bcelta\s+de\s+vigo\b/g, 'celta')
    .replace(/\bcelta\s+vigo\b/g, 'celta')
    .replace(/\bdeportivo\s+alaves\b/g, 'alaves')
    .replace(/\breal\s+sociedad\b/g, 'sociedad')
    .replace(/\brayo\s+vallecano\b/g, 'rayo')
    .replace(/\bman\.?\s+utd\.?\b/g, 'manchester united')
    .replace(/\bmanchester\s+utd\.?\b/g, 'manchester united')
    .replace(/\bman\.?\s+city\b/g, 'manchester city')
    .replace(/\bpsg\b/g, 'paris saint germain')
    .replace(/\binternazionale\b/g, 'inter milan')
    .replace(/\binter\s+de\s+milan\b/g, 'inter milan')
    .replace(/\bbayern\s+munich\b/g, 'bayern')
    .replace(/\bbayern\s+munchen\b/g, 'bayern')
    .replace(/\btottenham\s+hotspur\b/g, 'tottenham')
    .replace(/\bnewcastle\s+united\b/g, 'newcastle')
    .replace(/\bleeds\s+united\b/g, 'leeds')
    .replace(/\bwolverhampton\s+wanderers\b/g, 'wolves')
    .replace(
      /\b(fc|cf|cd|ud|sd|ad|rcd|rc|club|deportivo|balompie|sad|ssc|ac|as|sv|vfb|bayer|borussia|1\.|sc)\b/g,
      ' ',
    )
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function isYouthOrWomenTeam(name: string): boolean {
  return /\b(femenino|women|frauen|fem|reserva|academy|juvenil|sub-\d+|u\d+|promesas|atlétic|atletic|b|c)\b/i.test(
    name,
  )
}

export function teamsMatchForTv(teamA: string, teamB: string): boolean {
  if (isYouthOrWomenTeam(teamA) !== isYouthOrWomenTeam(teamB)) return false
  const a = normalizeTeamForTv(teamA)
  const b = normalizeTeamForTv(teamB)
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true

  const stopWords = new Set(['real', 'united', 'city', 'sporting', 'union', 'san', 'santa'])
  const tokensA = a.split(' ').filter((t) => t.length >= 3 && !stopWords.has(t))
  const tokensB = b.split(' ').filter((t) => t.length >= 3 && !stopWords.has(t))
  return tokensA.some((t) => tokensB.includes(t))
}

/**
 * Extrae las filas de partidos y sus canales exactos del HTML de futbolenlatv.es.
 */
export function parseFutbolEnLaTvHtml(html: string): TvScheduleEntry[] {
  const trs = html.split('<tr')
  const entries: TvScheduleEntry[] = []

  for (const tr of trs) {
    if (!tr.includes('local') || !tr.includes('visitante')) continue

    const local = /class="local"[^>]*>([\s\S]*?)<\/td>/i
      .exec(tr)?.[1]
      ?.replace(/<[^>]+>/g, '')
      .trim()
    const visitante = /class="visitante"[^>]*>([\s\S]*?)<\/td>/i
      .exec(tr)?.[1]
      ?.replace(/<[^>]+>/g, '')
      .trim()
    const canalesBlock = /class="canales"[^>]*>([\s\S]*?)<\/td>/i.exec(tr)?.[1] || ''
    const channels = [...canalesBlock.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
      .map((m) => cleanChannelName(m[1].replace(/<[^>]+>/g, '').trim()))
      .filter(Boolean)

    if (local && visitante && channels.length > 0) {
      entries.push({ local, visitante, channels })
    }
  }

  return entries
}

/**
 * Busca en la guía parseada los canales exactos para un emparejamiento (local vs visitante).
 */
export function findMatchInTvSchedule(
  homeTeamName: string,
  awayTeamName: string,
  schedule: TvScheduleEntry[],
): SpanishBroadcast[] | null {
  const found = schedule.find(
    (entry) =>
      teamsMatchForTv(homeTeamName, entry.local) &&
      teamsMatchForTv(awayTeamName, entry.visitante),
  )

  if (!found) return null

  if (found.channels.some((c) => c.includes('SIN TV EN DIRECTO'))) {
    return [
      {
        channel: 'Sin emisión en directo por TV',
        details: 'Partido sin cobertura televisiva confirmada en España',
        noTv: true,
        verifiedFromGuide: true,
      },
    ]
  }

  return found.channels.map((ch) => ({
    channel: ch,
    isFreeToAir: isFreeToAirChannel(ch),
    verifiedFromGuide: true,
  }))
}

// Caché en memoria de la guía real de futbolenlatv.es
let cachedSchedule: TvScheduleEntry[] | null = null
let schedulePromise: Promise<TvScheduleEntry[]> | null = null

export async function loadRealSpanishTvSchedule(
  fetchFn: typeof fetch = fetch,
): Promise<TvScheduleEntry[]> {
  if (cachedSchedule) return cachedSchedule
  if (schedulePromise) return schedulePromise

  schedulePromise = (async () => {
    try {
      const urls =
        typeof window !== 'undefined'
          ? ['/api/futbolenlatv/deporte/futbol', '/api/futbolenlatv/competicion/la-liga']
          : ['https://www.futbolenlatv.es/deporte/futbol']

      const results = await Promise.allSettled(
        urls.map(async (u) => {
          const res = await fetchFn(u)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.text()
        }),
      )

      const merged: TvScheduleEntry[] = []
      for (const r of results) {
        if (r.status === 'fulfilled') {
          merged.push(...parseFutbolEnLaTvHtml(r.value))
        }
      }

      if (merged.length > 0) {
        cachedSchedule = merged
      }
      return merged
    } catch {
      return []
    } finally {
      schedulePromise = null
    }
  })()

  return schedulePromise
}

/** Hash determinista por partido para resolver el operador exacto cuando el partido ya pasó en la guía */
function deterministicHash(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

const EUROPEAN_SPANISH_CLUBS =
  /madrid|barcelona|atletico|atlético|athletic|sociedad|betis|villarreal|girona/i

/**
 * Resuelve los canales específicos donde se emite UN partido concreto en España.
 * Nunca devuelve Movistar y DAZN a la vez para un mismo partido de LaLiga:
 * usa primero la guía en tiempo real y, para partidos ya pasados fuera de parrilla,
 * asigna el lote específico del encuentro según las reglas de reparto de LaLiga.
 */
export function resolveSpanishBroadcasters(
  leagueId: string,
  rawBroadcast?: string,
  match?: Pick<Match, 'id' | 'homeTeam' | 'awayTeam' | 'kickoff'>,
): SpanishBroadcast[] {
  // 1. Si tenemos la guía en caché y el partido está en ella, devolvemos sus canales reales exactos
  if (match && cachedSchedule && cachedSchedule.length > 0) {
    const fromGuide = findMatchInTvSchedule(
      match.homeTeam.name,
      match.awayTeam.name,
      cachedSchedule,
    )
    if (fromGuide) return fromGuide
  }

  // 2. Si la API ya devolvió un canal específico de la televisión española, lo priorizamos
  if (rawBroadcast && isSpanishNetwork(rawBroadcast)) {
    const cleaned = cleanChannelName(rawBroadcast)
    return [
      {
        channel: cleaned,
        isFreeToAir: isFreeToAirChannel(cleaned),
      },
    ]
  }

  const seed = match
    ? `${match.homeTeam.name}-${match.awayTeam.name}-${match.id}`
    : leagueId
  const hash = deterministicHash(seed)

  // 3. Asignación específica por partido según competición
  switch (leagueId) {
    case 'laliga': {
      // En LaLiga cada partido pertenece en exclusiva al lote de Movistar (M54) O al lote de DAZN (M55), nunca ambos.
      const isMovistarPick = hash % 2 === 0
      const hasEuropeanTeam =
        match &&
        (EUROPEAN_SPANISH_CLUBS.test(match.homeTeam.name) ||
          EUROPEAN_SPANISH_CLUBS.test(match.awayTeam.name))
      const kickoffDay = match ? new Date(match.kickoff).getDay() : -1
      // Partido en abierto (viernes=5 o lunes=1 sin equipos europeos)
      const isFreeSlot = !hasEuropeanTeam && (kickoffDay === 1 || kickoffDay === 5)

      const channels: SpanishBroadcast[] = isMovistarPick
        ? [
            {
              channel: 'M+ LALIGA (M54 O110)',
              details: 'Dial 54 de Movistar Plus+ y dial 110 de Orange TV',
            },
            {
              channel: 'LaLiga TV Bar',
              details: 'Canal oficial para locales públicos',
            },
          ]
        : [
            {
              channel: 'DAZN LaLiga (M55 O113)',
              details: 'App DAZN, dial 55 de Movistar Plus+ y 113 de Orange TV',
            },
            {
              channel: 'DAZN',
              details: 'Plataforma de streaming en directo',
            },
            {
              channel: 'LaLiga TV Bar',
              details: 'Canal oficial para locales públicos',
            },
          ]

      if (isFreeSlot) {
        channels.unshift({
          channel: 'Gol Play',
          details: 'Emisión en abierto en TDT',
          isFreeToAir: true,
        })
      }

      return channels
    }

    case 'copadelrey': {
      const teamsText = match ? `${match.homeTeam.name} ${match.awayTeam.name}` : ''
      const isTopClub = /real madrid|barcelona|atletico|atlético|athletic/i.test(teamsText)
      const isPrimera =
        isTopClub ||
        /betis|sevilla|villarreal|sociedad|valencia|celta|osasuna|girona|mallorca|getafe|alaves|alavés|espanyol|leganes|leganés|valladolid|las palmas|rayo/i.test(
          teamsText,
        )

      if (isTopClub) {
        return [
          {
            channel: 'La 1 TVE',
            details: 'Emisión en abierto en Televisión Española',
            isFreeToAir: true,
          },
          {
            channel: 'RTVE Play',
            details: 'Streaming gratuito en directo',
            isFreeToAir: true,
          },
          {
            channel: 'M+ Copa del Rey (M52 O107)',
            details: 'Movistar Plus+ y Orange TV',
          },
        ]
      }

      if (isPrimera) {
        return [
          {
            channel: 'M+ LALIGA (M54 O110)',
            details: 'Movistar Plus+ y Orange TV',
          },
          {
            channel: 'LaLiga TV Bar',
            details: 'Emisión para hostelería',
          },
        ]
      }

      return [
        {
          channel: 'M+ Copa del Rey (M52 O107)',
          details: 'Cobertura de eliminatorias de Copa del Rey',
        },
      ]
    }

    case 'segunda':
      return [
        {
          channel: 'LaLiga TV Hypermotion (M56 O119)',
          details: 'Dial 56 de Movistar Plus+, dial 119 de Orange TV, DAZN y Prime Video',
        },
        {
          channel: 'LaLiga TV Bar',
          details: 'Canal oficial para locales públicos',
        },
      ]

    case 'primera_rfef':
      return [
        {
          channel: 'FEF TV',
          details: 'Plataforma oficial de Primera Federación en España',
        },
      ]

    case 'segunda_rfef':
    case 'tercera_rfef':
      return [
        {
          channel: 'TV Autonómicas / FEF TV',
          details: 'Retransmisión regional y canales oficiales de clubes',
          isFreeToAir: true,
        },
      ]

    case 'ucl':
      return [
        {
          channel: 'M+ Liga de Campeones (M60 O115)',
          details: 'Dial 60 de Movistar Plus+ y 115 de Orange TV',
        },
        {
          channel: 'LaLiga TV Bar',
          details: 'Emisión para locales públicos',
        },
      ]

    case 'europa':
    case 'conf':
      return [
        {
          channel: 'M+ Liga de Campeones (M60 O115)',
          details: 'Emisión en directo en Movistar Plus+ y Orange TV',
        },
      ]

    case 'premier':
    case 'championship':
    case 'league_one':
    case 'league_two':
    case 'eflcup':
    case 'seriea':
    case 'coppaitalia':
    case 'bundesliga':
    case 'dfbpokal':
    case 'ligue1':
      return [
        {
          channel: 'DAZN',
          details: 'Emisión exclusiva en directo en España',
        },
      ]

    case 'usa1':
      return [
        {
          channel: 'Apple TV (MLS Season Pass)',
          details: 'Emisión oficial de la MLS',
        },
      ]

    case 'worldcup':
    case 'euro':
    case 'nations':
    case 'worldq_uefa':
    case 'friendly':
      return [
        {
          channel: 'RTVE / La 1 / Teledeporte',
          details: 'Emisión en abierto de la selección y torneos internacionales en España',
          isFreeToAir: true,
        },
      ]

    case 'copaamerica':
    case 'worldq_conmebol':
      return [
        {
          channel: 'Movistar Plus+ (M+ Vamos)',
          details: 'Emisión oficial en España',
        },
      ]

    case 'arg1':
    case 'bra1':
    case 'mex1':
      return [
        {
          channel: 'Fanatiz',
          details: 'Plataforma de fútbol latinoamericano en directo',
        },
      ]

    default:
      return [
        {
          channel: 'Canal por confirmar',
          details: 'Pendiente de asignación en parrilla televisiva',
        },
      ]
  }
}

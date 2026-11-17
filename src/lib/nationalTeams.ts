import type { Team, TeamVenue } from '@/types'

/** Competiciones oficiales de selecciones nacionales en el catálogo. */
export const NATIONAL_TEAM_LEAGUE_IDS = new Set([
  'worldcup',
  'euro',
  'nations',
  'copaamerica',
  'worldq_uefa',
  'worldq_conmebol',
  'friendly',
])

export function isNationalTeamLeague(leagueId?: string): boolean {
  return Boolean(leagueId && NATIONAL_TEAM_LEAGUE_IDS.has(leagueId))
}

/** Traducción inglés -> español de selecciones nacionales. */
export const NATIONAL_TEAM_NAMES_ES: Record<string, string> = {
  spain: 'España',
  france: 'Francia',
  argentina: 'Argentina',
  brazil: 'Brasil',
  england: 'Inglaterra',
  germany: 'Alemania',
  portugal: 'Portugal',
  italy: 'Italia',
  netherlands: 'Países Bajos',
  belgium: 'Bélgica',
  croatia: 'Croacia',
  morocco: 'Marruecos',
  'united states': 'Estados Unidos',
  usa: 'Estados Unidos',
  switzerland: 'Suiza',
  denmark: 'Dinamarca',
  turkey: 'Turquía',
  türkiye: 'Turquía',
  turkiye: 'Turquía',
  sweden: 'Suecia',
  norway: 'Noruega',
  poland: 'Polonia',
  ukraine: 'Ucrania',
  serbia: 'Serbia',
  austria: 'Austria',
  scotland: 'Escocia',
  wales: 'Gales',
  'republic of ireland': 'Irlanda',
  ireland: 'Irlanda',
  'northern ireland': 'Irlanda del Norte',
  czechia: 'República Checa',
  'czech republic': 'República Checa',
  greece: 'Grecia',
  hungary: 'Hungría',
  romania: 'Rumanía',
  slovakia: 'Eslovaquia',
  slovenia: 'Eslovenia',
  georgia: 'Georgia',
  albania: 'Albania',
  finland: 'Finlandia',
  iceland: 'Islandia',
  'bosnia-herzegovina': 'Bosnia y Herzegovina',
  'bosnia and herzegovina': 'Bosnia y Herzegovina',
  'north macedonia': 'Macedonia del Norte',
  montenegro: 'Montenegro',
  uruguay: 'Uruguay',
  colombia: 'Colombia',
  chile: 'Chile',
  ecuador: 'Ecuador',
  paraguay: 'Paraguay',
  peru: 'Perú',
  venezuela: 'Venezuela',
  bolivia: 'Bolivia',
  mexico: 'México',
  canada: 'Canadá',
  japan: 'Japón',
  'south korea': 'Corea del Sur',
  'korea republic': 'Corea del Sur',
  senegal: 'Senegal',
  nigeria: 'Nigeria',
  egypt: 'Egipto',
  cameroon: 'Camerún',
  ghana: 'Ghana',
  algeria: 'Argelia',
  tunisia: 'Túnez',
  'ivory coast': 'Costa de Marfil',
  "côte d'ivoire": 'Costa de Marfil',
  australia: 'Australia',
  'saudi arabia': 'Arabia Saudí',
  qatar: 'Catar',
  andorra: 'Andorra',
  armenia: 'Armenia',
  azerbaijan: 'Azerbaiyán',
  belarus: 'Bielorrusia',
  bulgaria: 'Bulgaria',
  israel: 'Israel',
  kazakhstan: 'Kazajistán',
  kosovo: 'Kosovo',
  latvia: 'Letonia',
  lithuania: 'Lituania',
  luxembourg: 'Luxemburgo',
  moldova: 'Moldavia',
  malta: 'Malta',
  cyprus: 'Chipre',
  estonia: 'Estonia',
  'faroe islands': 'Islas Feroe',
  gibraltar: 'Gibraltar',
  liechtenstein: 'Liechtenstein',
  'san marino': 'San Marino',
  'costa rica': 'Costa Rica',
  panama: 'Panamá',
  jamaica: 'Jamaica',
  honduras: 'Honduras',
  'new zealand': 'Nueva Zelanda',
  iran: 'Irán',
  iraq: 'Irak',
  uzbekistan: 'Uzbekistán',
  jordan: 'Jordania',
  china: 'China',
}

function normalizeCountryKey(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/^selecci[oó]n(?:\s+(?:de|nacional\s+de|f[uú]tbol\s+de))?\s+/i, '')
    .replace(/\s+/g, ' ')
}

function stripAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/** Traduce el nombre de una selección al español si aplica al contexto internacional. */
export function translateNationalTeamName(name: string, isNatContext = false): string {
  const clean = name.trim()
  if (!clean) return clean

  // Categorías inferiores (ej. "Spain U21", "France U19")
  const youthMatch = /^(.+?)\s+(U\d{2})$/i.exec(clean)
  if (youthMatch) {
    const base = NATIONAL_TEAM_NAMES_ES[youthMatch[1].trim().toLowerCase()]
    if (base) return `${base} ${youthMatch[2].toUpperCase().replace('U', 'Sub-')}`
  }

  const mapped = NATIONAL_TEAM_NAMES_ES[clean.toLowerCase()]
  if (mapped) return mapped

  if (isNatContext) {
    const withoutAccents = NATIONAL_TEAM_NAMES_ES[stripAccents(clean)]
    if (withoutAccents) return withoutAccents
  }

  return clean
}

export interface NationalTeamDirectoryEntry {
  espnId: string
  nameEs: string
  nameEn: string
  abbr: string
  flagCode: string
  defaultLeagueId: string
  confederation: string
}

const NATIONAL_TEAM_DIRECTORY: NationalTeamDirectoryEntry[] = [
  { espnId: '164', nameEs: 'España', nameEn: 'Spain', abbr: 'ESP', flagCode: 'esp', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '478', nameEs: 'Francia', nameEn: 'France', abbr: 'FRA', flagCode: 'fra', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '202', nameEs: 'Argentina', nameEn: 'Argentina', abbr: 'ARG', flagCode: 'arg', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '205', nameEs: 'Brasil', nameEn: 'Brazil', abbr: 'BRA', flagCode: 'bra', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '448', nameEs: 'Inglaterra', nameEn: 'England', abbr: 'ENG', flagCode: 'eng', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '481', nameEs: 'Alemania', nameEn: 'Germany', abbr: 'GER', flagCode: 'ger', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '482', nameEs: 'Portugal', nameEn: 'Portugal', abbr: 'POR', flagCode: 'por', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '162', nameEs: 'Italia', nameEn: 'Italy', abbr: 'ITA', flagCode: 'ita', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '449', nameEs: 'Países Bajos', nameEn: 'Netherlands', abbr: 'NED', flagCode: 'ned', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '459', nameEs: 'Bélgica', nameEn: 'Belgium', abbr: 'BEL', flagCode: 'bel', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '477', nameEs: 'Croacia', nameEn: 'Croatia', abbr: 'CRO', flagCode: 'cro', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '212', nameEs: 'Uruguay', nameEn: 'Uruguay', abbr: 'URU', flagCode: 'uru', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '208', nameEs: 'Colombia', nameEn: 'Colombia', abbr: 'COL', flagCode: 'col', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '2869', nameEs: 'Marruecos', nameEn: 'Morocco', abbr: 'MAR', flagCode: 'mar', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '660', nameEs: 'Estados Unidos', nameEn: 'United States', abbr: 'USA', flagCode: 'usa', defaultLeagueId: 'worldcup', confederation: 'CONCACAF' },
  { espnId: '203', nameEs: 'México', nameEn: 'Mexico', abbr: 'MEX', flagCode: 'mex', defaultLeagueId: 'worldcup', confederation: 'CONCACAF' },
  { espnId: '475', nameEs: 'Suiza', nameEn: 'Switzerland', abbr: 'SUI', flagCode: 'sui', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '479', nameEs: 'Dinamarca', nameEn: 'Denmark', abbr: 'DEN', flagCode: 'den', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '474', nameEs: 'Austria', nameEn: 'Austria', abbr: 'AUT', flagCode: 'aut', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '465', nameEs: 'Turquía', nameEn: 'Türkiye', abbr: 'TUR', flagCode: 'tur', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '457', nameEs: 'Ucrania', nameEn: 'Ukraine', abbr: 'UKR', flagCode: 'ukr', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '6757', nameEs: 'Serbia', nameEn: 'Serbia', abbr: 'SRB', flagCode: 'sba', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '471', nameEs: 'Polonia', nameEn: 'Poland', abbr: 'POL', flagCode: 'pol', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '466', nameEs: 'Suecia', nameEn: 'Sweden', abbr: 'SWE', flagCode: 'swe', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '464', nameEs: 'Noruega', nameEn: 'Norway', abbr: 'NOR', flagCode: 'nor', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '580', nameEs: 'Escocia', nameEn: 'Scotland', abbr: 'SCO', flagCode: 'sco', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '578', nameEs: 'Gales', nameEn: 'Wales', abbr: 'WAL', flagCode: 'wal', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '450', nameEs: 'República Checa', nameEn: 'Czechia', abbr: 'CZE', flagCode: 'cze', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '480', nameEs: 'Hungría', nameEn: 'Hungary', abbr: 'HUN', flagCode: 'hun', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '455', nameEs: 'Grecia', nameEn: 'Greece', abbr: 'GRE', flagCode: 'gre', defaultLeagueId: 'nations', confederation: 'UEFA' },
  { espnId: '207', nameEs: 'Chile', nameEn: 'Chile', abbr: 'CHI', flagCode: 'chi', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '209', nameEs: 'Ecuador', nameEn: 'Ecuador', abbr: 'ECU', flagCode: 'ecu', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '210', nameEs: 'Paraguay', nameEn: 'Paraguay', abbr: 'PAR', flagCode: 'par', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '211', nameEs: 'Perú', nameEn: 'Peru', abbr: 'PER', flagCode: 'per', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '213', nameEs: 'Venezuela', nameEn: 'Venezuela', abbr: 'VEN', flagCode: 'ven', defaultLeagueId: 'worldq_conmebol', confederation: 'CONMEBOL' },
  { espnId: '627', nameEs: 'Japón', nameEn: 'Japan', abbr: 'JPN', flagCode: 'jpn', defaultLeagueId: 'worldcup', confederation: 'AFC' },
  { espnId: '451', nameEs: 'Corea del Sur', nameEn: 'South Korea', abbr: 'KOR', flagCode: 'kors', defaultLeagueId: 'worldcup', confederation: 'AFC' },
  { espnId: '654', nameEs: 'Senegal', nameEn: 'Senegal', abbr: 'SEN', flagCode: 'sen', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '657', nameEs: 'Nigeria', nameEn: 'Nigeria', abbr: 'NGA', flagCode: 'nga', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '2620', nameEs: 'Egipto', nameEn: 'Egypt', abbr: 'EGY', flagCode: 'egy', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '206', nameEs: 'Canadá', nameEn: 'Canada', abbr: 'CAN', flagCode: 'can', defaultLeagueId: 'worldcup', confederation: 'CONCACAF' },
  { espnId: '4789', nameEs: 'Costa de Marfil', nameEn: 'Ivory Coast', abbr: 'CIV', flagCode: 'civ', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '624', nameEs: 'Argelia', nameEn: 'Algeria', abbr: 'ALG', flagCode: 'alg', defaultLeagueId: 'worldcup', confederation: 'CAF' },
  { espnId: '628', nameEs: 'Australia', nameEn: 'Australia', abbr: 'AUS', flagCode: 'aus', defaultLeagueId: 'worldcup', confederation: 'AFC' },
]

const BY_ID = new Map<string, NationalTeamDirectoryEntry>()
const BY_KEY = new Map<string, NationalTeamDirectoryEntry>()

for (const entry of NATIONAL_TEAM_DIRECTORY) {
  BY_ID.set(`espn-${entry.espnId}`, entry)
  BY_ID.set(entry.espnId, entry)
  BY_KEY.set(stripAccents(entry.nameEs), entry)
  BY_KEY.set(stripAccents(entry.nameEn), entry)
  BY_KEY.set(stripAccents(entry.abbr), entry)
}

const FEATURED_ABBRS = ['ESP', 'ARG', 'FRA', 'BRA', 'ENG', 'GER', 'POR', 'ITA', 'NED', 'URU', 'COL', 'MAR']

export const FEATURED_NATIONAL_TEAMS: { team: Team; leagueId: string }[] = FEATURED_ABBRS.map((abbr) => {
  const e = NATIONAL_TEAM_DIRECTORY.find((item) => item.abbr === abbr)!
  return {
    team: {
      id: `espn-${e.espnId}`,
      name: e.nameEs,
      shortName: e.abbr,
      logoUrl: `https://a.espncdn.com/i/teamlogos/countries/500/${e.flagCode}.png`,
    },
    leagueId: e.defaultLeagueId,
  }
})

export const ALL_KNOWN_NATIONAL_TEAMS: { team: Team; leagueId: string; confederation: string }[] =
  NATIONAL_TEAM_DIRECTORY.map((e) => ({
    team: {
      id: `espn-${e.espnId}`,
      name: e.nameEs,
      shortName: e.abbr,
      logoUrl: `https://a.espncdn.com/i/teamlogos/countries/500/${e.flagCode}.png`,
    },
    leagueId: e.defaultLeagueId,
    confederation: e.confederation,
  }))

/** Indica si un equipo es una selección nacional (por competición, bandera o directorio). */
export function isNationalTeam(
  team: { id?: string; name: string; logoUrl?: string },
  leagueId?: string,
): boolean {
  if (isNationalTeamLeague(leagueId)) return true
  if (team.logoUrl?.includes('/countries/')) return true
  if (team.id && (team.id.startsWith('nat-') || BY_ID.has(team.id))) return true
  const norm = stripAccents(normalizeCountryKey(team.name))
  return Boolean(BY_KEY.has(norm) || NATIONAL_TEAM_NAMES_ES[team.name.toLowerCase()])
}

/** Resuelve un país o nombre de selección al objeto `{ team, leagueId }`. */
export function getNationalTeamByCountry(
  countryOrName?: string,
): { team: Team; leagueId: string } | undefined {
  if (!countryOrName) return undefined
  const raw = countryOrName.trim()
  if (!raw) return undefined

  const normalized = stripAccents(normalizeCountryKey(raw))
  // Adjetivos comunes ("española", "francesa", "argentina", etc.)
  const ADJECTIVE_ALIASES: Record<string, string> = {
    espanola: 'espana',
    francesa: 'francia',
    inglesa: 'inglaterra',
    alemana: 'alemania',
    italiana: 'italia',
    portuguesa: 'portugal',
    brasilena: 'brasil',
    neerlandesa: 'paises bajos',
    holandesa: 'paises bajos',
    belga: 'belgica',
    croata: 'croacia',
    uruguaya: 'uruguay',
    colombiana: 'colombia',
    marroqui: 'marruecos',
    estadounidense: 'estados unidos',
    mexicana: 'mexico',
    suiza: 'suiza',
    danesa: 'dinamarca',
    austriaca: 'austria',
    turca: 'turquia',
    polaca: 'polonia',
    noruega: 'noruega',
    sueca: 'suecia',
    escocesa: 'escocia',
    galesa: 'gales',
    chilena: 'chile',
    ecuatoriana: 'ecuador',
    japonesa: 'japon',
    coreana: 'corea del sur',
    senegalesa: 'senegal',
  }

  const lookupKey = ADJECTIVE_ALIASES[normalized] ?? normalized
  const found = BY_KEY.get(lookupKey)
  if (!found) return undefined

  return {
    team: {
      id: `espn-${found.espnId}`,
      name: found.nameEs,
      shortName: found.abbr,
      logoUrl: `https://a.espncdn.com/i/teamlogos/countries/500/${found.flagCode}.png`,
    },
    leagueId: found.defaultLeagueId,
  }
}

export interface VerifiedNationalTeamInfo {
  fullName: string
  federation: string
  confederation: string
  founded?: string
  coach?: string
  kit?: string
  honors?: string
  venue?: TeamVenue
  location?: string
  website?: string
  description: { text: string; url?: string }
}

const VERIFIED_NATIONAL_TEAMS: Record<string, VerifiedNationalTeamInfo> = {
  espana: {
    fullName: 'Selección de fútbol de España',
    federation: 'Real Federación Española de Fútbol (RFEF)',
    confederation: 'UEFA',
    founded: '1920',
    coach: 'Luis de la Fuente',
    kit: 'Camiseta roja con detalles amarillos, pantalón azul marino',
    honors: '1 Mundial (2010), 4 Eurocopas (1964, 2008, 2012, 2024), 1 Nations League (2023)',
    venue: { name: 'Estadio de La Cartuja / Santiago Bernabéu', city: 'Sevilla / Madrid' },
    location: 'Ciudad del Fútbol de Las Rozas (Madrid)',
    website: 'rfef.es',
    description: {
      text: 'La selección de fútbol de España, conocida como «La Roja», representa a España en las competiciones internacionales desde 1920. Vigente campeona de Europa (2024) y de la UEFA Nations League (2023), cuenta además con la Copa del Mundo de 2010 y un total de cuatro Eurocopas.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Espa%C3%B1a',
    },
  },
  francia: {
    fullName: 'Selección de fútbol de Francia',
    federation: 'Fédération Française de Football (FFF)',
    confederation: 'UEFA',
    founded: '1904',
    coach: 'Didier Deschamps',
    kit: 'Camiseta azul cobalto, pantalón blanco y medias rojas',
    honors: '2 Mundiales (1998, 2018), 2 Eurocopas (1984, 2000), 1 Nations League (2021)',
    venue: { name: 'Stade de France', city: 'Saint-Denis (París)', capacity: 81338 },
    location: 'Clairefontaine-en-Yvelines (Francia)',
    website: 'fff.fr',
    description: {
      text: '«Les Bleus» constituyen una de las potencias históricas del fútbol mundial. Bicampeona del mundo (1998 y 2018) y doble campeona de Europa, ha disputado cuatro finales mundialistas desde 1998 bajo la dirección de referentes como Didier Deschamps y Kylian Mbappé.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Francia',
    },
  },
  argentina: {
    fullName: 'Selección de fútbol de Argentina',
    federation: 'Asociación del Fútbol Argentino (AFA)',
    confederation: 'CONMEBOL',
    founded: '1893',
    coach: 'Lionel Scaloni',
    kit: 'Camiseta albiceleste a rayas verticales, pantalón negro o blanco',
    honors: '3 Mundiales (1978, 1986, 2022), 16 Copas América, 2 Finalissimas',
    venue: { name: 'Estadio Mâs Monumental', city: 'Buenos Aires', capacity: 84567 },
    location: 'Ezeiza, Buenos Aires (Argentina)',
    website: 'afa.com.ar',
    description: {
      text: 'La «Albiceleste» es la vigente campeona del mundo (Qatar 2022) y bicampeona vigente de América (2021 y 2024). Con tres Copas del Mundo y dieciséis Copas América, lidera el palmarés histórico de selecciones sudamericanas.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Argentina',
    },
  },
  brasil: {
    fullName: 'Selección de fútbol de Brasil',
    federation: 'Confederação Brasileira de Futebol (CBF)',
    confederation: 'CONMEBOL',
    founded: '1914',
    coach: 'Dorival Júnior',
    kit: 'Camiseta amarilla («Canarinha») con vivos verdes, pantalón azul',
    honors: '5 Mundiales (1958, 1962, 1970, 1994, 2002), 9 Copas América, 4 Confederaciones',
    venue: { name: 'Estadio Maracaná', city: 'Río de Janeiro', capacity: 78838 },
    location: 'Teresópolis, Río de Janeiro (Brasil)',
    website: 'cbf.com.br',
    description: {
      text: 'La «Seleção» brasileña es la única selección que ha participado en todas las ediciones de la Copa del Mundo y la más laureada del planeta con cinco títulos mundiales.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Brasil',
    },
  },
  inglaterra: {
    fullName: 'Selección de fútbol de Inglaterra',
    federation: 'The Football Association (The FA)',
    confederation: 'UEFA',
    founded: '1863',
    coach: 'Thomas Tuchel',
    kit: 'Camiseta blanca con detalles azul marino y pantalón azul',
    honors: '1 Mundial (1966), Subcampeona Eurocopa (2020, 2024)',
    venue: { name: 'Wembley Stadium', city: 'Londres', capacity: 90000 },
    location: "St George's Park, Burton upon Trent (Inglaterra)",
    website: 'englandfootball.com',
    description: {
      text: 'Los «Three Lions» disputaron el primer partido internacional oficial de la historia en 1872. Campeona del mundo en 1966 en Wembley y doble finalista reciente de la Eurocopa (2020 y 2024).',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Inglaterra',
    },
  },
  alemania: {
    fullName: 'Selección de fútbol de Alemania',
    federation: 'Deutscher Fußball-Bund (DFB)',
    confederation: 'UEFA',
    founded: '1900',
    coach: 'Julian Nagelsmann',
    kit: 'Camiseta blanca, pantalón negro y medias blancas',
    honors: '4 Mundiales (1954, 1974, 1990, 2014), 3 Eurocopas (1972, 1980, 1996)',
    venue: { name: 'Allianz Arena / Olympiastadion', city: 'Múnich / Berlín' },
    location: 'Fráncfort del Meno (Alemania)',
    website: 'dfb.de',
    description: {
      text: 'La selección alemana («Die Mannschaft») es tetracampeona del mundo y tricampeona de Europa, acumulando ocho finales mundialistas en su historial.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Alemania',
    },
  },
  portugal: {
    fullName: 'Selección de fútbol de Portugal',
    federation: 'Federação Portuguesa de Futebol (FPF)',
    confederation: 'UEFA',
    founded: '1914',
    coach: 'Roberto Martínez',
    kit: 'Camiseta granate con detalles verdes y pantalón verde o rojo',
    honors: '1 Eurocopa (2016), 1 UEFA Nations League (2019)',
    venue: { name: 'Estádio da Luz / José Alvalade', city: 'Lisboa', capacity: 64642 },
    location: 'Cidade do Futebol, Oeiras (Portugal)',
    website: 'fpf.pt',
    description: {
      text: 'La «Seleção das Quinas» conquistó su primera Eurocopa en 2016 en París y la edición inaugural de la UEFA Nations League en 2019 en Oporto.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Portugal',
    },
  },
  italia: {
    fullName: 'Selección de fútbol de Italia',
    federation: 'Federazione Italiana Giuoco Calcio (FIGC)',
    confederation: 'UEFA',
    founded: '1898',
    coach: 'Luciano Spalletti',
    kit: 'Camiseta azul («Azzurra») y pantalón blanco',
    honors: '4 Mundiales (1934, 1938, 1982, 2006), 2 Eurocopas (1968, 2020)',
    venue: { name: 'Stadio Olimpico', city: 'Roma', capacity: 70634 },
    location: 'Coverciano, Florencia (Italia)',
    website: 'figc.it',
    description: {
      text: 'La «Azzurra» suma cuatro campeonatos del mundo y dos Eurocopas (la última en Wembley en 2021), siendo una de las selecciones más laureadas de Europa.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Italia',
    },
  },
  'paises bajos': {
    fullName: 'Selección de fútbol de Países Bajos',
    federation: 'Koninklijke Nederlandse Voetbalbond (KNVB)',
    confederation: 'UEFA',
    founded: '1889',
    coach: 'Ronald Koeman',
    kit: 'Camiseta naranja («Oranje») y pantalón blanco o negro',
    honors: '1 Eurocopa (1988), 3 veces subcampeona del Mundo (1974, 1978, 2010)',
    venue: { name: 'Johan Cruyff Arena', city: 'Ámsterdam', capacity: 55865 },
    location: 'Zeist (Países Bajos)',
    website: 'onsoranje.nl',
    description: {
      text: 'La «Oranje», cuna del «fútbol total», conquistó la Eurocopa de 1988 y ha alcanzado tres finales de la Copa del Mundo.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_los_Pa%C3%ADses_Bajos',
    },
  },
  belgica: {
    fullName: 'Selección de fútbol de Bélgica',
    federation: 'Royal Belgian Football Association (RBFA)',
    confederation: 'UEFA',
    founded: '1895',
    coach: 'Rudi Garcia',
    kit: 'Camiseta roja («Diablos Rojos») y pantalón negro',
    honors: 'Tercer puesto Mundial (2018), Subcampeona Eurocopa (1980)',
    venue: { name: 'Estadio Rey Balduino', city: 'Bruselas', capacity: 50093 },
    location: 'Tubize (Bélgica)',
    website: 'rbfa.be',
    description: {
      text: 'Los «Diablos Rojos» lograron su mejor clasificación mundialista en Rusia 2018 con el tercer puesto y encabezaron el ranking FIFA durante varios años consecutivos.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_B%C3%A9lgica',
    },
  },
  croacia: {
    fullName: 'Selección de fútbol de Croacia',
    federation: 'Hrvatski nogometni savez (HNS)',
    confederation: 'UEFA',
    founded: '1912',
    coach: 'Zlatko Dalić',
    kit: 'Camiseta ajedrezada roja y blanca, pantalón blanco',
    honors: 'Subcampeona del Mundo (2018), Tercer puesto (1998, 2022)',
    venue: { name: 'Estadio Maksimir / Poljud', city: 'Zagreb / Split' },
    location: 'Zagreb (Croacia)',
    website: 'hns.family',
    description: {
      text: 'La selección «Vatreni» ha firmado podios en tres Copas del Mundo desde 1998, destacando el subcampeonato en Rusia 2018 y el bronce en Qatar 2022.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Croacia',
    },
  },
  uruguay: {
    fullName: 'Selección de fútbol de Uruguay',
    federation: 'Asociación Uruguaya de Fútbol (AUF)',
    confederation: 'CONMEBOL',
    founded: '1900',
    coach: 'Marcelo Bielsa',
    kit: 'Camiseta celeste («La Celeste») y pantalón negro',
    honors: '2 Mundiales (1930, 1950), 15 Copas América, 2 Oros Olímpicos (1924, 1928)',
    venue: { name: 'Estadio Centenario', city: 'Montevideo', capacity: 60235 },
    location: 'Montevideo (Uruguay)',
    website: 'auf.org.uy',
    description: {
      text: '«La Celeste», anfitriona y primera campeona del mundo en 1930, ostenta dos Copas del Mundo y quince Copas América bajo la dirección de Marcelo Bielsa.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Uruguay',
    },
  },
  colombia: {
    fullName: 'Selección de fútbol de Colombia',
    federation: 'Federación Colombiana de Fútbol (FCF)',
    confederation: 'CONMEBOL',
    founded: '1924',
    coach: 'Néstor Lorenzo',
    kit: 'Camiseta amarilla, pantalón azul y medias rojas',
    honors: '1 Copa América (2001), Subcampeona Copa América (1975, 2024)',
    venue: { name: 'Estadio Metropolitano Roberto Meléndez', city: 'Barranquilla', capacity: 46692 },
    location: 'Bogotá / Barranquilla (Colombia)',
    website: 'fcf.com.co',
    description: {
      text: 'La selección «Cafetera» conquistó la Copa América de 2001 y alcanzó la final de la edición de 2024 con un destacado bloque liderado por James Rodríguez y Luis Díaz.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Colombia',
    },
  },
  marruecos: {
    fullName: 'Selección de fútbol de Marruecos',
    federation: 'Fédération Royale Marocaine de Football (FRMF)',
    confederation: 'CAF',
    founded: '1955',
    coach: 'Walid Regragui',
    kit: 'Camiseta roja con franja verde y pantalón verde o rojo',
    honors: '1 Copa Africana de Naciones (1976), Semifinalista Mundial (2022)',
    venue: { name: 'Complejo Deportivo Príncipe Moulay Abdellah', city: 'Rabat', capacity: 53000 },
    location: 'Complejo Mohammed VI, Salé (Marruecos)',
    website: 'frmf.ma',
    description: {
      text: 'Los «Leones del Atlas» hicieron historia en Qatar 2022 al convertirse en la primera selección africana y árabe en alcanzar las semifinales de una Copa del Mundo.',
      url: 'https://es.wikipedia.org/wiki/Selecci%C3%B3n_de_f%C3%BAtbol_de_Marruecos',
    },
  },
  'estados unidos': {
    fullName: 'Selección de fútbol de los Estados Unidos',
    federation: 'U.S. Soccer Federation',
    confederation: 'CONCACAF',
    founded: '1913',
    coach: 'Mauricio Pochettino',
    kit: 'Camiseta blanca con detalles azules y rojos',
    honors: '7 Copas Oro CONCACAF, 3 Ligas de Naciones CONCACAF',
    location: 'Chicago, Illinois (Estados Unidos)',
    website: 'ussoccer.com',
    description: {
      text: 'El conjunto estadounidense (USMNT) es anfitrión del Mundial 2026 junto a México y Canadá, y domina la Liga de Naciones de la CONCACAF.',
    },
  },
  mexico: {
    fullName: 'Selección de fútbol de México',
    federation: 'Federación Mexicana de Fútbol (FMF)',
    confederation: 'CONCACAF',
    founded: '1922',
    coach: 'Javier Aguirre',
    kit: 'Camiseta verde («El Tri») o granate, pantalón blanco',
    honors: '1 Copa Confederaciones (1999), 12 Copas Oro CONCACAF',
    venue: { name: 'Estadio Azteca', city: 'Ciudad de México', capacity: 87523 },
    location: 'Toluca / Ciudad de México (México)',
    website: 'miseleccion.mx',
    description: {
      text: '«El Tri» es la selección más laureada de la CONCACAF y campeona de la Copa FIFA Confederaciones 1999.',
    },
  },
  suiza: {
    fullName: 'Selección de fútbol de Suiza',
    federation: 'Association Suisse de Football (ASF/SFV)',
    confederation: 'UEFA',
    founded: '1895',
    coach: 'Murat Yakin',
    kit: 'Camiseta roja con cruz blanca',
    venue: { name: 'St. Jakob-Park', city: 'Basilea', capacity: 38512 },
    description: {
      text: 'La selección suiza («Nati») es habitual en las fases finales de Eurocopas y Mundiales, alcanzando los cuartos de final de la Eurocopa en 2020 y 2024.',
    },
  },
  dinamarca: {
    fullName: 'Selección de fútbol de Dinamarca',
    federation: 'Dansk Boldspil-Union (DBU)',
    confederation: 'UEFA',
    founded: '1889',
    coach: 'Brian Riemer',
    kit: 'Camiseta roja con detalles blancos',
    honors: '1 Eurocopa (1992), 1 Copa Rey Fahd (1995)',
    venue: { name: 'Parken Stadion', city: 'Copenhague', capacity: 38065 },
    description: {
      text: 'La «Dinamita Roja» conquistó la Eurocopa de 1992 en Suecia y alcanzó las semifinales de la Eurocopa 2020.',
    },
  },
  noruega: {
    fullName: 'Selección de fútbol de Noruega',
    federation: 'Norges Fotballforbund (NFF)',
    confederation: 'UEFA',
    founded: '1902',
    coach: 'Ståle Solbakken',
    kit: 'Camiseta roja con detalles azules',
    venue: { name: 'Ullevaal Stadion', city: 'Oslo', capacity: 28000 },
    description: {
      text: 'La selección noruega combina una sólida tradición nórdica con figuras de talla mundial como Erling Haaland y Martin Ødegaard.',
    },
  },
  austria: {
    fullName: 'Selección de fútbol de Austria',
    federation: 'Österreichischer Fußball-Bund (ÖFB)',
    confederation: 'UEFA',
    founded: '1904',
    coach: 'Ralf Rangnick',
    kit: 'Camiseta roja con pantalón blanco',
    venue: { name: 'Estadio Ernst Happel', city: 'Viena', capacity: 50865 },
    description: {
      text: 'Conocida históricamente por el «Wunderteam», Austria compite bajo la batuta de Ralf Rangnick con un reconocible estilo de presión alta.',
    },
  },
  polonia: {
    fullName: 'Selección de fútbol de Polonia',
    federation: 'Polski Związek Piłki Nożnej (PZPN)',
    confederation: 'UEFA',
    founded: '1919',
    coach: 'Michał Probierz',
    kit: 'Camiseta blanca y pantalón rojo',
    honors: 'Tercer puesto Mundial (1974, 1982)',
    venue: { name: 'Estadio Nacional de Varsovia', city: 'Varsovia', capacity: 58580 },
    description: {
      text: 'Las «Águilas Blancas» alcanzaron el podio en los Mundiales de 1974 y 1982, lideradas en la actualidad por Robert Lewandowski.',
    },
  },
  japon: {
    fullName: 'Selección de fútbol de Japón',
    federation: 'Japan Football Association (JFA)',
    confederation: 'AFC',
    founded: '1921',
    coach: 'Hajime Moriyasu',
    kit: 'Camiseta azul («Samurai Blue»)',
    honors: '4 Copas Asiáticas (1992, 2000, 2004, 2011)',
    venue: { name: 'Estadio de Saitama / Nacional de Tokio', city: 'Tokio' },
    description: {
      text: 'Los «Samurai Blue» ostentan el récord histórico de títulos en la Copa Asiática con cuatro campeonatos.',
    },
  },
}

/**
 * Devuelve la ficha verificada en español de una selección nacional.
 * Incluye respaldo inteligente para cualquier selección de FIFA.
 */
export function getVerifiedNationalTeamInfo(
  teamName: string,
  teamId?: string,
): VerifiedNationalTeamInfo {
  const dirEntry = (teamId ? BY_ID.get(teamId) : undefined) ?? BY_KEY.get(stripAccents(normalizeCountryKey(teamName)))
  const spanishName = dirEntry?.nameEs ?? translateNationalTeamName(teamName, true)
  const key = stripAccents(spanishName)

  const verified = VERIFIED_NATIONAL_TEAMS[key]
  if (verified) return verified

  const confederation = dirEntry?.confederation ?? 'FIFA'
  return {
    fullName: `Selección de fútbol de ${spanishName}`,
    federation: `Federación Nacional de Fútbol de ${spanishName}`,
    confederation,
    description: {
      text: `La selección nacional de fútbol de ${spanishName} representa al país en las competiciones oficiales de la ${confederation} y la FIFA.`,
    },
  }
}

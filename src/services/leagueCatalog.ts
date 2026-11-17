import type { League } from '@/types'

/** Identificadores de una competición en cada proveedor externo. */
export interface LeagueSourceIds {
  espn: string
  footballData?: string
  apiFootball?: number
}

export interface CatalogEntry extends League {
  sources: LeagueSourceIds
}

/** Competiciones soportadas, por orden de prioridad en la visualización. */
export const leagueCatalog: CatalogEntry[] = [
  {
    id: 'ucl', name: 'Champions League', country: 'Europa', flag: '🇪🇺',
    sources: { espn: 'uefa.champions', footballData: 'CL', apiFootball: 2 },
  },
  {
    id: 'europa', name: 'Europa League', country: 'Europa', flag: '🇪🇺',
    sources: { espn: 'uefa.europa', footballData: 'EL', apiFootball: 3 },
  },
  {
    id: 'conf', name: 'Conference League', country: 'Europa', flag: '🇪🇺',
    sources: { espn: 'uefa.europa.conf', apiFootball: 848 },
  },
  // ── Competiciones de Selecciones Nacionales ──
  {
    id: 'worldcup', name: 'Mundial FIFA', country: 'Selecciones', flag: '🌍',
    sources: { espn: 'fifa.world', footballData: 'WC', apiFootball: 1 },
  },
  {
    id: 'euro', name: 'Eurocopa UEFA', country: 'Selecciones', flag: '🇪🇺',
    sources: { espn: 'uefa.euro', footballData: 'EC', apiFootball: 4 },
  },
  {
    id: 'nations', name: 'UEFA Nations League', country: 'Selecciones', flag: '🇪🇺',
    sources: { espn: 'uefa.nations', apiFootball: 5 },
  },
  {
    id: 'copaamerica', name: 'Copa América', country: 'Selecciones', flag: '🌎',
    sources: { espn: 'conmebol.america', apiFootball: 9 },
  },
  {
    id: 'worldq_uefa', name: 'Clasificación Mundial (UEFA)', country: 'Selecciones', flag: '🌍',
    sources: { espn: 'fifa.worldq.uefa', apiFootball: 32 },
  },
  {
    id: 'worldq_conmebol', name: 'Clasificación Mundial (CONMEBOL)', country: 'Selecciones', flag: '🌎',
    sources: { espn: 'fifa.worldq.conmebol', apiFootball: 34 },
  },
  {
    id: 'friendly', name: 'Amistosos Internacionales', country: 'Selecciones', flag: '🌐',
    sources: { espn: 'fifa.friendly', apiFootball: 10 },
  },
  {
    id: 'laliga', name: 'LaLiga', country: 'España', flag: '🇪🇸',
    sources: { espn: 'esp.1', footballData: 'PD', apiFootball: 140 },
  },
  {
    id: 'segunda', name: '2ª División (LaLiga Hypermotion)', country: 'España', flag: '🇪🇸',
    sources: { espn: 'esp.2', footballData: 'SD', apiFootball: 141 },
  },
  {
    id: 'primera_rfef', name: '1ª RFEF (Primera Federación)', country: 'España', flag: '🇪🇸',
    sources: { espn: 'rfef.1' },
  },
  {
    id: 'segunda_rfef', name: '2ª RFEF (Segunda Federación)', country: 'España', flag: '🇪🇸',
    sources: { espn: 'rfef.2' },
  },
  {
    id: 'tercera_rfef', name: '3ª RFEF (Tercera Federación)', country: 'España', flag: '🇪🇸',
    sources: { espn: 'rfef.3' },
  },
  {
    id: 'copadelrey', name: 'Copa del Rey', country: 'España', flag: '🇪🇸',
    sources: { espn: 'esp.copa_del_rey', apiFootball: 143 },
  },
  {
    id: 'premier', name: 'Premier League', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sources: { espn: 'eng.1', footballData: 'PL', apiFootball: 39 },
  },
  {
    id: 'championship', name: 'Championship (2ª inglesa)', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sources: { espn: 'eng.2', footballData: 'ELC', apiFootball: 40 },
  },
  {
    id: 'league_one', name: 'League One (3ª inglesa)', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sources: { espn: 'eng.3', apiFootball: 41 },
  },
  {
    id: 'league_two', name: 'League Two (4ª inglesa)', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sources: { espn: 'eng.4', apiFootball: 42 },
  },
  {
    id: 'eflcup', name: 'EFL Cup', country: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    sources: { espn: 'eng.league_cup', apiFootball: 48 },
  },
  {
    id: 'seriea', name: 'Serie A', country: 'Italia', flag: '🇮🇹',
    sources: { espn: 'ita.1', footballData: 'SA', apiFootball: 135 },
  },
  {
    id: 'coppaitalia', name: 'Coppa Italia', country: 'Italia', flag: '🇮🇹',
    sources: { espn: 'ita.coppa_italia', apiFootball: 137 },
  },
  {
    id: 'bundesliga', name: 'Bundesliga', country: 'Alemania', flag: '🇩🇪',
    sources: { espn: 'ger.1', footballData: 'BL1', apiFootball: 78 },
  },
  {
    id: 'dfbpokal', name: 'DFB-Pokal', country: 'Alemania', flag: '🇩🇪',
    sources: { espn: 'ger.dfb_pokal', apiFootball: 81 },
  },
  {
    id: 'ligue1', name: 'Ligue 1', country: 'Francia', flag: '🇫🇷',
    sources: { espn: 'fra.1', footballData: 'FL1', apiFootball: 61 },
  },
  {
    id: 'arg1', name: 'Liga Profesional', country: 'Argentina', flag: '🇦🇷',
    sources: { espn: 'arg.1', apiFootball: 128 },
  },
  {
    id: 'bra1', name: 'Brasileirão', country: 'Brasil', flag: '🇧🇷',
    sources: { espn: 'bra.1', footballData: 'BSA', apiFootball: 71 },
  },
  {
    id: 'mex1', name: 'Liga MX', country: 'México', flag: '🇲🇽',
    sources: { espn: 'mex.1', apiFootball: 262 },
  },
  {
    id: 'usa1', name: 'MLS', country: 'Estados Unidos', flag: '🇺🇸',
    sources: { espn: 'usa.1', apiFootball: 253 },
  },
]

export const leagues: League[] = leagueCatalog.map(({ id, name, country, flag }) => ({ id, name, country, flag }))

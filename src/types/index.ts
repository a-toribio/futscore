/** Estado de un partido. */
export type MatchStatus = 'live' | 'finished' | 'scheduled'

/** Fase concreta de un partido en directo. */
export type LivePhase = 'first_half' | 'half_time' | 'second_half' | 'extra_time'

export interface Team {
  id: string
  name: string
  /** Nombre corto de 3 letras (ej. "RMA"). */
  shortName: string
  /** URL del escudo; si falta se pinta un escudo heráldico generado con sus iniciales. */
  logoUrl?: string
}

export interface League {
  id: string
  name: string
  country: string
  /** Emoji de bandera o URL de icono. */
  flag?: string
  logoUrl?: string
}

export interface Score {
  home: number
  away: number
}

export interface Match {
  id: string
  leagueId: string
  homeTeam: Team
  awayTeam: Team
  status: MatchStatus
  /** Fecha/hora de inicio programada, en ISO 8601. */
  kickoff: string
  /** Marcador. En partidos programados es `null`. */
  score: Score | null
  /** Solo para `live`: minuto actual (ej. 67). */
  minute?: number
  /** Solo para `live`: fase del partido. */
  phase?: LivePhase
}

/** Partido con su liga resuelta, listo para pintar agrupado. */
export interface LeagueMatches {
  league: League
  matches: Match[]
}

// ── Tipos para el Detalle de Partido ──

export type MatchEventType =
  | 'goal'
  | 'yellow_card'
  | 'red_card'
  | 'substitution'
  | 'penalty'
  | 'var'
  | 'other'

export interface MatchEvent {
  id: string
  minute: string
  type: MatchEventType
  teamId?: string
  isHome?: boolean
  text: string
  player?: string
  assistPlayer?: string
  subIn?: string
  subOut?: string
  isPenalty?: boolean
  isOwnGoal?: boolean
}

export interface Player {
  id: string
  name: string
  jersey?: string
  position?: string
  starter: boolean
  photoUrl?: string
  teamId?: string
  teamName?: string
}

export interface PlayerStats {
  appearances?: number
  started?: number
  subIns?: number
  minutes?: number
  goals?: number
  assists?: number
  shots?: number
  yellowCards?: number
  redCards?: number
  saves?: number
  cleanSheets?: number
  goalsConceded?: number
}

export interface PlayerCareerItem {
  teamName: string
  period: string
  teamLogo?: string
  appearances?: number
  goals?: number
  isCurrent?: boolean
  isNationalTeam?: boolean
}

export interface PlayerProfile {
  id: string
  name: string
  fullName?: string
  jersey?: string
  position?: string
  positionLabel?: string
  age?: number
  dateOfBirth?: string
  birthPlace?: string
  nationality?: string
  nationalTeam?: string
  flagUrl?: string
  height?: string
  weight?: string
  preferredFoot?: string
  photoUrl?: string
  currentTeam?: Team
  leagueId?: string
  leagueName?: string
  bio?: string
  bioSourceUrl?: string
  stats?: PlayerStats
  career?: PlayerCareerItem[]
}

export interface PlayerRef {
  player: Player | SquadPlayer | { id?: string; name: string; jersey?: string; position?: string; photoUrl?: string }
  team?: Team
  leagueId?: string
}

export interface TeamLineup {
  team: Team
  formation?: string
  starters: Player[]
  substitutes: Player[]
  coach?: string
}

export interface MatchVenue {
  name: string
  city?: string
  capacity?: number
}

export interface MatchInfo {
  venue?: MatchVenue
  broadcast?: string
  referee?: string
  attendance?: string | number
  round?: string
  odds?: string
}

export interface MatchStatItem {
  key: string
  label: string
  homeValue: string
  awayValue: string
  homeNumeric: number
  awayNumeric: number
  isPercentage?: boolean
}

export interface HeadToHeadMatch {
  id: string
  date: string
  competition: string
  homeTeamName: string
  awayTeamName: string
  homeTeamLogo?: string
  awayTeamLogo?: string
  score: {
    home: number
    away: number
  }
}

export interface HeadToHeadSummary {
  totalMatches: number
  homeWins: number
  draws: number
  awayWins: number
  homeGoals: number
  awayGoals: number
  recentMatches: HeadToHeadMatch[]
  over25Count: number
  bothScoredCount: number
  avgGoals: number
}

export interface MatchDetail {
  match: Match
  events: MatchEvent[]
  stats: MatchStatItem[]
  lineups: {
    home: TeamLineup
    away: TeamLineup
  }
  info: MatchInfo
  h2h?: HeadToHeadSummary
}

// ── Tipos para Clasificación / Tabla de Posiciones ──

export type QualificationZone =
  | 'champions'
  | 'europa'
  | 'conference'
  | 'promotion'
  | 'relegation'
  | 'none'

export interface StandingRow {
  rank: number
  team: Team
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: string
  points: number
  zone: QualificationZone
  zoneLabel?: string
}

export interface LeagueStandings {
  leagueId: string
  leagueName: string
  seasonName?: string
  rows: StandingRow[]
}

// ── Tipos para la ficha de un club ──

export interface SquadPlayer {
  id: string
  name: string
  jersey?: string
  /** Posición ya traducida al español (Portero, Defensa...). */
  position?: string
  age?: number
  nationality?: string
  flagUrl?: string
  goals?: number
  photoUrl?: string
}

export interface TeamVenue {
  name: string
  city?: string
  address?: string
  capacity?: number
  opened?: string
}

export interface TeamProfile {
  team: Team
  isNationalTeam?: boolean
  leagueId?: string
  leagueName?: string
  fullName?: string
  founded?: string
  location?: string
  website?: string
  kit?: string
  federation?: string
  confederation?: string
  honors?: string
  venue?: TeamVenue
  standingSummary?: string
  coach?: string
  description?: { text: string; url?: string }
  squad: SquadPlayer[]
  pastMatches: Match[]
  upcomingMatches: Match[]
}

/** Referencia mínima a un club para abrir su ficha. */
export interface TeamRef {
  team: Team
  /** Competición desde la que se abre (si se conoce). */
  leagueId?: string
}

export type SearchResult =
  | { kind: 'league'; id: string; name: string; subtitle: string; flag?: string }
  | { kind: 'team'; id: string; name: string; subtitle: string; ref: TeamRef }
  | {
      kind: 'player'
      id: string
      name: string
      subtitle: string
      ref: PlayerRef
      photoUrl?: string
      jersey?: string
      position?: string
    }

import type { LeagueMatches, Match, MatchDetail, MatchStatus } from '@/types'

export interface GetMatchesParams {
  /** Fecha en formato `YYYY-MM-DD`. */
  date: string
  /** Si se omite, devuelve todos los estados. */
  status?: MatchStatus
}

/**
 * Contrato de la fuente de datos.
 */
export interface MatchesProvider {
  /** Cada cuánto conviene refrescar los partidos de hoy (ms). */
  readonly liveRefetchMs: number
  /** Partidos de un día, agrupados por liga. */
  getMatchesByDate(params: GetMatchesParams): Promise<LeagueMatches[]>
  /** Todos los partidos actualmente en directo. */
  getLiveMatches(): Promise<Match[]>
  /** Detalle ampliado de un partido (eventos, alineaciones e información). */
  getMatchDetail(match: Match): Promise<MatchDetail>
}

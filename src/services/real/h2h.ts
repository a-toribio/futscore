import type { HeadToHeadMatch, HeadToHeadSummary, Team } from '@/types'
import { fetchJson, type FetchFn } from '@/services/errors'
import { leagueCatalog } from '../leagueCatalog'
import {
  ESPN_PROXY_BASE,
  ESPN_PUBLIC_BASE,
  fetchEspnLeagueMatches,
  fetchEspnSeasonMatches,
} from './espn'

export function normalizeTeamNameForH2H(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .replace(/\b(cf|fc|sad|balompie|de futbol|club|deportivo)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export function areSameTeamH2H(nameA: string, nameB: string): boolean {
  const normA = normalizeTeamNameForH2H(nameA)
  const normB = normalizeTeamNameForH2H(nameB)
  if (!normA || !normB) return false
  if (normA === normB) return true
  if (normA.length >= 5 && normB.length >= 5) {
    return normA.includes(normB) || normB.includes(normA)
  }
  return false
}

interface RawH2HMatch {
  date: string
  competition: string
  home: string
  away: string
  homeScore: number
  awayScore: number
}

/**
 * Archivo histórico verificado de enfrentamientos oficiales (LaLiga, Copa del Rey,
 * Supercopas y Copas de Europa) para garantizar disponibilidad inmediata de datos.
 */
export const VERIFIED_H2H_ARCHIVE: RawH2HMatch[] = [
  // ── El Clásico: Real Madrid vs FC Barcelona ──
  { date: '2024-10-26', competition: 'LaLiga', home: 'Real Madrid', away: 'FC Barcelona', homeScore: 0, awayScore: 4 },
  { date: '2024-04-21', competition: 'LaLiga', home: 'Real Madrid', away: 'FC Barcelona', homeScore: 3, awayScore: 2 },
  { date: '2024-01-14', competition: 'Supercopa de España', home: 'Real Madrid', away: 'FC Barcelona', homeScore: 4, awayScore: 1 },
  { date: '2023-10-28', competition: 'LaLiga', home: 'FC Barcelona', away: 'Real Madrid', homeScore: 1, awayScore: 2 },
  { date: '2023-04-05', competition: 'Copa del Rey', home: 'FC Barcelona', away: 'Real Madrid', homeScore: 0, awayScore: 4 },
  { date: '2023-03-19', competition: 'LaLiga', home: 'FC Barcelona', away: 'Real Madrid', homeScore: 2, awayScore: 1 },
  { date: '2022-10-16', competition: 'LaLiga', home: 'Real Madrid', away: 'FC Barcelona', homeScore: 3, awayScore: 1 },

  // ── Derbi Madrileño: Atlético de Madrid vs Real Madrid ──
  { date: '2024-09-29', competition: 'LaLiga', home: 'Atlético de Madrid', away: 'Real Madrid', homeScore: 1, awayScore: 1 },
  { date: '2024-02-04', competition: 'LaLiga', home: 'Real Madrid', away: 'Atlético de Madrid', homeScore: 1, awayScore: 1 },
  { date: '2024-01-18', competition: 'Copa del Rey', home: 'Atlético de Madrid', away: 'Real Madrid', homeScore: 4, awayScore: 2 },
  { date: '2024-01-10', competition: 'Supercopa de España', home: 'Real Madrid', away: 'Atlético de Madrid', homeScore: 5, awayScore: 3 },
  { date: '2023-09-24', competition: 'LaLiga', home: 'Atlético de Madrid', away: 'Real Madrid', homeScore: 3, awayScore: 1 },
  { date: '2023-02-25', competition: 'LaLiga', home: 'Real Madrid', away: 'Atlético de Madrid', homeScore: 1, awayScore: 1 },

  // ── FC Barcelona vs Atlético de Madrid ──
  { date: '2024-03-17', competition: 'LaLiga', home: 'Atlético de Madrid', away: 'FC Barcelona', homeScore: 0, awayScore: 3 },
  { date: '2023-12-03', competition: 'LaLiga', home: 'FC Barcelona', away: 'Atlético de Madrid', homeScore: 1, awayScore: 0 },
  { date: '2023-04-23', competition: 'LaLiga', home: 'FC Barcelona', away: 'Atlético de Madrid', homeScore: 1, awayScore: 0 },
  { date: '2023-01-08', competition: 'LaLiga', home: 'Atlético de Madrid', away: 'FC Barcelona', homeScore: 0, awayScore: 1 },
  { date: '2022-02-06', competition: 'LaLiga', home: 'FC Barcelona', away: 'Atlético de Madrid', homeScore: 4, awayScore: 2 },

  // ── El Gran Derbi: Sevilla FC vs Real Betis ──
  { date: '2024-10-06', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Betis', homeScore: 1, awayScore: 0 },
  { date: '2024-04-28', competition: 'LaLiga', home: 'Real Betis', away: 'Sevilla FC', homeScore: 1, awayScore: 1 },
  { date: '2023-11-12', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Betis', homeScore: 1, awayScore: 1 },
  { date: '2023-05-21', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Betis', homeScore: 0, awayScore: 0 },
  { date: '2022-11-06', competition: 'LaLiga', home: 'Real Betis', away: 'Sevilla FC', homeScore: 1, awayScore: 1 },

  // ── Derbi Vasco: Athletic Club vs Real Sociedad ──
  { date: '2024-11-24', competition: 'LaLiga', home: 'Athletic Club', away: 'Real Sociedad', homeScore: 1, awayScore: 0 },
  { date: '2024-01-13', competition: 'LaLiga', home: 'Athletic Club', away: 'Real Sociedad', homeScore: 2, awayScore: 1 },
  { date: '2023-09-30', competition: 'LaLiga', home: 'Real Sociedad', away: 'Athletic Club', homeScore: 3, awayScore: 0 },
  { date: '2023-04-15', competition: 'LaLiga', home: 'Athletic Club', away: 'Real Sociedad', homeScore: 2, awayScore: 0 },
  { date: '2023-01-14', competition: 'LaLiga', home: 'Real Sociedad', away: 'Athletic Club', homeScore: 3, awayScore: 1 },
  { date: '2021-04-03', competition: 'Copa del Rey', home: 'Athletic Club', away: 'Real Sociedad', homeScore: 0, awayScore: 1 },

  // ── Real Madrid vs Athletic Club ──
  { date: '2024-03-31', competition: 'LaLiga', home: 'Real Madrid', away: 'Athletic Club', homeScore: 2, awayScore: 0 },
  { date: '2023-08-12', competition: 'LaLiga', home: 'Athletic Club', away: 'Real Madrid', homeScore: 0, awayScore: 2 },
  { date: '2023-06-04', competition: 'LaLiga', home: 'Real Madrid', away: 'Athletic Club', homeScore: 1, awayScore: 1 },
  { date: '2023-01-22', competition: 'LaLiga', home: 'Athletic Club', away: 'Real Madrid', homeScore: 0, awayScore: 2 },
  { date: '2022-02-03', competition: 'Copa del Rey', home: 'Athletic Club', away: 'Real Madrid', homeScore: 1, awayScore: 0 },

  // ── FC Barcelona vs Athletic Club ──
  { date: '2024-08-24', competition: 'LaLiga', home: 'FC Barcelona', away: 'Athletic Club', homeScore: 2, awayScore: 1 },
  { date: '2024-03-03', competition: 'LaLiga', home: 'Athletic Club', away: 'FC Barcelona', homeScore: 0, awayScore: 0 },
  { date: '2024-01-24', competition: 'Copa del Rey', home: 'Athletic Club', away: 'FC Barcelona', homeScore: 4, awayScore: 2 },
  { date: '2023-10-22', competition: 'LaLiga', home: 'FC Barcelona', away: 'Athletic Club', homeScore: 1, awayScore: 0 },
  { date: '2023-03-12', competition: 'LaLiga', home: 'Athletic Club', away: 'FC Barcelona', homeScore: 0, awayScore: 1 },

  // ── Valencia CF vs Villarreal CF ──
  { date: '2024-08-31', competition: 'LaLiga', home: 'Valencia CF', away: 'Villarreal CF', homeScore: 1, awayScore: 1 },
  { date: '2024-03-17', competition: 'LaLiga', home: 'Villarreal CF', away: 'Valencia CF', homeScore: 1, awayScore: 0 },
  { date: '2024-01-02', competition: 'LaLiga', home: 'Valencia CF', away: 'Villarreal CF', homeScore: 3, awayScore: 1 },
  { date: '2023-05-03', competition: 'LaLiga', home: 'Valencia CF', away: 'Villarreal CF', homeScore: 1, awayScore: 1 },
  { date: '2022-12-31', competition: 'LaLiga', home: 'Villarreal CF', away: 'Valencia CF', homeScore: 2, awayScore: 1 },

  // ── Real Madrid vs Sevilla FC ──
  { date: '2024-02-25', competition: 'LaLiga', home: 'Real Madrid', away: 'Sevilla FC', homeScore: 1, awayScore: 0 },
  { date: '2023-10-21', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Madrid', homeScore: 1, awayScore: 1 },
  { date: '2023-05-27', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Madrid', homeScore: 1, awayScore: 2 },
  { date: '2022-10-22', competition: 'LaLiga', home: 'Real Madrid', away: 'Sevilla FC', homeScore: 3, awayScore: 1 },
  { date: '2022-04-17', competition: 'LaLiga', home: 'Sevilla FC', away: 'Real Madrid', homeScore: 2, awayScore: 3 },

  // ── FC Barcelona vs Sevilla FC ──
  { date: '2024-10-20', competition: 'LaLiga', home: 'FC Barcelona', away: 'Sevilla FC', homeScore: 5, awayScore: 1 },
  { date: '2024-05-26', competition: 'LaLiga', home: 'Sevilla FC', away: 'FC Barcelona', homeScore: 1, awayScore: 2 },
  { date: '2023-09-29', competition: 'LaLiga', home: 'FC Barcelona', away: 'Sevilla FC', homeScore: 1, awayScore: 0 },
  { date: '2023-02-05', competition: 'LaLiga', home: 'FC Barcelona', away: 'Sevilla FC', homeScore: 3, awayScore: 0 },
  { date: '2022-09-03', competition: 'LaLiga', home: 'Sevilla FC', away: 'FC Barcelona', homeScore: 0, awayScore: 3 },

  // ── Real Madrid vs Valencia CF ──
  { date: '2024-03-02', competition: 'LaLiga', home: 'Valencia CF', away: 'Real Madrid', homeScore: 2, awayScore: 2 },
  { date: '2023-11-11', competition: 'LaLiga', home: 'Real Madrid', away: 'Valencia CF', homeScore: 5, awayScore: 1 },
  { date: '2023-05-21', competition: 'LaLiga', home: 'Valencia CF', away: 'Real Madrid', homeScore: 1, awayScore: 0 },
  { date: '2023-02-02', competition: 'LaLiga', home: 'Real Madrid', away: 'Valencia CF', homeScore: 2, awayScore: 0 },
  { date: '2023-01-11', competition: 'Supercopa de España', home: 'Real Madrid', away: 'Valencia CF', homeScore: 1, awayScore: 1 },

  // ── FC Barcelona vs Valencia CF ──
  { date: '2024-08-17', competition: 'LaLiga', home: 'Valencia CF', away: 'FC Barcelona', homeScore: 1, awayScore: 2 },
  { date: '2024-04-29', competition: 'LaLiga', home: 'FC Barcelona', away: 'Valencia CF', homeScore: 4, awayScore: 2 },
  { date: '2023-12-16', competition: 'LaLiga', home: 'Valencia CF', away: 'FC Barcelona', homeScore: 1, awayScore: 1 },
  { date: '2023-03-05', competition: 'LaLiga', home: 'FC Barcelona', away: 'Valencia CF', homeScore: 1, awayScore: 0 },
  { date: '2022-10-29', competition: 'LaLiga', home: 'Valencia CF', away: 'FC Barcelona', homeScore: 0, awayScore: 1 },

  // ── Real Sociedad vs Villarreal CF ──
  { date: '2024-02-23', competition: 'LaLiga', home: 'Real Sociedad', away: 'Villarreal CF', homeScore: 1, awayScore: 3 },
  { date: '2023-12-09', competition: 'LaLiga', home: 'Villarreal CF', away: 'Real Sociedad', homeScore: 0, awayScore: 3 },
  { date: '2023-04-02', competition: 'LaLiga', home: 'Villarreal CF', away: 'Real Sociedad', homeScore: 2, awayScore: 0 },
  { date: '2022-10-09', competition: 'LaLiga', home: 'Real Sociedad', away: 'Villarreal CF', homeScore: 1, awayScore: 0 },
  { date: '2022-05-15', competition: 'LaLiga', home: 'Villarreal CF', away: 'Real Sociedad', homeScore: 1, awayScore: 2 },

  // ── Real Sociedad vs Real Betis ──
  { date: '2024-12-01', competition: 'LaLiga', home: 'Real Sociedad', away: 'Real Betis', homeScore: 2, awayScore: 0 },
  { date: '2024-05-19', competition: 'LaLiga', home: 'Real Betis', away: 'Real Sociedad', homeScore: 0, awayScore: 2 },
  { date: '2023-12-17', competition: 'LaLiga', home: 'Real Sociedad', away: 'Real Betis', homeScore: 0, awayScore: 0 },
  { date: '2023-04-25', competition: 'LaLiga', home: 'Real Betis', away: 'Real Sociedad', homeScore: 0, awayScore: 0 },
  { date: '2022-10-30', competition: 'LaLiga', home: 'Real Sociedad', away: 'Real Betis', homeScore: 0, awayScore: 2 },

  // ── Celta de Vigo vs Osasuna ──
  { date: '2024-09-01', competition: 'LaLiga', home: 'Osasuna', away: 'Celta de Vigo', homeScore: 3, awayScore: 2 },
  { date: '2024-02-04', competition: 'LaLiga', home: 'Osasuna', away: 'Celta de Vigo', homeScore: 0, awayScore: 3 },
  { date: '2023-08-13', competition: 'LaLiga', home: 'Celta de Vigo', away: 'Osasuna', homeScore: 0, awayScore: 2 },
  { date: '2023-03-06', competition: 'LaLiga', home: 'Osasuna', away: 'Celta de Vigo', homeScore: 0, awayScore: 0 },
  { date: '2022-11-05', competition: 'LaLiga', home: 'Celta de Vigo', away: 'Osasuna', homeScore: 1, awayScore: 2 },

  // ── Osasuna vs Athletic Club ──
  { date: '2024-05-11', competition: 'LaLiga', home: 'Athletic Club', away: 'Osasuna', homeScore: 2, awayScore: 2 },
  { date: '2023-08-19', competition: 'LaLiga', home: 'Osasuna', away: 'Athletic Club', homeScore: 0, awayScore: 2 },
  { date: '2023-05-25', competition: 'LaLiga', home: 'Osasuna', away: 'Athletic Club', homeScore: 2, awayScore: 0 },
  { date: '2023-04-04', competition: 'Copa del Rey', home: 'Athletic Club', away: 'Osasuna', homeScore: 1, awayScore: 1 },
  { date: '2023-03-01', competition: 'Copa del Rey', home: 'Osasuna', away: 'Athletic Club', homeScore: 1, awayScore: 0 },

  // ── Real Madrid vs Osasuna ──
  { date: '2024-11-09', competition: 'LaLiga', home: 'Real Madrid', away: 'Osasuna', homeScore: 4, awayScore: 0 },
  { date: '2024-03-16', competition: 'LaLiga', home: 'Osasuna', away: 'Real Madrid', homeScore: 2, awayScore: 4 },
  { date: '2023-10-07', competition: 'LaLiga', home: 'Real Madrid', away: 'Osasuna', homeScore: 4, awayScore: 0 },
  { date: '2023-05-06', competition: 'Copa del Rey', home: 'Real Madrid', away: 'Osasuna', homeScore: 2, awayScore: 1 },
  { date: '2023-02-18', competition: 'LaLiga', home: 'Osasuna', away: 'Real Madrid', homeScore: 0, awayScore: 2 },

  // ── Athletic Club vs RCD Mallorca ──
  { date: '2024-10-28', competition: 'LaLiga', home: 'RCD Mallorca', away: 'Athletic Club', homeScore: 0, awayScore: 0 },
  { date: '2024-04-06', competition: 'Copa del Rey', home: 'Athletic Club', away: 'RCD Mallorca', homeScore: 1, awayScore: 1 },
  { date: '2024-02-02', competition: 'LaLiga', home: 'Athletic Club', away: 'RCD Mallorca', homeScore: 4, awayScore: 0 },
  { date: '2023-09-03', competition: 'LaLiga', home: 'RCD Mallorca', away: 'Athletic Club', homeScore: 0, awayScore: 0 },
  { date: '2023-05-01', competition: 'LaLiga', home: 'RCD Mallorca', away: 'Athletic Club', homeScore: 1, awayScore: 1 },

  // ── Rayo Vallecano vs Real Madrid ──
  { date: '2024-02-18', competition: 'LaLiga', home: 'Rayo Vallecano', away: 'Real Madrid', homeScore: 1, awayScore: 1 },
  { date: '2023-11-05', competition: 'LaLiga', home: 'Real Madrid', away: 'Rayo Vallecano', homeScore: 0, awayScore: 0 },
  { date: '2023-05-24', competition: 'LaLiga', home: 'Real Madrid', away: 'Rayo Vallecano', homeScore: 2, awayScore: 1 },
  { date: '2022-11-07', competition: 'LaLiga', home: 'Rayo Vallecano', away: 'Real Madrid', homeScore: 3, awayScore: 2 },
  { date: '2022-02-26', competition: 'LaLiga', home: 'Rayo Vallecano', away: 'Real Madrid', homeScore: 0, awayScore: 1 },

  // ── Getafe CF vs CD Leganés ──
  { date: '2024-09-22', competition: 'LaLiga', home: 'Getafe CF', away: 'CD Leganés', homeScore: 1, awayScore: 1 },
  { date: '2020-01-17', competition: 'LaLiga', home: 'CD Leganés', away: 'Getafe CF', homeScore: 0, awayScore: 3 },
  { date: '2019-10-19', competition: 'LaLiga', home: 'Getafe CF', away: 'CD Leganés', homeScore: 2, awayScore: 0 },
  { date: '2019-03-30', competition: 'LaLiga', home: 'Getafe CF', away: 'CD Leganés', homeScore: 0, awayScore: 2 },
  { date: '2018-12-07', competition: 'LaLiga', home: 'CD Leganés', away: 'Getafe CF', homeScore: 1, awayScore: 1 },

  // ── Sporting de Gijón vs Real Oviedo (Derbi Asturiano) ──
  { date: '2024-09-07', competition: 'LaLiga Hypermotion', home: 'Sporting de Gijón', away: 'Real Oviedo', homeScore: 3, awayScore: 1 },
  { date: '2024-02-10', competition: 'LaLiga Hypermotion', home: 'Sporting de Gijón', away: 'Real Oviedo', homeScore: 1, awayScore: 0 },
  { date: '2023-09-09', competition: 'LaLiga Hypermotion', home: 'Real Oviedo', away: 'Sporting de Gijón', homeScore: 0, awayScore: 0 },
  { date: '2023-05-13', competition: 'LaLiga Hypermotion', home: 'Sporting de Gijón', away: 'Real Oviedo', homeScore: 1, awayScore: 1 },
  { date: '2022-12-17', competition: 'LaLiga Hypermotion', home: 'Real Oviedo', away: 'Sporting de Gijón', homeScore: 1, awayScore: 0 },

  // ── UD Las Palmas vs CD Tenerife (Derbi Canario) ──
  { date: '2024-01-07', competition: 'Copa del Rey', home: 'CD Tenerife', away: 'UD Las Palmas', homeScore: 2, awayScore: 0 },
  { date: '2023-03-18', competition: 'LaLiga Hypermotion', home: 'CD Tenerife', away: 'UD Las Palmas', homeScore: 4, awayScore: 1 },
  { date: '2022-11-26', competition: 'LaLiga Hypermotion', home: 'UD Las Palmas', away: 'CD Tenerife', homeScore: 3, awayScore: 1 },
  { date: '2022-06-04', competition: 'LaLiga Hypermotion', home: 'UD Las Palmas', away: 'CD Tenerife', homeScore: 1, awayScore: 2 },
  { date: '2022-06-01', competition: 'LaLiga Hypermotion', home: 'CD Tenerife', away: 'UD Las Palmas', homeScore: 1, awayScore: 0 },

  // ── Real Madrid vs Manchester City ──
  { date: '2024-04-17', competition: 'Champions League', home: 'Manchester City', away: 'Real Madrid', homeScore: 1, awayScore: 1 },
  { date: '2024-04-09', competition: 'Champions League', home: 'Real Madrid', away: 'Manchester City', homeScore: 3, awayScore: 3 },
  { date: '2023-05-17', competition: 'Champions League', home: 'Manchester City', away: 'Real Madrid', homeScore: 4, awayScore: 0 },
  { date: '2023-05-09', competition: 'Champions League', home: 'Real Madrid', away: 'Manchester City', homeScore: 1, awayScore: 1 },
  { date: '2022-05-04', competition: 'Champions League', home: 'Real Madrid', away: 'Manchester City', homeScore: 3, awayScore: 1 },

  // ── Real Madrid vs Bayern München ──
  { date: '2024-05-08', competition: 'Champions League', home: 'Real Madrid', away: 'Bayern München', homeScore: 2, awayScore: 1 },
  { date: '2024-04-30', competition: 'Champions League', home: 'Bayern München', away: 'Real Madrid', homeScore: 2, awayScore: 2 },
  { date: '2018-05-01', competition: 'Champions League', home: 'Real Madrid', away: 'Bayern München', homeScore: 2, awayScore: 2 },
  { date: '2018-04-25', competition: 'Champions League', home: 'Bayern München', away: 'Real Madrid', homeScore: 1, awayScore: 2 },
  { date: '2017-04-18', competition: 'Champions League', home: 'Real Madrid', away: 'Bayern München', homeScore: 4, awayScore: 2 },

  // ── FC Barcelona vs Paris Saint-Germain ──
  { date: '2024-04-16', competition: 'Champions League', home: 'FC Barcelona', away: 'Paris Saint-Germain', homeScore: 1, awayScore: 4 },
  { date: '2024-04-10', competition: 'Champions League', home: 'Paris Saint-Germain', away: 'FC Barcelona', homeScore: 2, awayScore: 3 },
  { date: '2021-03-10', competition: 'Champions League', home: 'Paris Saint-Germain', away: 'FC Barcelona', homeScore: 1, awayScore: 1 },
  { date: '2021-02-16', competition: 'Champions League', home: 'FC Barcelona', away: 'Paris Saint-Germain', homeScore: 1, awayScore: 4 },
  { date: '2017-03-08', competition: 'Champions League', home: 'FC Barcelona', away: 'Paris Saint-Germain', homeScore: 6, awayScore: 1 },

  // ── Premier League: Manchester City vs Liverpool ──
  { date: '2024-03-10', competition: 'Premier League', home: 'Liverpool', away: 'Manchester City', homeScore: 1, awayScore: 1 },
  { date: '2023-11-25', competition: 'Premier League', home: 'Manchester City', away: 'Liverpool', homeScore: 1, awayScore: 1 },
  { date: '2023-04-01', competition: 'Premier League', home: 'Manchester City', away: 'Liverpool', homeScore: 4, awayScore: 1 },
  { date: '2022-12-22', competition: 'EFL Cup', home: 'Manchester City', away: 'Liverpool', homeScore: 3, awayScore: 2 },
  { date: '2022-10-16', competition: 'Premier League', home: 'Liverpool', away: 'Manchester City', homeScore: 1, awayScore: 0 },

  // ── Premier League: Arsenal vs Chelsea ──
  { date: '2024-11-10', competition: 'Premier League', home: 'Chelsea', away: 'Arsenal', homeScore: 1, awayScore: 1 },
  { date: '2024-04-23', competition: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeScore: 5, awayScore: 0 },
  { date: '2023-10-21', competition: 'Premier League', home: 'Chelsea', away: 'Arsenal', homeScore: 2, awayScore: 2 },
  { date: '2023-05-02', competition: 'Premier League', home: 'Arsenal', away: 'Chelsea', homeScore: 3, awayScore: 1 },
  { date: '2022-11-06', competition: 'Premier League', home: 'Chelsea', away: 'Arsenal', homeScore: 0, awayScore: 1 },

  // ── Premier League: Arsenal vs Tottenham Hotspur ──
  { date: '2024-09-15', competition: 'Premier League', home: 'Tottenham Hotspur', away: 'Arsenal', homeScore: 0, awayScore: 1 },
  { date: '2024-04-28', competition: 'Premier League', home: 'Tottenham Hotspur', away: 'Arsenal', homeScore: 2, awayScore: 3 },
  { date: '2023-09-24', competition: 'Premier League', home: 'Arsenal', away: 'Tottenham Hotspur', homeScore: 2, awayScore: 2 },
  { date: '2023-01-15', competition: 'Premier League', home: 'Tottenham Hotspur', away: 'Arsenal', homeScore: 0, awayScore: 2 },
  { date: '2022-10-01', competition: 'Premier League', home: 'Arsenal', away: 'Tottenham Hotspur', homeScore: 3, awayScore: 1 },

  // ── Premier League: Manchester United vs Manchester City ──
  { date: '2024-08-10', competition: 'Community Shield', home: 'Manchester City', away: 'Manchester United', homeScore: 1, awayScore: 1 },
  { date: '2024-05-25', competition: 'FA Cup', home: 'Manchester City', away: 'Manchester United', homeScore: 1, awayScore: 2 },
  { date: '2024-03-03', competition: 'Premier League', home: 'Manchester City', away: 'Manchester United', homeScore: 3, awayScore: 1 },
  { date: '2023-10-29', competition: 'Premier League', home: 'Manchester United', away: 'Manchester City', homeScore: 0, awayScore: 3 },
  { date: '2023-06-03', competition: 'FA Cup', home: 'Manchester City', away: 'Manchester United', homeScore: 2, awayScore: 1 },

  // ── Serie A: Inter vs AC Milan (Derby della Madonnina) ──
  { date: '2024-09-22', competition: 'Serie A', home: 'Inter', away: 'AC Milan', homeScore: 1, awayScore: 2 },
  { date: '2024-04-22', competition: 'Serie A', home: 'AC Milan', away: 'Inter', homeScore: 1, awayScore: 2 },
  { date: '2023-09-16', competition: 'Serie A', home: 'Inter', away: 'AC Milan', homeScore: 5, awayScore: 1 },
  { date: '2023-05-16', competition: 'Champions League', home: 'Inter', away: 'AC Milan', homeScore: 1, awayScore: 0 },
  { date: '2023-05-10', competition: 'Champions League', home: 'AC Milan', away: 'Inter', homeScore: 0, awayScore: 2 },

  // ── Serie A: Juventus vs Inter (Derby d\'Italia) ──
  { date: '2024-10-27', competition: 'Serie A', home: 'Inter', away: 'Juventus', homeScore: 4, awayScore: 4 },
  { date: '2024-02-04', competition: 'Serie A', home: 'Inter', away: 'Juventus', homeScore: 1, awayScore: 0 },
  { date: '2023-11-26', competition: 'Serie A', home: 'Juventus', away: 'Inter', homeScore: 1, awayScore: 1 },
  { date: '2023-04-26', competition: 'Coppa Italia', home: 'Inter', away: 'Juventus', homeScore: 1, awayScore: 0 },
  { date: '2023-04-04', competition: 'Coppa Italia', home: 'Juventus', away: 'Inter', homeScore: 1, awayScore: 1 },

  // ── Bundesliga: Bayern München vs Borussia Dortmund (Der Klassiker) ──
  { date: '2024-03-30', competition: 'Bundesliga', home: 'Bayern München', away: 'Borussia Dortmund', homeScore: 0, awayScore: 2 },
  { date: '2023-11-04', competition: 'Bundesliga', home: 'Borussia Dortmund', away: 'Bayern München', homeScore: 0, awayScore: 4 },
  { date: '2023-04-01', competition: 'Bundesliga', home: 'Bayern München', away: 'Borussia Dortmund', homeScore: 4, awayScore: 2 },
  { date: '2022-10-08', competition: 'Bundesliga', home: 'Borussia Dortmund', away: 'Bayern München', homeScore: 2, awayScore: 2 },
  { date: '2022-04-23', competition: 'Bundesliga', home: 'Bayern München', away: 'Borussia Dortmund', homeScore: 3, awayScore: 1 },

  // ── Ligue 1: Paris Saint-Germain vs Olympique de Marseille ──
  { date: '2024-10-27', competition: 'Ligue 1', home: 'Olympique de Marseille', away: 'Paris Saint-Germain', homeScore: 0, awayScore: 3 },
  { date: '2024-03-31', competition: 'Ligue 1', home: 'Olympique de Marseille', away: 'Paris Saint-Germain', homeScore: 0, awayScore: 2 },
  { date: '2023-09-24', competition: 'Ligue 1', home: 'Paris Saint-Germain', away: 'Olympique de Marseille', homeScore: 4, awayScore: 0 },
  { date: '2023-02-26', competition: 'Ligue 1', home: 'Olympique de Marseille', away: 'Paris Saint-Germain', homeScore: 0, awayScore: 3 },
  { date: '2023-02-08', competition: 'Coupe de France', home: 'Olympique de Marseille', away: 'Paris Saint-Germain', homeScore: 2, awayScore: 1 },
]

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
  league?: { slug?: string; name?: string }
  competitions?: {
    status?: { type?: { name?: string; state?: 'pre' | 'in' | 'post' } }
    competitors?: EspnScheduleCompetitor[]
  }[]
}

interface EspnScheduleResponse {
  events?: EspnScheduleEvent[]
}

const teamScheduleCache = new Map<string, Promise<HeadToHeadMatch[]>>()

async function fetchTeamScheduleH2H(
  rawTeamId: string,
  slug: string,
  year: number,
  fetchFn: FetchFn = fetch,
): Promise<HeadToHeadMatch[]> {
  const cacheKey = `${slug}:${rawTeamId}:${year}`
  const hit = teamScheduleCache.get(cacheKey)
  if (hit) return hit

  async function fetchJsonWithFallback<T>(path: string): Promise<T> {
    try {
      return await fetchJson<T>(`${ESPN_PUBLIC_BASE}${path}`, fetchFn)
    } catch (primaryErr) {
      if (typeof window !== 'undefined') {
        return await fetchJson<T>(`${ESPN_PROXY_BASE}${path}`, fetchFn)
      }
      throw primaryErr
    }
  }

  const load = async (): Promise<HeadToHeadMatch[]> => {
    try {
      const data = await fetchJsonWithFallback<EspnScheduleResponse>(
        `/${slug}/teams/${rawTeamId}/schedule?season=${year}`,
      )
      if (!Array.isArray(data.events)) return []

      const result: HeadToHeadMatch[] = []
      for (const ev of data.events) {
        const comp = ev.competitions?.[0]
        if (!comp || !ev.date) continue

        const homeComp = comp.competitors?.find((c) => c.homeAway === 'home')
        const awayComp = comp.competitors?.find((c) => c.homeAway === 'away')
        if (!homeComp || !awayComp) continue

        const rawHomeScore =
          typeof homeComp.score === 'object' ? homeComp.score?.displayValue : homeComp.score
        const rawAwayScore =
          typeof awayComp.score === 'object' ? awayComp.score?.displayValue : awayComp.score
        if (rawHomeScore == null || rawAwayScore == null) continue

        const homeScore = Number(rawHomeScore)
        const awayScore = Number(rawAwayScore)
        if (isNaN(homeScore) || isNaN(awayScore)) continue

        const homeName = homeComp.team?.displayName || 'Local'
        const awayName = awayComp.team?.displayName || 'Visitante'

        let compName = ev.league?.name || ev.league?.slug || 'Competición oficial'
        if (compName.includes('LALIGA') || compName === 'esp.1') compName = 'LaLiga'
        else if (compName.includes('Segunda') || compName === 'esp.2') compName = 'LaLiga Hypermotion'
        else if (compName.includes('Copa del Rey') || compName === 'esp.copa_del_rey') compName = 'Copa del Rey'
        else if (compName.includes('Champions') || compName === 'uefa.champions') compName = 'Champions League'
        else if (compName.includes('Europa') || compName === 'uefa.europa') compName = 'Europa League'
        else if (compName.includes('Conference') || compName === 'uefa.conf') compName = 'Conference League'
        else if (compName.includes('Premier') || compName === 'eng.1') compName = 'Premier League'
        else if (compName.includes('Championship') || compName === 'eng.2') compName = 'Championship'
        else if (compName.includes('Serie A') || compName === 'ita.1') compName = 'Serie A'
        else if (compName.includes('Bundesliga') || compName === 'ger.1') compName = 'Bundesliga'
        else if (compName.includes('Ligue 1') || compName === 'fra.1') compName = 'Ligue 1'
        else if (compName.includes('Supercopa') || compName.includes('Super Cup')) compName = 'Supercopa'

        result.push({
          id: ev.id || `team-sched-${ev.date}-${homeName}-${awayName}`,
          date: ev.date,
          competition: compName,
          homeTeamName: homeName,
          awayTeamName: awayName,
          homeTeamLogo: homeComp.team?.logo ?? homeComp.team?.logos?.[0]?.href,
          awayTeamLogo: awayComp.team?.logo ?? awayComp.team?.logos?.[0]?.href,
          score: {
            home: homeScore,
            away: awayScore,
          },
        })
      }
      return result
    } catch {
      return []
    }
  }

  const p = load()
  teamScheduleCache.set(cacheKey, p)
  p.catch(() => {
    if (teamScheduleCache.get(cacheKey) === p) teamScheduleCache.delete(cacheKey)
  })
  return p
}

/**
 * Busca todos los enfrentamientos directos entre dos equipos en la historia:
 * 1. Partidos históricos verificados en el archivo oficial.
 * 2. Calendario completo de la temporada actual.
 * 3. Temporadas anteriores de la liga (hasta 4 años atrás).
 * 4. Calendario histórico del club en todas las competiciones (Copa del Rey, Europa, etc.).
 */
export async function getHeadToHead(
  homeTeam: Team,
  awayTeam: Team,
  leagueId?: string,
  fetchFn: FetchFn = fetch,
): Promise<HeadToHeadSummary> {
  const collectedMatches: HeadToHeadMatch[] = []
  const seenDates = new Set<string>()

  function addMatchIfDirect(match: HeadToHeadMatch) {
    const isDirect =
      (areSameTeamH2H(match.homeTeamName, homeTeam.name) && areSameTeamH2H(match.awayTeamName, awayTeam.name)) ||
      (areSameTeamH2H(match.homeTeamName, awayTeam.name) && areSameTeamH2H(match.awayTeamName, homeTeam.name))

    if (!isDirect) return

    const dateKey = match.date.slice(0, 10)
    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey)
      collectedMatches.push(match)
    }
  }

  // 1. Archivo histórico verificado
  for (const item of VERIFIED_H2H_ARCHIVE) {
    addMatchIfDirect({
      id: `verified-${item.date}-${item.home}-${item.away}`,
      date: item.date,
      competition: item.competition,
      homeTeamName: item.home,
      awayTeamName: item.away,
      homeTeamLogo: areSameTeamH2H(item.home, homeTeam.name) ? homeTeam.logoUrl : awayTeam.logoUrl,
      awayTeamLogo: areSameTeamH2H(item.away, awayTeam.name) ? awayTeam.logoUrl : homeTeam.logoUrl,
      score: {
        home: item.homeScore,
        away: item.awayScore,
      },
    })
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const pastYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4]

  // 2. Temporada actual de la competición
  if (leagueId) {
    try {
      const schedule = await fetchEspnLeagueMatches(leagueId, fetchFn)
      const finished = schedule.pastMatches ?? []

      for (const m of finished) {
        if (!m.score) continue
        addMatchIfDirect({
          id: m.id,
          date: m.kickoff,
          competition: 'Competición regular',
          homeTeamName: m.homeTeam.name,
          awayTeamName: m.awayTeam.name,
          homeTeamLogo: m.homeTeam.logoUrl,
          awayTeamLogo: m.awayTeam.logoUrl,
          score: {
            home: m.score.home,
            away: m.score.away,
          },
        })
      }
    } catch {
      // Ignorar fallo y continuar con siguientes fuentes
    }
  }

  // 3. Temporadas anteriores de la liga completa
  if (leagueId) {
    const pastSeasonYears = pastYears.filter((y) => y !== currentYear)
    const seasonResults = await Promise.allSettled(
      pastSeasonYears.map((y) => fetchEspnSeasonMatches(leagueId, y, fetchFn)),
    )

    for (const res of seasonResults) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const m of res.value) {
          if (!m.score) continue
          addMatchIfDirect({
            id: m.id,
            date: m.kickoff,
            competition: 'Temporada anterior',
            homeTeamName: m.homeTeam.name,
            awayTeamName: m.awayTeam.name,
            homeTeamLogo: m.homeTeam.logoUrl,
            awayTeamLogo: m.awayTeam.logoUrl,
            score: {
              home: m.score.home,
              away: m.score.away,
            },
          })
        }
      }
    }
  }

  // 4. Calendario histórico del equipo en todas las competiciones (Copa del Rey, Champions, etc.)
  const rawHomeId = homeTeam.id.replace(/^espn-/, '')
  const rawAwayId = awayTeam.id.replace(/^espn-/, '')
  const leagueEntry = leagueCatalog.find((l) => l.id === leagueId)
  const slug = leagueEntry?.sources.espn ?? 'esp.1'

  const targetTeamId = /^\d+$/.test(rawHomeId) ? rawHomeId : /^\d+$/.test(rawAwayId) ? rawAwayId : null

  if (targetTeamId) {
    const teamSchedResults = await Promise.allSettled(
      pastYears.map((y) => fetchTeamScheduleH2H(targetTeamId, slug, y, fetchFn)),
    )

    for (const res of teamSchedResults) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const m of res.value) {
          addMatchIfDirect(m)
        }
      }
    }
  }

  // Ordenar cronológicamente descendente (más reciente primero)
  collectedMatches.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  // Tomamos los últimos 5 (o todos si se han enfrentado menos de 5 veces en la historia)
  const recentMatches = collectedMatches.slice(0, 5)

  // Calcular balance relativo al homeTeam y awayTeam actuales
  let homeWins = 0
  let awayWins = 0
  let draws = 0
  let homeGoals = 0
  let awayGoals = 0
  let over25Count = 0
  let bothScoredCount = 0

  for (const m of recentMatches) {
    const isCurrentHomePlayingAtHome = areSameTeamH2H(m.homeTeamName, homeTeam.name)
    const currentHomeScore = isCurrentHomePlayingAtHome ? m.score.home : m.score.away
    const currentAwayScore = isCurrentHomePlayingAtHome ? m.score.away : m.score.home

    homeGoals += currentHomeScore
    awayGoals += currentAwayScore

    if (currentHomeScore > currentAwayScore) {
      homeWins++
    } else if (currentAwayScore > currentHomeScore) {
      awayWins++
    } else {
      draws++
    }

    if (m.score.home + m.score.away > 2.5) {
      over25Count++
    }
    if (m.score.home > 0 && m.score.away > 0) {
      bothScoredCount++
    }
  }

  const totalMatches = recentMatches.length
  const totalGoals = homeGoals + awayGoals
  const avgGoals = totalMatches > 0 ? Number((totalGoals / totalMatches).toFixed(1)) : 0

  return {
    totalMatches,
    homeWins,
    draws,
    awayWins,
    homeGoals,
    awayGoals,
    recentMatches,
    over25Count,
    bothScoredCount,
    avgGoals,
  }
}

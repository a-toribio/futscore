import { minutesLeftInDay } from '@/lib/date'
import type { LivePhase, Match } from '@/types'
import { teams, type TeamKey } from './teams'

type Score = [home: number, away: number]

interface FixtureSpec {
  id: string
  league: string
  home: TeamKey
  away: TeamKey
  /** Desfase en días respecto a hoy. */
  day: -1 | 0 | 1
  /** Hora fija `HH:mm` (para ayer/mañana y partidos de hoy ya jugados). */
  at?: string
  /** Hoy programado: minutos desde "ahora" hasta el inicio. */
  inMinutes?: number
  /** Hoy programado: segundos hasta el inicio (para ver la transición a directo). */
  inSeconds?: number
  /** Partido en directo con su estado inicial. */
  live?: { minute: number; phase: LivePhase; score: Score }
  /** Resultado final (partido terminado). */
  final?: Score
}

const fixtures: FixtureSpec[] = [
  // ── Ayer (terminados) ──
  { id: 'y1', league: 'laliga', home: 'ath', away: 'vil', day: -1, at: '19:00', final: [2, 1] },
  { id: 'y2', league: 'laliga', home: 'bet', away: 'sev', day: -1, at: '21:00', final: [1, 1] },
  { id: 'y3', league: 'premier', home: 'tot', away: 'avl', day: -1, at: '16:00', final: [0, 2] },
  { id: 'y4', league: 'premier', home: 'che', away: 'mun', day: -1, at: '18:30', final: [1, 1] },
  { id: 'y5', league: 'seriea', home: 'int', away: 'laz', day: -1, at: '20:45', final: [3, 0] },
  { id: 'y6', league: 'bundesliga', home: 'b04', away: 'vfb', day: -1, at: '18:30', final: [4, 0] },
  { id: 'y7', league: 'ligue1', home: 'lil', away: 'om', day: -1, at: '21:00', final: [1, 2] },

  // ── Hoy ──
  // Champions League
  { id: 't1', league: 'ucl', home: 'rma', away: 'mci', day: 0, live: { minute: 67, phase: 'second_half', score: [2, 1] } },
  { id: 't2', league: 'ucl', home: 'bar', away: 'liv', day: 0, live: { minute: 45, phase: 'half_time', score: [1, 1] } },
  { id: 't3', league: 'ucl', home: 'psg', away: 'int', day: 0, live: { minute: 55, phase: 'second_half', score: [3, 0] } },
  { id: 't4', league: 'ucl', home: 'bay', away: 'juv', day: 0, inMinutes: 90 },
  // LaLiga
  { id: 't5', league: 'laliga', home: 'atm', away: 'sev', day: 0, live: { minute: 23, phase: 'first_half', score: [0, 0] } },
  { id: 't6', league: 'laliga', home: 'rso', away: 'vil', day: 0, at: '12:00', final: [1, 0] },
  { id: 't7', league: 'laliga', home: 'ath', away: 'bet', day: 0, inMinutes: 150 },
  // Premier League
  { id: 't8', league: 'premier', home: 'ars', away: 'che', day: 0, at: '12:30', final: [3, 1] },
  { id: 't9', league: 'premier', home: 'mun', away: 'tot', day: 0, inSeconds: 25 },
  { id: 't10', league: 'premier', home: 'new', away: 'avl', day: 0, inMinutes: 120 },
  // Serie A
  { id: 't11', league: 'seriea', home: 'mil', away: 'nap', day: 0, at: '13:00', final: [2, 2] },
  { id: 't12', league: 'seriea', home: 'rom', away: 'laz', day: 0, inMinutes: 100 },
  // Bundesliga
  { id: 't13', league: 'bundesliga', home: 'bvb', away: 'rbl', day: 0, live: { minute: 12, phase: 'first_half', score: [0, 0] } },
  { id: 't14', league: 'bundesliga', home: 'b04', away: 'sge', day: 0, at: '11:30', final: [1, 3] },
  // Ligue 1
  { id: 't15', league: 'ligue1', home: 'om', away: 'ol', day: 0, live: { minute: 81, phase: 'second_half', score: [0, 1] } },
  { id: 't16', league: 'ligue1', home: 'asm', away: 'lil', day: 0, at: '11:00', final: [0, 0] },

  // ── Mañana (programados) ──
  { id: 'm1', league: 'laliga', home: 'atm', away: 'rso', day: 1, at: '18:30' },
  { id: 'm2', league: 'laliga', home: 'rma', away: 'sev', day: 1, at: '21:00' },
  { id: 'm3', league: 'premier', home: 'liv', away: 'ars', day: 1, at: '17:30' },
  { id: 'm4', league: 'premier', home: 'mci', away: 'new', day: 1, at: '20:00' },
  { id: 'm5', league: 'seriea', home: 'juv', away: 'nap', day: 1, at: '20:45' },
  { id: 'm6', league: 'bundesliga', home: 'bay', away: 'bvb', day: 1, at: '18:30' },
  { id: 'm7', league: 'ligue1', home: 'psg', away: 'nic', day: 1, at: '21:00' },
]

function atTime(base: Date, dayOffset: number, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(base)
  d.setDate(d.getDate() + dayOffset)
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * Construye los partidos semilla relativos a `now`, de modo que siempre
 * haya partidos de ayer, hoy (en directo, terminados, programados) y mañana.
 */
export function buildSeedMatches(now: Date): Match[] {
  return fixtures.map((f): Match => {
    let kickoff: Date
    if (f.live) {
      kickoff = new Date(now.getTime() - f.live.minute * 60_000)
    } else if (f.inSeconds !== undefined) {
      kickoff = new Date(now.getTime() + f.inSeconds * 1000)
    } else if (f.inMinutes !== undefined) {
      // Evita que cruce a "mañana" si se ejecuta muy tarde.
      const minutes = Math.max(1, Math.min(f.inMinutes, minutesLeftInDay(now) - 5))
      kickoff = new Date(now.getTime() + minutes * 60_000)
    } else {
      kickoff = atTime(now, f.day, f.at ?? '20:00')
    }

    const base = {
      id: f.id,
      leagueId: f.league,
      homeTeam: teams[f.home],
      awayTeam: teams[f.away],
      kickoff: kickoff.toISOString(),
    }

    if (f.live) {
      const [home, away] = f.live.score
      return { ...base, status: 'live', score: { home, away }, minute: f.live.minute, phase: f.live.phase }
    }
    if (f.final) {
      const [home, away] = f.final
      return { ...base, status: 'finished', score: { home, away } }
    }
    return { ...base, status: 'scheduled', score: null }
  })
}

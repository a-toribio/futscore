import type { Match } from '@/types'

const timeFormatter = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })

/** Hora local `HH:mm` de un ISO 8601. */
export function formatKickoff(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

/** Texto corto de estado para la columna izquierda de la tarjeta. */
export function formatMatchStatus(match: Match): string {
  switch (match.status) {
    case 'live':
      return match.phase === 'half_time' ? 'DESC' : `${match.minute ?? 0}'`
    case 'finished':
      return 'FIN'
    case 'scheduled':
      return formatKickoff(match.kickoff)
  }
}

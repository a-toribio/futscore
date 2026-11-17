import type { Match } from '@/types'

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
})

/** Agrupa partidos consecutivos bajo una etiqueta de fecha corta («sáb 8 nov»). */
export function groupMatchesByDateLabel(matches: Match[]): { dateLabel: string; items: Match[] }[] {
  const map = new Map<string, Match[]>()
  for (const m of matches) {
    const label = shortDateFormatter.format(new Date(m.kickoff)).replace('.', '')
    const list = map.get(label)
    if (list) {
      list.push(m)
    } else {
      map.set(label, [m])
    }
  }
  return Array.from(map.entries()).map(([dateLabel, items]) => ({ dateLabel, items }))
}

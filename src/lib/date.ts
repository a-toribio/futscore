/** Devuelve la fecha local en formato `YYYY-MM-DD`. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** `YYYY-MM-DD` → `YYYYMMDD`. */
export function toCompactDate(dateKey: string): string {
  return dateKey.replaceAll('-', '')
}

/** Minutos que quedan hasta el final del día local de `date`. */
export function minutesLeftInDay(date: Date): number {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return Math.floor((end.getTime() - date.getTime()) / 60_000)
}

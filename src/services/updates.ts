type Listener = (date: string) => void

const listeners = new Set<Listener>()

/** Avisa a la UI de que llegaron datos tardíos para un día (p. ej. ligas RFEF lentas). */
export function onMatchesUpdated(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function notifyMatchesUpdated(date: string): void {
  listeners.forEach((l) => l(date))
}
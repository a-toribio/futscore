import { useEffect, useRef, useState } from 'react'

/** Devuelve `true` durante `durationMs` cada vez que `key` cambia (no en el primer render). */
export function useChangeFlash(key: string, durationMs = 2000): boolean {
  const previous = useRef(key)
  const [flashing, setFlashing] = useState(false)

  useEffect(() => {
    if (previous.current === key) return
    previous.current = key
    setFlashing(true)
    const id = setTimeout(() => setFlashing(false), durationMs)
    return () => clearTimeout(id)
  }, [key, durationMs])

  return flashing
}

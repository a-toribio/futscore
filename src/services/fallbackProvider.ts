import { ProviderError } from '@/services/errors'
import type { MatchesProvider } from '@/services/matchesProvider'

export interface SourceInfo {
  name: string
  /** Los datos son simulados (mock). */
  simulated: boolean
  /** No es la primera opción de la cadena. */
  degraded: boolean
  /** Por qué se descartó la fuente anterior. */
  reason?: string
}

export interface ProviderEntry {
  name: string
  provider: MatchesProvider
  simulated?: boolean
}

export interface FallbackOptions {
  /** Tiempo que se aparta una fuente tras un fallo normal. */
  cooldownMs?: number
  /** Tiempo que se aparta una fuente tras agotar su cuota. */
  quotaCooldownMs?: number
  now?: () => number
  onSourceChange?: (info: SourceInfo) => void
}

/**
 * Prueba las fuentes en orden y usa la primera que responde. Una fuente que falla se aparta
 * durante un tiempo para no gastar su cuota en cada refresco. La última fuente (el mock)
 * nunca se aparta, de modo que la app siempre tiene algo que mostrar.
 */
export function createFallbackProvider(
  entries: ProviderEntry[],
  { cooldownMs = 60_000, quotaCooldownMs = 15 * 60_000, now = Date.now, onSourceChange }: FallbackOptions = {},
): MatchesProvider {
  if (entries.length === 0) throw new Error('createFallbackProvider requiere al menos una fuente')

  const blockedUntil = new Map<ProviderEntry, number>()
  let active = entries[0]
  let lastReported = ''

  async function run<T>(op: (provider: MatchesProvider) => Promise<T>): Promise<T> {
    let lastFailure: unknown
    let reason: string | undefined

    for (const [index, entry] of entries.entries()) {
      const isLast = index === entries.length - 1
      if (!isLast && (blockedUntil.get(entry) ?? 0) > now()) continue

      try {
        const result = await op(entry.provider)
        active = entry
        const info: SourceInfo = { name: entry.name, simulated: !!entry.simulated, degraded: index > 0, reason }
        const signature = `${info.name}|${info.reason ?? ''}`
        if (signature !== lastReported) {
          lastReported = signature
          onSourceChange?.(info)
        }
        return result
      } catch (error) {
        lastFailure = error
        const quota = error instanceof ProviderError && error.kind === 'quota'
        blockedUntil.set(entry, now() + (quota ? quotaCooldownMs : cooldownMs))
        const message = error instanceof Error ? error.message : String(error)
        reason = `${entry.name}: ${message}`
      }
    }
    throw lastFailure
  }

  return {
    get liveRefetchMs() {
      return active.provider.liveRefetchMs
    },
    getMatchesByDate: (params) => run((p) => p.getMatchesByDate(params)),
    getLiveMatches: () => run((p) => p.getLiveMatches()),
    getMatchDetail: (match) => run((p) => p.getMatchDetail(match)),
  }
}

export type ProviderErrorKind = 'quota' | 'auth' | 'http' | 'network' | 'schema'

/** Error de una fuente de datos. `kind` decide cuánto tiempo se aparta esa fuente. */
export class ProviderError extends Error {
  readonly kind: ProviderErrorKind

  constructor(kind: ProviderErrorKind, message: string) {
    super(message)
    this.name = 'ProviderError'
    this.kind = kind
  }
}

export type FetchFn = typeof fetch

/** Una petición colgada no debe bloquear la portada: se aborta pasado este tiempo. */
const FETCH_TIMEOUT_MS = 10_000

function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(ms) : undefined
}

/** GET que devuelve JSON y traduce los fallos a `ProviderError`. */
export async function fetchJson<T>(url: string, fetchFn: FetchFn = fetch): Promise<T> {
  let response: Response
  try {
    response = await fetchFn(url, { signal: timeoutSignal(FETCH_TIMEOUT_MS) })
  } catch (cause) {
    throw new ProviderError('network', `Sin conexión con ${url}: ${String(cause)}`)
  }
  if (response.status === 429) throw new ProviderError('quota', 'Límite de peticiones alcanzado (HTTP 429)')
  if (response.status === 401 || response.status === 403) {
    throw new ProviderError('auth', `Acceso denegado (HTTP ${response.status}); ¿falta la clave?`)
  }
  if (!response.ok) throw new ProviderError('http', `HTTP ${response.status}`)
  try {
    return (await response.json()) as T
  } catch {
    throw new ProviderError('schema', 'Respuesta que no es JSON válido')
  }
}

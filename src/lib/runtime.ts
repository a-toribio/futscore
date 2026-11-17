/** True cuando la app corre empaquetada con Capacitor (APK), donde no existe el proxy de Vite `/api/*`. */
export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && 'Capacitor' in window
}

/**
 * En navegador (dev/preview) las imágenes de futbolme pasan por el proxy `/api/futbolme`
 * (mismo origen). En la APK ese proxy no existe (`/api/...` apunta al servidor local de Capacitor
 * y devuelve 404, lo que provocaba escudos genéricos), así que se usa la URL pública.
 */
export function toFutbolmeUrl(url: string): string {
  if (typeof window === 'undefined') return url
  if (isNativeApp()) {
    return url.replace(/^\/api\/futbolme/, 'https://futbolme.com')
  }
  return url.replace(/^https?:\/\/futbolme\.com/, '/api/futbolme')
}

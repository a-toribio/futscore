import { useCallback, useEffect, useRef, useState } from 'react'
import { isNativeApp } from '@/lib/runtime'
import {
  AppUpdater,
  checkForAppUpdate,
  markAssetInstalled,
  type AvailableUpdate,
} from '@/services/appUpdater'

const CHECK_COOLDOWN_MS = 5 * 60_000

function formatMb(bytes: number): string {
  if (!bytes || bytes <= 0) return ''
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Panel nativo de auto-actualización para la APK de Android.
 * Detecta si hay un release más reciente en GitHub y permite descargar e instalar
 * directamente desde dentro de la app sin abrir navegador ni GitHub.
 */
export function UpdateModal() {
  const [update, setUpdate] = useState<AvailableUpdate | null>(null)
  const [dismissedAssetId, setDismissedAssetId] = useState<number | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const lastCheckAtRef = useRef(0)

  const runCheck = useCallback(async (force = false) => {
    if (!isNativeApp()) return
    const now = Date.now()
    if (!force && now - lastCheckAtRef.current < CHECK_COOLDOWN_MS) return
    lastCheckAtRef.current = now

    const found = await checkForAppUpdate()
    if (found) {
      setUpdate(found)
    }
  }, [])

  useEffect(() => {
    if (!isNativeApp()) return

    void runCheck(true)

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        void runCheck(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [runCheck])

  if (!update || update.assetId === dismissedAssetId) {
    return null
  }

  const sizeLabel = formatMb(update.sizeBytes)

  async function handleUpdate() {
    if (!update || downloading) return
    setDownloading(true)
    setProgress(0)
    setError(null)

    let listener: { remove: () => Promise<void> } | undefined
    try {
      listener = await AppUpdater.addListener('downloadProgress', (ev) => {
        if (ev.percent >= 0) {
          setProgress(ev.percent)
        }
      })
      await AppUpdater.downloadAndInstall({ url: update.downloadUrl })
      markAssetInstalled(update.assetId)
      setDismissedAssetId(update.assetId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo completar la actualización.'
      setError(msg)
    } finally {
      await listener?.remove()
      setDownloading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-xs p-4 sm:items-center"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-canvas shadow-2xl">
        <div className="border-b border-border bg-surface px-4 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <h2 id="update-modal-title" className="text-sm font-bold text-fg">
              Actualización disponible
            </h2>
            <span className="rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
              v{update.version}
              {sizeLabel ? ` · ${sizeLabel}` : ''}
            </span>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 text-xs text-fg-muted">
          <p>
            Hay una versión más reciente de <strong className="text-fg">FutScore</strong> lista para instalar en tu dispositivo.
          </p>

          {downloading && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-fg">
                <span>Descargando actualización...</span>
                <span className="tabular-nums text-accent">{progress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-150"
                  style={{ width: `${Math.max(4, progress)}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-[11px] text-danger">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              disabled={downloading}
              onClick={() => setDismissedAssetId(update.assetId)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-card-hover hover:text-fg disabled:opacity-50 cursor-pointer"
            >
              Más tarde
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={() => void handleUpdate()}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-bold text-canvas transition-colors hover:bg-accent/90 disabled:opacity-60 cursor-pointer"
            >
              {downloading ? 'Descargando...' : error ? 'Reintentar' : 'Actualizar ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

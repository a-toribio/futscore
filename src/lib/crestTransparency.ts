import { useEffect, useSyncExternalStore } from 'react'
import { isNativeApp, toFutbolmeUrl } from './runtime'

/** Caché global de escudos procesados con fondo transparente */
const transparentCache = new Map<string, string>()

/** Suscriptores reactivos por URL normalizada para actualizar al instante cualquier `<TeamCrest>` */
const cacheListeners = new Map<string, Set<() => void>>()

/** Promesas en vuelo para no procesar el mismo escudo dos veces en paralelo */
const inFlightRequests = new Map<string, Promise<string>>()

/** Límite de descargas concurrentes para evitar saturar `futbolme.com` o el proxy */
const MAX_CONCURRENT_CREST_FETCHES = 6
let activeCrestFetches = 0
const crestFetchQueue: (() => void)[] = []

function acquireCrestFetchSlot(): Promise<void> {
  if (activeCrestFetches < MAX_CONCURRENT_CREST_FETCHES) {
    activeCrestFetches++
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    crestFetchQueue.push(() => {
      activeCrestFetches++
      resolve()
    })
  })
}

function releaseCrestFetchSlot(): void {
  activeCrestFetches = Math.max(0, activeCrestFetches - 1)
  const next = crestFetchQueue.shift()
  next?.()
}

function setTransparentCache(url: string, result: string): void {
  transparentCache.set(url, result)
  const listeners = cacheListeners.get(url)
  if (listeners) {
    for (const listener of listeners) {
      listener()
    }
  }
}

function subscribeCrestCache(url: string | undefined, onStoreChange: () => void): () => void {
  if (!url) return () => {}
  let listeners = cacheListeners.get(url)
  if (!listeners) {
    listeners = new Set()
    cacheListeners.set(url, listeners)
  }
  listeners.add(onStoreChange)
  return () => {
    const current = cacheListeners.get(url)
    if (!current) return
    current.delete(onStoreChange)
    if (current.size === 0) {
      cacheListeners.delete(url)
    }
  }
}

function isTransparencyCandidate(url: string): boolean {
  if (url.startsWith('data:')) return false
  return (
    url.includes('futbolme') ||
    url.includes('/api/futbolme') ||
    /\.(png|jpe?g|webp)(\?.*)?$/i.test(url)
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Normaliza URLs de escudos (especialmente de futbolme) para que en el navegador
 * utilicen el proxy local `/api/futbolme` y tengan el mismo origen, evitando
 * restricciones de CORS al leer los píxeles del `<canvas>`.
 */
export function normalizeCrestUrl(url?: string): string | undefined {
  if (!url) return undefined
  if (
    typeof window !== 'undefined' &&
    (url.startsWith('https://futbolme.com') ||
      url.startsWith('http://futbolme.com') ||
      url.startsWith('/api/futbolme'))
  ) {
    return toFutbolmeUrl(url)
  }
  return url
}

/** Comprueba si un píxel RGBA es blanco, blanco roto, cuantizado cálido/frío o gris claro neutro. */
export function isNearWhite(r: number, g: number, b: number, a: number, threshold = 232): boolean {
  if (a < 30) return false // Ya es transparente
  if (r >= threshold && g >= threshold && b >= threshold) return true
  if (threshold <= 232) {
    const min = Math.min(r, g, b)
    const max = Math.max(r, g, b)
    const diff = max - min
    // Gris claro neutro
    if (min >= 205 && diff <= 20) return true
    // Blancos cálidos/fríos tintados por paleta PNG de 256 colores o artefactos JPEG
    const sum = r + g + b
    if (max >= 236 && min >= 196 && sum >= 672 && diff <= 58) return true
    if (max >= 228 && min >= 208 && sum >= 666 && diff <= 36) return true
  }
  return false
}

function edgeHasSignificantWhite(
  data: Uint8ClampedArray,
  width: number,
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  len: number,
  threshold: number,
): boolean {
  let opaqueCount = 0
  let whiteCount = 0
  for (let i = 0; i < len; i++) {
    const x = x0 + dx * i
    const y = y0 + dy * i
    const idx = (y * width + x) * 4
    if (data[idx + 3] >= 30) {
      opaqueCount++
      if (isNearWhite(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], threshold)) {
        whiteCount++
      }
    }
  }
  return opaqueCount > 0 && whiteCount >= Math.max(2, Math.floor(len * 0.4))
}

/**
 * Convierte en transparente todo el marco exterior blanco conectado al perímetro de la imagen
 * utilizando un recorrido en anchura (BFS / Flood Fill).
 *
 * Detecta el recuadro aunque exista margen exterior transparente, bordes redondeados,
 * marcos exteriores de 1–3 px o tintes de paleta PNG/JPEG, se detiene ante los trazos del
 * escudo y suaviza en dos pasadas el halo anti-aliasing sobre la frontera.
 *
 * @returns true si se eliminó un marco blanco, false si la imagen ya era transparente o sin marco blanco
 */
export function floodFillTransparentBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  threshold = 232,
): boolean {
  if (width <= 0 || height <= 0) return false

  const imgData = ctx.getImageData(0, 0, width, height)
  const data = imgData.data

  // 1. Localizar el rectángulo delimitador de píxeles opacos (salta posibles márgenes exteriores transparentes)
  let minX = width
  let maxX = -1
  let minY = height
  let maxY = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] >= 30) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (minX > maxX || minY > maxY) return false

  const boxW = maxX - minX + 1
  const boxH = maxY - minY + 1
  const isRealCrest = boxW >= 20 && boxH >= 20

  const isPixelWhite = (x: number, y: number) => {
    const idx = (y * width + x) * 4
    return isNearWhite(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], threshold)
  }

  // 2. Detectar el recuadro blanco evaluando inset = 0 (y 1..3 en imágenes reales con marco exterior)
  const maxInset = isRealCrest ? 3 : 0
  let matchedInset = -1

  for (let inset = 0; inset <= maxInset; inset++) {
    const iMinX = minX + inset
    const iMaxX = maxX - inset
    const iMinY = minY + inset
    const iMaxY = maxY - inset
    if (iMinX >= iMaxX || iMinY >= iMaxY) break

    const curW = iMaxX - iMinX + 1
    const curH = iMaxY - iMinY + 1
    const maxCornerProbe = Math.min(4, Math.floor(Math.min(curW, curH) / 4))

    const corners: [number, number, number, number][] = [
      [iMinX, iMinY, 1, 1],
      [iMaxX, iMinY, -1, 1],
      [iMinX, iMaxY, 1, -1],
      [iMaxX, iMaxY, -1, -1],
    ]

    let whiteCorners = 0
    for (const [cx, cy, sx, sy] of corners) {
      const exactIdx = (cy * width + cx) * 4
      if (
        isNearWhite(data[exactIdx], data[exactIdx + 1], data[exactIdx + 2], data[exactIdx + 3], threshold)
      ) {
        whiteCorners++
        continue
      }

      // Tolerancia para recuadros blancos con esquinas ligeramente redondeadas (hasta 4px transparentes)
      if (data[exactIdx + 3] < 30 && maxCornerProbe > 0) {
        for (let d = 1; d <= maxCornerProbe; d++) {
          const px = cx + sx * d
          const py = cy + sy * d
          const pIdx = (py * width + px) * 4
          if (data[pIdx + 3] < 30) continue
          if (
            isNearWhite(data[pIdx], data[pIdx + 1], data[pIdx + 2], data[pIdx + 3], threshold) &&
            (edgeHasSignificantWhite(data, width, iMinX, py, 1, 0, curW, threshold) ||
              edgeHasSignificantWhite(data, width, px, iMinY, 0, 1, curH, threshold))
          ) {
            whiteCorners++
          }
          break
        }
      }
    }

    if (whiteCorners >= 2) {
      matchedInset = inset
      break
    }

    if (isRealCrest && whiteCorners >= 1) {
      let perimTotal = 0
      let perimWhite = 0
      for (let x = iMinX; x <= iMaxX; x++) {
        perimTotal += 2
        if (isPixelWhite(x, iMinY)) perimWhite++
        if (isPixelWhite(x, iMaxY)) perimWhite++
      }
      for (let y = iMinY + 1; y < iMaxY; y++) {
        perimTotal += 2
        if (isPixelWhite(iMinX, y)) perimWhite++
        if (isPixelWhite(iMaxX, y)) perimWhite++
      }
      if (perimTotal > 0 && perimWhite / perimTotal >= 0.35) {
        matchedInset = inset
        break
      }
    }
  }

  if (matchedInset < 0) {
    return false
  }

  // Eliminar marco exterior de 1..3 px cuando el recuadro blanco empieza justo por dentro del borde
  if (matchedInset > 0) {
    const nMinX = minX + matchedInset
    const nMaxX = maxX - matchedInset
    const nMinY = minY + matchedInset
    const nMaxY = maxY - matchedInset
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < nMinX || x > nMaxX || y < nMinY || y > nMaxY) {
          data[(y * width + x) * 4 + 3] = 0
        }
      }
    }
    minX = nMinX
    maxX = nMaxX
    minY = nMinY
    maxY = nMaxY
  }

  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels)
  const queue = new Int32Array(totalPixels)
  let queueEnd = 0
  let queueStart = 0

  const isBgPixel = (idx: number, x: number, y: number): boolean => {
    const p = idx * 4
    const r = data[p]
    const g = data[p + 1]
    const b = data[p + 2]
    const a = data[p + 3]
    if (isNearWhite(r, g, b, a, threshold)) return true
    if (isRealCrest && a >= 30) {
      const inCore =
        x >= width * 0.22 && x <= width * 0.78 && y >= height * 0.22 && y <= height * 0.78
      if (!inCore) {
        const mn = Math.min(r, g, b)
        const mx = Math.max(r, g, b)
        if (mn >= 188 && mx - mn <= 18) return true
      }
    }
    return false
  }

  const isLightNeutralBorder = (x: number, y: number): boolean => {
    const p = (y * width + x) * 4
    const a = data[p + 3]
    if (a < 30) return true
    const mn = Math.min(data[p], data[p + 1], data[p + 2])
    const mx = Math.max(data[p], data[p + 1], data[p + 2])
    return mn >= 175 && mx - mn <= 20
  }

  const trySeedPixel = (x: number, y: number) => {
    const idx = y * width + x
    if (visited[idx]) return
    if (isBgPixel(idx, x, y)) {
      visited[idx] = 1
      queue[queueEnd++] = idx
    }
  }

  // 3. Añadir a la cola todos los píxeles de fondo del perímetro del recuadro opaco
  for (let x = minX; x <= maxX; x++) {
    trySeedPixel(x, minY)
    trySeedPixel(x, maxY)
  }
  for (let y = minY + 1; y < maxY; y++) {
    trySeedPixel(minX, y)
    trySeedPixel(maxX, y)
  }

  if (isRealCrest && maxX - minX >= 2 && maxY - minY >= 2) {
    for (let x = minX + 1; x <= maxX - 1; x++) {
      if (matchedInset > 0 || isLightNeutralBorder(x, minY)) trySeedPixel(x, minY + 1)
      if (matchedInset > 0 || isLightNeutralBorder(x, maxY)) trySeedPixel(x, maxY - 1)
    }
    for (let y = minY + 1; y <= maxY - 1; y++) {
      if (matchedInset > 0 || isLightNeutralBorder(minX, y)) trySeedPixel(minX + 1, y)
      if (matchedInset > 0 || isLightNeutralBorder(maxX, y)) trySeedPixel(maxX - 1, y)
    }
  }

  if (queueEnd === 0 && matchedInset === 0) return false

  // 4. Propagar el flood-fill hacia adentro haciendo transparentes los píxeles conectados
  while (queueStart < queueEnd) {
    const curr = queue[queueStart++]
    const cx = curr % width
    const cy = (curr / width) | 0

    data[curr * 4 + 3] = 0

    const tryPush = (next: number, nx: number, ny: number) => {
      if (visited[next]) return
      if (isBgPixel(next, nx, ny)) {
        visited[next] = 1
        queue[queueEnd++] = next
      }
    }

    if (cx > minX) tryPush(curr - 1, cx - 1, cy)
    if (cx < maxX) tryPush(curr + 1, cx + 1, cy)
    if (cy > minY) tryPush(curr - width, cx, cy - 1)
    if (cy < maxY) tryPush(curr + width, cx, cy + 1)
  }

  // 5. Dos pasadas de suavizado anti-aliasing para eliminar halos en modo oscuro
  const featheredCleared = new Uint8Array(totalPixels)
  const pass1Cleared: number[] = []

  const featherPass1 = (next: number) => {
    if (visited[next] || featheredCleared[next]) return
    const p = next * 4
    const a = data[p + 3]
    if (a < 30) return
    const r = data[p]
    const g = data[p + 1]
    const b = data[p + 2]
    const minRgb = Math.min(r, g, b)
    const maxRgb = Math.max(r, g, b)
    const diff = maxRgb - minRgb
    const sum = r + g + b
    if ((minRgb >= 185 && diff <= 30) || (sum >= 645 && minRgb >= 185 && diff <= 48)) {
      data[p + 3] = 0
      featheredCleared[next] = 1
      pass1Cleared.push(next)
    } else if (minRgb >= 150 && diff <= 32) {
      const factor = Math.max(0, (190 - minRgb) / 50)
      data[p + 3] = Math.min(a, Math.round(a * factor))
    }
  }

  for (let i = 0; i < queueEnd; i++) {
    const curr = queue[i]
    const cx = curr % width
    const cy = (curr / width) | 0

    if (cx > minX) featherPass1(curr - 1)
    if (cx < maxX) featherPass1(curr + 1)
    if (cy > minY) featherPass1(curr - width)
    if (cy < maxY) featherPass1(curr + width)
    if (isRealCrest) {
      if (cx > minX && cy > minY) featherPass1(curr - width - 1)
      if (cx < maxX && cy > minY) featherPass1(curr - width + 1)
      if (cx > minX && cy < maxY) featherPass1(curr + width - 1)
      if (cx < maxX && cy < maxY) featherPass1(curr + width + 1)
    }
  }

  const featherPass2 = (next: number) => {
    if (visited[next] || featheredCleared[next]) return
    const p = next * 4
    const a = data[p + 3]
    if (a < 30) return
    const minRgb = Math.min(data[p], data[p + 1], data[p + 2])
    const maxRgb = Math.max(data[p], data[p + 1], data[p + 2])
    if (minRgb >= 190 && maxRgb - minRgb <= 28) {
      data[p + 3] = Math.min(a, Math.round(a * 0.25))
    }
  }

  for (let i = 0; i < pass1Cleared.length; i++) {
    const curr = pass1Cleared[i]
    const cx = curr % width
    const cy = (curr / width) | 0

    if (cx > minX) featherPass2(curr - 1)
    if (cx < maxX) featherPass2(curr + 1)
    if (cy > minY) featherPass2(curr - width)
    if (cy < maxY) featherPass2(curr + width)
  }

  ctx.putImageData(imgData, 0, 0)
  return true
}

function detectImageMime(bytes: Uint8Array, fallbackContentType: string): string | null {
  if (bytes.length < 4) return null
  if (bytes[0] === 0x3c) return null // '<' -> respuesta HTML (404 / error)
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png'
  }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif'
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    return 'image/webp'
  }
  return fallbackContentType || 'image/png'
}

function loadImageElement(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (crossOrigin) {
      img.crossOrigin = crossOrigin
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Image load failed'))
    img.src = src
  })
}

async function fetchImageAsObjectUrl(
  url: string,
): Promise<{ src: string; revoke: () => void } | null> {
  if (
    typeof fetch !== 'function' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return null
  }
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const contentType = res.headers?.get?.('content-type') || 'image/png'
    let blob: Blob
    if (typeof res.arrayBuffer === 'function') {
      const buffer = await res.arrayBuffer()
      if (!buffer || buffer.byteLength === 0) return null
      const bytes = new Uint8Array(buffer)
      const mime = detectImageMime(bytes, contentType)
      if (!mime) return null
      blob = new Blob([bytes], { type: mime })
    } else if (typeof res.blob === 'function') {
      blob = await res.blob()
      if (!blob || blob.size === 0) return null
    } else {
      return null
    }
    const objectUrl = URL.createObjectURL(blob)
    return {
      src: objectUrl,
      revoke: () => URL.revokeObjectURL(objectUrl),
    }
  } catch {
    return null
  }
}

function renderTransparentCanvas(img: HTMLImageElement, normalized: string): string {
  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  if (width <= 0 || height <= 0) {
    return normalized
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return normalized
  }

  ctx.drawImage(img, 0, 0)
  const changed = floodFillTransparentBackground(ctx, width, height)
  return changed ? canvas.toDataURL('image/png') : normalized
}

async function loadCrestImageOnce(
  normalized: string,
): Promise<{ img: HTMLImageElement; revoke?: () => void }> {
  const fetched = await fetchImageAsObjectUrl(normalized)
  if (fetched) {
    try {
      const img = await loadImageElement(fetched.src)
      return { img, revoke: fetched.revoke }
    } catch {
      fetched.revoke()
    }
  }
  const img = await loadImageElement(normalized, 'anonymous')
  return { img }
}

/**
 * Procesa de forma síncrona un `<img>` ya cargado en el navegador (mismo origen o CORS abierto),
 * eliminando el recuadro blanco exterior con cero peticiones HTTP adicionales y actualizando la caché reactiva.
 */
export function processLoadedCrestImage(img: HTMLImageElement, rawUrl?: string): void {
  const normalized = normalizeCrestUrl(rawUrl) ?? rawUrl
  if (!normalized || transparentCache.has(normalized) || !isTransparencyCandidate(normalized)) {
    return
  }
  if (typeof document === 'undefined') return
  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  if (width <= 0 || height <= 0) return

  try {
    const result = renderTransparentCanvas(img, normalized)
    setTransparentCache(normalized, result)
  } catch {
    // Imagen cross-origin sin CORS en navegador/WebView: procesamos en segundo plano con cola y reintentos
    void makeCrestBackgroundTransparent(normalized)
  }
}

/**
 * Carga una imagen vía fetch nativo/proxy con concurrencia limitada y reintentos,
 * detecta si tiene un recuadro blanco exterior y lo remueve devolviendo una Data URL PNG transparente.
 */
export async function makeCrestBackgroundTransparent(url: string): Promise<string> {
  const normalized = normalizeCrestUrl(url) ?? url

  if (transparentCache.has(normalized)) {
    return transparentCache.get(normalized)!
  }

  if (inFlightRequests.has(normalized)) {
    return inFlightRequests.get(normalized)!
  }

  if (typeof window === 'undefined') {
    return normalized
  }

  const promise = (async () => {
    let slotAcquired = false
    let revoke: (() => void) | undefined
    try {
      await acquireCrestFetchSlot()
      slotAcquired = true

      const maxAttempts = 3 // intento inicial + hasta 2 reintentos
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const loaded = await loadCrestImageOnce(normalized)
          revoke = loaded.revoke
          const result = renderTransparentCanvas(loaded.img, normalized)
          setTransparentCache(normalized, result)
          return result
        } catch (err) {
          revoke?.()
          revoke = undefined
          if (attempt >= maxAttempts) {
            throw err
          }
          await sleep(400 * attempt)
        }
      }
      return normalized
    } catch {
      // Si falla la descarga o la lectura de píxeles tras reintentar, devolvemos la URL original sin envenenar la caché
      return normalized
    } finally {
      revoke?.()
      if (slotAcquired) {
        releaseCrestFetchSlot()
      }
      inFlightRequests.delete(normalized)
    }
  })()

  inFlightRequests.set(normalized, promise)
  return promise
}

/**
 * Hook de React para consumir una URL de escudo y obtener de forma reactiva
 * la versión con el marco blanco exterior removido.
 */
export function useTransparentCrest(rawUrl?: string): string | undefined {
  const normalized = normalizeCrestUrl(rawUrl)

  const cached = useSyncExternalStore(
    (onStoreChange) => subscribeCrestCache(normalized, onStoreChange),
    () => (normalized ? transparentCache.get(normalized) : undefined),
    () => undefined,
  )

  useEffect(() => {
    if (!normalized || cached !== undefined || !isTransparencyCandidate(normalized)) {
      return
    }

    // En navegador con proxy local `/api/futbolme`, `<TeamCrest onLoad>` procesa síncronamente sin
    // peticiones extra en el arranque; diferimos un respaldo breve por si no pasase por `onLoad`.
    const deferMs = !isNativeApp() && normalized.startsWith('/api/futbolme') ? 1500 : 0
    if (deferMs > 0) {
      const timer = window.setTimeout(() => {
        if (!transparentCache.has(normalized)) {
          void makeCrestBackgroundTransparent(normalized)
        }
      }, deferMs)
      return () => window.clearTimeout(timer)
    }

    void makeCrestBackgroundTransparent(normalized)
  }, [normalized, cached])

  return cached ?? normalized
}

import { useEffect, useState } from 'react'
import { toFutbolmeUrl } from './runtime'

/** Caché global de escudos procesados con fondo transparente */
const transparentCache = new Map<string, string>()

/** Promesas en vuelo para no procesar el mismo escudo dos veces en paralelo */
const inFlightRequests = new Map<string, Promise<string>>()

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

/** Comprueba si un píxel RGBA es blanco, blanco roto o gris muy claro neutro (marco de fondo). */
export function isNearWhite(r: number, g: number, b: number, a: number, threshold = 232): boolean {
  if (a < 30) return false // Ya es transparente
  if (r >= threshold && g >= threshold && b >= threshold) return true
  if (threshold <= 232) {
    const min = Math.min(r, g, b)
    const max = Math.max(r, g, b)
    // Captura fondos blanco roto o gris muy claro sin saturación típicos de escudos comprimidos
    if (min >= 216 && max - min <= 16) return true
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
 * Detecta el recuadro aunque exista un pequeño margen exterior transparente o bordes redondeados,
 * se detiene ante los bordes y trazos del escudo, y suaviza el halo anti-aliasing en la frontera.
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
  const maxCornerProbe = Math.min(4, Math.floor(Math.min(boxW, boxH) / 4))

  // 2. Comprobar las 4 esquinas del rectángulo opaco.
  // Si el primer píxel opaco de la esquina es casi blanco, cuenta como esquina de recuadro blanco.
  const corners: [number, number, number, number][] = [
    [minX, minY, 1, 1],
    [maxX, minY, -1, 1],
    [minX, maxY, 1, -1],
    [maxX, maxY, -1, -1],
  ]

  let whiteCorners = 0
  for (const [cx, cy, sx, sy] of corners) {
    const exactIdx = (cy * width + cx) * 4
    if (isNearWhite(data[exactIdx], data[exactIdx + 1], data[exactIdx + 2], data[exactIdx + 3], threshold)) {
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
          (edgeHasSignificantWhite(data, width, minX, cy, 1, 0, boxW, threshold) ||
            edgeHasSignificantWhite(data, width, cx, minY, 0, 1, boxH, threshold))
        ) {
          whiteCorners++
        }
        break
      }
    }
  }

  // Si menos de 2 esquinas son blancas, no es una imagen con recuadro blanco opaco
  if (whiteCorners < 2) {
    return false
  }

  const totalPixels = width * height
  const visited = new Uint8Array(totalPixels)
  const queue = new Int32Array(totalPixels)
  let queueEnd = 0
  let queueStart = 0

  const trySeedPixel = (x: number, y: number) => {
    const idx = y * width + x
    if (visited[idx]) return
    const p = idx * 4
    if (isNearWhite(data[p], data[p + 1], data[p + 2], data[p + 3], threshold)) {
      visited[idx] = 1
      queue[queueEnd++] = idx
    }
  }

  // 3. Añadir a la cola todos los píxeles casi blancos del perímetro del recuadro opaco
  for (let x = minX; x <= maxX; x++) {
    trySeedPixel(x, minY)
    trySeedPixel(x, maxY)
  }
  for (let y = minY + 1; y < maxY; y++) {
    trySeedPixel(minX, y)
    trySeedPixel(maxX, y)
  }

  if (queueEnd === 0) return false

  // 4. Propagar el flood-fill hacia adentro haciendo transparentes los píxeles conectados
  while (queueStart < queueEnd) {
    const curr = queue[queueStart++]
    const cx = curr % width
    const cy = (curr / width) | 0

    data[curr * 4 + 3] = 0

    const tryPush = (next: number) => {
      if (visited[next]) return
      const nextP = next * 4
      if (isNearWhite(data[nextP], data[nextP + 1], data[nextP + 2], data[nextP + 3], threshold)) {
        visited[next] = 1
        queue[queueEnd++] = next
      }
    }

    if (cx > minX) tryPush(curr - 1)
    if (cx < maxX) tryPush(curr + 1)
    if (cy > minY) tryPush(curr - width)
    if (cy < maxY) tryPush(curr + width)
  }

  // 5. Suavizar el borde anti-aliasing pegado al fondo eliminado para quitar halos blancos en modo oscuro
  for (let i = 0; i < queueEnd; i++) {
    const curr = queue[i]
    const cx = curr % width
    const cy = (curr / width) | 0

    const featherNeighbor = (next: number) => {
      if (visited[next]) return
      const p = next * 4
      const a = data[p + 3]
      if (a < 30) return
      const r = data[p]
      const g = data[p + 1]
      const b = data[p + 2]
      const minRgb = Math.min(r, g, b)
      const maxRgb = Math.max(r, g, b)
      if (minRgb >= 192 && maxRgb - minRgb <= 22) {
        if (minRgb >= 210 && maxRgb - minRgb <= 14) {
          data[p + 3] = 0
        } else {
          const factor = Math.max(0, (226 - minRgb) / 36)
          data[p + 3] = Math.min(a, Math.round(a * factor))
        }
      }
    }

    if (cx > minX) featherNeighbor(curr - 1)
    if (cx < maxX) featherNeighbor(curr + 1)
    if (cy > minY) featherNeighbor(curr - width)
    if (cy < maxY) featherNeighbor(curr + width)
  }

  ctx.putImageData(imgData, 0, 0)
  return true
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
      blob = new Blob([buffer], { type: contentType })
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

/**
 * Carga una imagen vía fetch nativo/proxy (evitando bloqueos CORS en WebView de Android y navegador),
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
    let revoke: (() => void) | undefined
    try {
      const fetched = await fetchImageAsObjectUrl(normalized)
      let img: HTMLImageElement
      if (fetched) {
        revoke = fetched.revoke
        img = await loadImageElement(fetched.src)
      } else {
        img = await loadImageElement(normalized, 'anonymous')
      }

      const width = img.naturalWidth || img.width
      const height = img.naturalHeight || img.height
      if (width <= 0 || height <= 0) {
        transparentCache.set(normalized, normalized)
        return normalized
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) {
        transparentCache.set(normalized, normalized)
        return normalized
      }

      ctx.drawImage(img, 0, 0)
      const changed = floodFillTransparentBackground(ctx, width, height)

      if (changed) {
        const transparentDataUrl = canvas.toDataURL('image/png')
        transparentCache.set(normalized, transparentDataUrl)
        return transparentDataUrl
      }

      transparentCache.set(normalized, normalized)
      return normalized
    } catch {
      // Si falla la descarga o la lectura de píxeles, devolvemos la URL original sin envenenar la caché
      return normalized
    } finally {
      revoke?.()
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
  const [processed, setProcessed] = useState<{ url: string; result: string } | null>(null)

  const cached = normalized ? transparentCache.get(normalized) : undefined
  const asyncUrl = processed !== null && processed.url === normalized ? processed.result : undefined
  const crestUrl = cached ?? asyncUrl ?? normalized

  useEffect(() => {
    if (!normalized || transparentCache.has(normalized)) {
      return
    }

    // Comprobamos si la imagen proviene de futbolme o termina en extensión de imagen típica
    const isCandidate =
      normalized.includes('futbolme') ||
      normalized.includes('/api/futbolme') ||
      /\.(png|jpe?g)(\?.*)?$/i.test(normalized)

    if (!isCandidate) {
      return
    }

    let isMounted = true
    makeCrestBackgroundTransparent(normalized)
      .then((result) => {
        if (isMounted) {
          setProcessed({ url: normalized, result })
        }
      })
      .catch(() => {
        if (isMounted) {
          setProcessed({ url: normalized, result: normalized })
        }
      })

    return () => {
      isMounted = false
    }
  }, [normalized])

  return crestUrl
}

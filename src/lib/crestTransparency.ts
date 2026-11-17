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

/** Comprueba si un píxel RGBA es blanco o casi blanco (fondo de imagen con marco). */
export function isNearWhite(r: number, g: number, b: number, a: number, threshold = 232): boolean {
  if (a < 30) return false // Ya es transparente
  return r >= threshold && g >= threshold && b >= threshold
}

/**
 * Convierte en transparente todo el marco exterior blanco conectado al perímetro de la imagen
 * utilizando un recorrido en anchura (BFS / Flood Fill).
 *
 * Se detiene ante los bordes y trazos coloreados del escudo, preservando intactos
 * los elementos blancos interiores (rayas de equipación, tipografías, estrellas, etc.).
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

  // Comprobar primero las 4 esquinas exteriores.
  // Si están transparentes o son oscuras/coloreadas, la imagen no tiene marco blanco.
  const cornerCoords: [number, number][] = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ]

  let whiteCorners = 0
  for (const [cx, cy] of cornerCoords) {
    const idx = (cy * width + cx) * 4
    if (isNearWhite(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], threshold)) {
      whiteCorners++
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

  // 1. Añadir a la cola todos los píxeles casi blancos del perímetro exterior
  // Fila superior e inferior
  for (let x = 0; x < width; x++) {
    // Arriba (y = 0)
    const topIdx = x
    const topP = topIdx * 4
    if (isNearWhite(data[topP], data[topP + 1], data[topP + 2], data[topP + 3], threshold)) {
      visited[topIdx] = 1
      queue[queueEnd++] = topIdx
    }

    // Abajo (y = height - 1)
    const bottomIdx = (height - 1) * width + x
    const bottomP = bottomIdx * 4
    if (isNearWhite(data[bottomP], data[bottomP + 1], data[bottomP + 2], data[bottomP + 3], threshold)) {
      if (!visited[bottomIdx]) {
        visited[bottomIdx] = 1
        queue[queueEnd++] = bottomIdx
      }
    }
  }

  // Columnas izquierda y derecha
  for (let y = 1; y < height - 1; y++) {
    const leftIdx = y * width
    const leftP = leftIdx * 4
    if (isNearWhite(data[leftP], data[leftP + 1], data[leftP + 2], data[leftP + 3], threshold)) {
      if (!visited[leftIdx]) {
        visited[leftIdx] = 1
        queue[queueEnd++] = leftIdx
      }
    }

    const rightIdx = y * width + (width - 1)
    const rightP = rightIdx * 4
    if (isNearWhite(data[rightP], data[rightP + 1], data[rightP + 2], data[rightP + 3], threshold)) {
      if (!visited[rightIdx]) {
        visited[rightIdx] = 1
        queue[queueEnd++] = rightIdx
      }
    }
  }

  if (queueEnd === 0) return false

  // 2. Propagar el flood-fill hacia adentro haciendo transparentes los píxeles conectados
  while (queueStart < queueEnd) {
    const curr = queue[queueStart++]
    const cx = curr % width
    const cy = (curr / width) | 0

    // Establecer alfa a 0 (totalmente transparente)
    data[curr * 4 + 3] = 0

    // Vecinos ortogonales (arriba, abajo, izquierda, derecha)
    const neighbors: number[] = []
    if (cx > 0) neighbors.push(curr - 1)
    if (cx < width - 1) neighbors.push(curr + 1)
    if (cy > 0) neighbors.push(curr - width)
    if (cy < height - 1) neighbors.push(curr + width)

    for (let i = 0; i < neighbors.length; i++) {
      const next = neighbors[i]
      if (!visited[next]) {
        const nextP = next * 4
        if (isNearWhite(data[nextP], data[nextP + 1], data[nextP + 2], data[nextP + 3], threshold)) {
          visited[next] = 1
          queue[queueEnd++] = next
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return true
}

/**
 * Carga una imagen, detecta si tiene un marco blanco cuadrado y lo remueve
 * devolviendo una Data URL PNG transparente. Si la imagen no tiene marco blanco
 * o falla la manipulación, devuelve la URL original normalizada.
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

  const promise = new Promise<string>((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = normalized

    img.onload = () => {
      try {
        const width = img.naturalWidth || img.width
        const height = img.naturalHeight || img.height

        if (width <= 0 || height <= 0) {
          transparentCache.set(normalized, normalized)
          return resolve(normalized)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })

        if (!ctx) {
          transparentCache.set(normalized, normalized)
          return resolve(normalized)
        }

        ctx.drawImage(img, 0, 0)
        const changed = floodFillTransparentBackground(ctx, width, height)

        if (changed) {
          const transparentDataUrl = canvas.toDataURL('image/png')
          transparentCache.set(normalized, transparentDataUrl)
          resolve(transparentDataUrl)
        } else {
          transparentCache.set(normalized, normalized)
          resolve(normalized)
        }
      } catch {
        // En caso de que el canvas esté bloqueado por origen cruzado o error, conservar original
        transparentCache.set(normalized, normalized)
        resolve(normalized)
      } finally {
        inFlightRequests.delete(normalized)
      }
    }

    img.onerror = () => {
      transparentCache.set(normalized, normalized)
      inFlightRequests.delete(normalized)
      resolve(normalized)
    }
  })

  inFlightRequests.set(normalized, promise)
  return promise
}

/**
 * Hook de React para consumir una URL de escudo y obtener de forma reactiva
 * la versión con el marco blanco exterior removido.
 */
export function useTransparentCrest(rawUrl?: string): string | undefined {
  const normalized = normalizeCrestUrl(rawUrl)
  const [asyncUrl, setAsyncUrl] = useState<string | undefined>()

  const cached = normalized ? transparentCache.get(normalized) : undefined
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
      .then((processed) => {
        if (isMounted) {
          setAsyncUrl(processed)
        }
      })
      .catch(() => {
        if (isMounted) {
          setAsyncUrl(normalized)
        }
      })

    return () => {
      isMounted = false
    }
  }, [normalized])

  return crestUrl
}

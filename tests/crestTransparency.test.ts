import { describe, expect, it } from 'vitest'
import {
  floodFillTransparentBackground,
  isNearWhite,
  normalizeCrestUrl,
} from '../src/lib/crestTransparency'

describe('crestTransparency', () => {
  it('detecta correctamente píxeles blancos, blanco roto y casi blancos', () => {
    expect(isNearWhite(255, 255, 255, 255)).toBe(true)
    expect(isNearWhite(240, 240, 240, 255)).toBe(true)
    expect(isNearWhite(232, 232, 232, 255)).toBe(true)
    expect(isNearWhite(222, 222, 222, 255)).toBe(true)
    // Píxel oscuro o de color
    expect(isNearWhite(200, 200, 200, 255)).toBe(false)
    expect(isNearWhite(255, 0, 0, 255)).toBe(false)
    // Píxel ya transparente
    expect(isNearWhite(255, 255, 255, 0)).toBe(false)
  })

  it('normaliza URLs de futbolme para usar el proxy en navegador si window está definido', () => {
    const raw = 'https://futbolme.com/static/img/club/escudo4558.png'
    const normalized = normalizeCrestUrl(raw)
    // En Vitest / jsdom o node
    if (typeof window !== 'undefined') {
      expect(normalized).toBe('/api/futbolme/static/img/club/escudo4558.png')
    } else {
      expect(normalized).toBe(raw)
    }
  })

  it('elimina el marco blanco exterior con floodFill pero preserva el blanco interior protegido', () => {
    // Creamos un canvas simulado de 5x5:
    // Borde exterior: blanco (255, 255, 255, 255)
    // Anillo protector: negro (0, 0, 0, 255)
    // Centro interior: blanco (255, 255, 255, 255) (ejemplo de detalle blanco dentro del escudo)
    const width = 5
    const height = 5
    const totalBytes = width * height * 4
    const buffer = new Uint8ClampedArray(totalBytes)

    // Llenar todo de blanco por defecto
    for (let i = 0; i < totalBytes; i += 4) {
      buffer[i] = 255 // R
      buffer[i + 1] = 255 // G
      buffer[i + 2] = 255 // B
      buffer[i + 3] = 255 // A
    }

    // Dibujar un borde protector negro en el recuadro 1..3, 1..3
    // (x=1..3, y=1..3 perímetro)
    for (let x = 1; x <= 3; x++) {
      for (let y = 1; y <= 3; y++) {
        if (x === 1 || x === 3 || y === 1 || y === 3) {
          const idx = (y * width + x) * 4
          buffer[idx] = 10 // R
          buffer[idx + 1] = 10 // G
          buffer[idx + 2] = 10 // B
          buffer[idx + 3] = 255 // A
        }
      }
    }
    // El centro (2, 2) sigue siendo blanco puro!

    const imgData = {
      data: buffer,
      width,
      height,
    } as unknown as ImageData

    let updatedData: ImageData | null = null
    const mockCtx = {
      getImageData: () => imgData,
      putImageData: (d: ImageData) => {
        updatedData = d
      },
    } as unknown as CanvasRenderingContext2D

    const result = floodFillTransparentBackground(mockCtx, width, height)
    expect(result).toBe(true)
    expect(updatedData).not.toBeNull()

    // 1. Las esquinas exteriores ahora deben tener alfa = 0 (transparentes)
    const cornerIdx = 0 // esquina (0, 0)
    expect(buffer[cornerIdx + 3]).toBe(0)

    // 2. El anillo negro debe mantener su color y alfa = 255
    const ringIdx = (1 * width + 1) * 4
    expect(buffer[ringIdx]).toBe(10)
    expect(buffer[ringIdx + 3]).toBe(255)

    // 3. El centro interior (2, 2) debe seguir siendo BLANCO y OPACO (alfa = 255)!
    const centerIdx = (2 * width + 2) * 4
    expect(buffer[centerIdx]).toBe(255)
    expect(buffer[centerIdx + 1]).toBe(255)
    expect(buffer[centerIdx + 2]).toBe(255)
    expect(buffer[centerIdx + 3]).toBe(255)
  })

  it('no modifica imágenes que ya son transparentes o con esquinas no blancas', () => {
    const width = 4
    const height = 4
    const buffer = new Uint8ClampedArray(width * height * 4) // todos 0 (transparente)

    const imgData = { data: buffer, width, height } as unknown as ImageData
    const mockCtx = {
      getImageData: () => imgData,
      putImageData: () => {},
    } as unknown as CanvasRenderingContext2D

    const result = floodFillTransparentBackground(mockCtx, width, height)
    expect(result).toBe(false)
  })

  it('elimina un recuadro gris claro o blanco roto aunque tenga margen exterior transparente de 1px', () => {
    // 7x7: borde exterior (0 y 6) transparente; marco interior (1..5) gris muy claro (222);
    // contorno protector (2..4) oscuro; centro (3,3) blanco puro protegido.
    const width = 7
    const height = 7
    const buffer = new Uint8ClampedArray(width * height * 4)

    for (let y = 1; y <= 5; y++) {
      for (let x = 1; x <= 5; x++) {
        const idx = (y * width + x) * 4
        buffer[idx] = 222
        buffer[idx + 1] = 222
        buffer[idx + 2] = 222
        buffer[idx + 3] = 255
      }
    }

    for (let y = 2; y <= 4; y++) {
      for (let x = 2; x <= 4; x++) {
        const idx = (y * width + x) * 4
        if (x === 3 && y === 3) {
          buffer[idx] = 255
          buffer[idx + 1] = 255
          buffer[idx + 2] = 255
          buffer[idx + 3] = 255
        } else {
          buffer[idx] = 12
          buffer[idx + 1] = 12
          buffer[idx + 2] = 12
          buffer[idx + 3] = 255
        }
      }
    }

    const imgData = { data: buffer, width, height } as unknown as ImageData
    const mockCtx = {
      getImageData: () => imgData,
      putImageData: () => {},
    } as unknown as CanvasRenderingContext2D

    const result = floodFillTransparentBackground(mockCtx, width, height)
    expect(result).toBe(true)

    // Recuadro blanco roto (1, 1) ahora debe ser transparente
    expect(buffer[(1 * width + 1) * 4 + 3]).toBe(0)
    // Contorno del escudo (2, 2) sigue opaco
    expect(buffer[(2 * width + 2) * 4 + 3]).toBe(255)
    // Centro blanco interior (3, 3) permanece opaco
    expect(buffer[(3 * width + 3) * 4 + 3]).toBe(255)
  })
})

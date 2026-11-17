import { translatePosition } from '@/lib/positions'
import type { Player } from '@/types'

export interface PositionedPlayer {
  player: Player
  x: number // 0..100 horizontal percentage
  y: number // 0..100 vertical percentage (top to bottom)
  lineIndex: number
}

export interface TacticalFormation {
  formation: string // e.g. "4-3-3", "4-2-3-1"
  lines: PositionedPlayer[][]
  allPlayers: PositionedPlayer[]
}

/**
 * Formatea el nombre de un jugador para mostrarse conciso y legible sobre el césped
 * (ej. "Thibaut Courtois" -> "Courtois", "Vinícius Júnior" -> "Vinícius Jr.").
 */
export function formatPitchPlayerName(name: string): string {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (!clean) return 'Jugador'

  const parts = clean.split(' ')
  if (parts.length === 1) return parts[0]

  const last = parts[parts.length - 1]
  const prev = parts.length >= 2 ? parts[parts.length - 2] : ''

  // Sufijos como Jr, Júnior, II, III, Filho, Neto
  if (/^(jr\.?|junior|júnior|filho|neto|ii|iii)$/i.test(last) && prev) {
    return `${prev} Jr.`
  }

  // Si el primer nombre es muy corto o es una inicial (ej. "J. Martínez")
  if (parts[0].length <= 2 && parts[0].endsWith('.')) {
    return `${parts[0]} ${last}`
  }

  // Nombres hispanos o compuestos comunes (ej. "Lamine Yamal")
  if (parts.length === 2 && (parts[0] === 'Lamine' || parts[0] === 'Nico')) {
    return `${parts[0]} ${last}`
  }

  // Devolver el apellido o nombre deportivo principal
  return last
}

export interface TacticalSlot {
  depth: number
  lane: number
}

const EXACT_SLOTS: Record<string, TacticalSlot> = {
  // Porteros
  G: { depth: 0, lane: 0 },
  GK: { depth: 0, lane: 0 },
  POR: { depth: 0, lane: 0 },
  PO: { depth: 0, lane: 0 },
  PT: { depth: 0, lane: 0 },
  ARQ: { depth: 0, lane: 0 },

  // Defensas
  LB: { depth: 12, lane: -2 },
  LWB: { depth: 12, lane: -2 },
  LI: { depth: 12, lane: -2 },
  'CD-L': { depth: 10, lane: -1 },
  'CB-L': { depth: 10, lane: -1 },
  LCB: { depth: 10, lane: -1 },
  CD: { depth: 10, lane: 0 },
  CB: { depth: 10, lane: 0 },
  SW: { depth: 10, lane: 0 },
  D: { depth: 10, lane: 0 },
  DF: { depth: 10, lane: 0 },
  DEF: { depth: 10, lane: 0 },
  'CD-R': { depth: 10, lane: 1 },
  'CB-R': { depth: 10, lane: 1 },
  RCB: { depth: 10, lane: 1 },
  RB: { depth: 12, lane: 2 },
  RWB: { depth: 12, lane: 2 },
  LD: { depth: 12, lane: 2 },
  RD: { depth: 12, lane: 2 },

  // Pivotes / Mediocentros defensivos
  'DM-L': { depth: 20, lane: -1 },
  LDM: { depth: 20, lane: -1 },
  'CDM-L': { depth: 20, lane: -1 },
  DM: { depth: 20, lane: 0 },
  CDM: { depth: 20, lane: 0 },
  MCD: { depth: 20, lane: 0 },
  PIV: { depth: 20, lane: 0 },
  'DM-R': { depth: 20, lane: 1 },
  RDM: { depth: 20, lane: 1 },
  'CDM-R': { depth: 20, lane: 1 },

  // Centrocampistas centrales e interiores
  LM: { depth: 25, lane: -2 },
  MI: { depth: 25, lane: -2 },
  'CM-L': { depth: 25, lane: -1 },
  LCM: { depth: 25, lane: -1 },
  CM: { depth: 25, lane: 0 },
  M: { depth: 25, lane: 0 },
  MF: { depth: 25, lane: 0 },
  MID: { depth: 25, lane: 0 },
  MED: { depth: 25, lane: 0 },
  MC: { depth: 25, lane: 0 },
  VOL: { depth: 25, lane: 0 },
  'CM-R': { depth: 25, lane: 1 },
  RCM: { depth: 25, lane: 1 },
  RM: { depth: 25, lane: 2 },
  MD: { depth: 25, lane: 2 },

  // Mediapuntas
  'AM-L': { depth: 30, lane: -2 },
  LAM: { depth: 30, lane: -2 },
  AM: { depth: 30, lane: 0 },
  CAM: { depth: 30, lane: 0 },
  MCO: { depth: 30, lane: 0 },
  'AM-R': { depth: 30, lane: 2 },
  RAM: { depth: 30, lane: 2 },

  // Extremos y Segundos Delanteros
  LF: { depth: 35, lane: -2 },
  'LF-L': { depth: 35, lane: -2 },
  LW: { depth: 35, lane: -2 },
  EI: { depth: 35, lane: -2 },
  'CF-L': { depth: 35, lane: -1 },
  LS: { depth: 35, lane: -1 },
  'ST-L': { depth: 35, lane: -1 },
  SS: { depth: 35, lane: 0 },
  SD: { depth: 35, lane: 0 },
  'CF-R': { depth: 35, lane: 1 },
  RS: { depth: 35, lane: 1 },
  'ST-R': { depth: 35, lane: 1 },
  RF: { depth: 35, lane: 2 },
  'RF-R': { depth: 35, lane: 2 },
  RW: { depth: 35, lane: 2 },
  ED: { depth: 35, lane: 2 },

  // Delantero Centro / Ariete
  F: { depth: 40, lane: 0 },
  CF: { depth: 40, lane: 0 },
  ST: { depth: 40, lane: 0 },
  FW: { depth: 40, lane: 0 },
  FWD: { depth: 40, lane: 0 },
  DC: { depth: 40, lane: 0 },
  ATA: { depth: 40, lane: 0 },
  ATT: { depth: 40, lane: 0 },
  DEL: { depth: 40, lane: 0 },
}

/**
 * Devuelve la profundidad vertical (`depth`) y el carril horizontal (`lane`, -2 izquierda a +2 derecha)
 * a partir del código o nombre de demarcación.
 */
export function getTacticalDepthAndLane(position?: string): TacticalSlot {
  const pos = (position || '').toUpperCase().trim()
  if (EXACT_SLOTS[pos]) return EXACT_SLOTS[pos]

  if (/GOAL|PORTER|ARQUER|GUARDAM/.test(pos)) return { depth: 0, lane: 0 }

  // Defensas
  if (/LEFT\s*(?:WING\s*)?BACK|LATERAL\s*IZQ/.test(pos)) return { depth: 12, lane: -2 }
  if (/RIGHT\s*(?:WING\s*)?BACK|LATERAL\s*DER/.test(pos)) return { depth: 12, lane: 2 }
  if (/CENTER\s*LEFT\s*DEF/.test(pos)) return { depth: 10, lane: -1 }
  if (/CENTER\s*RIGHT\s*DEF/.test(pos)) return { depth: 10, lane: 1 }
  if (/DEFEND|DEFENSA|BACK|LATERAL|CENTRAL|STOPPER/.test(pos)) return { depth: 10, lane: 0 }

  // Mediocentros defensivos / Pivotes
  if (/DEFENSIVE\s*MID.*LEFT/.test(pos)) return { depth: 20, lane: -1 }
  if (/DEFENSIVE\s*MID.*RIGHT/.test(pos)) return { depth: 20, lane: 1 }
  if (/DEFENSIVE\s*MID|PIVOTE/.test(pos)) return { depth: 20, lane: 0 }

  // Mediapuntas
  if (/ATTACKING\s*MID.*LEFT/.test(pos)) return { depth: 30, lane: -2 }
  if (/ATTACKING\s*MID.*RIGHT/.test(pos)) return { depth: 30, lane: 2 }
  if (/ATTACKING\s*MID|MEDIAPUNTA/.test(pos)) return { depth: 30, lane: 0 }

  // Centrocampistas e interiores
  if (/^LEFT\s*MID|INTERIOR\s*IZQ/.test(pos)) return { depth: 25, lane: -2 }
  if (/^RIGHT\s*MID|INTERIOR\s*DER/.test(pos)) return { depth: 25, lane: 2 }
  if (/CENTER\s*LEFT\s*MID/.test(pos)) return { depth: 25, lane: -1 }
  if (/CENTER\s*RIGHT\s*MID/.test(pos)) return { depth: 25, lane: 1 }
  if (/MIDFIELD|CENTROCAMPIST|MEDIO|VOLANTE/.test(pos)) return { depth: 25, lane: 0 }

  // Extremos y Delanteros
  if (/^LEFT\s*(?:FORWARD|WINGER)|EXTREMO\s*IZQ/.test(pos)) return { depth: 35, lane: -2 }
  if (/^RIGHT\s*(?:FORWARD|WINGER)|EXTREMO\s*DER/.test(pos)) return { depth: 35, lane: 2 }
  if (/CENTER\s*LEFT\s*FORWARD/.test(pos)) return { depth: 35, lane: -1 }
  if (/CENTER\s*RIGHT\s*FORWARD/.test(pos)) return { depth: 35, lane: 1 }
  if (/SECOND\s*STRIKER/.test(pos)) return { depth: 35, lane: 0 }
  if (/FORWARD|STRIKER|DELANTER|WINGER?|EXTREM|PUNTA|ARIETE|ATTACK/.test(pos)) {
    return { depth: 40, lane: 0 }
  }

  return { depth: 25, lane: 0 }
}

/**
 * Deducir una formación estándar (ej. "4-3-3") a partir de los códigos de posición de los 11 titulares
 * cuando la API no proporciona la formación explícita.
 */
export function inferFormationFromStarters(starters: Player[]): string {
  let def = 0
  let mid = 0
  let fwd = 0

  for (const p of starters) {
    const code = translatePosition(p.position).code
    if (code === 'DEF') def++
    else if (code === 'MED') mid++
    else if (code === 'DEL') fwd++
  }

  // Si la suma de jugadores de campo es 10 (o cercana a 10), generamos la cadena táctica
  if (def + mid + fwd >= 8) {
    // Si falta alguno para llegar a 10, ajustamos a la línea más probable
    const remaining = 10 - (def + mid + fwd)
    if (remaining > 0) mid += remaining
    return `${def}-${mid}-${fwd}`
  }

  return '4-3-3' // Formación por defecto
}

/**
 * Parsea una formación táctica y asigna coordenadas (x, y) relativas en el terreno de juego
 * a cada uno de los 11 titulares, respetando profundidad vertical y carril horizontal.
 */
export function buildTacticalFormation(
  starters: Player[],
  rawFormation?: string,
): TacticalFormation | null {
  if (starters.length === 0) return null

  // 1. Resolver y validar la formación táctica
  let formation = rawFormation?.trim()
  if (!formation || !/^\d+(?:-\d+)+$/.test(formation)) {
    formation = inferFormationFromStarters(starters)
  }

  const lineCounts = formation.split('-').map(Number).filter((n) => n > 0)
  const totalOutfield = lineCounts.reduce((acc, c) => acc + c, 0)

  // 2. Separar al portero de los jugadores de campo con índice original estable
  const indexed = starters.map((player, origIdx) => ({
    player,
    origIdx,
    ...getTacticalDepthAndLane(player.position),
  }))

  const gkIndex = indexed.findIndex((item) => translatePosition(item.player.position).code === 'POR')
  const goalkeeper = (gkIndex >= 0 ? indexed.splice(gkIndex, 1)[0] : indexed.shift()!).player

  // Ordenar jugadores de campo por profundidad vertical ascendente (desempate por orden original)
  indexed.sort((a, b) => a.depth - b.depth || a.origIdx - b.origIdx)

  // Si el desglose de líneas no suma exactamente los jugadores de campo restantes, ajustamos
  if (totalOutfield !== indexed.length) {
    formation = inferFormationFromStarters([goalkeeper, ...indexed.map((i) => i.player)])
  }

  const finalLineCounts = formation.split('-').map(Number)

  // 3. Agrupar los jugadores en líneas según la formación y ordenar cada línea por carril horizontal (izq -> der)
  const playerLines: Player[][] = []
  let offset = 0
  for (const count of finalLineCounts) {
    const chunk = indexed.slice(offset, offset + count)
    if (chunk.length > 0) {
      chunk.sort((a, b) => a.lane - b.lane || a.origIdx - b.origIdx)
      playerLines.push(chunk.map((c) => c.player))
    }
    offset += count
  }
  // Si sobró algún jugador no contemplado en la formación, se añade a la última línea
  if (offset < indexed.length) {
    const remainder = indexed
      .slice(offset)
      .sort((a, b) => a.lane - b.lane || a.origIdx - b.origIdx)
      .map((c) => c.player)
    if (playerLines.length > 0) {
      playerLines[playerLines.length - 1].push(...remainder)
    } else {
      playerLines.push(remainder)
    }
  }

  // 4. Calcular coordenadas (X, Y) para el campo
  // El portero está en la portería inferior (Y ~ 88%).
  // Las líneas de campo van subiendo hacia la portería rival (Y ~ 70% defensa, ~50% medios, ~22% delanteros).
  const numOutfieldLines = playerLines.length
  const lines: PositionedPlayer[][] = []
  const allPlayers: PositionedPlayer[] = []

  // Línea 0: Portero
  const gkPositioned: PositionedPlayer = {
    player: goalkeeper,
    x: 50,
    y: 88,
    lineIndex: 0,
  }
  lines.push([gkPositioned])
  allPlayers.push(gkPositioned)

  // Líneas de campo (1 a N)
  // Espaciado vertical progresivo de abajo (defensa) hacia arriba (delantera)
  const yStart = 72 // Línea defensiva (cerca de la portería propia)
  const yEnd = 20 // Línea delantera (cerca de la portería rival)

  for (let lIdx = 0; lIdx < numOutfieldLines; lIdx++) {
    const linePlayers = playerLines[lIdx]
    const lineCount = linePlayers.length
    if (lineCount === 0) continue

    // Progresión Y suave
    const yFraction = numOutfieldLines > 1 ? lIdx / (numOutfieldLines - 1) : 0.5
    const y = yStart - yFraction * (yStart - yEnd)

    const linePositioned: PositionedPlayer[] = []
    for (let pIdx = 0; pIdx < lineCount; pIdx++) {
      // Distribución horizontal X centrada
      // Para N jugadores, posiciones en (i + 1) / (N + 1) * 100
      const x = ((pIdx + 1) / (lineCount + 1)) * 100

      const positioned: PositionedPlayer = {
        player: linePlayers[pIdx],
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        lineIndex: lIdx + 1,
      }
      linePositioned.push(positioned)
      allPlayers.push(positioned)
    }
    lines.push(linePositioned)
  }

  return {
    formation,
    lines,
    allPlayers,
  }
}

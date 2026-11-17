import { describe, expect, it } from 'vitest'
import {
  buildTacticalFormation,
  formatPitchPlayerName,
  inferFormationFromStarters,
} from '../src/lib/formationLayout'
import type { Player } from '../src/types'

describe('formationLayout', () => {
  it('formatea nombres cortos legibles para el campo', () => {
    expect(formatPitchPlayerName('Pedri')).toBe('Pedri')
    expect(formatPitchPlayerName('Thibaut Courtois')).toBe('Courtois')
    expect(formatPitchPlayerName('Vinícius Júnior')).toBe('Vinícius Jr.')
    expect(formatPitchPlayerName('Kylian Mbappé')).toBe('Mbappé')
    expect(formatPitchPlayerName('Lamine Yamal')).toBe('Lamine Yamal')
    expect(formatPitchPlayerName('Nico Williams')).toBe('Nico Williams')
    expect(formatPitchPlayerName('J. Martínez')).toBe('J. Martínez')
  })

  it('deduce formaciones estándar cuando no vienen explícitas', () => {
    const players: Player[] = [
      { id: '1', name: 'Portero', position: 'POR', starter: true },
      { id: '2', name: 'Def 1', position: 'DEF', starter: true },
      { id: '3', name: 'Def 2', position: 'DEF', starter: true },
      { id: '4', name: 'Def 3', position: 'DEF', starter: true },
      { id: '5', name: 'Def 4', position: 'DEF', starter: true },
      { id: '6', name: 'Med 1', position: 'MED', starter: true },
      { id: '7', name: 'Med 2', position: 'MED', starter: true },
      { id: '8', name: 'Med 3', position: 'MED', starter: true },
      { id: '9', name: 'Del 1', position: 'DEL', starter: true },
      { id: '10', name: 'Del 2', position: 'DEL', starter: true },
      { id: '11', name: 'Del 3', position: 'DEL', starter: true },
    ]

    expect(inferFormationFromStarters(players)).toBe('4-3-3')
  })

  it('distribuye un 4-3-3 en 4 líneas con coordenadas simétricas', () => {
    const starters: Player[] = [
      { id: '1', name: 'Courtois', position: 'G', starter: true },
      { id: '2', name: 'Carvajal', position: 'D', starter: true },
      { id: '3', name: 'Militão', position: 'D', starter: true },
      { id: '4', name: 'Rüdiger', position: 'D', starter: true },
      { id: '5', name: 'Mendy', position: 'D', starter: true },
      { id: '6', name: 'Valverde', position: 'M', starter: true },
      { id: '7', name: 'Tchouaméni', position: 'M', starter: true },
      { id: '8', name: 'Bellingham', position: 'M', starter: true },
      { id: '9', name: 'Rodrygo', position: 'F', starter: true },
      { id: '10', name: 'Mbappé', position: 'F', starter: true },
      { id: '11', name: 'Vinícius Jr.', position: 'F', starter: true },
    ]

    const tactical = buildTacticalFormation(starters, '4-3-3')
    expect(tactical).not.toBeNull()
    expect(tactical?.formation).toBe('4-3-3')
    expect(tactical?.lines).toHaveLength(4) // GK + Def + Mid + Att
    expect(tactical?.allPlayers).toHaveLength(11)

    // Línea 0 (Portero): centrado en x=50, y=88
    const gk = tactical!.lines[0][0]
    expect(gk.player.name).toBe('Courtois')
    expect(gk.x).toBe(50)
    expect(gk.y).toBe(88)

    // Línea 1 (4 defensas): y=72, x distribuidos simétricamente
    const defs = tactical!.lines[1]
    expect(defs).toHaveLength(4)
    expect(defs[0].x).toBe(20)
    expect(defs[1].x).toBe(40)
    expect(defs[2].x).toBe(60)
    expect(defs[3].x).toBe(80)
    expect(defs[0].y).toBe(72)

    // Línea 3 (3 delanteros): y=20, x distribuidos en 25, 50, 75
    const atts = tactical!.lines[3]
    expect(atts).toHaveLength(3)
    expect(atts[0].x).toBe(25)
    expect(atts[1].x).toBe(50)
    expect(atts[2].x).toBe(75)
    expect(atts[0].y).toBe(20)
  })

  it('distribuye formaciones con 4 líneas de campo como 4-2-3-1', () => {
    const starters: Player[] = [
      { id: '1', name: 'Portero', position: 'POR', starter: true },
      { id: '2', name: 'Def 1', position: 'DEF', starter: true },
      { id: '3', name: 'Def 2', position: 'DEF', starter: true },
      { id: '4', name: 'Def 3', position: 'DEF', starter: true },
      { id: '5', name: 'Def 4', position: 'DEF', starter: true },
      { id: '6', name: 'Pivote 1', position: 'MED', starter: true },
      { id: '7', name: 'Pivote 2', position: 'MED', starter: true },
      { id: '8', name: 'Extremo D', position: 'DEL', starter: true },
      { id: '9', name: 'Mediapunta', position: 'MED', starter: true },
      { id: '10', name: 'Extremo I', position: 'DEL', starter: true },
      { id: '11', name: 'Delantero', position: 'DEL', starter: true },
    ]

    const tactical = buildTacticalFormation(starters, '4-2-3-1')
    expect(tactical).not.toBeNull()
    expect(tactical?.lines).toHaveLength(5) // GK + 4 + 2 + 3 + 1
    expect(tactical?.lines[1]).toHaveLength(4) // 4 defensas
    expect(tactical?.lines[2]).toHaveLength(2) // 2 pivotes
    expect(tactical?.lines[3]).toHaveLength(3) // 3 mediapuntas
    expect(tactical?.lines[4]).toHaveLength(1) // 1 delantero centro
    expect(tactical?.lines[4][0].x).toBe(50) // Delantero centro centrado
  })

  it('ordena extremos y delantero centro de izquierda a derecha en 4-3-3 aunque lleguen desordenados', () => {
    const starters: Player[] = [
      { id: '1', name: 'Sergio Herrera', position: 'G', starter: true },
      { id: '2', name: 'Jesús Areso', position: 'RB', starter: true },
      { id: '3', name: 'Juan Cruz', position: 'LB', starter: true },
      { id: '4', name: 'Lucas Torró', position: 'CM', starter: true },
      { id: '5', name: 'Alejandro Catena', position: 'CD-R', starter: true },
      { id: '6', name: 'Enzo Boyomo', position: 'CD-L', starter: true },
      { id: '7', name: 'Jon Moncayola', position: 'RM', starter: true },
      { id: '8', name: 'Aimar Oroz', position: 'LM', starter: true },
      { id: '9', name: 'Ante Budimir', position: 'F', starter: true },
      { id: '10', name: 'Rubén Peña', position: 'RF', starter: true },
      { id: '11', name: 'Bryan Zaragoza', position: 'LF', starter: true },
    ]

    const tactical = buildTacticalFormation(starters, '4-3-3')!
    // Defensa de izq a der: LB -> CD-L -> CD-R -> RB
    expect(tactical.lines[1].map((p) => p.player.name)).toEqual([
      'Juan Cruz',
      'Enzo Boyomo',
      'Alejandro Catena',
      'Jesús Areso',
    ])
    // Medio de izq a der: LM -> CM -> RM
    expect(tactical.lines[2].map((p) => p.player.name)).toEqual([
      'Aimar Oroz',
      'Lucas Torró',
      'Jon Moncayola',
    ])
    // Delantera de izq a der: LF (x=25) -> F (x=50) -> RF (x=75)
    expect(tactical.lines[3].map((p) => p.player.name)).toEqual([
      'Bryan Zaragoza',
      'Ante Budimir',
      'Rubén Peña',
    ])
    expect(tactical.lines[3].map((p) => p.x)).toEqual([25, 50, 75])
  })

  it('ubica cada demarcación en su línea y banda exacta en un 4-2-3-1 real (ESPN)', () => {
    const starters: Player[] = [
      { id: '1', name: 'Iñaki Peña', position: 'G', starter: true },
      { id: '2', name: 'Jules Koundé', position: 'RB', starter: true },
      { id: '3', name: 'Alejandro Balde', position: 'LB', starter: true },
      { id: '4', name: 'Pedri', position: 'LM', starter: true },
      { id: '5', name: 'Pau Cubarsí', position: 'CD-R', starter: true },
      { id: '6', name: 'Iñigo Martínez', position: 'CD-L', starter: true },
      { id: '7', name: 'Lamine Yamal', position: 'AM-R', starter: true },
      { id: '8', name: 'Marc Casadó', position: 'RM', starter: true },
      { id: '9', name: 'Robert Lewandowski', position: 'F', starter: true },
      { id: '10', name: 'Fermín López', position: 'AM', starter: true },
      { id: '11', name: 'Raphinha', position: 'AM-L', starter: true },
    ]

    const tactical = buildTacticalFormation(starters, '4-2-3-1')!
    expect(tactical.lines).toHaveLength(5)
    expect(tactical.lines[1].map((p) => p.player.name)).toEqual([
      'Alejandro Balde',
      'Iñigo Martínez',
      'Pau Cubarsí',
      'Jules Koundé',
    ])
    expect(tactical.lines[2].map((p) => p.player.name)).toEqual(['Pedri', 'Marc Casadó'])
    expect(tactical.lines[3].map((p) => p.player.name)).toEqual([
      'Raphinha',
      'Fermín López',
      'Lamine Yamal',
    ])
    expect(tactical.lines[4].map((p) => p.player.name)).toEqual(['Robert Lewandowski'])
  })

  it('reconoce CF-L y CF-R como delanteros y los ordena de izquierda a derecha en 4-4-2', () => {
    const starters: Player[] = [
      { id: '1', name: 'Jan Oblak', position: 'G', starter: true },
      { id: '2', name: 'Nahuel Molina', position: 'RB', starter: true },
      { id: '3', name: 'Reinildo', position: 'LB', starter: true },
      { id: '4', name: 'Koke', position: 'CM-R', starter: true },
      { id: '5', name: 'Axel Witsel', position: 'CD-R', starter: true },
      { id: '6', name: 'Giménez', position: 'CD-L', starter: true },
      { id: '7', name: 'De Paul', position: 'RM', starter: true },
      { id: '8', name: 'Gallagher', position: 'CM-L', starter: true },
      { id: '9', name: 'Griezmann', position: 'CF-R', starter: true },
      { id: '10', name: 'Julián Álvarez', position: 'CF-L', starter: true },
      { id: '11', name: 'Samuel Lino', position: 'LM', starter: true },
    ]

    const tactical = buildTacticalFormation(starters, '4-4-2')!
    expect(tactical.lines[2].map((p) => p.player.name)).toEqual([
      'Samuel Lino',
      'Gallagher',
      'Koke',
      'De Paul',
    ])
    expect(tactical.lines[3].map((p) => p.player.name)).toEqual(['Julián Álvarez', 'Griezmann'])
  })
})

import { describe, expect, it } from 'vitest'
import { getUrlForStack, type NavEntry } from '@/features/navigation/navigationUrls'
import { nameSimilarEnough } from '@/services/real/players'
import type { Match, Team } from '@/types'

describe('getUrlForStack', () => {
  const dummyTeam: Team = { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' }
  const dummyMatch: Match = {
    id: '12345',
    leagueId: 'esp.1',
    homeTeam: dummyTeam,
    awayTeam: { id: 'espn-83', name: 'Barcelona', shortName: 'BAR' },
    status: 'scheduled',
    kickoff: '2026-11-21T20:00:00Z',
    score: null,
  }

  it('devuelve "/" para pila vacía (pantalla principal)', () => {
    expect(getUrlForStack([])).toBe('/')
  })

  it('genera URL con parámetro "?match=..." para partido', () => {
    const stack: NavEntry[] = [{ type: 'match', match: dummyMatch }]
    expect(getUrlForStack(stack)).toBe('/?match=12345')
  })

  it('genera URL con parámetros "?team=...&league=..." para club', () => {
    const stack: NavEntry[] = [
      { type: 'team', teamRef: { team: dummyTeam, leagueId: 'esp.1' } },
    ]
    expect(getUrlForStack(stack)).toBe('/?team=espn-86&league=esp.1')
  })

  it('genera URL para jugador', () => {
    const stack: NavEntry[] = [
      {
        type: 'player',
        playerRef: {
          player: { id: '', name: 'Luka Modric', starter: true },
          team: dummyTeam,
        },
      },
    ]
    expect(getUrlForStack(stack)).toBe('/?player=Luka+Modric&team=espn-86')
  })

  it('genera URL para clasificación de liga', () => {
    const stack: NavEntry[] = [{ type: 'league', leagueId: 'esp.1' }]
    expect(getUrlForStack(stack)).toBe('/?league=esp.1')
  })

  it('refleja siempre la vista superior en la URL', () => {
    const stack: NavEntry[] = [
      { type: 'match', match: dummyMatch },
      { type: 'team', teamRef: { team: dummyTeam } },
    ]
    // La vista superior es el equipo
    expect(getUrlForStack(stack)).toBe('/?team=espn-86')
  })
})

describe('nameSimilarEnough (validación de nombres de jugador)', () => {
  it('reconoce el mismo nombre con o sin tildes', () => {
    expect(nameSimilarEnough('Kylian Mbappé', 'Kylian Mbappe')).toBe(true)
    expect(nameSimilarEnough('Luka Modrić', 'Luka Modric')).toBe(true)
  })

  it('permite coincidencias con nombre corto vs completo', () => {
    expect(nameSimilarEnough('Aspas', 'Iago Aspas')).toBe(true)
    expect(nameSimilarEnough('Iago Aspas Juncal', 'Iago Aspas')).toBe(true)
    expect(nameSimilarEnough('Vinícius Jr.', 'Vinícius Júnior')).toBe(true)
  })

  it('rechaza jugadores distintos con nombres que no coinciden', () => {
    // Caso típico de bug: buscar un canterano o jugador de 1ª RFEF y que ESPN devuelva una estrella mundial
    expect(nameSimilarEnough('Alberto Gómez', 'Mario Gómez')).toBe(false)
    expect(nameSimilarEnough('Carlos Fernández', 'Enzo Fernández')).toBe(false)
    expect(nameSimilarEnough('Mikel San José', 'José San Román')).toBe(false)
    expect(nameSimilarEnough('Javi Pérez', 'Pérez')).toBe(true) // token coincidente
    expect(nameSimilarEnough('Asier Córdoba', 'Iñigo Córdoba')).toBe(false)
  })

  it('ignora mayúsculas y caracteres especiales', () => {
    expect(nameSimilarEnough('KEVIN DE BRUYNE', 'Kevin De Bruyne')).toBe(true)
    expect(nameSimilarEnough('Marc-André ter Stegen', 'Marc-Andre ter Stegen')).toBe(true)
  })
})

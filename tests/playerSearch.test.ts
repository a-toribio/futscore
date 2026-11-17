import { describe, expect, it } from 'vitest'
import { registerDynamicPlayers, searchPlayers } from '@/services/real/playerIndex'
import { getPlayerPhotoSync, normalizePlayerKey } from '@/services/real/playerPhotos'
import type { Team } from '@/types'

describe('Player Photos Service', () => {
  it('normalizes player keys cleanly without accents or spaces', () => {
    expect(normalizePlayerKey('Kylian Mbappé')).toBe('kylianmbappe')
    expect(normalizePlayerKey('Vinícius Júnior')).toBe('viniciusjunior')
    expect(normalizePlayerKey('Lamine Yamal')).toBe('lamineyamal')
    expect(normalizePlayerKey('Alexander Sørloth')).toBe('alexandersorloth')
  })

  it('retrieves instant verified photos for top stars synchronously', () => {
    expect(getPlayerPhotoSync('Kylian Mbappé')).toMatch(/\.(?:png|jpg)/)
    expect(getPlayerPhotoSync('Lamine Yamal')).toMatch(/\.(?:png|jpg)/)
    expect(getPlayerPhotoSync('Pedri')).toMatch(/\.(?:png|jpg)/)
    expect(getPlayerPhotoSync('Erling Haaland')).toMatch(/\.(?:png|jpg)/)
  })

  it('returns undefined for unknown empty names without throwing', () => {
    expect(getPlayerPhotoSync('')).toBeUndefined()
    expect(getPlayerPhotoSync(undefined)).toBeUndefined()
  })
})

describe('Player Index & Search', () => {
  it('does not return players when searching for a club name', () => {
    const playersForClub = searchPlayers('Real Madrid')
    expect(playersForClub.length).toBe(0)
  })

  it('finds top players by first name, last name or accent-insensitive token', () => {
    const mbappe = searchPlayers('mbappe')
    expect(mbappe.length).toBeGreaterThan(0)
    expect(mbappe[0].name).toBe('Kylian Mbappé')
    expect(mbappe[0].kind).toBe('player')

    const lamine = searchPlayers('lamine')
    expect(lamine.length).toBeGreaterThan(0)
    expect(lamine[0].name).toBe('Lamine Yamal')

    const vini = searchPlayers('vinicius')
    expect(vini.length).toBeGreaterThan(0)
    expect(vini[0].name).toBe('Vinícius Júnior')

    const aspas = searchPlayers('aspas')
    expect(aspas.length).toBeGreaterThan(0)
    expect(aspas[0].name).toBe('Iago Aspas')
  })

  it('registers dynamic players from squads into the search index', () => {
    const testTeam: Team = { id: 'test-1', name: 'Real Zaragoza', shortName: 'ZAR' }
    registerDynamicPlayers(
      [
        { id: 'zar-1', name: 'Mario Soberón', jersey: '9', position: 'Delantero', starter: true },
        { id: 'zar-2', name: 'Gaëtan Poussin', jersey: '1', position: 'Portero', starter: true },
      ],
      testTeam,
      'esp.2',
    )

    const soberon = searchPlayers('soberon')
    expect(soberon.length).toBeGreaterThan(0)
    expect(soberon[0].name).toBe('Mario Soberón')
    expect(soberon[0].subtitle).toContain('Real Zaragoza')

    const poussin = searchPlayers('poussin')
    expect(poussin.length).toBeGreaterThan(0)
    expect(poussin[0].name).toBe('Gaëtan Poussin')
  })
})

import { describe, expect, it } from 'vitest'
import {
  cleanChannelName,
  findMatchInTvSchedule,
  isSpanishNetwork,
  parseFutbolEnLaTvHtml,
  resolveSpanishBroadcasters,
} from '@/lib/broadcasters'

describe('broadcasters', () => {
  it('detecta canales españoles correctamente', () => {
    expect(isSpanishNetwork('Movistar LALIGA TV')).toBe(true)
    expect(isSpanishNetwork('M+ LALIGA (M54 O110)')).toBe(true)
    expect(isSpanishNetwork('DAZN 1')).toBe(true)
    expect(isSpanishNetwork('Gol Play')).toBe(true)
    expect(isSpanishNetwork('RTVE La 1')).toBe(true)
    expect(isSpanishNetwork('ESPN+')).toBe(false)
    expect(isSpanishNetwork('Peacock')).toBe(false)
    expect(isSpanishNetwork(undefined)).toBe(false)
  })

  it('limpia sufijos promocionales de los canales de la guía', () => {
    expect(cleanChannelName('Movistar Plus+ (M8): VER PARTIDO')).toBe('Movistar Plus+ (M8)')
    expect(cleanChannelName('DAZN (Ver en directo)')).toBe('DAZN')
  })

  it('parsea HTML de futbolenlatv.es y encuentra el canal exacto de cada partido', () => {
    const sampleHtml = `
      <table>
        <tr>
          <td class="local">Real Madrid</td>
          <td class="visitante">Celta</td>
          <td class="canales">
            <ul>
              <li>M+ LALIGA (M54 O110)</li>
              <li>Movistar Plus+ (M8): VER PARTIDO</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td class="local">FC Barcelona</td>
          <td class="visitante">Villarreal</td>
          <td class="canales">
            <ul>
              <li>DAZN LaLiga (M55 O113)</li>
              <li>DAZN (Ver en directo)</li>
            </ul>
          </td>
        </tr>
        <tr>
          <td class="local">CD Pamplona</td>
          <td class="visitante">Eibar</td>
          <td class="canales">
            <ul>
              <li>* SIN TV EN DIRECTO *</li>
            </ul>
          </td>
        </tr>
      </table>
    `
    const schedule = parseFutbolEnLaTvHtml(sampleHtml)
    expect(schedule).toHaveLength(3)

    const madridMatch = findMatchInTvSchedule('Real Madrid', 'Celta Vigo', schedule)
    expect(madridMatch?.map((c) => c.channel)).toEqual([
      'M+ LALIGA (M54 O110)',
      'Movistar Plus+ (M8)',
    ])

    const barcaMatch = findMatchInTvSchedule('Barcelona', 'Villarreal', schedule)
    expect(barcaMatch?.map((c) => c.channel)).toEqual([
      'DAZN LaLiga (M55 O113)',
      'DAZN',
    ])

    const noTvMatch = findMatchInTvSchedule('CD Pamplona', 'SD Eibar', schedule)
    expect(noTvMatch?.[0].noTv).toBe(true)
  })

  it('asigna un operador específico por partido en LaLiga sin mezclar Movistar y DAZN a la vez', () => {
    const matchA = {
      id: 'espn-401882814',
      homeTeam: { id: '1', name: 'Elche', shortName: 'ELC' },
      awayTeam: { id: '2', name: 'Real Betis', shortName: 'BET' },
      kickoff: '2026-11-08T20:00:00Z',
    }
    const list = resolveSpanishBroadcasters('laliga', undefined, matchA)
    const channels = list.map((b) => b.channel)
    const hasMovistar = channels.some((c) => c.includes('M+ LALIGA'))
    const hasDazn = channels.some((c) => c.includes('DAZN'))
    expect(hasMovistar !== hasDazn).toBe(true)
  })

  it('resuelve operadores de Champions y Premier', () => {
    expect(resolveSpanishBroadcasters('ucl')[0].channel).toBe('M+ Liga de Campeones (M60 O115)')
    expect(resolveSpanishBroadcasters('premier')[0].channel).toBe('DAZN')
  })

  it('respeta la señal si ya es un operador español', () => {
    const custom = resolveSpanishBroadcasters('laliga', 'DAZN LaLiga')
    expect(custom).toHaveLength(1)
    expect(custom[0].channel).toBe('DAZN LaLiga')
  })
})

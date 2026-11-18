import { describe, expect, it } from 'vitest'
import { getRfefMatchDetail, parseFutbolmeTournamentHtml, RFEF_GROUPS_BY_LEAGUE } from '@/services/real/rfef'
import { fetchRfefExtraDetail, parseBetsapiCards, parseBetsapiStats } from '@/services/real/futbolmeApi'
import type { Match } from '@/types'

const SAMPLE = {"results":[{"has_lineup":0,"events":[{"id":"327475845","text":"33\u0027 ~ 1st Red Card ~  ~(Ponferradina)"},{"id":"327478104","text":"44\u0027 ~ 1st Yellow Card ~  ~(Ponferradina)"},{"id":"327483337","text":"54\u0027 ~ 2nd Red Card ~  ~(Ponferradina)"},{"id":"327484610","text":"60\u0027 - 1st Goal -   (Ponferradina) -"},{"id":"327487457","text":"76\u0027 - 2nd Goal -   (Cacereno) -"},{"id":"327488497","text":"81\u0027 - 3rd Goal -   (Cacereno) -"},{"id":"327490050","text":"89\u0027 ~ 2nd Yellow Card ~  ~(Ponferradina)"},{"id":"327490503","text":"90+1\u0027 ~ 3rd Yellow Card ~  ~(Cacereno)"}],"away":{"name":"CP Cacereño"},"home":{"name":"Ponferradina"},"stats":{"attacks":["99","117"],"ball_safe":["87","86"],"corners":["5","9"],"corner_f":["5","9"],"corner_h":["4","1"],"dangerous_attacks":["47","76"],"fouls":["13","7"],"goalattempts":["7","11"],"goals":["1","2"],"injuries":["0","0"],"offsides":["3","0"],"off_target":["9","10"],"on_target":["2","4"],"penalties":["0","0"],"possession_rt":["50","50"],"redcards":["2","0"],"saves":["2","0"],"shots_blocked":["3","3"],"substitutions":["5","5"],"yellowcards":["2","1"],"yellowred_cards":["0","0"]},"extra":{"home_pos":"11","away_pos":"10","numberofperiods":"2","periodlength":"45","stadium_data":{"id":"13234","name":"Estadio El Toralin","city":"Ponferrada","country":"Spain","capacity":"8800","googlecoords":"42.55751032773942, -6.599381804340857"},"length":90,"round":"12"}}]}

const match = {
  id: 'rfef-1',
  leagueId: 'primera_rfef',
  homeTeam: { id: 'h', name: 'SD Ponferradina', shortName: 'PON' },
  awayTeam: { id: 'a', name: 'CP Cacereño', shortName: 'CAC' },
  kickoff: '2026-11-13T18:00:00.000Z',
  status: 'finished',
  score: { home: 1, away: 2 },
} as Match

describe('detalle de partidos RFEF (futbolme)', () => {
  it('convierte tarjetas por equipo', () => {
    const cards = parseBetsapiCards(SAMPLE.results[0].events, 'Ponferradina', match)
    expect(cards.length).toBeGreaterThan(0)
    expect(cards.every((c) => c.type === 'yellow_card' || c.type === 'red_card')).toBe(true)
    expect(cards.find((c) => c.type === 'red_card')?.isHome).toBe(true)
    expect(cards.find((c) => c.minute === "90+1'")?.isHome).toBe(false)
  })

  it('convierte estadísticas con porcentaje de posesión', () => {
    const stats = parseBetsapiStats(SAMPLE.results[0].stats as Record<string, string[]>)
    const poss = stats.find((s) => s.key === 'possessionPct')
    expect(poss?.homeValue).toBe('50%')
    expect(stats.find((s) => s.key === 'wonCorners')).toMatchObject({ homeNumeric: 5, awayNumeric: 9 })
  })

  it('descarga estadio, estadísticas y tarjetas', async () => {
    const fetchFn = (async () => new Response(JSON.stringify(SAMPLE))) as typeof fetch
    const extra = await fetchRfefExtraDetail('12158004', match, fetchFn)
    expect(extra?.venue?.name).toBe('Estadio El Toralin')
    expect(extra?.stats.length).toBeGreaterThan(5)
    expect(extra?.lineups).toBeUndefined()
  })

  it('sin datos guardados devuelve el detalle base sin fallar', async () => {
    const detail = await getRfefMatchDetail(match, (async () => new Response('{}')) as typeof fetch)
    expect(detail.match.id).toBe('rfef-1')
  })

  it('el parser de torneo guarda el id de evento para pedir el detalle', async () => {
    const html = '<div class="cajaPartido" itemscope><meta itemprop="name" content="A - B"><meta itemprop="startDate" content="2026-11-13T18:00:00+00:00"><img class="span-evento-trigger" attr-id-evento="12158004"><div class="equipoPartidoLocal"><span class="d-none d-sm-block">A</span></div><div class="col-2 resultadoPartido"><span>1</span>-<span>2</span></div><div class="equipoPartidoVisitante"><span class="d-none d-sm-block">B</span></div><a href="javascript:mostrarColor(999);"></a></div>'
    const parsed = parseFutbolmeTournamentHtml(html, 'primera_rfef', RFEF_GROUPS_BY_LEAGUE.primera_rfef[0])
    const m = parsed.matches[0].match
    let called = ''
    await getRfefMatchDetail(m, (async (url: string, init?: RequestInit) => {
      called = String(init?.body)
      return new Response('{}')
    }) as unknown as typeof fetch)
    expect(called).toContain('id=12158004')
  })

  it('asigna el equipo correcto en tarjetas RFEF incluso con alias distintos o nombres parecidos', () => {
    const aliasMatch = {
      id: 'rfef-2',
      leagueId: 'primera_rfef',
      homeTeam: { id: 'rfef-ud-ourense', name: 'UD Ourense', shortName: 'UD' },
      awayTeam: { id: 'rfef-ourense-cf', name: 'Ourense CF', shortName: 'OUR' },
      kickoff: '2026-11-15T17:00:00.000Z',
      status: 'finished',
      score: { home: 1, away: 0 },
    } as Match

    const cards = parseBetsapiCards(
      [
        { id: 'c1', text: "22' ~ 1st Yellow Card ~  ~(Ourense CF)" },
        { id: 'c2', text: "55' ~ 2nd Yellow Card ~  ~(UD Ourense)" },
      ],
      'UD Ourense',
      aliasMatch,
      'Ourense CF',
    )
    expect(cards[0].isHome).toBe(false)
    expect(cards[1].isHome).toBe(true)

    const leonesaMatch = {
      id: 'rfef-3',
      leagueId: 'primera_rfef',
      homeTeam: { id: 'rfef-real-union-club', name: 'Real Unión Club', shortName: 'UNI' },
      awayTeam: { id: 'rfef-cyd-leonesa', name: 'CyD Leonesa', shortName: 'LEO' },
      kickoff: '2026-11-15T17:00:00.000Z',
      status: 'finished',
      score: { home: 1, away: 0 },
    } as Match

    const cards2 = parseBetsapiCards(
      [
        { id: 'c3', text: "16' ~ 1st Yellow Card ~  ~(Cultural Leonesa)" },
        { id: 'c4', text: "38' ~ 2nd Yellow Card ~  ~(Real Unión)" },
      ],
      'Real Unión',
      leonesaMatch,
      'Cultural Leonesa',
    )
    expect(cards2[0].isHome).toBe(false)
    expect(cards2[1].isHome).toBe(true)
  })
})
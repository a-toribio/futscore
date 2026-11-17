import { describe, expect, it } from 'vitest'
import { resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import {
  mapEspnEvent,
  mapEspnStandings,
  mapEspnSummary,
  parseEspnEventDetails,
} from '@/services/real/espn'
import { parseFutbolmeTournamentHtml, RFEF_GROUPS_BY_LEAGUE } from '@/services/real/rfef'
import { mapApiFootballFixture } from '@/services/real/apiFootball'
import { estimateLiveMinute, mapFootballDataMatch } from '@/services/real/footballData'
import { deriveShortName } from '@/services/real/createRealProvider'

const espn = (state: 'pre' | 'in' | 'post', name: string, extra: object = {}) => ({
  id: '1',
  date: '2026-11-08T13:00Z',
  status: { clock: 0, displayClock: "0'", period: 0, type: { name, state }, ...extra },
  competitions: [
    {
      competitors: [
        { homeAway: 'home', score: '2', team: { id: '10', abbreviation: 'BET', displayName: 'Real Betis', logo: 'https://x/10.png' } },
        { homeAway: 'away', score: '1', team: { id: '20', abbreviation: 'ELC', displayName: 'Elche', logo: 'https://x/20.png' } },
      ],
    },
  ],
})

describe('mapEspnEvent', () => {
  it('mapea un partido terminado', () => {
    expect(mapEspnEvent(espn('post', 'STATUS_FULL_TIME'), 'laliga')).toMatchObject({
      id: 'espn-1',
      leagueId: 'laliga',
      status: 'finished',
      score: { home: 2, away: 1 },
      kickoff: '2026-11-08T13:00:00.000Z',
      homeTeam: { name: 'Real Betis', shortName: 'BET', logoUrl: 'https://x/10.png' },
    })
  })

  it('mapea un partido programado sin marcador', () => {
    expect(mapEspnEvent(espn('pre', 'STATUS_SCHEDULED'), 'laliga')).toMatchObject({ status: 'scheduled', score: null })
  })

  it('mapea un directo con minuto y fase', () => {
    const live = mapEspnEvent(espn('in', 'STATUS_SECOND_HALF', { displayClock: "67'", clock: 4020, period: 2 }), 'laliga')
    expect(live).toMatchObject({ status: 'live', minute: 67, phase: 'second_half', score: { home: 2, away: 1 } })
  })

  it('detecta el descanso', () => {
    const ht = mapEspnEvent(espn('in', 'STATUS_HALFTIME', { displayClock: "45'", period: 1 }), 'laliga')
    expect(ht).toMatchObject({ status: 'live', phase: 'half_time', minute: 45 })
  })

  it('usa el reloj en segundos si displayClock no trae minuto', () => {
    const live = mapEspnEvent(espn('in', 'STATUS_FIRST_HALF', { displayClock: '', clock: 600, period: 1 }), 'laliga')
    expect(live).toMatchObject({ minute: 10, phase: 'first_half' })
  })

  it('descarta aplazados y eventos incompletos', () => {
    expect(mapEspnEvent(espn('post', 'STATUS_POSTPONED'), 'laliga')).toBeNull()
    expect(mapEspnEvent({ id: '9' }, 'laliga')).toBeNull()
  })
})

describe('mapApiFootballFixture', () => {
  const fixture = (short: string, elapsed: number | null = null) => ({
    fixture: { id: 77, date: '2026-11-10T20:00:00+01:00', status: { short, elapsed } },
    league: { id: 140 },
    teams: { home: { id: 541, name: 'Real Madrid', logo: 'l1' }, away: { id: 529, name: 'Barcelona', logo: 'l2' } },
    goals: { home: 1, away: 0 },
  })

  it('mapea cada estado', () => {
    expect(mapApiFootballFixture(fixture('NS'))).toMatchObject({ id: 'apif-77', leagueId: 'laliga', status: 'scheduled', score: null })
    expect(mapApiFootballFixture(fixture('FT'))).toMatchObject({ status: 'finished', score: { home: 1, away: 0 } })
    expect(mapApiFootballFixture(fixture('2H', 70))).toMatchObject({ status: 'live', phase: 'second_half', minute: 70 })
    expect(mapApiFootballFixture(fixture('HT', 45))).toMatchObject({ status: 'live', phase: 'half_time' })
  })

  it('descarta aplazados y ligas no soportadas', () => {
    expect(mapApiFootballFixture(fixture('PST'))).toBeNull()
    expect(mapApiFootballFixture({ ...fixture('NS'), league: { id: 999 } })).toBeNull()
  })
})

describe('mapFootballDataMatch', () => {
  const NOW = Date.parse('2026-11-10T20:30:00Z')
  const match = (status: string, extra: object = {}) => ({
    id: 5,
    utcDate: '2026-11-10T20:00:00Z',
    status,
    competition: { code: 'PL' },
    homeTeam: { id: 1, name: 'Arsenal FC', tla: 'ARS', crest: 'c1' },
    awayTeam: { id: 2, name: 'Chelsea FC', tla: 'CHE', crest: 'c2' },
    score: { fullTime: { home: 2, away: 2 } },
    ...extra,
  })

  it('mapea estados', () => {
    expect(mapFootballDataMatch(match('TIMED'), NOW)).toMatchObject({ id: 'fd-5', leagueId: 'premier', status: 'scheduled', score: null })
    expect(mapFootballDataMatch(match('FINISHED'), NOW)).toMatchObject({ status: 'finished', score: { home: 2, away: 2 } })
    expect(mapFootballDataMatch(match('PAUSED'), NOW)).toMatchObject({ status: 'live', phase: 'half_time' })
    expect(mapFootballDataMatch(match('POSTPONED'), NOW)).toBeNull()
  })

  it('usa el minuto de la API si existe y lo estima si no', () => {
    expect(mapFootballDataMatch(match('IN_PLAY', { minute: 33 }), NOW)).toMatchObject({ minute: 33, phase: 'first_half' })
    expect(mapFootballDataMatch(match('IN_PLAY'), NOW)).toMatchObject({ minute: 30, phase: 'first_half' })
  })

  it('estima la segunda parte descontando el descanso', () => {
    expect(estimateLiveMinute('2026-11-10T20:00:00Z', Date.parse('2026-11-10T21:05:00Z'))).toEqual({ minute: 50, phase: 'second_half' })
  })
})

describe('deriveShortName', () => {
  it('usa la palabra más larga, sin acentos', () => {
    expect(deriveShortName('Real Madrid')).toBe('MAD')
    expect(deriveShortName('Atlético de Madrid')).toBe('ATL')
  })
})

describe('parseEspnEventDetails', () => {
  it('extrae el autor del gol y la asistencia', () => {
    const text =
      'Goal! Elche 0, Real Betis 2. Marc Bartra (Real Betis) header from the centre of the box. Assisted by Dani Ceballos with a cross following a corner.'
    const res = parseEspnEventDetails(text, 'Goal')
    expect(res.type).toBe('goal')
    expect(res.player).toBe('Marc Bartra')
    expect(res.assistPlayer).toBe('Dani Ceballos')
  })

  it('extrae autor de gol sin asistencia y detecta penalti', () => {
    const text = 'Goal! Real Madrid 1, Barcelona 0. Vinícius Júnior (Real Madrid) converts the penalty.'
    const res = parseEspnEventDetails(text, 'Goal')
    expect(res.player).toBe('Vinícius Júnior')
    expect(res.assistPlayer).toBeUndefined()
    expect(res.isPenalty).toBe(true)
  })

  it('extrae jugador en tarjetas amarillas y rojas', () => {
    const yellow = parseEspnEventDetails('Federico Redondo (Elche) is shown the yellow card for a bad foul.', 'Yellow Card')
    expect(yellow.type).toBe('yellow_card')
    expect(yellow.player).toBe('Federico Redondo')

    const red = parseEspnEventDetails('Igor Thiago (Brentford) is shown the red card for violent conduct.', 'Red Card')
    expect(red.type).toBe('red_card')
    expect(red.player).toBe('Igor Thiago')
  })

  it('extrae jugador entrante y saliente en sustituciones', () => {
    const sub = parseEspnEventDetails(
      'Substitution, Real Betis. Dani Ceballos replaces Pablo Fornals.',
      'Substitution',
    )
    expect(sub.type).toBe('substitution')
    expect(sub.subIn).toBe('Dani Ceballos')
    expect(sub.subOut).toBe('Pablo Fornals')
  })
})

describe('mapEspnSummary', () => {
  const matchSample: any = {
    id: 'espn-100',
    leagueId: 'laliga',
    homeTeam: { id: 'espn-1', name: 'Real Madrid', shortName: 'RMA' },
    awayTeam: { id: 'espn-2', name: 'Barcelona', shortName: 'BAR' },
    kickoff: '2026-11-10T20:00:00Z',
    status: 'finished',
    score: { home: 2, away: 1 },
  }

  it('mapea eventos, alineaciones y datos de estadio/tv', () => {
    const raw = {
      keyEvents: [
        {
          id: 'e1',
          text: 'Gol de Vinícius Júnior',
          clock: { displayValue: "34'" },
          type: { text: 'Goal' },
          team: { id: '1' },
        },
      ],
      rosters: [
        {
          team: { id: '1', displayName: 'Real Madrid' },
          formation: '4-3-3',
          roster: [
            { starter: true, jersey: '1', athlete: { displayName: 'Courtois' }, position: { abbreviation: 'G' } },
            { starter: false, jersey: '13', athlete: { displayName: 'Lunin' }, position: { abbreviation: 'G' } },
          ],
          coach: [{ displayName: 'Carlo Ancelotti' }],
        },
      ],
      gameInfo: {
        venue: { fullName: 'Santiago Bernabéu', capacity: 81044, address: { city: 'Madrid' } },
        officials: [{ displayName: 'Gil Manzano' }],
      },
      header: {
        competitions: [
          {
            broadcast: 'Movistar Plus+',
            notes: [{ headline: 'El Clásico' }],
          },
        ],
      },
    }

    const detail = mapEspnSummary(raw, matchSample)
    expect(detail.events).toHaveLength(1)
    expect(detail.events[0]).toMatchObject({
      minute: "34'",
      type: 'goal',
      text: 'Gol de Vinícius Júnior',
      isHome: true,
    })
    expect(detail.lineups.home.formation).toBe('4-3-3')
    expect(detail.lineups.home.starters).toHaveLength(1)
    expect(detail.lineups.home.substitutes).toHaveLength(1)
    expect(detail.lineups.home.coach).toBe('Carlo Ancelotti')
    expect(detail.info.venue?.name).toBe('Santiago Bernabéu')
    expect(detail.info.venue?.city).toBe('Madrid')
    expect(detail.info.broadcast).toBe('Movistar Plus+')
    expect(detail.info.referee).toBe('Gil Manzano')
    expect(detail.info.round).toBe('El Clásico')
  })

  it('extrae árbitro desde competition officials o noticias si falta gameInfo', () => {
    const rawWithCompOfficial = {
      header: {
        competitions: [{ officials: [{ fullName: 'Sánchez Martínez' }] }],
      },
    }
    expect(mapEspnSummary(rawWithCompOfficial, matchSample).info.referee).toBe('Sánchez Martínez')

    const rawWithNews = {
      news: {
        articles: [{ description: 'Referee Michael Oliver booked two players in the first half.' }],
      },
    }
    expect(mapEspnSummary(rawWithNews, matchSample).info.referee).toBe('Michael Oliver')
  })

  it('mapea estadísticas comparativas de boxscore.teams', () => {
    const rawWithStats = {
      boxscore: {
        teams: [
          {
            team: { id: '1', displayName: 'Real Madrid' },
            statistics: [
              { name: 'possessionPct', displayValue: '58.4' },
              { name: 'totalShots', displayValue: '16' },
              { name: 'shotsOnTarget', displayValue: '7' },
            ],
          },
          {
            team: { id: '2', displayName: 'Barcelona' },
            statistics: [
              { name: 'possessionPct', displayValue: '41.6' },
              { name: 'totalShots', displayValue: '11' },
              { name: 'shotsOnTarget', displayValue: '4' },
            ],
          },
        ],
      },
    }
    const detail = mapEspnSummary(rawWithStats, matchSample)
    expect(detail.stats).toHaveLength(3)
    expect(detail.stats[0]).toMatchObject({
      key: 'possessionPct',
      label: 'Posesión',
      homeValue: '58%',
      awayValue: '42%',
      homeNumeric: 58.4,
      awayNumeric: 41.6,
    })
  })
})

describe('mapEspnStandings', () => {
  it('mapea la tabla de clasificación con zonas europeas y descenso', () => {
    const rawStandings = {
      name: 'Spanish LALIGA',
      season: { displayName: '2026-27' },
      children: [
        {
          standings: {
            entries: [
              {
                team: { id: '83', displayName: 'Barcelona', abbreviation: 'BAR', logos: [{ href: 'https://x/bar.png' }] },
                note: { description: 'UEFA Champions League' },
                stats: [
                  { name: 'rank', displayValue: '1' },
                  { name: 'gamesPlayed', displayValue: '12' },
                  { name: 'wins', displayValue: '11' },
                  { name: 'ties', displayValue: '0' },
                  { name: 'losses', displayValue: '1' },
                  { name: 'pointsFor', displayValue: '40' },
                  { name: 'pointsAgainst', displayValue: '11' },
                  { name: 'pointDifferential', displayValue: '+29' },
                  { name: 'points', displayValue: '33' },
                ],
              },
            ],
          },
        },
      ],
    }

    const result = mapEspnStandings(rawStandings, 'laliga')
    expect(result.leagueId).toBe('laliga')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0]).toMatchObject({
      rank: 1,
      played: 12,
      wins: 11,
      draws: 0,
      losses: 1,
      goalsFor: 40,
      goalsAgainst: 11,
      goalDiff: '+29',
      points: 33,
      zone: 'champions',
    })
  })

  it('asigna las zonas europeas estrictamente por posición y orden de puntos, ignorando notas erróneas en mitad de tabla', () => {
    const entries = Array.from({ length: 20 }, (_, i) => ({
      team: { id: String(i + 1), displayName: `Equipo ${i + 1}` },
      // Simulamos nota errónea de ESPN en el puesto 10
      note: i === 9 ? { description: 'Europa League' } : undefined,
      stats: [
        { name: 'rank', displayValue: String(i + 1) },
        { name: 'points', displayValue: String(60 - i * 2) },
        { name: 'pointDifferential', displayValue: String(20 - i) },
      ],
    }))

    const result = mapEspnStandings({ children: [{ standings: { entries } }] }, 'laliga')
    expect(result.rows[0].zone).toBe('champions')
    expect(result.rows[3].zone).toBe('champions')
    expect(result.rows[4].zone).toBe('europa')
    expect(result.rows[5].zone).toBe('conference')
    expect(result.rows[6].zone).toBe('none')
    expect(result.rows[9].zone).toBe('none') // El 10º nunca lleva recuadro europeo
    expect(result.rows[17].zone).toBe('relegation')
    expect(result.rows[19].zone).toBe('relegation')
  })

  it('clasifica correctamente 2ª División (LaLiga Hypermotion) con ascenso directo, playoffs y descenso', () => {
    const entries = Array.from({ length: 22 }, (_, i) => ({
      team: { id: String(i + 1), displayName: `Club Segunda ${i + 1}` },
      stats: [
        { name: 'rank', displayValue: String(i + 1) },
        { name: 'points', displayValue: String(70 - i * 2) },
        { name: 'pointDifferential', displayValue: String(25 - i) },
      ],
    }))

    const result = mapEspnStandings({ children: [{ standings: { entries } }] }, 'segunda')
    expect(result.rows[0].zone).toBe('promotion')
    expect(result.rows[1].zone).toBe('promotion')
    expect(result.rows[2].zone).toBe('europa')
    expect(result.rows[5].zone).toBe('europa')
    expect(result.rows[6].zone).toBe('none')
    expect(result.rows[18].zone).toBe('relegation')
    expect(result.rows[21].zone).toBe('relegation')
  })
})

describe('resolveSpanishTeamCrest y escudos reales en Copa del Rey / RFEF', () => {
  it('asigna el escudo real oficial a equipos humildes de Copa del Rey sin logo en ESPN', () => {
    expect(resolveSpanishTeamCrest('Anaitasuna')).toBe('https://futbolme.com/static/img/club/escudo1929.png')
    expect(resolveSpanishTeamCrest('CD Pamplona')).toBe('https://futbolme.com/static/img/club/escudo4155.png')
    expect(resolveSpanishTeamCrest('Mijas Las Lagunas')).toBe('https://futbolme.com/static/img/club/escudo12935.png')
    expect(resolveSpanishTeamCrest('Trival Valderas')).toBe('https://futbolme.com/static/img/club/escudo4165.png')
    expect(resolveSpanishTeamCrest('Tavernes de la Valldigna')).toBe('https://futbolme.com/static/img/club/escudo3972.png')
    expect(resolveSpanishTeamCrest('Gimnástica Torrelavega')).toBe('https://futbolme.com/static/img/club/escudo4558.png')
    expect(resolveSpanishTeamCrest('San Sebastián de los Reyes')).toBe('https://futbolme.com/static/img/club/escudo4543.png')
    expect(resolveSpanishTeamCrest('CD Artistico Navalcarnero')).toBe('https://futbolme.com/static/img/club/escudo4107.png')

    const copaEvent = {
      id: '999',
      date: '2026-11-10T18:00Z',
      status: { type: { name: 'STATUS_FULL_TIME', state: 'post' as const } },
      competitions: [
        {
          competitors: [
            { homeAway: 'home' as const, score: '0', team: { id: '9001', displayName: 'Anaitasuna' } },
            { homeAway: 'away' as const, score: '1', team: { id: '96', displayName: 'Alavés', logo: 'https://a.espncdn.com/alaves.png' } },
          ],
        },
      ],
    }
    const mapped = mapEspnEvent(copaEvent, 'copadelrey')
    expect(mapped?.homeTeam.logoUrl).toBe('https://futbolme.com/static/img/club/escudo1929.png')
    expect(mapped?.awayTeam.logoUrl).toBe('https://a.espncdn.com/alaves.png')
  })
})

describe('parseFutbolmeTournamentHtml (1ª RFEF, 2ª RFEF, 3ª RFEF)', () => {
  it('extrae clasificación real, escudos reales, partidos, estadio y goleadores', () => {
    const sampleHtml = `
      <table>
        <tr data-bk="white" class="fila-par">
          <td class="text-left celda-posicion">1</td>
          <td>
            <img src="/static/img/club/escudo4484.png" itemprop="logo" alt="escudo CD Lugo">
            <strong itemprop="name">
              <span class="d-inline-block d-sm-none">Lugo</span>
              <span class="d-none d-sm-inline-block">CD Lugo</span>
            </strong>
          </td>
          <td class="text-center"><b>28</b></td>
          <td class="text-center">11</td>
          <td class="text-center">9</td>
          <td class="text-center">1</td>
          <td class="text-center">1</td>
          <td class="text-center">19</td>
          <td class="text-center">9</td>
          <td class="text-center">10</td>
        </tr>
      </table>
      <a href="/resultados-directo/torneo/primera-federacion-grupo-1/3055/jornada/10">J10</a>
      <a href="/resultados-directo/torneo/primera-federacion-grupo-1/3055/jornada/11">J11</a>
      <a href="/resultados-directo/torneo/primera-federacion-grupo-1/3055/jornada/12">J12</a>
      <div class="cajaPartido" itemscope itemtype="http://schema.org/SportsEvent">
        <meta itemprop="name" content="CP Cacereño - CD Lugo">
        <span itemprop="location" itemscope itemtype="http://schema.org/Place">
          <meta itemprop="name" content="Príncipe Felipe">
          <meta itemprop="address" content="Cáceres">
        </span>
        <meta itemprop="startDate" content="2026-11-06T18:00:00+00:00">
        <a href="javascript:mostrarColor(1336237);">+</a>
        <div class="col-5 equipoPartido equipoPartidoLocal">
          <span class="d-none d-sm-block">CP Cacereño</span>
        </div>
        <div class="col-2 resultadoPartido">
          <span>0</span> - <span>1</span>
        </div>
        <div class="col-5 equipoPartido equipoPartidoVisitante">
          <span class="d-none d-sm-block">CD Lugo</span>
        </div>
        <div class="row observacionesGoles">
          <div class="col-6 nopadding"><p><i></i></p></div>
          <div class="col-6 nopadding"><p><i>0-<b>1</b>, <a href="/jugador.php?id=62981">Morchiladze</a> - 17´<br /></i></p></div>
        </div>
      </div>
    `
    const parsed = parseFutbolmeTournamentHtml(
      sampleHtml,
      'primera_rfef',
      RFEF_GROUPS_BY_LEAGUE.primera_rfef[0],
    )
    expect(parsed.standings).toHaveLength(1)
    expect(parsed.standings[0]).toMatchObject({
      rank: 1,
      points: 28,
      played: 11,
      wins: 9,
      draws: 1,
      losses: 1,
      goalsFor: 19,
      goalsAgainst: 9,
      goalDiff: '+10',
      zone: 'promotion',
      team: {
        name: 'CD Lugo',
        logoUrl: 'https://futbolme.com/static/img/club/escudo4484.png',
      },
    })
    expect(parsed.matches).toHaveLength(1)
    expect(parsed.matches[0].match).toMatchObject({
      id: 'rfef-1336237',
      status: 'finished',
      score: { home: 0, away: 1 },
      homeTeam: {
        name: 'CP Cacereño',
        logoUrl: 'https://futbolme.com/static/img/club/escudo4598.png',
      },
      awayTeam: {
        name: 'CD Lugo',
        logoUrl: 'https://futbolme.com/static/img/club/escudo4484.png',
      },
    })
    expect(parsed.matches[0].venue).toEqual({ name: 'Príncipe Felipe', city: 'Cáceres' })
    expect(parsed.matches[0].events).toHaveLength(1)
    expect(parsed.matches[0].events[0]).toMatchObject({
      minute: "17'",
      player: 'Morchiladze',
      isHome: false,
      type: 'goal',
    })
  })
})

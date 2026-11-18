import { describe, expect, it } from 'vitest'
import { getVerifiedClubInfo } from '@/services/real/clubRegistry'
import { parseRfefSquad, parseRfefTeamData } from '@/services/real/rfef'
import { leagueCatalog } from '@/services/leagueCatalog'
import { resolveSpanishBroadcasters } from '@/lib/broadcasters'
import {
  getNationalTeamByCountry,
  getVerifiedNationalTeamInfo,
  isNationalTeam,
  translateNationalTeamName,
} from '@/lib/nationalTeams'
import { resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import type { Match } from '@/types'
import {
  normalizeSearch,
  searchEntities,
  translateStandingSummary,
  type TeamIndexEntry,
} from '@/services/real/teams'
import { clampSentences } from '@/services/real/wikipedia'

const entry = (id: string, name: string, leagueName: string): TeamIndexEntry => ({
  ref: { team: { id, name, shortName: name.slice(0, 3).toUpperCase() } },
  leagueName,
})

describe('searchEntities', () => {
  const teams = [
    entry('espn-86', 'Real Madrid', 'LaLiga'),
    entry('espn-83', 'Barcelona', 'LaLiga'),
    entry('espn-1', 'Atlético Madrid', 'LaLiga'),
    entry('rfef-cd-lugo', 'CD Lugo', '1ª RFEF (Primera Federación) · Grupo 1'),
  ]

  it('ignora acentos y mayúsculas y encuentra clubes', () => {
    const res = searchEntities('atletico', teams)
    expect(res.map((r) => r.name)).toContain('Atlético Madrid')
    expect(normalizeSearch('Atlético  MADRID')).toBe('atletico madrid')
  })

  it('encuentra competiciones por nombre', () => {
    const res = searchEntities('hypermotion', teams)
    expect(res[0]).toMatchObject({ kind: 'league', id: 'segunda' })
    expect(searchEntities('tercera', teams).some((r) => r.kind === 'league' && r.id === 'tercera_rfef')).toBe(true)
  })

  it('exige todas las palabras y prioriza los que empiezan por la búsqueda', () => {
    const res = searchEntities('madrid', teams).filter((r) => r.kind === 'team')
    expect(res.map((r) => r.name)).toEqual(['Atlético Madrid', 'Real Madrid'].sort((a, b) => {
      return res.findIndex((r) => r.name === a) - res.findIndex((r) => r.name === b)
    }))
    expect(searchEntities('real lugo', teams)).toEqual([])
    expect(searchEntities('   ', teams)).toEqual([])
  })
})

describe('translateStandingSummary / clampSentences', () => {
  it('traduce el resumen de posición de ESPN', () => {
    expect(translateStandingSummary('2nd in Spanish LALIGA')).toBe('2º en la clasificación')
    expect(translateStandingSummary('algo raro')).toBe('')
  })

  it('recorta descripciones largas por frase', () => {
    const text = `${'Frase de prueba larga. '.repeat(40)}`
    const out = clampSentences(text, 200)
    expect(out.length).toBeLessThanOrEqual(200)
    expect(out.endsWith('.')).toBe(true)
  })
})

describe('parseRfefTeamData', () => {
  it('extrae estadio y datos del club', () => {
    const html = `
      <div id="contenedorSuperiorEquipo" class="row"><h1>CD Lugo</h1></div>
      <div style="margin-top: 10px" class="col-12 contenedorBlancoBordesRedondeadosConPadding">
        <div class="row">
          <div class="col-6">
            <h3>Anxo Carro</h3>
            <span>
              Avenida de los Deportes, s/n -
              Lugo
            </span>
            <hr>
            <div>Año de inauguración: 1974</div>
            <div>Capacidad: 7840</div>
          </div>
        </div>
      </div>
      <div class="col-12"><div class="row"><div class="col-7">
        <h3>Datos del club</h3>
        <div><strong>Club Deportivo Lugo</strong></div>
        <div>Fundado en 1946</div>
        <div><strong>Web:</strong> <a href='http://www.cdlugo.com' target='_blank'>www.cdlugo.com</a></div>
      </div><div class="col-5">Equipación: Camiseta rojiblanca a rayas verticales,
        pantalón azul y medias rojas.
      </div></div></div>`
    const data = parseRfefTeamData(html)
    expect(data.venue).toMatchObject({
      name: 'Anxo Carro',
      city: 'Lugo',
      capacity: 7840,
      opened: '1974',
    })
    expect(data.fullName).toBe('Club Deportivo Lugo')
    expect(data.founded).toBe('1946')
    expect(data.website).toBe('http://www.cdlugo.com')
    expect(data.kit).toContain('rojiblanca')
  })
})

describe('parseRfefSquad', () => {
  it('extrae jugadores agrupados por demarcación en español', () => {
    const player = (name: string, id: number, goals: number) => `
      <div class="row" style="margin-bottom: 10px;">
        <div class="col-2"><a href='https://futbolme.com/resultados-directo/jugador/x/${id}'></a></div>
        <div class="col-8"><span style='font-size: 15px'>
          ${name}
        </span><br />
          <span class="badge" style="width:30px;">9</span></div>
        <div class="col-2 text-center"><span class='iconseparate'></span><br />
          ${goals}
        </div>
      </div>`
    const html = `<h2 class="subtitulo">Senior Masculino</h2>
      <h2 class="subtitulo">Porteros</h2>${player('Pere Haro Crespo', 47362, 0)}
      <h2 class="subtitulo">Delanteros</h2>${player('Tornike Morchiladze', 62981, 3)}
      <h2 class="subtitulo">Sin demarcación</h2>${player('Kevin Presa', 1, 1)}`
    const squad = parseRfefSquad(html)
    expect(squad).toHaveLength(3)
    expect(squad[0]).toMatchObject({ id: '47362', name: 'Pere Haro Crespo', position: 'Portero' })
    expect(squad[1]).toMatchObject({ position: 'Delantero', goals: 3, jersey: '9' })
    expect(squad[2].position).toBeUndefined()
  })
})

describe('getVerifiedClubInfo (registro verídico de clubes)', () => {
  it('resuelve clubes de 1ª División española con todos sus datos', () => {
    const rm = getVerifiedClubInfo('Real Madrid', 'espn-86')
    expect(rm).toBeDefined()
    expect(rm?.fullName).toBe('Real Madrid Club de Fútbol')
    expect(rm?.founded).toBe('1902')
    expect(rm?.venue.name).toBe('Santiago Bernabéu')
    expect(rm?.venue.capacity).toBe(83186)
    expect(rm?.description.url).toContain('Real_Madrid')

    const barca = getVerifiedClubInfo('Barcelona', '83')
    expect(barca).toBeDefined()
    expect(barca?.fullName).toBe('Futbol Club Barcelona')
    expect(barca?.venue.name).toContain('Camp Nou')
    expect(barca?.venue.capacity).toBe(99354)
  })

  it('resuelve clubes de 2ª División española', () => {
    const depor = getVerifiedClubInfo('Deportivo', 'espn-90')
    expect(depor).toBeDefined()
    expect(depor?.venue.name).toContain('Riazor')
    expect(depor?.venue.capacity).toBe(32490)

    const huesca = getVerifiedClubInfo('SD Huesca')
    expect(huesca).toBeDefined()
    expect(huesca?.venue.name).toBe('El Alcoraz')
    expect(huesca?.venue.capacity).toBe(9100)
  })

  it('resuelve clubes ingleses hasta la 4ª división (Premier, Championship, League One, League Two)', () => {
    // Premier League
    const arsenal = getVerifiedClubInfo('Arsenal', 'espn-359')
    expect(arsenal?.venue.name).toBe('Emirates Stadium')
    expect(arsenal?.venue.capacity).toBe(60704)

    const bournemouth = getVerifiedClubInfo('AFC Bournemouth', 'espn-349')
    expect(bournemouth?.venue.name).toContain('Vitality Stadium')

    // Championship
    const leeds = getVerifiedClubInfo('Leeds United', 'espn-357')
    expect(leeds?.venue.name).toBe('Elland Road')
    expect(leeds?.venue.capacity).toBe(37890)

    // League One
    const wrexham = getVerifiedClubInfo('Wrexham AFC', 'espn-352')
    expect(wrexham?.fullName).toContain('Wrexham')
    expect(wrexham?.founded).toBe('1864')
    expect(wrexham?.venue.name).toContain('Racecourse')

    const bolton = getVerifiedClubInfo('Bolton Wanderers', 'espn-358')
    expect(bolton?.venue.name).toContain('Toughsheet')

    // League Two
    const notts = getVerifiedClubInfo('Notts County', 'espn-340')
    expect(notts?.founded).toBe('1862')
    expect(notts?.venue.name).toBe('Meadow Lane')

    const portVale = getVerifiedClubInfo('Port Vale', 'espn-348')
    expect(portVale?.venue.name).toBe('Vale Park')
  })

  it('resuelve grandes clubes europeos (Serie A, Bundesliga, Ligue 1)', () => {
    const inter = getVerifiedClubInfo('Inter Milan', 'espn-110')
    expect(inter?.venue.name).toContain('Meazza')

    const bayern = getVerifiedClubInfo('Bayern Munich', 'espn-132')
    expect(bayern?.venue.name).toBe('Allianz Arena')
    expect(bayern?.venue.capacity).toBe(75024)

    const psg = getVerifiedClubInfo('Paris Saint-Germain', 'espn-160')
    expect(psg?.venue.name).toContain('Príncipes')
  })
})

describe('Catálogo y retransmisiones de ligas inglesas inferiores', () => {
  it('incluye Championship, League One y League Two en el catálogo de competiciones', () => {
    const ch = leagueCatalog.find((l) => l.id === 'championship')
    expect(ch).toBeDefined()
    expect(ch?.sources.espn).toBe('eng.2')
    expect(ch?.country).toBe('Inglaterra')

    const l1 = leagueCatalog.find((l) => l.id === 'league_one')
    expect(l1?.sources.espn).toBe('eng.3')

    const l2 = leagueCatalog.find((l) => l.id === 'league_two')
    expect(l2?.sources.espn).toBe('eng.4')
  })

  it('asigna retransmisiones en España en DAZN para el fútbol inglés inferior', () => {
    const fakeMatch = (id: string, leagueId: string): Match => ({
      id,
      leagueId,
      homeTeam: { id: 't1', name: 'Equipo 1', shortName: 'EQ1' },
      awayTeam: { id: 't2', name: 'Equipo 2', shortName: 'EQ2' },
      kickoff: new Date().toISOString(),
      status: 'scheduled',
    })

    const bCh = resolveSpanishBroadcasters('championship', undefined, fakeMatch('m1', 'championship'))
    expect(bCh[0].channel).toBe('DAZN')

    const bL1 = resolveSpanishBroadcasters('league_one', undefined, fakeMatch('m2', 'league_one'))
    expect(bL1[0].channel).toBe('DAZN')

    const bL2 = resolveSpanishBroadcasters('league_two', undefined, fakeMatch('m3', 'league_two'))
    expect(bL2[0].channel).toBe('DAZN')
  })
})

describe('Selecciones Nacionales y Competiciones Internacionales', () => {
  it('incluye Mundial FIFA, Eurocopa, Nations League, Copa América y Clasificaciones en leagueCatalog', () => {
    const wc = leagueCatalog.find((l) => l.id === 'worldcup')
    expect(wc?.sources.espn).toBe('fifa.world')

    const euro = leagueCatalog.find((l) => l.id === 'euro')
    expect(euro?.sources.espn).toBe('uefa.euro')

    const nations = leagueCatalog.find((l) => l.id === 'nations')
    expect(nations?.sources.espn).toBe('uefa.nations')

    const copa = leagueCatalog.find((l) => l.id === 'copaamerica')
    expect(copa?.sources.espn).toBe('conmebol.america')

    expect(leagueCatalog.some((l) => l.id === 'worldq_uefa')).toBe(true)
    expect(leagueCatalog.some((l) => l.id === 'worldq_conmebol')).toBe(true)
    expect(leagueCatalog.some((l) => l.id === 'friendly')).toBe(true)
  })

  it('traduce nombres de selecciones al español correctamente', () => {
    expect(translateNationalTeamName('Spain', true)).toBe('España')
    expect(translateNationalTeamName('France', true)).toBe('Francia')
    expect(translateNationalTeamName('Brazil', true)).toBe('Brasil')
    expect(translateNationalTeamName('Germany', true)).toBe('Alemania')
    expect(translateNationalTeamName('Netherlands', true)).toBe('Países Bajos')
    expect(translateNationalTeamName('Türkiye', true)).toBe('Turquía')
    expect(translateNationalTeamName('Spain U21', true)).toBe('España Sub-21')
  })

  it('devuelve ficha verificada de España, Argentina, Francia, Brasil e Inglaterra', () => {
    const spain = getVerifiedNationalTeamInfo('España', 'espn-164')
    expect(spain.fullName).toBe('Selección de fútbol de España')
    expect(spain.federation).toContain('RFEF')
    expect(spain.confederation).toBe('UEFA')
    expect(spain.coach).toBe('Luis de la Fuente')
    expect(spain.honors).toContain('Mundial')

    const arg = getVerifiedNationalTeamInfo('Argentina', 'espn-202')
    expect(arg.federation).toContain('AFA')
    expect(arg.confederation).toBe('CONMEBOL')
    expect(arg.coach).toBe('Lionel Scaloni')

    const fra = getVerifiedNationalTeamInfo('France', 'espn-478')
    expect(fra.federation).toContain('FFF')
    expect(fra.coach).toBe('Didier Deschamps')

    const bra = getVerifiedNationalTeamInfo('Brazil', 'espn-205')
    expect(bra.federation).toContain('CBF')

    const eng = getVerifiedNationalTeamInfo('England', 'espn-448')
    expect(eng.venue?.name).toContain('Wembley')
  })

  it('resuelve selecciones por país o etiqueta de selección', () => {
    const esp = getNationalTeamByCountry('Selección de España')
    expect(esp?.team.id).toBe('espn-164')
    expect(esp?.team.name).toBe('España')
    expect(esp?.team.logoUrl).toContain('/countries/500/esp.png')

    const fra = getNationalTeamByCountry('France')
    expect(fra?.team.id).toBe('espn-478')
    expect(fra?.team.name).toBe('Francia')

    expect(isNationalTeam({ id: 'espn-164', name: 'España' })).toBe(true)
    expect(isNationalTeam({ id: 'espn-86', name: 'Real Madrid' })).toBe(false)
  })
})

describe('Real Unión de Irún y búsqueda por localidad', () => {
  it('resuelve el escudo oficial del Real Unión en todas sus variantes sin confundirlo con Tenerife', () => {
    const irunUrl = 'https://futbolme.com/static/img/club/escudo4557.png'
    expect(resolveSpanishTeamCrest('Real Unión')).toBe(irunUrl)
    expect(resolveSpanishTeamCrest('Real Unión Club')).toBe(irunUrl)
    expect(resolveSpanishTeamCrest('Real Unión de Irún')).toBe(irunUrl)
    expect(resolveSpanishTeamCrest('Irún')).toBe(irunUrl)
    expect(resolveSpanishTeamCrest('Real Unión Club B')).toBe(irunUrl)
    expect(resolveSpanishTeamCrest('Real Unión de Tenerife SC')).toBe(
      'https://futbolme.com/static/img/club/escudo3561.png',
    )
  })

  it('encuentra al Real Unión Club al buscar "irun" y devuelve su ficha verificada', () => {
    const teams = [entry('rfef-real-uni-n-club', 'Real Unión Club', '1ª RFEF · Grupo 1')]
    const results = searchEntities('irun', teams)
    expect(results.some((r) => r.kind === 'team' && r.name === 'Real Unión Club')).toBe(true)

    const clubInfo = getVerifiedClubInfo('Irún')
    expect(clubInfo?.venue.name).toBe('Stadium Gal')
    expect(clubInfo?.venue.city).toBe('Irún')
  })
})

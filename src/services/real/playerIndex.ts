import { translatePosition } from '@/lib/positions'
import type { Player, PlayerRef, SearchResult, SquadPlayer, Team } from '@/types'
import { getPlayerPhotoSync, VERIFIED_PLAYER_PHOTOS } from './playerPhotos'
import { normalizeSearch } from './teams'

export interface IndexedPlayer {
  id: string
  name: string
  team: Team
  leagueId?: string
  position?: string
  jersey?: string
  photoUrl?: string
}

// ── Catálogo precargado de estrellas y jugadores clave de LaLiga y competiciones europeas ──
const INITIAL_STAR_PLAYERS: IndexedPlayer[] = [
  // Real Madrid
  {
    id: '238711',
    name: 'Kylian Mbappé',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '9',
    photoUrl: VERIFIED_PLAYER_PHOTOS.kylianmbappe,
  },
  {
    id: '238712',
    name: 'Vinícius Júnior',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '7',
    photoUrl: VERIFIED_PLAYER_PHOTOS.viniciusjunior,
  },
  {
    id: '280628',
    name: 'Jude Bellingham',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '5',
    photoUrl: VERIFIED_PLAYER_PHOTOS.judebellingham,
  },
  {
    id: '249673',
    name: 'Rodrygo',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '11',
    photoUrl: VERIFIED_PLAYER_PHOTOS.rodrygo,
  },
  {
    id: '238714',
    name: 'Federico Valverde',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '8',
    photoUrl: VERIFIED_PLAYER_PHOTOS.federicovalverde,
  },
  {
    id: '45849',
    name: 'Luka Modric',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '10',
    photoUrl: VERIFIED_PLAYER_PHOTOS.lukamodric,
  },
  {
    id: '134283',
    name: 'Thibaut Courtois',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Portero',
    jersey: '1',
    photoUrl: VERIFIED_PLAYER_PHOTOS.thibautcourtois,
  },
  {
    id: '269859',
    name: 'Eduardo Camavinga',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '6',
    photoUrl: VERIFIED_PLAYER_PHOTOS.eduardocamavinga,
  },
  {
    id: '246328',
    name: 'Aurélien Tchouaméni',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '14',
    photoUrl: VERIFIED_PLAYER_PHOTOS.aurelientchouameni,
  },
  {
    id: '169018',
    name: 'Dani Carvajal',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Defensa',
    jersey: '2',
    photoUrl: VERIFIED_PLAYER_PHOTOS.danicarvajal,
  },
  {
    id: '286395',
    name: 'Arda Güler',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '15',
    photoUrl: VERIFIED_PLAYER_PHOTOS.ardaguler,
  },
  {
    id: '300001',
    name: 'Endrick',
    team: { id: 'espn-86', name: 'Real Madrid', shortName: 'RMA' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '16',
    photoUrl: VERIFIED_PLAYER_PHOTOS.endrick,
  },

  // FC Barcelona
  {
    id: '316278',
    name: 'Lamine Yamal',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '19',
    photoUrl: VERIFIED_PLAYER_PHOTOS.lamineyamal,
  },
  {
    id: '103565',
    name: 'Robert Lewandowski',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '9',
    photoUrl: VERIFIED_PLAYER_PHOTOS.robertlewandowski,
  },
  {
    id: '272990',
    name: 'Pedri',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '8',
    photoUrl: VERIFIED_PLAYER_PHOTOS.pedri,
  },
  {
    id: '235287',
    name: 'Raphinha',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '11',
    photoUrl: VERIFIED_PLAYER_PHOTOS.raphinha,
  },
  {
    id: '238715',
    name: 'Dani Olmo',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '20',
    photoUrl: VERIFIED_PLAYER_PHOTOS.daniolmo,
  },
  {
    id: '293419',
    name: 'Gavi',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '6',
    photoUrl: VERIFIED_PLAYER_PHOTOS.gavi,
  },
  {
    id: '320001',
    name: 'Pau Cubarsí',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Defensa',
    jersey: '2',
    photoUrl: VERIFIED_PLAYER_PHOTOS.paucubarsi,
  },
  {
    id: '241160',
    name: 'Frenkie de Jong',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '21',
    photoUrl: VERIFIED_PLAYER_PHOTOS.frenkiedejong,
  },
  {
    id: '238716',
    name: 'Jules Koundé',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Defensa',
    jersey: '23',
    photoUrl: VERIFIED_PLAYER_PHOTOS.juleskounde,
  },
  {
    id: '286396',
    name: 'Alejandro Balde',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Defensa',
    jersey: '3',
    photoUrl: VERIFIED_PLAYER_PHOTOS.alejandrobalde,
  },
  {
    id: '136151',
    name: 'Marc-André ter Stegen',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Portero',
    jersey: '1',
    photoUrl: VERIFIED_PLAYER_PHOTOS.marcandreterstegen,
  },
  {
    id: '254632',
    name: 'Ferran Torres',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '7',
    photoUrl: VERIFIED_PLAYER_PHOTOS.ferrantorres,
  },
  {
    id: '310001',
    name: 'Fermín López',
    team: { id: 'espn-83', name: 'FC Barcelona', shortName: 'BAR' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '16',
    photoUrl: VERIFIED_PLAYER_PHOTOS.ferminlopez,
  },

  // Atlético de Madrid
  {
    id: '141052',
    name: 'Antoine Griezmann',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '7',
    photoUrl: VERIFIED_PLAYER_PHOTOS.antoinegriezmann,
  },
  {
    id: '272991',
    name: 'Julián Álvarez',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '19',
    photoUrl: VERIFIED_PLAYER_PHOTOS.julianalvarez,
  },
  {
    id: '194765',
    name: 'Alexander Sørloth',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '9',
    photoUrl: VERIFIED_PLAYER_PHOTOS.alexandersorloth,
  },
  {
    id: '190001',
    name: 'Rodrigo De Paul',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '5',
    photoUrl: VERIFIED_PLAYER_PHOTOS.rodrigodepaul,
  },
  {
    id: '150001',
    name: 'Jan Oblak',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Portero',
    jersey: '13',
    photoUrl: VERIFIED_PLAYER_PHOTOS.janoblak,
  },
  {
    id: '140001',
    name: 'Koke',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '6',
    photoUrl: VERIFIED_PLAYER_PHOTOS.koke,
  },
  {
    id: '200001',
    name: 'Marcos Llorente',
    team: { id: 'espn-1068', name: 'Atlético de Madrid', shortName: 'ATM' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '14',
    photoUrl: VERIFIED_PLAYER_PHOTOS.marcosllorente,
  },

  // Athletic Club
  {
    id: '290001',
    name: 'Nico Williams',
    team: { id: 'espn-93', name: 'Athletic Club', shortName: 'ATH' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '10',
    photoUrl: VERIFIED_PLAYER_PHOTOS.nicowilliams,
  },
  {
    id: '190002',
    name: 'Iñaki Williams',
    team: { id: 'espn-93', name: 'Athletic Club', shortName: 'ATH' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '9',
    photoUrl: VERIFIED_PLAYER_PHOTOS.inakiwilliams,
  },
  {
    id: '270001',
    name: 'Oihan Sancet',
    team: { id: 'espn-93', name: 'Athletic Club', shortName: 'ATH' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '8',
    photoUrl: VERIFIED_PLAYER_PHOTOS.oihansancet,
  },
  {
    id: '240001',
    name: 'Unai Simón',
    team: { id: 'espn-93', name: 'Athletic Club', shortName: 'ATH' },
    leagueId: 'esp.1',
    position: 'Portero',
    jersey: '1',
    photoUrl: VERIFIED_PLAYER_PHOTOS.unaisimon,
  },
  {
    id: '250001',
    name: 'Dani Vivian',
    team: { id: 'espn-93', name: 'Athletic Club', shortName: 'ATH' },
    leagueId: 'esp.1',
    position: 'Defensa',
    jersey: '3',
    photoUrl: VERIFIED_PLAYER_PHOTOS.danivivian,
  },

  // Real Sociedad
  {
    id: '260001',
    name: 'Takefusa Kubo',
    team: { id: 'espn-89', name: 'Real Sociedad', shortName: 'RSO' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '14',
    photoUrl: VERIFIED_PLAYER_PHOTOS.takefusakubo,
  },
  {
    id: '220001',
    name: 'Mikel Oyarzabal',
    team: { id: 'espn-89', name: 'Real Sociedad', shortName: 'RSO' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '10',
    photoUrl: VERIFIED_PLAYER_PHOTOS.mikeloyarzabal,
  },
  {
    id: '270002',
    name: 'Martín Zubimendi',
    team: { id: 'espn-89', name: 'Real Sociedad', shortName: 'RSO' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '4',
    photoUrl: VERIFIED_PLAYER_PHOTOS.martinzubimendi,
  },

  // Celta de Vigo
  {
    id: '120001',
    name: 'Iago Aspas',
    team: { id: 'espn-85', name: 'Celta de Vigo', shortName: 'CEL' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '10',
    photoUrl: VERIFIED_PLAYER_PHOTOS.iagoaspas,
  },
  {
    id: '180001',
    name: 'Borja Iglesias',
    team: { id: 'espn-85', name: 'Celta de Vigo', shortName: 'CEL' },
    leagueId: 'esp.1',
    position: 'Delantero',
    jersey: '7',
    photoUrl: VERIFIED_PLAYER_PHOTOS.borjaiglesias,
  },

  // Real Betis
  {
    id: '150002',
    name: 'Isco',
    team: { id: 'espn-244', name: 'Real Betis', shortName: 'BET' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '22',
    photoUrl: VERIFIED_PLAYER_PHOTOS.isco,
  },
  {
    id: '230001',
    name: 'Giovani Lo Celso',
    team: { id: 'espn-244', name: 'Real Betis', shortName: 'BET' },
    leagueId: 'esp.1',
    position: 'Centrocampista',
    jersey: '20',
    photoUrl: VERIFIED_PLAYER_PHOTOS.giovanilocelso,
  },

  // Premier League & Internacionales
  {
    id: '249001',
    name: 'Erling Haaland',
    team: { id: 'espn-382', name: 'Manchester City', shortName: 'MCI' },
    leagueId: 'eng.1',
    position: 'Delantero',
    jersey: '9',
    photoUrl: VERIFIED_PLAYER_PHOTOS.erlinghaaland,
  },
  {
    id: '249002',
    name: 'Kevin De Bruyne',
    team: { id: 'espn-382', name: 'Manchester City', shortName: 'MCI' },
    leagueId: 'eng.1',
    position: 'Centrocampista',
    jersey: '17',
    photoUrl: VERIFIED_PLAYER_PHOTOS.kevindebruyne,
  },
  {
    id: '249003',
    name: 'Rodri',
    team: { id: 'espn-382', name: 'Manchester City', shortName: 'MCI' },
    leagueId: 'eng.1',
    position: 'Centrocampista',
    jersey: '16',
    photoUrl: VERIFIED_PLAYER_PHOTOS.rodri,
  },
  {
    id: '249004',
    name: 'Bukayo Saka',
    team: { id: 'espn-359', name: 'Arsenal', shortName: 'ARS' },
    leagueId: 'eng.1',
    position: 'Delantero',
    jersey: '7',
    photoUrl: VERIFIED_PLAYER_PHOTOS.bukayosaka,
  },
  {
    id: '249005',
    name: 'Mohamed Salah',
    team: { id: 'espn-364', name: 'Liverpool', shortName: 'LIV' },
    leagueId: 'eng.1',
    position: 'Delantero',
    jersey: '11',
    photoUrl: VERIFIED_PLAYER_PHOTOS.mohamedsalah,
  },
  {
    id: '249006',
    name: 'Cole Palmer',
    team: { id: 'espn-363', name: 'Chelsea', shortName: 'CHE' },
    leagueId: 'eng.1',
    position: 'Centrocampista',
    jersey: '20',
    photoUrl: VERIFIED_PLAYER_PHOTOS.colepalmer,
  },
]

// Índice en memoria que se expande dinámicamente con las plantillas cargadas
const PLAYER_REGISTRY = new Map<string, IndexedPlayer>()

// Cargar catálogo inicial
for (const p of INITIAL_STAR_PLAYERS) {
  PLAYER_REGISTRY.set(p.name.toLowerCase(), p)
}

/** Registra jugadores dinámicamente cuando se cargan alineaciones o plantillas */
export function registerDynamicPlayers(
  players: (Player | SquadPlayer)[],
  team: Team,
  leagueId?: string,
): void {
  for (const p of players) {
    if (!p.name || p.name.trim().length === 0) continue
    const key = p.name.toLowerCase()
    if (!PLAYER_REGISTRY.has(key)) {
      PLAYER_REGISTRY.set(key, {
        id: p.id || p.name,
        name: p.name,
        team,
        leagueId,
        position: p.position ? translatePosition(p.position).label : undefined,
        jersey: p.jersey,
        photoUrl: p.photoUrl || getPlayerPhotoSync(p.name),
      })
    }
  }
}

/** Busca jugadores en el registro por nombre (sin contaminar búsquedas de clubes) */
export function searchPlayers(query: string, limit = 15): SearchResult[] {
  const tokens = normalizeSearch(query).split(' ').filter(Boolean)
  if (tokens.length === 0) return []

  const matches: { item: IndexedPlayer; score: number }[] = []

  for (const player of PLAYER_REGISTRY.values()) {
    const normName = normalizeSearch(player.name)

    // Solo coincidir si los términos de búsqueda están presentes en el nombre del futbolista
    if (!tokens.every((t) => normName.includes(t))) continue

    let score = 0
    if (normName.startsWith(tokens[0])) score += 3
    if (normName.split(' ').some((w) => w.startsWith(tokens[0]))) score += 2

    matches.push({ item: player, score })
  }

  matches.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))

  return matches.slice(0, limit).map(({ item }): SearchResult => {
    const ref: PlayerRef = {
      player: {
        id: item.id,
        name: item.name,
        jersey: item.jersey,
        position: item.position,
        photoUrl: item.photoUrl,
      },
      team: item.team,
      leagueId: item.leagueId,
    }

    return {
      kind: 'player',
      id: `player-${item.id}-${item.name}`,
      name: item.name,
      subtitle: `${item.team.name}${item.position ? ` · ${item.position}` : ''}`,
      ref,
      photoUrl: item.photoUrl,
      jersey: item.jersey,
      position: item.position,
    }
  })
}

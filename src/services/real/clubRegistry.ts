import type { TeamVenue } from '@/types'

export interface VerifiedClubProfile {
  fullName: string
  founded: string
  location: string
  website?: string
  kit?: string
  venue: TeamVenue
  description: {
    text: string
    url?: string
  }
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(club|deportivo|deportiva|cf|cd|ud|sd|ad|rcd|rc|fc|ca|afc|football|balompie|sad|united|city|town|wanderers|rovers|albion|athletic)\b/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Base de datos de clubes verificados con estadio, capacidad, año de fundación y descripción verídica */
export const VERIFIED_CLUBS: Record<string, VerifiedClubProfile> = {
// === LALIGA (ESPAÑA - 1ª) ===
  'real-madrid': {
    fullName: 'Real Madrid Club de Fútbol',
    founded: '1902',
    location: 'Madrid, España',
    website: 'www.realmadrid.com',
    kit: 'Camiseta blanca, pantalón blanco y medias blancas.',
    venue: { name: 'Santiago Bernabéu', city: 'Madrid', address: 'Av. de Concha Espina, 1', capacity: 83186, opened: '1947' },
    description: {
      text: 'El Real Madrid Club de Fútbol fue fundado el 6 de marzo de 1902 en Madrid. Es el club más laureado de Europa con 15 Copas de Europa y 36 títulos de Liga española.',
      url: 'https://es.wikipedia.org/wiki/Real_Madrid_Club_de_F%C3%BAtbol',
    },
  },
  'barcelona': {
    fullName: 'Futbol Club Barcelona',
    founded: '1899',
    location: 'Barcelona, Cataluña, España',
    website: 'www.fcbarcelona.es',
    kit: 'Camiseta azulgrana a rayas verticales, pantalón azul y medias azulgranas.',
    venue: { name: 'Spotify Camp Nou', city: 'Barcelona', address: "Carrer d'Arístides Maillol, 12", capacity: 99354, opened: '1957' },
    description: {
      text: 'El Futbol Club Barcelona fue fundado el 29 de noviembre de 1899 por Joan Gamper. Célebre por su lema «Més que un club», su cantera de La Masia y su palmarés internacional.',
      url: 'https://es.wikipedia.org/wiki/Futbol_Club_Barcelona',
    },
  },
  'atletico-madrid': {
    fullName: 'Club Atlético de Madrid, S.A.D.',
    founded: '1903',
    location: 'Madrid, España',
    website: 'www.atleticodemadrid.com',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón azul y medias rojas.',
    venue: { name: 'Cívitas Metropolitano', city: 'Madrid', address: 'Av. de Luis Aragonés, 4', capacity: 70460, opened: '2017' },
    description: {
      text: 'El Club Atlético de Madrid fue fundado en 1903 en Madrid. Conocidos como «colchoneros», poseen once títulos de Liga, diez Copas del Rey y tres UEFA Europa League.',
      url: 'https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_de_Madrid',
    },
  },
  'athletic-club': {
    fullName: 'Athletic Club',
    founded: '1898',
    location: 'Bilbao, Vizcaya, España',
    website: 'www.athletic-club.eus',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón negro y medias negras.',
    venue: { name: 'San Mamés', city: 'Bilbao', address: 'Rafael Moreno Pitxitxi Kalea', capacity: 53289, opened: '2013' },
    description: {
      text: 'El Athletic Club fue fundado en 1898 en Bilbao. Único en el fútbol de élite por competir exclusivamente con futbolistas nacidos o formados en el País Vasco y Navarra.',
      url: 'https://es.wikipedia.org/wiki/Athletic_Club',
    },
  },
  'real-sociedad': {
    fullName: 'Real Sociedad de Fútbol, S.A.D.',
    founded: '1909',
    location: 'San Sebastián, Guipúzcoa, España',
    website: 'www.realsociedad.eus',
    kit: 'Camiseta blanquiazul a rayas verticales, pantalón blanco.',
    venue: { name: 'Reale Arena', city: 'San Sebastián', address: 'Anoeta Pasealekua, 1', capacity: 39313, opened: '1993' },
    description: {
      text: 'La Real Sociedad de Fútbol fue fundada en septiembre de 1909 en San Sebastián. Bicampeona de Liga y tricampeona de Copa del Rey, con su afamada cantera en Zubieta.',
      url: 'https://es.wikipedia.org/wiki/Real_Sociedad_de_F%C3%BAtbol',
    },
  },
  'real-betis': {
    fullName: 'Real Betis Balompié, S.A.D.',
    founded: '1907',
    location: 'Sevilla, Andalucía, España',
    website: 'www.realbetisbalompie.es',
    kit: 'Camiseta verdiblanca a rayas verticales, pantalón blanco y medias verdes.',
    venue: { name: 'Benito Villamarín', city: 'Sevilla', address: 'Av. de Heliópolis, s/n', capacity: 60721, opened: '1929' },
    description: {
      text: 'El Real Betis Balompié fue fundado en 1907 en Sevilla. Campeón de Liga en 1935 y tricampeón de Copa del Rey, cuenta con una de las masas sociales más fieles de España.',
      url: 'https://es.wikipedia.org/wiki/Real_Betis_Balompi%C3%A9',
    },
  },
  'sevilla': {
    fullName: 'Sevilla Fútbol Club, S.A.D.',
    founded: '1890',
    location: 'Sevilla, Andalucía, España',
    website: 'www.sevillafc.es',
    kit: 'Camiseta blanca con detalles rojos, pantalón blanco y medias negras.',
    venue: { name: 'Ramón Sánchez-Pizjuán', city: 'Sevilla', address: 'Calle Sevilla Fútbol Club, s/n', capacity: 43883, opened: '1958' },
    description: {
      text: 'El Sevilla Fútbol Club fue fundado en 1890 en Sevilla. Es el club más laureado en la historia de la UEFA Europa League con siete títulos.',
      url: 'https://es.wikipedia.org/wiki/Sevilla_F%C3%BAtbol_Club',
    },
  },
  'valencia': {
    fullName: 'Valencia Club de Fútbol, S.A.D.',
    founded: '1919',
    location: 'Valencia, España',
    website: 'www.valenciacf.com',
    kit: 'Camiseta blanca, pantalón negro y medias blancas.',
    venue: { name: 'Mestalla', city: 'Valencia', address: 'Avinguda de Suècia, s/n', capacity: 49430, opened: '1923' },
    description: {
      text: 'El Valencia Club de Fútbol fue fundado en 1919. Hexacampeón de Liga y octacampeón de Copa del Rey, disputa sus partidos en el centenario estadio de Mestalla.',
      url: 'https://es.wikipedia.org/wiki/Valencia_Club_de_F%C3%BAtbol',
    },
  },
  'villarreal': {
    fullName: 'Villarreal Club de Fútbol, S.A.D.',
    founded: '1923',
    location: 'Vila-real, Castellón, España',
    website: 'www.villarrealcf.es',
    kit: 'Camiseta amarilla, pantalón amarillo y medias amarillas.',
    venue: { name: 'Estadio de la Cerámica', city: 'Vila-real', address: 'Carrer Blasco Ibáñez, 2', capacity: 23500, opened: '1923' },
    description: {
      text: 'El Villarreal Club de Fútbol, conocido como el «Submarino Amarillo», fue fundado en 1923 en Vila-real. Campeón de la UEFA Europa League en 2021.',
      url: 'https://es.wikipedia.org/wiki/Villarreal_Club_de_F%C3%BAtbol',
    },
  },
  'celta-vigo': {
    fullName: 'Real Club Celta de Vigo, S.A.D.',
    founded: '1923',
    location: 'Vigo, Pontevedra, España',
    website: 'www.rccelta.es',
    kit: 'Camiseta celeste, pantalón blanco y medias celestes.',
    venue: { name: 'Abanca-Balaídos', city: 'Vigo', address: 'Av. de Balaídos, s/n', capacity: 24791, opened: '1928' },
    description: {
      text: 'El Real Club Celta de Vigo nació en 1923 de la fusión del Real Vigo Sporting y el Real Fortuna. Símbolo del fútbol gallego, viste de celeste en Balaídos.',
      url: 'https://es.wikipedia.org/wiki/Real_Club_Celta_de_Vigo',
    },
  },
  'osasuna': {
    fullName: 'Club Atlético Osasuna',
    founded: '1920',
    location: 'Pamplona, Navarra, España',
    website: 'www.osasuna.es',
    kit: 'Camiseta roja, pantalón azul marino y medias negras.',
    venue: { name: 'El Sadar', city: 'Pamplona', address: 'Calle Sadar, s/n', capacity: 23576, opened: '1967' },
    description: {
      text: 'El Club Atlético Osasuna fue fundado en 1920 en Pamplona. «Osasuna» significa salud o fuerza en euskera, y su feudo de El Sadar es célebre por su apasionada atmósfera.',
      url: 'https://es.wikipedia.org/wiki/Club_Atl%C3%A9tico_Osasuna',
    },
  },
  'espanyol': {
    fullName: 'Reial Club Deportiu Espanyol de Barcelona, S.A.D.',
    founded: '1900',
    location: 'Cornellà de Llobregat / Barcelona, España',
    website: 'www.rcdespanyol.com',
    kit: 'Camiseta blanquiazul a rayas verticales, pantalón azul y medias blancas.',
    venue: { name: 'Stage Front Stadium (RCDE Stadium)', city: 'Cornellà de Llobregat', address: 'Av. del Baix Llobregat, 100', capacity: 40000, opened: '2009' },
    description: {
      text: 'El RCD Espanyol fue fundado en 1900 en Barcelona. Miembro fundador de la Liga y tetracampeón de la Copa del Rey, disputa sus partidos en el RCDE Stadium.',
      url: 'https://es.wikipedia.org/wiki/RCD_Espanyol',
    },
  },
  'alaves': {
    fullName: 'Deportivo Alavés, S.A.D.',
    founded: '1921',
    location: 'Vitoria-Gasteiz, Álava, España',
    website: 'www.deportivoalaves.com',
    kit: 'Camiseta albiazul a rayas verticales, pantalón azul y medias blancas.',
    venue: { name: 'Mendizorroza', city: 'Vitoria-Gasteiz', address: 'Paseo de Cervantes, s/n', capacity: 19840, opened: '1924' },
    description: {
      text: 'El Deportivo Alavés fue fundado en 1921 en Vitoria-Gasteiz. Apodado «El Glorioso», disputó la mítica final de la Copa de la UEFA en 2001.',
      url: 'https://es.wikipedia.org/wiki/Deportivo_Alav%C3%A9s',
    },
  },
  'rayo-vallecano': {
    fullName: 'Rayo Vallecano de Madrid, S.A.D.',
    founded: '1924',
    location: 'Madrid (Vallecas), España',
    website: 'www.rayovallecano.es',
    kit: 'Camiseta blanca con franja diagonal roja, pantalón blanco.',
    venue: { name: 'Campo de Fútbol de Vallecas', city: 'Madrid', address: 'Calle del Payaso Fofó, 1', capacity: 14708, opened: '1976' },
    description: {
      text: 'El Rayo Vallecano fue fundado en 1924 en el madrileño distrito de Vallecas. Caracterizado por su franja roja y su fuerte arraigo popular y social.',
      url: 'https://es.wikipedia.org/wiki/Rayo_Vallecano_de_Madrid',
    },
  },
  'getafe': {
    fullName: 'Getafe Club de Fútbol, S.A.D.',
    founded: '1983',
    location: 'Getafe, Madrid, España',
    website: 'www.getafecf.com',
    kit: 'Camiseta azul marino, pantalón azul marino y medias azules.',
    venue: { name: 'Coliseum', city: 'Getafe', address: 'Av. Teresa de Calcuta, 12', capacity: 16500, opened: '1998' },
    description: {
      text: 'El Getafe Club de Fútbol representa a la ciudad madrileña de Getafe. Refundado en 1983, ha competido durante dos décadas en Primera División, con dos subcampeonatos de Copa del Rey.',
      url: 'https://es.wikipedia.org/wiki/Getafe_Club_de_F%C3%BAtbol',
    },
  },
  'girona': {
    fullName: 'Girona Futbol Club, S.A.D.',
    founded: '1930',
    location: 'Girona, Cataluña, España',
    website: 'www.gironafc.cat',
    kit: 'Camiseta albirroja a rayas verticales, pantalón rojo.',
    venue: { name: 'Montilivi', city: 'Girona', address: 'Avinguda Montilivi, 141', capacity: 14624, opened: '1970' },
    description: {
      text: 'El Girona Futbol Club fue fundado en 1930 en Girona. Ha vivido un ascenso histórico hasta clasificarse para la UEFA Champions League en 2024.',
      url: 'https://es.wikipedia.org/wiki/Girona_Futbol_Club',
    },
  },
  'mallorca': {
    fullName: 'Real Club Deportivo Mallorca, S.A.D.',
    founded: '1916',
    location: 'Palma, Islas Baleares, España',
    website: 'www.rcdmallorca.es',
    kit: 'Camiseta roja bermellona, pantalón negro y medias rojas.',
    venue: { name: 'Mallorca Son Moix', city: 'Palma', address: 'Camí dels Reis, s/n', capacity: 23142, opened: '1999' },
    description: {
      text: 'El Real Club Deportivo Mallorca fue fundado en 1916 en Palma. Campeón de la Copa del Rey en 2003 y de la Supercopa en 1998.',
      url: 'https://es.wikipedia.org/wiki/Real_Club_Deportivo_Mallorca',
    },
  },
  'real-valladolid': {
    fullName: 'Real Valladolid Club de Fútbol, S.A.D.',
    founded: '1928',
    location: 'Valladolid, Castilla y León, España',
    website: 'www.realvalladolid.es',
    kit: 'Camiseta blanquivioleta a rayas verticales, pantalón blanco.',
    venue: { name: 'José Zorrilla', city: 'Valladolid', address: 'Av. del Mundial 82, s/n', capacity: 27618, opened: '1982' },
    description: {
      text: 'El Real Valladolid nació en 1928 de la fusión de dos clubes vallisoletanos. Histórico club de Castilla y León, campeón de la Copa de la Liga en 1984.',
      url: 'https://es.wikipedia.org/wiki/Real_Valladolid_Club_de_F%C3%BAtbol',
    },
  },
  'las-palmas': {
    fullName: 'Unión Deportiva Las Palmas, S.A.D.',
    founded: '1949',
    location: 'Las Palmas de Gran Canaria, España',
    website: 'www.udlaspalmas.es',
    kit: 'Camiseta amarilla, pantalón azul y medias amarillas.',
    venue: { name: 'Estadio de Gran Canaria', city: 'Las Palmas', address: 'Calle Fondos del Segura, s/n', capacity: 32392, opened: '2003' },
    description: {
      text: 'La UD Las Palmas nació en 1949 por la fusión de cinco clubes de Gran Canaria. Destacado por su estilo técnico canario, fue subcampeón de Liga en 1969.',
      url: 'https://es.wikipedia.org/wiki/Uni%C3%B3n_Deportiva_Las_Palmas',
    },
  },
  'leganes': {
    fullName: 'Club Deportivo Leganés, S.A.D.',
    founded: '1928',
    location: 'Leganés, Madrid, España',
    website: 'www.cdleganes.com',
    kit: 'Camiseta blanquiazul a rayas verticales, pantalón blanco y medias azules.',
    venue: { name: 'Estadio Municipal Butarque', city: 'Leganés', address: 'Calle Arquitectura, s/n', capacity: 12450, opened: '1998' },
    description: {
      text: 'El Club Deportivo Leganés fue fundado en 1928 en Leganés, Madrid. Conocidos como «pepineros», alcanzaron la Primera División en 2016 y las semifinales de Copa en 2018.',
      url: 'https://es.wikipedia.org/wiki/Club_Deportivo_Legan%C3%A9s',
    },
  },

  // === LALIGA HYPERMOTION (ESPAÑA - 2ª) ===
  'real-zaragoza': {
    fullName: 'Real Zaragoza, S.A.D.',
    founded: '1932',
    location: 'Zaragoza, Aragón, España',
    website: 'www.realzaragoza.com',
    kit: 'Camiseta blanca, pantalón azul y medias blancas.',
    venue: { name: 'La Romareda', city: 'Zaragoza', address: 'Calle de Eduardo Ibarra, 6', capacity: 33608, opened: '1957' },
    description: {
      text: 'El Real Zaragoza fue fundado en 1932 en Zaragoza. Uno de los grandes históricos de España, seis veces campeón de Copa del Rey y campeón de la Recopa de Europa en 1995.',
      url: 'https://es.wikipedia.org/wiki/Real_Zaragoza',
    },
  },
  'sporting-gijon': {
    fullName: 'Real Sporting de Gijón, S.A.D.',
    founded: '1905',
    location: 'Gijón, Asturias, España',
    website: 'www.realsporting.com',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón azul y medias rojas.',
    venue: { name: 'El Molinón - Enrique Castro Quini', city: 'Gijón', address: 'Parque de Isabel la Católica', capacity: 30000, opened: '1908' },
    description: {
      text: 'El Real Sporting de Gijón fue fundado en 1905. Su estadio, El Molinón, es el más antiguo de España. Subcampeón de Liga en 1979 y cuna de la leyenda Quini.',
      url: 'https://es.wikipedia.org/wiki/Real_Sporting_de_Gij%C3%B3n',
    },
  },
  'real-oviedo': {
    fullName: 'Real Oviedo, S.A.D.',
    founded: '1926',
    location: 'Oviedo, Asturias, España',
    website: 'www.realoviedo.es',
    kit: 'Camiseta azul carbayón, pantalón blanco y medias azules.',
    venue: { name: 'Carlos Tartiere', city: 'Oviedo', address: 'Calle Ricardo Vázquez Prada, s/n', capacity: 30500, opened: '2000' },
    description: {
      text: 'El Real Oviedo nació en 1926 de la fusión del Real Stadium Ovetense y el Real Club Deportivo Oviedo. Histórico club carbayón que compitió 38 temporadas en Primera División.',
      url: 'https://es.wikipedia.org/wiki/Real_Oviedo',
    },
  },
  'deportivo': {
    fullName: 'Real Club Deportivo de La Coruña, S.A.D.',
    founded: '1906',
    location: 'A Coruña, Galicia, España',
    website: 'www.rcdeportivo.es',
    kit: 'Camiseta blanquiazul a rayas verticales, pantalón azul y medias azules.',
    venue: { name: 'Abanca-Riazor', city: 'A Coruña', address: 'Rúa Manuel Murguía, s/n', capacity: 32490, opened: '1944' },
    description: {
      text: 'El RCD de La Coruña fue fundado en 1906 en A Coruña. Campeón de Liga en 2000, bicampeón de Copa del Rey y triple de Supercopa, célebre como el «Súper Dépor».',
      url: 'https://es.wikipedia.org/wiki/Real_Club_Deportivo_de_La_Coru%C3%B1a',
    },
  },
  'racing-santander': {
    fullName: 'Real Racing Club de Santander, S.A.D.',
    founded: '1913',
    location: 'Santander, Cantabria, España',
    website: 'www.realracingclub.es',
    kit: 'Camiseta blanca, pantalón negro y medias verdes.',
    venue: { name: 'Campos de Sport de El Sardinero', city: 'Santander', address: 'Calle Real Racing Club, s/n', capacity: 22222, opened: '1988' },
    description: {
      text: 'El Real Racing Club fue fundado en 1913 en Santander. Uno de los diez clubes fundadores de la Primera División española en 1929.',
      url: 'https://es.wikipedia.org/wiki/Real_Racing_Club_de_Santander',
    },
  },
  'levante': {
    fullName: 'Levante Unión Deportiva, S.A.D.',
    founded: '1909',
    location: 'Valencia, España',
    website: 'www.levanteud.com',
    kit: 'Camiseta azulgrana a rayas verticales, pantalón azul y medias azulgranas.',
    venue: { name: 'Ciutat de València', city: 'Valencia', address: 'Carrer de Sant Vicent de Paül, 44', capacity: 26354, opened: '1969' },
    description: {
      text: 'El Levante UD es el club decano de la ciudad de Valencia, fundado en 1909. Disputó la UEFA Europa League en 2012 y cuenta con el estadio Ciutat de València.',
      url: 'https://es.wikipedia.org/wiki/Levante_Uni%C3%B3n_Deportiva',
    },
  },
  'elche': {
    fullName: 'Elche Club de Fútbol, S.A.D.',
    founded: '1923',
    location: 'Elche, Alicante, España',
    website: 'www.elchecf.es',
    kit: 'Camiseta blanca con franja horizontal verde, pantalón blanco.',
    venue: { name: 'Manuel Martínez Valero', city: 'Elche', address: 'Av. Manuel Martínez Valero, 3', capacity: 31388, opened: '1976' },
    description: {
      text: 'El Elche CF fue fundado en 1923 en la ciudad ilicitana. Subcampeón de la Copa del Rey en 1969, su estadio albergó partidos del Mundial de España 1982.',
      url: 'https://es.wikipedia.org/wiki/Elche_Club_de_F%C3%BAtbol',
    },
  },
  'eibar': {
    fullName: 'Sociedad Deportiva Eibar, S.A.D.',
    founded: '1940',
    location: 'Eibar, Guipúzcoa, España',
    website: 'www.sdeibar.com',
    kit: 'Camiseta azulgrana a rayas verticales, pantalón azul y medias azulgranas.',
    venue: { name: 'Ipurua', city: 'Eibar', address: 'Ipurua Kalea, 2', capacity: 8164, opened: '1947' },
    description: {
      text: 'La SD Eibar fue fundada en 1940 en la ciudad armera de Eibar. Modelo de gestión deportiva humilde y ejemplar que compitió siete temporadas seguidas en Primera División.',
      url: 'https://es.wikipedia.org/wiki/Sociedad_Deportiva_Eibar',
    },
  },
  'almeria': {
    fullName: 'Unión Deportiva Almería, S.A.D.',
    founded: '1989',
    location: 'Almería, Andalucía, España',
    website: 'www.udalmeriasad.com',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón rojo y medias blancas.',
    venue: { name: 'Power Horse Stadium (Juegos Mediterráneos)', city: 'Almería', address: 'Calle Alcalde Santiago Martínez Cabrejas, 5', capacity: 15274, opened: '2004' },
    description: {
      text: 'La UD Almería fue fundada en 1989 en la ciudad andaluza de Almería. Disputa sus encuentros en el estadio de los Juegos Mediterráneos.',
      url: 'https://es.wikipedia.org/wiki/Uni%C3%B3n_Deportiva_Almer%C3%ADa',
    },
  },
  'granada': {
    fullName: 'Granada Club de Fútbol, S.A.D.',
    founded: '1931',
    location: 'Granada, Andalucía, España',
    website: 'www.granadacf.es',
    kit: 'Camiseta rojiblanca a rayas horizontales, pantalón azul y medias blancas.',
    venue: { name: 'Nuevo Los Cármenes', city: 'Granada', address: 'Calle Pintor Manuel Maldonado, s/n', capacity: 19336, opened: '1995' },
    description: {
      text: 'El Granada Club de Fútbol fue fundado en 1931. Subcampeón de Copa del Rey en 1959 y cuartofinalista de la UEFA Europa League en 2021.',
      url: 'https://es.wikipedia.org/wiki/Granada_Club_de_F%C3%BAtbol',
    },
  },
  'cadiz': {
    fullName: 'Cádiz Club de Fútbol, S.A.D.',
    founded: '1910',
    location: 'Cádiz, Andalucía, España',
    website: 'www.cadizcf.com',
    kit: 'Camiseta amarilla, pantalón azul y medias amarillas.',
    venue: { name: 'Nuevo Mirandilla', city: 'Cádiz', address: 'Plaza de Madrid, s/n', capacity: 20724, opened: '1955' },
    description: {
      text: 'El Cádiz CF fue fundado en 1910 en la «Tacita de Plata». Símbolo de simpatía en el fútbol español gracias a su legendario Mágico González y su incondicional afición.',
      url: 'https://es.wikipedia.org/wiki/C%C3%A1diz_Club_de_F%C3%BAtbol',
    },
  },
  'malaga': {
    fullName: 'Málaga Club de Fútbol, S.A.D.',
    founded: '1904',
    location: 'Málaga, Andalucía, España',
    website: 'www.malagacf.com',
    kit: 'Camiseta blanquiazul a rayas verticales, pantalón azul y medias blancas.',
    venue: { name: 'La Rosaleda', city: 'Málaga', address: 'Paseo de Martiricos, s/n', capacity: 30044, opened: '1941' },
    description: {
      text: 'El Málaga Club de Fútbol representa a la capital de la Costa del Sol. Campeón de la Copa Intertoto en 2002 y cuartofinalista de la UEFA Champions League en 2013.',
      url: 'https://es.wikipedia.org/wiki/M%C3%A1laga_Club_de_F%C3%BAtbol',
    },
  },
  'tenerife': {
    fullName: 'Club Deportivo Tenerife, S.A.D.',
    founded: '1912',
    location: 'Santa Cruz de Tenerife, España',
    website: 'www.clubdeportivotenerife.es',
    kit: 'Camiseta blanca con detalles azules, pantalón azul y medias blancas.',
    venue: { name: 'Heliodoro Rodríguez López', city: 'Santa Cruz de Tenerife', address: 'Calle San Sebastián, s/n', capacity: 22824, opened: '1925' },
    description: {
      text: 'El CD Tenerife fue fundado en 1912 en la isla de Tenerife. Semifinalista de la Copa de la UEFA en 1997, disputa el Clásico Canario ante la UD Las Palmas.',
      url: 'https://es.wikipedia.org/wiki/Club_Deportivo_Tenerife',
    },
  },
  'castellon': {
    fullName: 'Club Deportivo Castellón, S.A.D.',
    founded: '1922',
    location: 'Castellón de la Plana, España',
    website: 'www.cdcastellon.com',
    kit: 'Camiseta albinegra a rayas verticales, pantalón blanco.',
    venue: { name: 'SkyFi Castalia', city: 'Castellón de la Plana', address: "Carrer d'Osca, s/n", capacity: 15500, opened: '1987' },
    description: {
      text: 'El CD Castellón fue fundado en 1922 en Castellón de la Plana. Subcampeón de la Copa del Rey en 1973 y club histórico de la Comunidad Valenciana.',
      url: 'https://es.wikipedia.org/wiki/Club_Deportivo_Castell%C3%B3n',
    },
  },
  'albacete': {
    fullName: 'Albacete Balompié, S.A.D.',
    founded: '1940',
    location: 'Albacete, Castilla-La Mancha, España',
    website: 'www.albacetebalompie.es',
    kit: 'Camiseta blanca, pantalón blanco y medias blancas.',
    venue: { name: 'Carlos Belmonte', city: 'Albacete', address: 'Av. de España, s/n', capacity: 17524, opened: '1960' },
    description: {
      text: 'El Albacete Balompié fue fundado en 1940. Célebre en los años noventa como el «Queso Mecánico» dirigido por Benito Floro.',
      url: 'https://es.wikipedia.org/wiki/Albacete_Balompi%C3%A9',
    },
  },
  'burgos': {
    fullName: 'Burgos Club de Fútbol, S.A.D.',
    founded: '1936',
    location: 'Burgos, Castilla y León, España',
    website: 'www.burgoscf.es',
    kit: 'Camiseta blanca, pantalón negro y medias blancas.',
    venue: { name: 'El Plantío', city: 'Burgos', address: 'Calle del Vena, s/n', capacity: 12194, opened: '1964' },
    description: {
      text: 'El Burgos Club de Fútbol representa a la ciudad castellana de Burgos. Disputa sus partidos en el estadio municipal de El Plantío.',
      url: 'https://es.wikipedia.org/wiki/Burgos_Club_de_F%C3%BAtbol',
    },
  },
  'cordoba': {
    fullName: 'Córdoba Club de Fútbol, S.A.D.',
    founded: '1954',
    location: 'Córdoba, Andalucía, España',
    website: 'www.cordobacf.com',
    kit: 'Camiseta blanquiverde a rayas verticales, pantalón blanco.',
    venue: { name: 'Nuevo Arcángel', city: 'Córdoba', address: 'Calle José Ramón García Fernández, s/n', capacity: 21822, opened: '1993' },
    description: {
      text: 'El Córdoba Club de Fútbol fue fundado en 1954 en la ciudad califal. Quinto clasificado de Primera División en 1965 y semifinalista de Copa en 1967.',
      url: 'https://es.wikipedia.org/wiki/C%C3%B3rdoba_Club_de_F%C3%BAtbol',
    },
  },

  // === PREMIER LEAGUE (INGLATERRA - 1ª) ===
  'arsenal': {
    fullName: 'Arsenal Football Club',
    founded: '1886',
    location: 'Londres (Islington), Inglaterra',
    website: 'www.arsenal.com',
    kit: 'Camiseta roja con mangas blancas, pantalón blanco y medias rojas.',
    venue: { name: 'Emirates Stadium', city: 'Londres', address: 'Hornsey Rd, London N7 7AJ', capacity: 60704, opened: '2006' },
    description: {
      text: 'El Arsenal FC fue fundado en 1886 en Woolwich («The Gunners»). Trece veces campeón de liga inglesa (incluidos «Los Invencibles» de 2004) y catorce veces de la FA Cup.',
      url: 'https://es.wikipedia.org/wiki/Arsenal_Football_Club',
    },
  },
  'manchester-city': {
    fullName: 'Manchester City Football Club',
    founded: '1880',
    location: 'Mánchester, Inglaterra',
    website: 'www.mancity.com',
    kit: 'Camiseta azul cielo, pantalón blanco y medias azul cielo.',
    venue: { name: 'Etihad Stadium', city: 'Mánchester', address: 'Ashton New Rd, Manchester M11 3FF', capacity: 53400, opened: '2003' },
    description: {
      text: "El Manchester City fue fundado en 1880 como St. Mark's. Campeón de la UEFA Champions League en 2023 con su triplete histórico y dominador hegemónico moderno de la Premier League.",
      url: 'https://es.wikipedia.org/wiki/Manchester_City_Football_Club',
    },
  },
  'liverpool': {
    fullName: 'Liverpool Football Club',
    founded: '1892',
    location: 'Liverpool, Inglaterra',
    website: 'www.liverpoolfc.com',
    kit: 'Camiseta roja, pantalón rojo y medias rojas.',
    venue: { name: 'Anfield', city: 'Liverpool', address: 'Anfield Rd, Liverpool L4 0TH', capacity: 61276, opened: '1884' },
    description: {
      text: "El Liverpool FC fue fundado en 1892 en Anfield. Seis veces campeón de Europa y diecinueve de la liga inglesa, célebre por su himno «You'll Never Walk Alone».",
      url: 'https://es.wikipedia.org/wiki/Liverpool_Football_Club',
    },
  },
  'manchester-united': {
    fullName: 'Manchester United Football Club',
    founded: '1878',
    location: 'Mánchester (Trafford), Inglaterra',
    website: 'www.manutd.com',
    kit: 'Camiseta roja, pantalón blanco y medias negras.',
    venue: { name: 'Old Trafford', city: 'Mánchester', address: 'Sir Matt Busby Way, Manchester M16 0RA', capacity: 74310, opened: '1910' },
    description: {
      text: 'El Manchester United, apodado los «Red Devils», fue fundado en 1878. Es el club con más títulos de liga inglesa (20) y tres Copas de Europa.',
      url: 'https://es.wikipedia.org/wiki/Manchester_United_Football_Club',
    },
  },
  'chelsea': {
    fullName: 'Chelsea Football Club',
    founded: '1905',
    location: 'Londres (Fulham), Inglaterra',
    website: 'www.chelseafc.com',
    kit: 'Camiseta azul royal, pantalón azul royal y medias blancas.',
    venue: { name: 'Stamford Bridge', city: 'Londres', address: 'Fulham Rd, London SW6 1HS', capacity: 40343, opened: '1877' },
    description: {
      text: 'El Chelsea FC fue fundado en 1905 en Londres. Bicampeón de la UEFA Champions League (2012, 2021) y seis veces campeón de Inglaterra.',
      url: 'https://es.wikipedia.org/wiki/Chelsea_Football_Club',
    },
  },
  'tottenham': {
    fullName: 'Tottenham Hotspur Football Club',
    founded: '1882',
    location: 'Londres (Tottenham), Inglaterra',
    website: 'www.tottenhamhotspur.com',
    kit: 'Camiseta blanca, pantalón azul marino y medias blancas.',
    venue: { name: 'Tottenham Hotspur Stadium', city: 'Londres', address: '782 High Rd, London N17 0BX', capacity: 62850, opened: '2019' },
    description: {
      text: 'El Tottenham Hotspur fue fundado en 1882 en el norte de Londres. Primer club británico en ganar un trofeo europeo (1963) y célebre por su lema «Audere est Facere».',
      url: 'https://es.wikipedia.org/wiki/Tottenham_Hotspur_Football_Club',
    },
  },
  'aston-villa': {
    fullName: 'Aston Villa Football Club',
    founded: '1874',
    location: 'Birmingham, Inglaterra',
    website: 'www.avfc.co.uk',
    kit: 'Camiseta granate con mangas celestes, pantalón blanco.',
    venue: { name: 'Villa Park', city: 'Birmingham', address: 'Trinity Rd, Birmingham B6 6HE', capacity: 42682, opened: '1897' },
    description: {
      text: 'El Aston Villa fue fundado en 1874 en Birmingham. Miembro fundador de la Football League en 1888, campeón de la Copa de Europa en 1982 y siete veces campeón inglés.',
      url: 'https://es.wikipedia.org/wiki/Aston_Villa_Football_Club',
    },
  },
  'newcastle': {
    fullName: 'Newcastle United Football Club',
    founded: '1892',
    location: 'Newcastle upon Tyne, Inglaterra',
    website: 'www.newcastleunited.com',
    kit: 'Camiseta blanquinegra a rayas verticales, pantalón negro.',
    venue: { name: "St James' Park", city: 'Newcastle upon Tyne', address: 'Barrack Rd, Newcastle NE1 4ST', capacity: 52305, opened: '1892' },
    description: {
      text: "El Newcastle United nació en 1892. Apodados «The Magpies», poseen cuatro títulos de liga inglesa y seis FA Cups en su histórico feudo de St James' Park.",
      url: 'https://es.wikipedia.org/wiki/Newcastle_United_Football_Club',
    },
  },

  // === EFL CHAMPIONSHIP (INGLATERRA - 2ª) ===
  'leeds': {
    fullName: 'Leeds United Football Club',
    founded: '1919',
    location: 'Leeds, Yorkshire del Oeste, Inglaterra',
    website: 'www.leedsunited.com',
    kit: 'Camiseta completamente blanca, pantalón blanco y medias blancas.',
    venue: { name: 'Elland Road', city: 'Leeds', address: 'Elland Rd, Leeds LS11 0ES', capacity: 37890, opened: '1897' },
    description: {
      text: 'El Leeds United fue fundado en 1919. Tricampeón de la primera división inglesa y finalista de la Copa de Europa en 1975, célebre por la época dorada de Don Revie.',
      url: 'https://es.wikipedia.org/wiki/Leeds_United_Football_Club',
    },
  },
  'wrexham': {
    fullName: 'Wrexham Association Football Club',
    founded: '1864',
    location: 'Wrexham, Gales',
    website: 'www.wrexhamafc.co.uk',
    kit: 'Camiseta roja, pantalón blanco y medias rojas.',
    venue: { name: 'STōK Cae Ras (Racecourse Ground)', city: 'Wrexham', address: 'Mold Rd, Wrexham LL11 2AH', capacity: 12600, opened: '1807' },
    description: {
      text: 'El Wrexham AFC fue fundado en 1864 en Gales. Es el tercer club profesional más antiguo del planeta y el Racecourse Ground es el estadio internacional más antiguo en uso continuo.',
      url: 'https://es.wikipedia.org/wiki/Wrexham_Association_Football_Club',
    },
  },
  'burnley': {
    fullName: 'Burnley Football Club',
    founded: '1882',
    location: 'Burnley, Lancashire, Inglaterra',
    website: 'www.burnleyfootballclub.com',
    kit: 'Camiseta granate con mangas celestes, pantalón blanco.',
    venue: { name: 'Turf Moor', city: 'Burnley', address: 'Harry Potts Way, Burnley BB10 4BX', capacity: 21944, opened: '1883' },
    description: {
      text: 'El Burnley FC fue fundado en 1882. Miembro fundador de la Football League en 1888 y bicampeón de la liga inglesa en Turf Moor.',
      url: 'https://es.wikipedia.org/wiki/Burnley_Football_Club',
    },
  },
  'sunderland': {
    fullName: 'Sunderland Association Football Club',
    founded: '1879',
    location: 'Sunderland, Tyne y Wear, Inglaterra',
    website: 'www.safc.com',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón negro.',
    venue: { name: 'Stadium of Light', city: 'Sunderland', address: 'Millennium Way, Sunderland SR5 1SU', capacity: 49000, opened: '1997' },
    description: {
      text: 'El Sunderland AFC fue fundado en 1879. Hexacampeón de la máxima categoría inglesa y bicampeón de FA Cup («The Black Cats»).',
      url: 'https://es.wikipedia.org/wiki/Sunderland_Association_Football_Club',
    },
  },
  'sheffield-united': {
    fullName: 'Sheffield United Football Club',
    founded: '1889',
    location: 'Sheffield, Yorkshire del Sur, Inglaterra',
    website: 'www.sufc.co.uk',
    kit: 'Camiseta rojiblanca a rayas verticales, pantalón negro.',
    venue: { name: 'Bramall Lane', city: 'Sheffield', address: 'Bramall Ln, Sheffield S2 4SU', capacity: 32050, opened: '1855' },
    description: {
      text: 'El Sheffield United («The Blades») fue fundado en 1889. Campeón inglés en 1898 y cuatro veces ganador de la FA Cup en Bramall Lane.',
      url: 'https://es.wikipedia.org/wiki/Sheffield_United_Football_Club',
    },
  },
  'west-brom': {
    fullName: 'West Bromwich Albion Football Club',
    founded: '1878',
    location: 'West Bromwich, Tierras Medias Occidentales, Inglaterra',
    website: 'www.wba.co.uk',
    kit: 'Camiseta a rayas verticales azul marino y blancas, pantalón blanco.',
    venue: { name: 'The Hawthorns', city: 'West Bromwich', address: 'Halfords Ln, West Bromwich B71 4LF', capacity: 26850, opened: '1900' },
    description: {
      text: 'El West Bromwich Albion («The Baggies») fue fundado en 1878. Miembro fundador de la Football League en 1888 y cinco veces ganador de la FA Cup.',
      url: 'https://es.wikipedia.org/wiki/West_Bromwich_Albion_Football_Club',
    },
  },
  'norwich': {
    fullName: 'Norwich City Football Club',
    founded: '1902',
    location: 'Norwich, Norfolk, Inglaterra',
    website: 'www.canaries.co.uk',
    kit: 'Camiseta amarilla con ribetes verdes, pantalón verde.',
    venue: { name: 'Carrow Road', city: 'Norwich', address: 'Carrow Rd, Norwich NR1 1JE', capacity: 27244, opened: '1935' },
    description: {
      text: 'El Norwich City fue fundado en 1902 en Norfolk. Apodados «The Canaries», dos veces campeones de la Copa de la Liga inglesa.',
      url: 'https://es.wikipedia.org/wiki/Norwich_City_Football_Club',
    },
  },

  // === GRANDES DE ITALIA, ALEMANIA Y FRANCIA ===
  'inter': {
    fullName: 'Football Club Internazionale Milano S.p.A.',
    founded: '1908',
    location: 'Milán, Lombardía, Italia',
    website: 'www.inter.it',
    kit: 'Camiseta nerazzurra a rayas verticales negras y azules, pantalón negro.',
    venue: { name: 'Giuseppe Meazza (San Siro)', city: 'Milán', address: 'Piazzale Angelo Moratti, 20151 Milano', capacity: 75923, opened: '1926' },
    description: {
      text: 'El Inter de Milán fue fundado en 1908. Único club italiano que nunca ha descendido de la Serie A, posee 20 scudetti y tres Copas de Europa.',
      url: 'https://es.wikipedia.org/wiki/Inter_de_Mil%C3%A1n',
    },
  },
  'juventus': {
    fullName: 'Juventus Football Club S.p.A.',
    founded: '1897',
    location: 'Turín, Piamonte, Italia',
    website: 'www.juventus.com',
    kit: 'Camiseta bianconera a rayas verticales blancas y negras, pantalón blanco.',
    venue: { name: 'Allianz Stadium', city: 'Turín', address: 'Corso Gaetano Scirea, 50, 10151 Torino', capacity: 41507, opened: '2011' },
    description: {
      text: 'La Juventus («La Vecchia Signora») fue fundada en 1897 en Turín. Es el club más laureado del fútbol italiano con 36 títulos de Serie A y dos Copas de Europa.',
      url: 'https://es.wikipedia.org/wiki/Juventus_Football_Club',
    },
  },
  'milan': {
    fullName: 'Associazione Calcio Milan S.p.A.',
    founded: '1899',
    location: 'Milán, Lombardía, Italia',
    website: 'www.acmilan.com',
    kit: 'Camiseta rossonera a rayas verticales rojas y negras, pantalón blanco.',
    venue: { name: 'San Siro', city: 'Milán', address: 'Piazzale Angelo Moratti, 20151 Milano', capacity: 75923, opened: '1926' },
    description: {
      text: 'El AC Milan fue fundado en 1899. Es el segundo club con más títulos de la UEFA Champions League de la historia (7) y 19 veces campeón de Italia.',
      url: 'https://es.wikipedia.org/wiki/Associazione_Calcio_Milan',
    },
  },
  'bayern': {
    fullName: 'Fußball-Club Bayern München e. V.',
    founded: '1900',
    location: 'Múnich, Baviera, Alemania',
    website: 'www.fcbayern.com',
    kit: 'Camiseta roja con detalles blancos, pantalón blanco y medias rojas.',
    venue: { name: 'Allianz Arena', city: 'Múnich', address: 'Werner-Heisenberg-Allee 25, 80939 München', capacity: 75024, opened: '2005' },
    description: {
      text: 'El Bayern de Múnich fue fundado en 1900. Club hegemónico de Alemania con 33 títulos de Bundesliga y seis Copas de Europa.',
      url: 'https://es.wikipedia.org/wiki/Bayern_de_M%C3%BAnich',
    },
  },
  'dortmund': {
    fullName: 'Ballspielverein Borussia 09 e. V. Dortmund',
    founded: '1909',
    location: 'Dortmund, Renania del Norte-Westfalia, Alemania',
    website: 'www.bvb.de',
    kit: 'Camiseta amarilla con detalles negros, pantalón negro.',
    venue: { name: 'Signal Iduna Park (Westfalenstadion)', city: 'Dortmund', address: 'Strobelallee 50, 44139 Dortmund', capacity: 81365, opened: '1974' },
    description: {
      text: 'El Borussia Dortmund fue fundado en 1909. Campeón de Europa en 1997, legendario por su grada del «Muro Amarillo» con 25.000 aficionados de pie.',
      url: 'https://es.wikipedia.org/wiki/Borussia_Dortmund',
    },
  },
  'psg': {
    fullName: 'Paris Saint-Germain Football Club',
    founded: '1970',
    location: 'París, Francia',
    website: 'www.psg.fr',
    kit: 'Camiseta azul marino con franja central roja y blanca, pantalón azul.',
    venue: { name: 'Parque de los Príncipes', city: 'París', address: '24 Rue du Commandant Guilbaud, 75016 Paris', capacity: 47929, opened: '1972' },
    description: {
      text: 'El Paris Saint-Germain nació en 1970 en París. Es el club más laureado de Francia con doce títulos de Ligue 1 y quince Copas de Francia.',
      url: 'https://es.wikipedia.org/wiki/Paris_Saint-Germain_Football_Club',
    },
  },

  // === CLUBES ADICIONALES (INGLATERRA, ESPAÑA Y EUROPA) ===
  'huesca': {
      "fullName": "Sociedad Deportiva Huesca, S.A.D.",
      "founded": "1960",
      "location": "Huesca, Aragón, España",
      "website": "www.sdhuesca.es",
      "kit": "Camiseta azulgrana a rayas verticales, pantalón azul y medias azulgranas.",
      "venue": {
          "name": "El Alcoraz",
          "city": "Huesca",
          "address": "Camino Cocorón, s/n",
          "capacity": 9100,
          "opened": "1972"
      },
      "description": {
          "text": "La SD Huesca fue fundada en 1960 en Huesca. El club oscense logró el histórico ascenso a Primera División en 2018 y 2020 con su lema «Fieles siempre, sin reblar».",
          "url": "https://es.wikipedia.org/wiki/Sociedad_Deportiva_Huesca"
      }
  },
  'racing-ferrol': {
      "fullName": "Racing Club de Ferrol, S.A.D.",
      "founded": "1919",
      "location": "Ferrol, La Coruña, Galicia, España",
      "website": "www.racingclubferrol.net",
      "kit": "Camiseta verde, pantalón blanco y medias verdes.",
      "venue": {
          "name": "A Malata",
          "city": "Ferrol",
          "address": "Estrada Alta do Porto, s/n",
          "capacity": 12043,
          "opened": "1993"
      },
      "description": {
          "text": "El Racing Club de Ferrol fue fundado en 1919 en la ciudad naval de Ferrol. Histórico del fútbol gallego, finalista de la Copa de España en 1939.",
          "url": "https://es.wikipedia.org/wiki/Racing_Club_de_Ferrol"
      }
  },
  'eldense': {
      "fullName": "Club Deportivo Eldense, S.A.D.",
      "founded": "1921",
      "location": "Elda, Alicante, España",
      "website": "www.cdeldense.es",
      "kit": "Camiseta azulgrana a franjas verticales, pantalón azul y medias azules.",
      "venue": {
          "name": "Nuevo Pepico Amat",
          "city": "Elda",
          "address": "Calle de la Hípica, s/n",
          "capacity": 4036,
          "opened": "2012"
      },
      "description": {
          "text": "El Club Deportivo Eldense es uno de los clubes más antiguos de la Comunidad Valenciana, fundado en 1921 en Elda. Logró un sonado regreso al fútbol profesional en 2023.",
          "url": "https://es.wikipedia.org/wiki/Club_Deportivo_Eldense"
      }
  },
  'mirandes': {
      "fullName": "Club Deportivo Mirandés, S.A.D.",
      "founded": "1927",
      "location": "Miranda de Ebro, Burgos, España",
      "website": "www.cdmirandes.com",
      "kit": "Camiseta roja con mangas negras, pantalón negro y medias rojas.",
      "venue": {
          "name": "Estadio Municipal de Anduva",
          "city": "Miranda de Ebro",
          "address": "Calle Anduva, s/n",
          "capacity": 5759,
          "opened": "1950"
      },
      "description": {
          "text": "El CD Mirandés fue fundado en 1927 en Miranda de Ebro. Célebre por sus gestas coperas alcanzando las semifinales de la Copa del Rey en 2012 y 2020.",
          "url": "https://es.wikipedia.org/wiki/Club_Deportivo_Mirand%C3%A9s"
      }
  },
  'cartagena': {
      "fullName": "Fútbol Club Cartagena, S.A.D.",
      "founded": "1995",
      "location": "Cartagena, Región de Murcia, España",
      "website": "www.fccartagena.es",
      "kit": "Camiseta albinegra a rayas verticales, pantalón negro y medias blancas.",
      "venue": {
          "name": "Estadio Municipal Cartagonova",
          "city": "Cartagena",
          "address": "Calle Doctor Luis Calandre, s/n",
          "capacity": 15105,
          "opened": "1988"
      },
      "description": {
          "text": "El FC Cartagena («Efesé») fue fundado en 1995 en la histórica ciudad trimilenaria de Cartagena. Disputa sus partidos en el estadio Cartagonova.",
          "url": "https://es.wikipedia.org/wiki/F%C3%BAtbol_Club_Cartagena"
      }
  },
  'bournemouth': {
      "fullName": "AFC Bournemouth",
      "founded": "1899",
      "location": "Bournemouth, Dorset, Inglaterra",
      "website": "www.afcb.co.uk",
      "kit": "Camiseta a rayas verticales rojas y negras, pantalón negro y medias rojas.",
      "venue": {
          "name": "Vitality Stadium (Dean Court)",
          "city": "Bournemouth",
          "address": "Kings Park, Bournemouth BH7 7AF",
          "capacity": 11307,
          "opened": "1910"
      },
      "description": {
          "text": "El AFC Bournemouth fue fundado en 1899 bajo el nombre de Boscombe FC. Conocidos como «The Cherries», ascendieron a la Premier League en 2015 por primera vez en su historia.",
          "url": "https://es.wikipedia.org/wiki/AFC_Bournemouth"
      }
  },
  'brentford': {
      "fullName": "Brentford Football Club",
      "founded": "1889",
      "location": "Londres (Brentford), Inglaterra",
      "website": "www.brentfordfc.com",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón negro y medias negras.",
      "venue": {
          "name": "Gtech Community Stadium",
          "city": "Londres",
          "address": "Lionel Rd S, Brentford TW8 0RU",
          "capacity": 17250,
          "opened": "2020"
      },
      "description": {
          "text": "El Brentford FC fue fundado en 1889 en el oeste de Londres («The Bees»). Célebre por su pionero modelo estadístico de datos y su dinámico estilo en la Premier League.",
          "url": "https://es.wikipedia.org/wiki/Brentford_Football_Club"
      }
  },
  'brighton': {
      "fullName": "Brighton & Hove Albion Football Club",
      "founded": "1901",
      "location": "Brighton y Hove, Sussex Oriental, Inglaterra",
      "website": "www.brightonandhovealbion.com",
      "kit": "Camiseta blanquiazul a rayas verticales, pantalón azul y medias blancas.",
      "venue": {
          "name": "American Express Stadium (Amex Stadium)",
          "city": "Brighton",
          "address": "Village Way, Brighton BN1 9BL",
          "capacity": 31876,
          "opened": "2011"
      },
      "description": {
          "text": "El Brighton & Hove Albion («The Seagulls») fue fundado en 1901 en la costa sur inglesa. Reconocido internacionalmente por su brillante captación de talento y fútbol vistoso.",
          "url": "https://es.wikipedia.org/wiki/Brighton_%26_Hove_Albion_Football_Club"
      }
  },
  'crystal-palace': {
      "fullName": "Crystal Palace Football Club",
      "founded": "1905",
      "location": "Londres (South Norwood), Inglaterra",
      "website": "www.cpfc.co.uk",
      "kit": "Camiseta a franjas verticales rojas y azules, pantalón azul y medias azules.",
      "venue": {
          "name": "Selhurst Park",
          "city": "Londres",
          "address": "Holmesdale Rd, London SE25 6PU",
          "capacity": 25486,
          "opened": "1924"
      },
      "description": {
          "text": "El Crystal Palace FC («The Eagles») fue fundado en 1905 en el emblemático palacio de cristal de Londres. Su estadio de Selhurst Park es famoso por el fervor de su afición.",
          "url": "https://es.wikipedia.org/wiki/Crystal_Palace_Football_Club"
      }
  },
  'everton': {
      "fullName": "Everton Football Club",
      "founded": "1878",
      "location": "Liverpool, Merseyside, Inglaterra",
      "website": "www.evertonfc.com",
      "kit": "Camiseta azul royal, pantalón blanco y medias blancas.",
      "venue": {
          "name": "Goodison Park",
          "city": "Liverpool",
          "address": "Goodison Rd, Liverpool L4 4EL",
          "capacity": 39572,
          "opened": "1892"
      },
      "description": {
          "text": "El Everton FC («The Toffees») fue fundado en 1878 en Liverpool. Miembro fundador de la Football League en 1888, posee nueve títulos de liga inglesa.",
          "url": "https://es.wikipedia.org/wiki/Everton_Football_Club"
      }
  },
  'fulham': {
      "fullName": "Fulham Football Club",
      "founded": "1879",
      "location": "Londres (Fulham), Inglaterra",
      "website": "www.fulhamfc.com",
      "kit": "Camiseta blanca, pantalón negro y medias blancas.",
      "venue": {
          "name": "Craven Cottage",
          "city": "Londres",
          "address": "Stevenage Rd, London SW6 6HH",
          "capacity": 29600,
          "opened": "1896"
      },
      "description": {
          "text": "El Fulham FC es el club profesional más antiguo de Londres, fundado en 1879. Su estadio ribereño a orillas del Támesis, Craven Cottage, es un tesoro arquitectónico del fútbol.",
          "url": "https://es.wikipedia.org/wiki/Fulham_Football_Club"
      }
  },
  'ipswich': {
      "fullName": "Ipswich Town Football Club",
      "founded": "1878",
      "location": "Ipswich, Suffolk, Inglaterra",
      "website": "www.itfc.co.uk",
      "kit": "Camiseta azul con ribetes blancos, pantalón blanco y medias azules.",
      "venue": {
          "name": "Portman Road",
          "city": "Ipswich",
          "address": "Portman Rd, Ipswich IP1 2DA",
          "capacity": 30014,
          "opened": "1884"
      },
      "description": {
          "text": "El Ipswich Town («The Tractor Boys») fue fundado en 1878. Campeón de Inglaterra en 1962 con Alf Ramsey y de la Copa de la UEFA en 1981 con Bobby Robson.",
          "url": "https://es.wikipedia.org/wiki/Ipswich_Town_Football_Club"
      }
  },
  'leicester': {
      "fullName": "Leicester City Football Club",
      "founded": "1884",
      "location": "Leicester, Tierras Medias Orientales, Inglaterra",
      "website": "www.lcfc.com",
      "kit": "Camiseta azul rey, pantalón blanco y medias azules.",
      "venue": {
          "name": "King Power Stadium",
          "city": "Leicester",
          "address": "Filbert Way, Leicester LE2 7FL",
          "capacity": 32262,
          "opened": "2002"
      },
      "description": {
          "text": "El Leicester City («The Foxes») protagonizó en 2016 una de las mayores hazañas del deporte mundial al proclamarse campeón de la Premier League contra todo pronóstico.",
          "url": "https://es.wikipedia.org/wiki/Leicester_City_Football_Club"
      }
  },
  'nottingham-forest': {
      "fullName": "Nottingham Forest Football Club",
      "founded": "1865",
      "location": "West Bridgford, Nottinghamshire, Inglaterra",
      "website": "www.nottinghamforest.co.uk",
      "kit": "Camiseta roja («Garibaldi red»), pantalón blanco y medias rojas.",
      "venue": {
          "name": "City Ground",
          "city": "Nottingham",
          "address": "Pavilion Rd, West Bridgford, Nottingham NG2 5FJ",
          "capacity": 30445,
          "opened": "1898"
      },
      "description": {
          "text": "El Nottingham Forest fue fundado en 1865. Bicampeón consecutivo de la Copa de Europa (1979 y 1980) bajo la legendaria dirección de Brian Clough.",
          "url": "https://es.wikipedia.org/wiki/Nottingham_Forest_Football_Club"
      }
  },
  'southampton': {
      "fullName": "Southampton Football Club",
      "founded": "1885",
      "location": "Southampton, Hampshire, Inglaterra",
      "website": "www.southamptonfc.com",
      "kit": "Camiseta rojiblanca a franjas verticales, pantalón negro y medias blancas.",
      "venue": {
          "name": "St Mary's Stadium",
          "city": "Southampton",
          "address": "Britannia Rd, Southampton SO14 5FP",
          "capacity": 32384,
          "opened": "2001"
      },
      "description": {
          "text": "El Southampton FC («The Saints») fue fundado en 1885 en Southampton. Campeón de la FA Cup en 1976 y afamado por su histórica academia de canteranos.",
          "url": "https://es.wikipedia.org/wiki/Southampton_Football_Club"
      }
  },
  'west-ham': {
      "fullName": "West Ham United Football Club",
      "founded": "1895",
      "location": "Londres (Stratford), Inglaterra",
      "website": "www.whufc.com",
      "kit": "Camiseta granate con mangas celestes («Claret and Blue»), pantalón blanco.",
      "venue": {
          "name": "London Stadium",
          "city": "Londres",
          "address": "Queen Elizabeth Olympic Park, London E20 2ST",
          "capacity": 62500,
          "opened": "2012"
      },
      "description": {
          "text": "El West Ham United («The Hammers») nació en 1895 como Thames Ironworks. Campeón de la UEFA Conference League en 2023 y tres veces de la FA Cup en su himno «Forever Blowing Bubbles».",
          "url": "https://es.wikipedia.org/wiki/West_Ham_United_Football_Club"
      }
  },
  'wolves': {
      "fullName": "Wolverhampton Wanderers Football Club",
      "founded": "1877",
      "location": "Wolverhampton, Tierras Medias Occidentales, Inglaterra",
      "website": "www.wolves.co.uk",
      "kit": "Camiseta oro viejo («Old Gold»), pantalón negro y medias doradas.",
      "venue": {
          "name": "Molineux Stadium",
          "city": "Wolverhampton",
          "address": "Waterloo Rd, Wolverhampton WV1 4QR",
          "capacity": 32050,
          "opened": "1889"
      },
      "description": {
          "text": "El Wolverhampton Wanderers fue fundado en 1877 y fue miembro fundador de la liga inglesa. Tricampeón de Inglaterra en los años cincuenta pionero de las competiciones europeas de clubes.",
          "url": "https://es.wikipedia.org/wiki/Wolverhampton_Wanderers_Football_Club"
      }
  },
  'birmingham': {
      "fullName": "Birmingham City Football Club",
      "founded": "1875",
      "location": "Birmingham, Inglaterra",
      "website": "www.bcfc.com",
      "kit": "Camiseta azul royal, pantalón blanco y medias azules.",
      "venue": {
          "name": "St Andrew's @ Knighthead Park",
          "city": "Birmingham",
          "address": "Cattell Rd, Birmingham B9 4RL",
          "capacity": 29409,
          "opened": "1906"
      },
      "description": {
          "text": "El Birmingham City FC («The Blues») fue fundado en 1875 como Small Heath Alliance. Bicampeón de la Copa de la Liga inglesa, disputa el clásico de la Segunda Ciudad contra el Aston Villa.",
          "url": "https://es.wikipedia.org/wiki/Birmingham_City_Football_Club"
      }
  },
  'blackburn': {
      "fullName": "Blackburn Rovers Football Club",
      "founded": "1875",
      "location": "Blackburn, Lancashire, Inglaterra",
      "website": "www.rovers.co.uk",
      "kit": "Camiseta mitad azul y mitad blanca, pantalón blanco.",
      "venue": {
          "name": "Ewood Park",
          "city": "Blackburn",
          "address": "Nutall St, Blackburn BB2 4JF",
          "capacity": 31367,
          "opened": "1882"
      },
      "description": {
          "text": "El Blackburn Rovers fue fundado en 1875. Miembro fundador de la Football League en 1888 y campeón de la Premier League en 1995 con Alan Shearer.",
          "url": "https://es.wikipedia.org/wiki/Blackburn_Rovers_Football_Club"
      }
  },
  'bristol-city': {
      "fullName": "Bristol City Football Club",
      "founded": "1894",
      "location": "Bristol, Inglaterra",
      "website": "www.bcfc.co.uk",
      "kit": "Camiseta roja con ribetes blancos, pantalón blanco y medias rojas.",
      "venue": {
          "name": "Ashton Gate",
          "city": "Bristol",
          "address": "Ashton Rd, Bristol BS3 2EJ",
          "capacity": 27000,
          "opened": "1887"
      },
      "description": {
          "text": "El Bristol City («The Robins») fue fundado en 1894 en la ciudad de Bristol. Subcampeón de la First Division en 1907 y finalista de la FA Cup en 1909.",
          "url": "https://es.wikipedia.org/wiki/Bristol_City_Football_Club"
      }
  },
  'cardiff': {
      "fullName": "Cardiff City Football Club",
      "founded": "1899",
      "location": "Cardiff, Gales",
      "website": "www.cardiffcityfc.co.uk",
      "kit": "Camiseta azul, pantalón blanco y medias azules.",
      "venue": {
          "name": "Cardiff City Stadium",
          "city": "Cardiff",
          "address": "Leckwith Rd, Cardiff CF11 8AZ",
          "capacity": 33280,
          "opened": "2009"
      },
      "description": {
          "text": "El Cardiff City («The Bluebirds») fue fundado en 1899 en la capital de Gales. Es el único club no inglés que ha conquistado la FA Cup británica (1927).",
          "url": "https://es.wikipedia.org/wiki/Cardiff_City_Football_Club"
      }
  },
  'coventry': {
      "fullName": "Coventry City Football Club",
      "founded": "1883",
      "location": "Coventry, Tierras Medias Occidentales, Inglaterra",
      "website": "www.ccfc.co.uk",
      "kit": "Camiseta azul cielo, pantalón azul cielo y medias azul cielo.",
      "venue": {
          "name": "Coventry Building Society Arena",
          "city": "Coventry",
          "address": "Judds Ln, Coventry CV6 6GE",
          "capacity": 32609,
          "opened": "2005"
      },
      "description": {
          "text": "El Coventry City («The Sky Blues») nació en 1883 como Singers FC. Campeón de la FA Cup en 1987 en una histórica final disputada en Wembley ante el Tottenham.",
          "url": "https://es.wikipedia.org/wiki/Coventry_City_Football_Club"
      }
  },
  'derby': {
      "fullName": "Derby County Football Club",
      "founded": "1884",
      "location": "Derby, Derbyshire, Inglaterra",
      "website": "www.dcfc.co.uk",
      "kit": "Camiseta blanca con detalles negros, pantalón negro y medias blancas.",
      "venue": {
          "name": "Pride Park Stadium",
          "city": "Derby",
          "address": "Pride Park, Derby DE24 8XL",
          "capacity": 33597,
          "opened": "1997"
      },
      "description": {
          "text": "El Derby County («The Rams») fue fundado en 1884 y fue miembro fundador de la Football League en 1888. Bicampeón de la liga inglesa en los años setenta con Brian Clough.",
          "url": "https://es.wikipedia.org/wiki/Derby_County_Football_Club"
      }
  },
  'hull': {
      "fullName": "Hull City Association Football Club",
      "founded": "1904",
      "location": "Kingston upon Hull, Yorkshire del Este, Inglaterra",
      "website": "www.wearehullcity.co.uk",
      "kit": "Camiseta a franjas negras y ámbar, pantalón negro.",
      "venue": {
          "name": "MKM Stadium",
          "city": "Kingston upon Hull",
          "address": "Walton St, Hull HU3 6HU",
          "capacity": 25586,
          "opened": "2002"
      },
      "description": {
          "text": "El Hull City («The Tigers») fue fundado en 1904. Finalista de la FA Cup en 2014, lo que le permitió disputar competición europea por primera vez.",
          "url": "https://es.wikipedia.org/wiki/Hull_City_Association_Football_Club"
      }
  },
  'luton': {
      "fullName": "Luton Town Football Club",
      "founded": "1885",
      "location": "Luton, Bedfordshire, Inglaterra",
      "website": "www.lutontown.co.uk",
      "kit": "Camiseta naranja, pantalón azul marino y medias blancas.",
      "venue": {
          "name": "Kenilworth Road",
          "city": "Luton",
          "address": "1 Maple Rd E, Luton LU4 8AW",
          "capacity": 12000,
          "opened": "1905"
      },
      "description": {
          "text": "El Luton Town («The Hatters») fue fundado en 1885. Campeón de la Copa de la Liga en 1988, protagonizó un meteórico regreso desde la quinta división hasta la Premier League.",
          "url": "https://es.wikipedia.org/wiki/Luton_Town_Football_Club"
      }
  },
  'middlesbrough': {
      "fullName": "Middlesbrough Football Club",
      "founded": "1876",
      "location": "Middlesbrough, Yorkshire del Norte, Inglaterra",
      "website": "www.mfc.co.uk",
      "kit": "Camiseta roja con banda blanca en el pecho, pantalón rojo.",
      "venue": {
          "name": "Riverside Stadium",
          "city": "Middlesbrough",
          "address": "Riverside Stadium, Middlesbrough TS3 6RS",
          "capacity": 34742,
          "opened": "1995"
      },
      "description": {
          "text": "El Middlesbrough FC («Boro») fue fundado en 1876. Campeón de la Copa de la Liga inglesa en 2004 y finalista de la Copa de la UEFA en 2006.",
          "url": "https://es.wikipedia.org/wiki/Middlesbrough_Football_Club"
      }
  },
  'millwall': {
      "fullName": "Millwall Football Club",
      "founded": "1885",
      "location": "Londres (Bermondsey), Inglaterra",
      "website": "www.millwallfc.co.uk",
      "kit": "Camiseta azul marino, pantalón blanco y medias azules.",
      "venue": {
          "name": "The Den",
          "city": "Londres",
          "address": "Zampa Rd, London SE16 3LN",
          "capacity": 20146,
          "opened": "1993"
      },
      "description": {
          "text": "El Millwall FC («The Lions») nació en 1885 fundado por trabajadores de las fábricas mermeleras de la Isla de Perros en Londres. Finalista de la FA Cup en 2004.",
          "url": "https://es.wikipedia.org/wiki/Millwall_Football_Club"
      }
  },
  'oxford': {
      "fullName": "Oxford United Football Club",
      "founded": "1893",
      "location": "Oxford, Oxfordshire, Inglaterra",
      "website": "www.oufc.co.uk",
      "kit": "Camiseta amarilla, pantalón azul marino y medias amarillas.",
      "venue": {
          "name": "Kassam Stadium",
          "city": "Oxford",
          "address": "Grenoble Rd, Oxford OX4 4XP",
          "capacity": 12500,
          "opened": "2001"
      },
      "description": {
          "text": "El Oxford United («The U's») fue fundado en 1893 como Headington United. Campeón de la Copa de la Liga inglesa en 1986 ante el Atlético de Madrid.",
          "url": "https://es.wikipedia.org/wiki/Oxford_United_Football_Club"
      }
  },
  'plymouth': {
      "fullName": "Plymouth Argyle Football Club",
      "founded": "1886",
      "location": "Plymouth, Devon, Inglaterra",
      "website": "www.pafc.co.uk",
      "kit": "Camiseta verde oscuro, pantalón negro y medias blancas.",
      "venue": {
          "name": "Home Park",
          "city": "Plymouth",
          "address": "Home Park, Plymouth PL2 3DQ",
          "capacity": 17900,
          "opened": "1901"
      },
      "description": {
          "text": "El Plymouth Argyle («The Pilgrims») fue fundado en 1886 en el extremo suroeste de Inglaterra. Disputa sus encuentros en el legendario feudo de Home Park.",
          "url": "https://es.wikipedia.org/wiki/Plymouth_Argyle_Football_Club"
      }
  },
  'portsmouth': {
      "fullName": "Portsmouth Football Club",
      "founded": "1898",
      "location": "Portsmouth, Hampshire, Inglaterra",
      "website": "www.portsmouthfc.co.uk",
      "kit": "Camiseta azul, pantalón blanco y medias rojas.",
      "venue": {
          "name": "Fratton Park",
          "city": "Portsmouth",
          "address": "Frogmore Rd, Portsmouth PO4 8RA",
          "capacity": 20895,
          "opened": "1899"
      },
      "description": {
          "text": "El Portsmouth FC («Pompey») fue fundado en 1898 en la ciudad costera de Portsmouth. Bicampeón de Inglaterra (1949, 1950) y bicampeón de la FA Cup (1939, 2008).",
          "url": "https://es.wikipedia.org/wiki/Portsmouth_Football_Club"
      }
  },
  'preston': {
      "fullName": "Preston North End Football Club",
      "founded": "1880",
      "location": "Preston, Lancashire, Inglaterra",
      "website": "www.pnefc.net",
      "kit": "Camiseta blanca, pantalón azul marino y medias blancas.",
      "venue": {
          "name": "Deepdale",
          "city": "Preston",
          "address": "Sir Tom Finney Way, Preston PR1 6RU",
          "capacity": 23404,
          "opened": "1875"
      },
      "description": {
          "text": "El Preston North End fue el primer campeón de la liga inglesa en 1888-89 como «Los Invencibles» sin perder un solo encuentro. Su estadio Deepdale es el más antiguo en uso continuo del fútbol mundial.",
          "url": "https://es.wikipedia.org/wiki/Preston_North_End_Football_Club"
      }
  },
  'qpr': {
      "fullName": "Queens Park Rangers Football Club",
      "founded": "1882",
      "location": "Londres (Shepherd's Bush), Inglaterra",
      "website": "www.qpr.co.uk",
      "kit": "Camiseta a franjas horizontales azules y blancas («Hoops»), pantalón blanco.",
      "venue": {
          "name": "MATRADE Loftus Road",
          "city": "Londres",
          "address": "South Africa Rd, London W12 7PJ",
          "capacity": 18439,
          "opened": "1904"
      },
      "description": {
          "text": "El Queens Park Rangers («QPR») fue fundado en 1882 en el oeste de Londres. Campeón de la Copa de la Liga en 1967 y subcampeón de liga en 1976.",
          "url": "https://es.wikipedia.org/wiki/Queens_Park_Rangers_Football_Club"
      }
  },
  'sheffield-wednesday': {
      "fullName": "Sheffield Wednesday Football Club",
      "founded": "1867",
      "location": "Sheffield, Yorkshire del Sur, Inglaterra",
      "website": "www.swfc.co.uk",
      "kit": "Camiseta a rayas verticales azules y blancas, pantalón negro.",
      "venue": {
          "name": "Hillsborough Stadium",
          "city": "Sheffield",
          "address": "Hillsborough, Sheffield S6 1SW",
          "capacity": 39732,
          "opened": "1899"
      },
      "description": {
          "text": "El Sheffield Wednesday («The Owls») nació en 1867 originado como club de cricket. Tetracampeón de Inglaterra y tricampeón de la FA Cup en el histórico Hillsborough.",
          "url": "https://es.wikipedia.org/wiki/Sheffield_Wednesday_Football_Club"
      }
  },
  'stoke': {
      "fullName": "Stoke City Football Club",
      "founded": "1863",
      "location": "Stoke-on-Trent, Staffordshire, Inglaterra",
      "website": "www.stokecityfc.com",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón blanco.",
      "venue": {
          "name": "bet365 Stadium",
          "city": "Stoke-on-Trent",
          "address": "Stanley Matthews Way, Stoke-on-Trent ST4 4EG",
          "capacity": 30089,
          "opened": "1997"
      },
      "description": {
          "text": "El Stoke City («The Potters») fue fundado en 1863 y es el segundo club profesional más antiguo del mundo. Miembro fundador de la Football League en 1888.",
          "url": "https://es.wikipedia.org/wiki/Stoke_City_Football_Club"
      }
  },
  'swansea': {
      "fullName": "Swansea City Association Football Club",
      "founded": "1912",
      "location": "Swansea, Gales",
      "website": "www.swanseacity.com",
      "kit": "Camiseta completamente blanca, pantalón blanco y medias blancas.",
      "venue": {
          "name": "Swansea.com Stadium",
          "city": "Swansea",
          "address": "Landore, Swansea SA1 2FA",
          "capacity": 21088,
          "opened": "2005"
      },
      "description": {
          "text": "El Swansea City («The Swans») fue fundado en 1912 en Gales. Campeón de la Copa de la Liga inglesa en 2013 con Michael Laudrup desplegando un juego de toque memorable.",
          "url": "https://es.wikipedia.org/wiki/Swansea_City_Association_Football_Club"
      }
  },
  'watford': {
      "fullName": "Watford Football Club",
      "founded": "1881",
      "location": "Watford, Hertfordshire, Inglaterra",
      "website": "www.watfordfc.com",
      "kit": "Camiseta amarilla con ribetes negros, pantalón negro y medias amarillas.",
      "venue": {
          "name": "Vicarage Road",
          "city": "Watford",
          "address": "Vicarage Rd, Watford WD18 0ER",
          "capacity": 22200,
          "opened": "1922"
      },
      "description": {
          "text": "El Watford FC («The Hornets») fue fundado en 1881. Históricamente ligado a Sir Elton John como presidente de honor y subcampeón de liga y FA Cup en los años ochenta.",
          "url": "https://es.wikipedia.org/wiki/Watford_Football_Club"
      }
  },
  'afc-wimbledon': {
      "fullName": "AFC Wimbledon",
      "founded": "2002",
      "location": "Londres (Wimbledon), Inglaterra",
      "website": "www.afcwimbledon.co.uk",
      "kit": "Camiseta azul royal con franja amarilla, pantalón azul y medias azules.",
      "venue": {
          "name": "Cherry Red Records Stadium (Plough Lane)",
          "city": "Londres",
          "address": "Plough Ln, London SW17 0NR",
          "capacity": 9215,
          "opened": "2020"
      },
      "description": {
          "text": "El AFC Wimbledon nació en 2002 fundado por los propios aficionados tras la mudanza del histórico Wimbledon FC a Milton Keynes. Ejemplo mundial de club propiedad de su masa social.",
          "url": "https://es.wikipedia.org/wiki/AFC_Wimbledon"
      }
  },
  'barnsley': {
      "fullName": "Barnsley Football Club",
      "founded": "1887",
      "location": "Barnsley, Yorkshire del Sur, Inglaterra",
      "website": "www.barnsleyfc.co.uk",
      "kit": "Camiseta roja, pantalón blanco y medias rojas.",
      "venue": {
          "name": "Oakwell",
          "city": "Barnsley",
          "address": "Grove St, Barnsley S71 1ET",
          "capacity": 23287,
          "opened": "1888"
      },
      "description": {
          "text": "El Barnsley FC («The Tykes») fue fundado en 1887. Campeón de la FA Cup en 1912 y club con el récord histórico de temporadas disputadas en la segunda división inglesa.",
          "url": "https://es.wikipedia.org/wiki/Barnsley_Football_Club"
      }
  },
  'blackpool': {
      "fullName": "Blackpool Football Club",
      "founded": "1887",
      "location": "Blackpool, Lancashire, Inglaterra",
      "website": "www.blackpoolfc.co.uk",
      "kit": "Camiseta naranja mandarina («Tangerine»), pantalón blanco y medias naranjas.",
      "venue": {
          "name": "Bloomfield Road",
          "city": "Blackpool",
          "address": "Seasiders Way, Blackpool FY1 6JJ",
          "capacity": 17338,
          "opened": "1899"
      },
      "description": {
          "text": "El Blackpool FC («The Seasiders») fue fundado en 1887 en la costa de Lancashire. Campeón de la célebre final de FA Cup de 1953 («la final de Stanley Matthews»).",
          "url": "https://es.wikipedia.org/wiki/Blackpool_Football_Club"
      }
  },
  'bolton': {
      "fullName": "Bolton Wanderers Football Club",
      "founded": "1874",
      "location": "Bolton, Gran Mánchester, Inglaterra",
      "website": "www.bwfc.co.uk",
      "kit": "Camiseta blanca con detalles azul marino, pantalón azul marino.",
      "venue": {
          "name": "Toughsheet Community Stadium",
          "city": "Bolton",
          "address": "Burnden Way, Horwich, Bolton BL6 6JW",
          "capacity": 28723,
          "opened": "1997"
      },
      "description": {
          "text": "El Bolton Wanderers fue fundado en 1874 y fue miembro fundador de la Football League en 1888. Cuatro veces campeón de la FA Cup (incluida la legendaria «Final del Caballo Blanco» de 1923).",
          "url": "https://es.wikipedia.org/wiki/Bolton_Wanderers_Football_Club"
      }
  },
  'bristol-rovers': {
      "fullName": "Bristol Rovers Football Club",
      "founded": "1883",
      "location": "Bristol, Inglaterra",
      "website": "www.bristolrovers.co.uk",
      "kit": "Camiseta a cuarteles azules y blancos, pantalón blanco.",
      "venue": {
          "name": "Memorial Stadium",
          "city": "Bristol",
          "address": "Filton Ave, Bristol BS7 0BF",
          "capacity": 12300,
          "opened": "1921"
      },
      "description": {
          "text": "El Bristol Rovers («The Pirates») fue fundado en 1883 en Bristol. Caracterizado por sus tradicionales cuarteles azules y blancos en su camiseta.",
          "url": "https://es.wikipedia.org/wiki/Bristol_Rovers_Football_Club"
      }
  },
  'burton': {
      "fullName": "Burton Albion Football Club",
      "founded": "1950",
      "location": "Burton upon Trent, Staffordshire, Inglaterra",
      "website": "www.burtonalbionfc.co.uk",
      "kit": "Camiseta amarilla con ribetes negros, pantalón negro.",
      "venue": {
          "name": "Pirelli Stadium",
          "city": "Burton upon Trent",
          "address": "Princess Way, Burton-on-Trent DE13 0AR",
          "capacity": 6912,
          "opened": "2005"
      },
      "description": {
          "text": "El Burton Albion («The Brewers») nació en 1950 en la capital cervecera inglesa. Llegó a disputar dos campañas consecutivas en la Championship en 2016-2018.",
          "url": "https://es.wikipedia.org/wiki/Burton_Albion_Football_Club"
      }
  },
  'cambridge': {
      "fullName": "Cambridge United Football Club",
      "founded": "1912",
      "location": "Cambridge, Cambridgeshire, Inglaterra",
      "website": "www.cambridgeunited.com",
      "kit": "Camiseta ámbar y negra a rayas verticales, pantalón negro.",
      "venue": {
          "name": "Cledara Abbey Stadium",
          "city": "Cambridge",
          "address": "Newmarket Rd, Cambridge CB5 8LN",
          "capacity": 8127,
          "opened": "1932"
      },
      "description": {
          "text": "El Cambridge United («The U's») fue fundado en 1912 en la célebre ciudad universitaria inglesa de Cambridge.",
          "url": "https://es.wikipedia.org/wiki/Cambridge_United_Football_Club"
      }
  },
  'charlton': {
      "fullName": "Charlton Athletic Football Club",
      "founded": "1905",
      "location": "Londres (Greenwich), Inglaterra",
      "website": "www.charltonafc.com",
      "kit": "Camiseta roja, pantalón blanco y medias rojas.",
      "venue": {
          "name": "The Valley",
          "city": "Londres",
          "address": "Floyd Rd, London SE7 8BL",
          "capacity": 27111,
          "opened": "1919"
      },
      "description": {
          "text": "El Charlton Athletic («The Addicks») fue fundado en 1905 en el sureste de Londres. Campeón de la FA Cup en 1947 y habitual animador de la Premier League a principios de los 2000.",
          "url": "https://es.wikipedia.org/wiki/Charlton_Athletic_Football_Club"
      }
  },
  'crawley': {
      "fullName": "Crawley Town Football Club",
      "founded": "1896",
      "location": "Crawley, Sussex Occidental, Inglaterra",
      "website": "www.crawleytownfc.com",
      "kit": "Camiseta roja con ribetes blancos, pantalón rojo.",
      "venue": {
          "name": "Broadfield Stadium",
          "city": "Crawley",
          "address": "Winfield Way, Crawley RH11 9RX",
          "capacity": 5996,
          "opened": "1997"
      },
      "description": {
          "text": "El Crawley Town («The Red Devils») nació en 1896 en Sussex Occidental. Campeón de los playoffs de ascenso de League Two en Wembley en 2024.",
          "url": "https://es.wikipedia.org/wiki/Crawley_Town_Football_Club"
      }
  },
  'exeter': {
      "fullName": "Exeter City Football Club",
      "founded": "1901",
      "location": "Exeter, Devon, Inglaterra",
      "website": "www.exetercityfc.co.uk",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón negro.",
      "venue": {
          "name": "St James Park",
          "city": "Exeter",
          "address": "Stadium Way, Exeter EX4 6PX",
          "capacity": 8720,
          "opened": "1904"
      },
      "description": {
          "text": "El Exeter City («The Grecians») fue fundado en 1901 en Devon. Célebre por haber sido el primer rival internacional de la historia de la selección de Brasil en 1914.",
          "url": "https://es.wikipedia.org/wiki/Exeter_City_Football_Club"
      }
  },
  'huddersfield': {
      "fullName": "Huddersfield Town Association Football Club",
      "founded": "1908",
      "location": "Huddersfield, Yorkshire del Oeste, Inglaterra",
      "website": "www.htafc.com",
      "kit": "Camiseta a rayas verticales azules y blancas, pantalón blanco.",
      "venue": {
          "name": "John Smith's Stadium",
          "city": "Huddersfield",
          "address": "Stadium Way, Huddersfield HD1 6PX",
          "capacity": 24121,
          "opened": "1994"
      },
      "description": {
          "text": "El Huddersfield Town («The Terriers») fue el primer club inglés en conquistar tres títulos consecutivos de primera división (1924, 1925, 1926) bajo Herbert Chapman.",
          "url": "https://es.wikipedia.org/wiki/Huddersfield_Town_Association_Football_Club"
      }
  },
  'leyton-orient': {
      "fullName": "Leyton Orient Football Club",
      "founded": "1881",
      "location": "Londres (Leyton), Inglaterra",
      "website": "www.leytonorient.com",
      "kit": "Camiseta roja con detalles blancos, pantalón rojo.",
      "venue": {
          "name": "Gaughan Group Stadium (Brisbane Road)",
          "city": "Londres",
          "address": "Brisbane Rd, London E10 5NF",
          "capacity": 9271,
          "opened": "1937"
      },
      "description": {
          "text": "El Leyton Orient («The O's») es el segundo club más antiguo de Londres, fundado en 1881 en el este londinense.",
          "url": "https://es.wikipedia.org/wiki/Leyton_Orient_Football_Club"
      }
  },
  'lincoln': {
      "fullName": "Lincoln City Football Club",
      "founded": "1884",
      "location": "Lincoln, Lincolnshire, Inglaterra",
      "website": "www.weareimps.com",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón negro.",
      "venue": {
          "name": "LNER Stadium (Sincil Bank)",
          "city": "Lincoln",
          "address": "Sincil Bank, Lincoln LN5 8LD",
          "capacity": 10669,
          "opened": "1895"
      },
      "description": {
          "text": "El Lincoln City («The Imps») fue fundado en 1884. Primer club amateur en alcanzar los cuartos de final de la FA Cup en 103 años en 2017.",
          "url": "https://es.wikipedia.org/wiki/Lincoln_City_Football_Club"
      }
  },
  'mansfield': {
      "fullName": "Mansfield Town Football Club",
      "founded": "1897",
      "location": "Mansfield, Nottinghamshire, Inglaterra",
      "website": "www.mansfieldtown.net",
      "kit": "Camiseta ámbar con ribetes azul marino, pantalón azul marino.",
      "venue": {
          "name": "One Call Stadium (Field Mill)",
          "city": "Mansfield",
          "address": "Quarry Ln, Mansfield NG18 5WV",
          "capacity": 9186,
          "opened": "1861"
      },
      "description": {
          "text": "El Mansfield Town («The Stags») fue fundado en 1897. Su estadio de Field Mill es el campo de fútbol en el que más tiempo ininterrumpido se ha jugado al fútbol en la Football League.",
          "url": "https://es.wikipedia.org/wiki/Mansfield_Town_Football_Club"
      }
  },
  'northampton': {
      "fullName": "Northampton Town Football Club",
      "founded": "1897",
      "location": "Northampton, Northamptonshire, Inglaterra",
      "website": "www.ntfc.co.uk",
      "kit": "Camiseta granate con detalles blancos, pantalón blanco.",
      "venue": {
          "name": "Sixfields Stadium",
          "city": "Northampton",
          "address": "Upton Way, Northampton NN5 5QA",
          "capacity": 7798,
          "opened": "1994"
      },
      "description": {
          "text": "El Northampton Town («The Cobblers») fue fundado en 1897 en el corazón de la industria zapatera británica de Northampton.",
          "url": "https://es.wikipedia.org/wiki/Northampton_Town_Football_Club"
      }
  },
  'peterborough': {
      "fullName": "Peterborough United Football Club",
      "founded": "1934",
      "location": "Peterborough, Cambridgeshire, Inglaterra",
      "website": "www.theposh.com",
      "kit": "Camiseta azul rey, pantalón blanco y medias azules.",
      "venue": {
          "name": "Weston Homes Stadium (London Road)",
          "city": "Peterborough",
          "address": "London Rd, Peterborough PE2 8AL",
          "capacity": 15314,
          "opened": "1913"
      },
      "description": {
          "text": "El Peterborough United («The Posh») fue fundado en 1934. Doble campeón del EFL Trophy en Wembley en 2014 y 2024.",
          "url": "https://es.wikipedia.org/wiki/Peterborough_United_Football_Club"
      }
  },
  'reading': {
      "fullName": "Reading Football Club",
      "founded": "1871",
      "location": "Reading, Berkshire, Inglaterra",
      "website": "www.readingfc.co.uk",
      "kit": "Camiseta a franjas horizontales azules y blancas («Hoops»), pantalón blanco.",
      "venue": {
          "name": "Select Car Leasing Stadium",
          "city": "Reading",
          "address": "Junction 11, M4, Reading RG2 0FL",
          "capacity": 24161,
          "opened": "1998"
      },
      "description": {
          "text": "El Reading FC («The Royals») fue fundado en 1871. Ostenta el récord de más puntos en una sola temporada del fútbol inglés (106 puntos en la Championship 2005-06).",
          "url": "https://es.wikipedia.org/wiki/Reading_Football_Club"
      }
  },
  'rotherham': {
      "fullName": "Rotherham United Football Club",
      "founded": "1925",
      "location": "Rotherham, Yorkshire del Sur, Inglaterra",
      "website": "www.themillers.co.uk",
      "kit": "Camiseta roja con mangas blancas, pantalón blanco y medias rojas.",
      "venue": {
          "name": "AESSEAL New York Stadium",
          "city": "Rotherham",
          "address": "New York Way, Rotherham S60 1AH",
          "capacity": 12021,
          "opened": "2012"
      },
      "description": {
          "text": "El Rotherham United («The Millers») nació en 1925 de la fusión de Rotherham County y Rotherham Town en Yorkshire del Sur.",
          "url": "https://es.wikipedia.org/wiki/Rotherham_United_Football_Club"
      }
  },
  'shrewsbury': {
      "fullName": "Shrewsbury Town Football Club",
      "founded": "1886",
      "location": "Shrewsbury, Shropshire, Inglaterra",
      "website": "www.shrewsburytown.com",
      "kit": "Camiseta azul y ámbar a rayas verticales, pantalón azul.",
      "venue": {
          "name": "Croud Meadow",
          "city": "Shrewsbury",
          "address": "Oteley Rd, Shrewsbury SY2 6ST",
          "capacity": 9875,
          "opened": "2007"
      },
      "description": {
          "text": "El Shrewsbury Town («The Shrews») fue fundado en 1886 en Shropshire, a orillas del río Severn.",
          "url": "https://es.wikipedia.org/wiki/Shrewsbury_Town_Football_Club"
      }
  },
  'stevenage': {
      "fullName": "Stevenage Football Club",
      "founded": "1976",
      "location": "Stevenage, Hertfordshire, Inglaterra",
      "website": "www.stevenagefc.com",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón rojo.",
      "venue": {
          "name": "Lamex Stadium (Broadhall Way)",
          "city": "Stevenage",
          "address": "Broadhall Way, Stevenage SG2 8RH",
          "capacity": 7800,
          "opened": "1961"
      },
      "description": {
          "text": "El Stevenage FC («The Boro») fue fundado en 1976. Bicampeón del FA Trophy en Wembley y protagonista de sonados triunfos en la FA Cup.",
          "url": "https://es.wikipedia.org/wiki/Stevenage_Football_Club"
      }
  },
  'stockport': {
      "fullName": "Stockport County Football Club",
      "founded": "1883",
      "location": "Stockport, Gran Mánchester, Inglaterra",
      "website": "www.stockportcounty.com",
      "kit": "Camiseta azul rey con ribetes blancos, pantalón blanco.",
      "venue": {
          "name": "Edgeley Park",
          "city": "Stockport",
          "address": "Hardcastle Rd, Stockport SK3 9DD",
          "capacity": 10852,
          "opened": "1891"
      },
      "description": {
          "text": "El Stockport County («The Hatters») fue fundado en 1883 en Stockport. Campeón de League Two en 2024 regresando con fuerza a los primeros planos de la EFL.",
          "url": "https://es.wikipedia.org/wiki/Stockport_County_Football_Club"
      }
  },
  'wigan': {
      "fullName": "Wigan Athletic Football Club",
      "founded": "1932",
      "location": "Wigan, Gran Mánchester, Inglaterra",
      "website": "www.wiganathletic.com",
      "kit": "Camiseta a rayas verticales azules y blancas, pantalón azul.",
      "venue": {
          "name": "The Brick Community Stadium",
          "city": "Wigan",
          "address": "Loire Dr, Wigan WN5 0UZ",
          "capacity": 25138,
          "opened": "1999"
      },
      "description": {
          "text": "El Wigan Athletic («The Latics») fue fundado en 1932. Campeón de la FA Cup en 2013 al vencer en Wembley al Manchester City con un célebre gol de Ben Watson.",
          "url": "https://es.wikipedia.org/wiki/Wigan_Athletic_Football_Club"
      }
  },
  'wycombe': {
      "fullName": "Wycombe Wanderers Football Club",
      "founded": "1887",
      "location": "High Wycombe, Buckinghamshire, Inglaterra",
      "website": "www.wwfc.com",
      "kit": "Camiseta a cuarteles en dos tonos de azul («Quartered»), pantalón azul marino.",
      "venue": {
          "name": "Adams Park",
          "city": "High Wycombe",
          "address": "Hillbottom Rd, High Wycombe HP12 4HJ",
          "capacity": 10137,
          "opened": "1990"
      },
      "description": {
          "text": "El Wycombe Wanderers («The Chairboys») fue fundado en 1887 en la capital de los fabricantes de sillas de Buckinghamshire. Semifinalista de la FA Cup en 2001.",
          "url": "https://es.wikipedia.org/wiki/Wycombe_Wanderers_Football_Club"
      }
  },
  'accrington': {
      "fullName": "Accrington Stanley Football Club",
      "founded": "1968",
      "location": "Accrington, Lancashire, Inglaterra",
      "website": "www.accringtonstanley.co.uk",
      "kit": "Camiseta roja con mangas blancas, pantalón blanco.",
      "venue": {
          "name": "Wham Stadium (Crown Ground)",
          "city": "Accrington",
          "address": "Livingstone Rd, Accrington BB5 5BX",
          "capacity": 5456,
          "opened": "1968"
      },
      "description": {
          "text": "El Accrington Stanley es célebre en la cultura popular británica («Stanley, who are they?»). Refundado en 1968, ascendió a la Football League en 2006 tras cuatro décadas de ausencia.",
          "url": "https://es.wikipedia.org/wiki/Accrington_Stanley_Football_Club"
      }
  },
  'barnet': {
      "fullName": "Barnet Football Club",
      "founded": "1888",
      "location": "Londres (Edgware/Barnet), Inglaterra",
      "website": "www.barnetfc.com",
      "kit": "Camiseta ámbar y negra a rayas verticales, pantalón negro.",
      "venue": {
          "name": "The Hive Stadium",
          "city": "Londres",
          "address": "Camrose Ave, Edgware HA8 6AG",
          "capacity": 6500,
          "opened": "2013"
      },
      "description": {
          "text": "El Barnet FC («The Bees») fue fundado en 1888 en el norte de Londres. Disputa sus encuentros en The Hive Stadium.",
          "url": "https://es.wikipedia.org/wiki/Barnet_Football_Club"
      }
  },
  'barrow': {
      "fullName": "Barrow Association Football Club",
      "founded": "1901",
      "location": "Barrow-in-Furness, Cumbria, Inglaterra",
      "website": "www.barrowafc.com",
      "kit": "Camiseta azul y blanca, pantalón azul.",
      "venue": {
          "name": "SO Legal Stadium (Holker Street)",
          "city": "Barrow-in-Furness",
          "address": "Wilkie Rd, Barrow-in-Furness LA14 5UW",
          "capacity": 6500,
          "opened": "1909"
      },
      "description": {
          "text": "El Barrow AFC («The Bluebirds») fue fundado en 1901 en Cumbria. Campeón del FA Trophy en 1990 y 2010.",
          "url": "https://es.wikipedia.org/wiki/Barrow_Association_Football_Club"
      }
  },
  'bradford': {
      "fullName": "Bradford City Association Football Club",
      "founded": "1903",
      "location": "Bradford, Yorkshire del Oeste, Inglaterra",
      "website": "www.bradfordcityafc.com",
      "kit": "Camiseta a franjas verticales granate y ámbar («Claret and Amber»), pantalón negro.",
      "venue": {
          "name": "University of Bradford Stadium (Valley Parade)",
          "city": "Bradford",
          "address": "Valley Parade, Bradford BD8 7DY",
          "capacity": 25136,
          "opened": "1886"
      },
      "description": {
          "text": "El Bradford City («The Bantams») fue fundado en 1903. Campeón de la FA Cup en 1911 y finalista de la Copa de la Liga en Wembley en 2013 como equipo de cuarta categoría.",
          "url": "https://es.wikipedia.org/wiki/Bradford_City_Association_Football_Club"
      }
  },
  'bromley': {
      "fullName": "Bromley Football Club",
      "founded": "1892",
      "location": "Londres (Bromley), Inglaterra",
      "website": "www.bromleyfc.co.uk",
      "kit": "Camiseta blanca con detalles negros, pantalón negro.",
      "venue": {
          "name": "Hayes Lane (Reloc8 Emirates Stadium)",
          "city": "Londres",
          "address": "Hayes Ln, Bromley BR2 9EF",
          "capacity": 5000,
          "opened": "1938"
      },
      "description": {
          "text": "El Bromley FC («The Ravens») fue fundado en 1892 en el sureste de Londres. Logró el histórico ascenso a la EFL en Wembley en 2024.",
          "url": "https://es.wikipedia.org/wiki/Bromley_Football_Club"
      }
  },
  'carlisle': {
      "fullName": "Carlisle United Football Club",
      "founded": "1904",
      "location": "Carlisle, Cumbria, Inglaterra",
      "website": "www.carlisleunited.co.uk",
      "kit": "Camiseta azul con ribetes rojos y blancos, pantalón blanco.",
      "venue": {
          "name": "Brunton Park",
          "city": "Carlisle",
          "address": "Warwick Rd, Carlisle CA1 1LL",
          "capacity": 17949,
          "opened": "1909"
      },
      "description": {
          "text": "El Carlisle United («The Cumbrians») fue fundado en 1904 en el extremo norte inglés junto a la frontera escocesa.",
          "url": "https://es.wikipedia.org/wiki/Carlisle_United_Football_Club"
      }
  },
  'cheltenham': {
      "fullName": "Cheltenham Town Football Club",
      "founded": "1887",
      "location": "Cheltenham, Gloucestershire, Inglaterra",
      "website": "www.ctfc.com",
      "kit": "Camiseta rojiblanca a rayas verticales, pantalón blanco.",
      "venue": {
          "name": "EV Charger Points Stadium (Whaddon Road)",
          "city": "Cheltenham",
          "address": "Whaddon Rd, Cheltenham GL52 5NA",
          "capacity": 7066,
          "opened": "1927"
      },
      "description": {
          "text": "El Cheltenham Town («The Robins») fue fundado en 1887 en la famosa ciudad balneario de Cheltenham.",
          "url": "https://es.wikipedia.org/wiki/Cheltenham_Town_Football_Club"
      }
  },
  'chesterfield': {
      "fullName": "Chesterfield Football Club",
      "founded": "1866",
      "location": "Chesterfield, Derbyshire, Inglaterra",
      "website": "www.chesterfield-fc.co.uk",
      "kit": "Camiseta azul royal, pantalón blanco y medias azules.",
      "venue": {
          "name": "SMH Group Stadium",
          "city": "Chesterfield",
          "address": "1866 Sheffield Rd, Chesterfield S41 8NZ",
          "capacity": 10504,
          "opened": "2010"
      },
      "description": {
          "text": "El Chesterfield FC («The Spireites») fue fundado en 1866. Célebre por alcanzar las semifinales de la FA Cup en 1997 como equipo de tercera categoría.",
          "url": "https://es.wikipedia.org/wiki/Chesterfield_Football_Club"
      }
  },
  'colchester': {
      "fullName": "Colchester United Football Club",
      "founded": "1937",
      "location": "Colchester, Essex, Inglaterra",
      "website": "www.cu-fc.com",
      "kit": "Camiseta a rayas verticales azules y blancas, pantalón azul.",
      "venue": {
          "name": "JobServe Community Stadium",
          "city": "Colchester",
          "address": "United Way, Colchester CO4 5UP",
          "capacity": 10105,
          "opened": "2008"
      },
      "description": {
          "text": "El Colchester United («The U's») nació en 1937 en la ciudad más antigua registrada de Gran Bretaña.",
          "url": "https://es.wikipedia.org/wiki/Colchester_United_Football_Club"
      }
  },
  'crewe': {
      "fullName": "Crewe Alexandra Football Club",
      "founded": "1877",
      "location": "Crewe, Cheshire, Inglaterra",
      "website": "www.crewealex.net",
      "kit": "Camiseta roja, pantalón blanco y medias rojas.",
      "venue": {
          "name": "Mornflake Stadium (Gresty Road)",
          "city": "Crewe",
          "address": "Gresty Rd, Crewe CW2 6EB",
          "capacity": 10153,
          "opened": "1906"
      },
      "description": {
          "text": "El Crewe Alexandra («The Railwaymen») fue fundado en 1877 nombrado en honor a la princesa Alejandra de Dinamarca. Sede de una prestigiosa cantera bajo Dario Gradi.",
          "url": "https://es.wikipedia.org/wiki/Crewe_Alexandra_Football_Club"
      }
  },
  'doncaster': {
      "fullName": "Doncaster Rovers Football Club",
      "founded": "1879",
      "location": "Doncaster, Yorkshire del Sur, Inglaterra",
      "website": "www.doncasterroversfc.co.uk",
      "kit": "Camiseta a franjas horizontales rojas y blancas («Hoops»), pantalón negro.",
      "venue": {
          "name": "Eco-Power Stadium (Keepmoat Stadium)",
          "city": "Doncaster",
          "address": "Stadium Way, Doncaster DN4 5JW",
          "capacity": 15231,
          "opened": "2006"
      },
      "description": {
          "text": "El Doncaster Rovers («Donny») fue fundado en 1879 en Yorkshire del Sur. Campeón de la Copa de la Liga de Tercera División (EFL Trophy) en 2007 en el Millennium Stadium.",
          "url": "https://es.wikipedia.org/wiki/Doncaster_Rovers_Football_Club"
      }
  },
  'fleetwood': {
      "fullName": "Fleetwood Town Football Club",
      "founded": "1908",
      "location": "Fleetwood, Lancashire, Inglaterra",
      "website": "www.fleetwoodtownfc.com",
      "kit": "Camiseta roja con mangas blancas, pantalón blanco.",
      "venue": {
          "name": "Highbury Stadium",
          "city": "Fleetwood",
          "address": "Park Ave, Fleetwood FY7 6TX",
          "capacity": 5327,
          "opened": "1939"
      },
      "description": {
          "text": "El Fleetwood Town («The Cod Army») nació en el puerto pesquero de Fleetwood en 1908. Cuna profesional de la explosión goleadora de Jamie Vardy antes de su pase al Leicester.",
          "url": "https://es.wikipedia.org/wiki/Fleetwood_Town_Football_Club"
      }
  },
  'gillingham': {
      "fullName": "Gillingham Football Club",
      "founded": "1893",
      "location": "Gillingham, Kent, Inglaterra",
      "website": "www.gillinghamfootballclub.com",
      "kit": "Camiseta azul royal con detalles blancos, pantalón blanco.",
      "venue": {
          "name": "Priestfield Stadium",
          "city": "Gillingham",
          "address": "Redfern Ave, Gillingham ME7 4DD",
          "capacity": 11582,
          "opened": "1893"
      },
      "description": {
          "text": "El Gillingham FC («The Gills») fue fundado en 1893 como New Brompton FC y es el único club de la Football League del condado de Kent.",
          "url": "https://es.wikipedia.org/wiki/Gillingham_Football_Club"
      }
  },
  'grimsby': {
      "fullName": "Grimsby Town Football Club",
      "founded": "1878",
      "location": "Cleethorpes, Lincolnshire, Inglaterra",
      "website": "www.grimsby-townfc.co.uk",
      "kit": "Camiseta a rayas verticales blancas y negras con detalles rojos, pantalón negro.",
      "venue": {
          "name": "Blundell Park",
          "city": "Cleethorpes",
          "address": "Harrington St, Cleethorpes DN35 7PY",
          "capacity": 9052,
          "opened": "1899"
      },
      "description": {
          "text": "El Grimsby Town («The Mariners») fue fundado en 1878 en el gran puerto pesquero de Grimsby. Semifinalista de la FA Cup en 1936 y 1939.",
          "url": "https://es.wikipedia.org/wiki/Grimsby_Town_Football_Club"
      }
  },
  'harrogate': {
      "fullName": "Harrogate Town Football Club",
      "founded": "1914",
      "location": "Harrogate, Yorkshire del Norte, Inglaterra",
      "website": "www.harrogatetownafc.com",
      "kit": "Camiseta amarilla y negra a rayas verticales, pantalón negro.",
      "venue": {
          "name": "Exercise Stadium (Wetherby Road)",
          "city": "Harrogate",
          "address": "Wetherby Rd, Harrogate HG2 7SA",
          "capacity": 5000,
          "opened": "1920"
      },
      "description": {
          "text": "El Harrogate Town («The Sulphurites») fue fundado en 1914. Ascendió por primera vez a la Football League en Wembley en 2020.",
          "url": "https://es.wikipedia.org/wiki/Harrogate_Town_Football_Club"
      }
  },
  'mk-dons': {
      "fullName": "Milton Keynes Dons Football Club",
      "founded": "2004",
      "location": "Milton Keynes, Buckinghamshire, Inglaterra",
      "website": "www.mkdons.com",
      "kit": "Camiseta blanca con detalles dorados y rojos, pantalón blanco.",
      "venue": {
          "name": "Stadium MK",
          "city": "Milton Keynes",
          "address": "Stadium Way W, Milton Keynes MK1 1ST",
          "capacity": 30500,
          "opened": "2007"
      },
      "description": {
          "text": "El Milton Keynes Dons nació en 2004 tras la controvertida reubicación del histórico Wimbledon FC a la moderna ciudad planificada de Milton Keynes.",
          "url": "https://es.wikipedia.org/wiki/Milton_Keynes_Dons_Football_Club"
      }
  },
  'morecambe': {
      "fullName": "Morecambe Football Club",
      "founded": "1920",
      "location": "Morecambe, Lancashire, Inglaterra",
      "website": "www.morecambefc.com",
      "kit": "Camiseta roja con ribetes negros y blancos, pantalón negro.",
      "venue": {
          "name": "Mazuma Mobile Stadium (Globe Arena)",
          "city": "Morecambe",
          "address": "Christie Way, Morecambe LA4 4TB",
          "capacity": 6476,
          "opened": "2010"
      },
      "description": {
          "text": "El Morecambe FC («The Shrimps») fue fundado en 1920 a orillas de la bahía de Morecambe.",
          "url": "https://es.wikipedia.org/wiki/Morecambe_Football_Club"
      }
  },
  'newport': {
      "fullName": "Newport County Association Football Club",
      "founded": "1912",
      "location": "Newport, Gales",
      "website": "www.newport-county.co.uk",
      "kit": "Camiseta ámbar con detalles negros, pantalón negro.",
      "venue": {
          "name": "Rodney Parade",
          "city": "Newport",
          "address": "Rodney Rd, Newport NP19 0UU",
          "capacity": 8700,
          "opened": "1877"
      },
      "description": {
          "text": "El Newport County («The Exiles») fue fundado en 1912 en el sur de Gales. Cuartofinalista de la Recopa de Europa en 1981.",
          "url": "https://es.wikipedia.org/wiki/Newport_County_Association_Football_Club"
      }
  },
  'notts-county': {
      "fullName": "Notts County Football Club",
      "founded": "1862",
      "location": "Nottingham, Nottinghamshire, Inglaterra",
      "website": "www.nottscountyfc.co.uk",
      "kit": "Camiseta a rayas verticales blancas y negras («The Magpies»), pantalón negro.",
      "venue": {
          "name": "Meadow Lane",
          "city": "Nottingham",
          "address": "Meadow Ln, Nottingham NG2 3HJ",
          "capacity": 19841,
          "opened": "1910"
      },
      "description": {
          "text": "El Notts County es el club de fútbol profesional más antiguo del mundo, fundado en 1862. Miembro fundador de la Football League en 1888 e inspiración de los colores blanquinegros de la Juventus de Turín.",
          "url": "https://es.wikipedia.org/wiki/Notts_County_Football_Club"
      }
  },
  'port-vale': {
      "fullName": "Port Vale Football Club",
      "founded": "1876",
      "location": "Burslem, Stoke-on-Trent, Inglaterra",
      "website": "www.port-vale.co.uk",
      "kit": "Camiseta blanca con detalles negros y dorados, pantalón negro.",
      "venue": {
          "name": "Vale Park",
          "city": "Stoke-on-Trent",
          "address": "Hamil Rd, Burslem, Stoke-on-Trent ST6 1AW",
          "capacity": 15695,
          "opened": "1950"
      },
      "description": {
          "text": "El Port Vale («The Valiants») fue fundado en 1876 en Burslem. Semifinalista de la FA Cup en 1954 y doble campeón del EFL Trophy.",
          "url": "https://es.wikipedia.org/wiki/Port_Vale_Football_Club"
      }
  },
  'salford': {
      "fullName": "Salford City Football Club",
      "founded": "1940",
      "location": "Salford, Gran Mánchester, Inglaterra",
      "website": "www.salfordcityfc.co.uk",
      "kit": "Camiseta roja con ribetes blancos, pantalón blanco.",
      "venue": {
          "name": "The Peninsula Stadium (Moor Lane)",
          "city": "Salford",
          "address": "Moor Ln, Kersal, Salford M7 3PZ",
          "capacity": 5108,
          "opened": "1978"
      },
      "description": {
          "text": "El Salford City («The Ammies») fue fundado en 1940. Copropiedad de la famosa «Clase del 92» del Manchester United (Gary Neville, Ryan Giggs, Paul Scholes, David Beckham) y campeón del EFL Trophy en 2020.",
          "url": "https://es.wikipedia.org/wiki/Salford_City_Football_Club"
      }
  },
  'swindon': {
      "fullName": "Swindon Town Football Club",
      "founded": "1879",
      "location": "Swindon, Wiltshire, Inglaterra",
      "website": "www.swindontownfc.co.uk",
      "kit": "Camiseta roja, pantalón blanco y medias rojas.",
      "venue": {
          "name": "The County Ground",
          "city": "Swindon",
          "address": "County Rd, Swindon SN1 2ED",
          "capacity": 15728,
          "opened": "1896"
      },
      "description": {
          "text": "El Swindon Town («The Robins») fue fundado en 1879 en Wiltshire. Campeón de la Copa de la Liga inglesa en Wembley en 1969 batiendo al Arsenal.",
          "url": "https://es.wikipedia.org/wiki/Swindon_Town_Football_Club"
      }
  },
  'tranmere': {
      "fullName": "Tranmere Rovers Football Club",
      "founded": "1884",
      "location": "Birkenhead, Merseyside, Inglaterra",
      "website": "www.tranmererovers.co.uk",
      "kit": "Camiseta completamente blanca con detalles azules, pantalón blanco.",
      "venue": {
          "name": "Prenton Park",
          "city": "Birkenhead",
          "address": "Prenton Rd W, Birkenhead CH42 9PY",
          "capacity": 16587,
          "opened": "1912"
      },
      "description": {
          "text": "El Tranmere Rovers («The Super White Army») fue fundado en 1884 en la península de Wirral, frente a Liverpool. Finalista de la Copa de la Liga en 2000.",
          "url": "https://es.wikipedia.org/wiki/Tranmere_Rovers_Football_Club"
      }
  },
  'walsall': {
      "fullName": "Walsall Football Club",
      "founded": "1888",
      "location": "Walsall, Tierras Medias Occidentales, Inglaterra",
      "website": "www.saddlers.co.uk",
      "kit": "Camiseta roja con ribetes blancos, pantalón blanco.",
      "venue": {
          "name": "Poundland Bescot Stadium",
          "city": "Walsall",
          "address": "Bescot Crescent, Walsall WS1 4SA",
          "capacity": 11300,
          "opened": "1990"
      },
      "description": {
          "text": "El Walsall FC («The Saddlers») fue fundado en 1888 tras la fusión de Walsall Town y Walsall Swifts en la tradicional capital guarnicionera británica.",
          "url": "https://es.wikipedia.org/wiki/Walsall_Football_Club"
      }
  },
  'roma': {
      "fullName": "Associazione Sportiva Roma S.p.A.",
      "founded": "1927",
      "location": "Roma, Lacio, Italia",
      "website": "www.asroma.com",
      "kit": "Camiseta rojo pórfido con ribetes dorados («Giallorosso»), pantalón blanco.",
      "venue": {
          "name": "Stadio Olimpico",
          "city": "Roma",
          "address": "Viale dei Gladiatori, 00135 Roma",
          "capacity": 70634,
          "opened": "1953"
      },
      "description": {
          "text": "La AS Roma fue fundada en 1927 en la capital italiana. Tricampeona de la Serie A y campeona de la UEFA Conference League en 2022, club del mítico Francesco Totti.",
          "url": "https://es.wikipedia.org/wiki/Associazione_Sportiva_Roma"
      }
  },
  'lazio': {
      "fullName": "Società Sportiva Lazio S.p.A.",
      "founded": "1900",
      "location": "Roma, Lacio, Italia",
      "website": "www.sslazio.it",
      "kit": "Camiseta celeste («Biancoceleste»), pantalón blanco y medias blancas.",
      "venue": {
          "name": "Stadio Olimpico",
          "city": "Roma",
          "address": "Viale dei Gladiatori, 00135 Roma",
          "capacity": 70634,
          "opened": "1953"
      },
      "description": {
          "text": "La SS Lazio fue fundada en 1900 en Roma. Bicampeona de la Serie A y campeona de la Recopa de Europa y Supercopa de Europa en 1999.",
          "url": "https://es.wikipedia.org/wiki/Societ%C3%A0_Sportiva_Lazio"
      }
  },
  'napoli': {
      "fullName": "Società Sportiva Calcio Napoli S.p.A.",
      "founded": "1926",
      "location": "Nápoles, Campania, Italia",
      "website": "www.sscnapoli.it",
      "kit": "Camiseta azul celeste («Azzurro»), pantalón blanco y medias celestes.",
      "venue": {
          "name": "Stadio Diego Armando Maradona",
          "city": "Nápoles",
          "address": "Piazzale Vincenzo Tecchio, 80125 Napoli",
          "capacity": 54726,
          "opened": "1959"
      },
      "description": {
          "text": "El SSC Napoli fue fundado en 1926 en Nápoles. Tricampeón de la Serie A y campeón de la Copa de la UEFA en 1989 bajo la eterna leyenda de Diego Armando Maradona.",
          "url": "https://es.wikipedia.org/wiki/Societ%C3%A0_Sportiva_Calcio_Napoli"
      }
  },
  'atalanta': {
      "fullName": "Atalanta Bergamasca Calcio S.p.A.",
      "founded": "1907",
      "location": "Bérgamo, Lombardía, Italia",
      "website": "www.atalanta.it",
      "kit": "Camiseta a rayas verticales negras y azules («Nerazzurri»), pantalón negro.",
      "venue": {
          "name": "Gewiss Stadium",
          "city": "Bérgamo",
          "address": "Viale Giulio Cesare, 18, 24124 Bergamo",
          "capacity": 24950,
          "opened": "1928"
      },
      "description": {
          "text": "La Atalanta fue fundada en 1907 en Bérgamo («La Dea»). Campeona de la UEFA Europa League en 2024 derrotando al invicto Bayer Leverkusen en Dublín.",
          "url": "https://es.wikipedia.org/wiki/Atalanta_Bergamasca_Calcio"
      }
  },
  'fiorentina': {
      "fullName": "ACF Fiorentina S.p.A.",
      "founded": "1926",
      "location": "Florencia, Toscana, Italia",
      "website": "www.acffiorentina.com",
      "kit": "Camiseta completamente violeta («Viola»), pantalón violeta y medias violetas.",
      "venue": {
          "name": "Stadio Artemio Franchi",
          "city": "Florencia",
          "address": "Viale Manfredo Fanti, 4, 50137 Firenze",
          "capacity": 43147,
          "opened": "1931"
      },
      "description": {
          "text": "La ACF Fiorentina fue fundada en 1926 en la histórica ciudad del Renacimiento. Bicampeona de Italia y primera campeona de la Recopa de Europa (1961).",
          "url": "https://es.wikipedia.org/wiki/ACF_Fiorentina"
      }
  },
  'leverkusen': {
      "fullName": "Bayer 04 Leverkusen Fußball GmbH",
      "founded": "1904",
      "location": "Leverkusen, Renania del Norte-Westfalia, Alemania",
      "website": "www.bayer04.de",
      "kit": "Camiseta negra con detalles rojos, pantalón negro.",
      "venue": {
          "name": "BayArena",
          "city": "Leverkusen",
          "address": "Bismarckstraße 122-124, 51373 Leverkusen",
          "capacity": 30210,
          "opened": "1958"
      },
      "description": {
          "text": "El Bayer 04 Leverkusen («Die Werkself») fue fundado en 1904 por empleados de la farmacéutica Bayer. Campeón invicto histórico de la Bundesliga y Copa alemana en 2024 con Xabi Alonso.",
          "url": "https://es.wikipedia.org/wiki/Bayer_04_Leverkusen"
      }
  },
  'leipzig': {
      "fullName": "RasenBallsport Leipzig e. V.",
      "founded": "2009",
      "location": "Leipzig, Sajonia, Alemania",
      "website": "www.rbleipzig.com",
      "kit": "Camiseta blanca con detalles rojos, pantalón blanco.",
      "venue": {
          "name": "Red Bull Arena",
          "city": "Leipzig",
          "address": "Am Sportforum 3, 04105 Leipzig",
          "capacity": 47069,
          "opened": "2004"
      },
      "description": {
          "text": "El RB Leipzig fue fundado en 2009 en Leipzig. Bicampeón de la DFB-Pokal (2022, 2023) y semifinalista de la UEFA Champions League en 2020.",
          "url": "https://es.wikipedia.org/wiki/RB_Leipzig"
      }
  },
  'eintracht': {
      "fullName": "Eintracht Frankfurt e. V.",
      "founded": "1899",
      "location": "Fráncfort del Meno, Hesse, Alemania",
      "website": "www.eintracht.de",
      "kit": "Camiseta negra y roja, pantalón negro.",
      "venue": {
          "name": "Deutsche Bank Park (Waldstadion)",
          "city": "Fráncfort",
          "address": "Mörfelder Landstraße 362, 60528 Frankfurt",
          "capacity": 58000,
          "opened": "1925"
      },
      "description": {
          "text": "El Eintracht Frankfurt («Die Adler») fue fundado en 1899 en la capital financiera alemana. Bicampeón de la Copa de la UEFA / Europa League (1980, 2022).",
          "url": "https://es.wikipedia.org/wiki/Eintracht_Fr%C3%A1ncfort"
      }
  },
  'stuttgart': {
      "fullName": "VfB Stuttgart 1893 e. V.",
      "founded": "1893",
      "location": "Stuttgart, Baden-Wurtemberg, Alemania",
      "website": "www.vfb.de",
      "kit": "Camiseta blanca con franja horizontal roja («Brustring»), pantalón blanco.",
      "venue": {
          "name": "MHPArena",
          "city": "Stuttgart",
          "address": "Mercedesstraße 87, 70372 Stuttgart",
          "capacity": 60449,
          "opened": "1933"
      },
      "description": {
          "text": "El VfB Stuttgart fue fundado en 1893. Pentacampeón de la Bundesliga alemana y tricampeón de la DFB-Pokal.",
          "url": "https://es.wikipedia.org/wiki/VfB_Stuttgart"
      }
  },
  'monaco': {
      "fullName": "Association Sportive de Monaco Football Club",
      "founded": "1924",
      "location": "Fontvieille, Principado de Mónaco",
      "website": "www.asmonaco.com",
      "kit": "Camiseta diagonal roja y blanca, pantalón blanco.",
      "venue": {
          "name": "Stade Louis-II",
          "city": "Mónaco",
          "address": "7 Av. des Castelans, 98000 Monaco",
          "capacity": 18523,
          "opened": "1985"
      },
      "description": {
          "text": "El AS Monaco fue fundado en 1924 en el Principado de Mónaco. Octacampeón de la Ligue 1 francesa y finalista de la UEFA Champions League en 2004.",
          "url": "https://es.wikipedia.org/wiki/AS_M%C3%B3naco"
      }
  },
  'marseille': {
      "fullName": "Olympique de Marseille",
      "founded": "1899",
      "location": "Marsella, Provenza-Alpes-Costa Azul, Francia",
      "website": "www.om.fr",
      "kit": "Camiseta blanca con detalles azul celeste («Droit au But»), pantalón blanco.",
      "venue": {
          "name": "Orange Vélodrome",
          "city": "Marsella",
          "address": "3 Bd Michelet, 13008 Marseille",
          "capacity": 67394,
          "opened": "1937"
      },
      "description": {
          "text": "El Olympique de Marsella fue fundado en 1899. Es el único club francés que ha ganado la UEFA Champions League (1993) y nueve veces campeón de Francia.",
          "url": "https://es.wikipedia.org/wiki/Olympique_de_Marsella"
      }
  },
  'lyon': {
      "fullName": "Olympique Lyonnais",
      "founded": "1950",
      "location": "Décines-Charpieu, Lyon, Francia",
      "website": "www.ol.fr",
      "kit": "Camiseta blanca con franja vertical roja y azul, pantalón blanco.",
      "venue": {
          "name": "Groupama Stadium (Parc OL)",
          "city": "Lyon",
          "address": "10 Av. Simone Veil, 69150 Décines-Charpieu",
          "capacity": 59186,
          "opened": "2016"
      },
      "description": {
          "text": "El Olympique Lyonnais («Les Gones») fue fundado en 1950 en Lyon. Marcó una época de oro al ganar siete títulos consecutivos de Ligue 1 entre 2002 y 2008.",
          "url": "https://es.wikipedia.org/wiki/Olympique_Lyonnais"
      }
  },
}

// Mapeo exhaustivo de nombres alternativos, IDs de ESPN y términos de búsqueda
const CLUB_LOOKUP = new Map<string, VerifiedClubProfile>()

for (const [key, profile] of Object.entries(VERIFIED_CLUBS)) {
  CLUB_LOOKUP.set(key, profile)
  CLUB_LOOKUP.set(normalizeKey(key), profile)
  CLUB_LOOKUP.set(normalizeKey(profile.fullName), profile)
}

// Nombres específicos usados por ESPN o usuarios
const ALIASES: Record<string, string> = {
  // España (1ª y 2ª)
  'real madrid': 'real-madrid',
  'real madrid cf': 'real-madrid',
  '86': 'real-madrid',
  'barcelona': 'barcelona',
  'fc barcelona': 'barcelona',
  'barca': 'barcelona',
  '83': 'barcelona',
  'atletico madrid': 'atletico-madrid',
  'atletico de madrid': 'atletico-madrid',
  'atleti': 'atletico-madrid',
  '1068': 'atletico-madrid',
  'athletic club': 'athletic-club',
  'athletic bilbao': 'athletic-club',
  'athletic': 'athletic-club',
  '93': 'athletic-club',
  'real sociedad': 'real-sociedad',
  'la real': 'real-sociedad',
  '89': 'real-sociedad',
  'real betis': 'real-betis',
  'betis': 'real-betis',
  '244': 'real-betis',
  'sevilla': 'sevilla',
  'sevilla fc': 'sevilla',
  '243': 'sevilla',
  'valencia': 'valencia',
  'valencia cf': 'valencia',
  '94': 'valencia',
  'villarreal': 'villarreal',
  'villarreal cf': 'villarreal',
  '102': 'villarreal',
  'celta vigo': 'celta-vigo',
  'celta de vigo': 'celta-vigo',
  'celta': 'celta-vigo',
  '85': 'celta-vigo',
  'osasuna': 'osasuna',
  'ca osasuna': 'osasuna',
  '97': 'osasuna',
  'espanyol': 'espanyol',
  'rcd espanyol': 'espanyol',
  '88': 'espanyol',
  'alaves': 'alaves',
  'deportivo alaves': 'alaves',
  '96': 'alaves',
  'rayo vallecano': 'rayo-vallecano',
  'rayo': 'rayo-vallecano',
  '101': 'rayo-vallecano',
  'getafe': 'getafe',
  'getafe cf': 'getafe',
  '2922': 'getafe',
  'girona': 'girona',
  'girona fc': 'girona',
  '9812': 'girona',
  'mallorca': 'mallorca',
  'rcd mallorca': 'mallorca',
  '84': 'mallorca',
  'real valladolid': 'real-valladolid',
  'valladolid': 'real-valladolid',
  '95': 'real-valladolid',
  'las palmas': 'las-palmas',
  'ud las palmas': 'las-palmas',
  '98': 'las-palmas',
  'leganes': 'leganes',
  'cd leganes': 'leganes',
  '17534': 'leganes',
  'real zaragoza': 'real-zaragoza',
  'zaragoza': 'real-zaragoza',
  'sporting gijon': 'sporting-gijon',
  'sporting': 'sporting-gijon',
  '3788': 'sporting-gijon',
  'real oviedo': 'real-oviedo',
  'oviedo': 'real-oviedo',
  '92': 'real-oviedo',
  'deportivo': 'deportivo',
  'deportivo la coruna': 'deportivo',
  'deportivo de la coruna': 'deportivo',
  'depor': 'deportivo',
  '90': 'deportivo',
  'racing santander': 'racing-santander',
  'racing de santander': 'racing-santander',
  '87': 'racing-santander',
  'levante': 'levante',
  'levante ud': 'levante',
  '1538': 'levante',
  'elche': 'elche',
  'elche cf': 'elche',
  '3751': 'elche',
  'eibar': 'eibar',
  'sd eibar': 'eibar',
  '3752': 'eibar',
  'almeria': 'almeria',
  'ud almeria': 'almeria',
  '6832': 'almeria',
  'granada': 'granada',
  'granada cf': 'granada',
  '3747': 'granada',
  'cadiz': 'cadiz',
  'cadiz cf': 'cadiz',
  '3842': 'cadiz',
  'malaga': 'malaga',
  'malaga cf': 'malaga',
  '99': 'malaga',
  'tenerife': 'tenerife',
  'cd tenerife': 'tenerife',
  '245': 'tenerife',
  'castellon': 'castellon',
  'cd castellon': 'castellon',
  '4438': 'castellon',
  'albacete': 'albacete',
  'albacete balompie': 'albacete',
  '2737': 'albacete',
  'burgos': 'burgos',
  'burgos cf': 'burgos',
  '12597': 'burgos',
  'cordoba': 'cordoba',
  'cordoba cf': 'cordoba',
  '8447': 'cordoba',
  'huesca': 'huesca',
  'sd huesca': 'huesca',
  'racing ferrol': 'racing-ferrol',
  'racing de ferrol': 'racing-ferrol',
  'eldense': 'eldense',
  'cd eldense': 'eldense',
  '7320': 'eldense',
  'mirandes': 'mirandes',
  'cd mirandes': 'mirandes',
  'cartagena': 'cartagena',
  'fc cartagena': 'cartagena',

  // Inglaterra (Premier League)
  'arsenal': 'arsenal',
  'arsenal fc': 'arsenal',
  '359': 'arsenal',
  'manchester city': 'manchester-city',
  'man city': 'manchester-city',
  '382': 'manchester-city',
  'liverpool': 'liverpool',
  'liverpool fc': 'liverpool',
  '364': 'liverpool',
  'manchester united': 'manchester-united',
  'man united': 'manchester-united',
  'man utd': 'manchester-united',
  '360': 'manchester-united',
  'chelsea': 'chelsea',
  'chelsea fc': 'chelsea',
  '363': 'chelsea',
  'tottenham hotspur': 'tottenham',
  'tottenham': 'tottenham',
  'spurs': 'tottenham',
  '367': 'tottenham',
  'aston villa': 'aston-villa',
  'villa': 'aston-villa',
  '362': 'aston-villa',
  'newcastle united': 'newcastle',
  'newcastle': 'newcastle',
  '361': 'newcastle',
  'bournemouth': 'bournemouth',
  'afc bournemouth': 'bournemouth',
  '349': 'bournemouth',
  'brentford': 'brentford',
  'brentford fc': 'brentford',
  '337': 'brentford',
  'brighton': 'brighton',
  'brighton & hove albion': 'brighton',
  'brighton and hove albion': 'brighton',
  '331': 'brighton',
  'crystal palace': 'crystal-palace',
  'crystal palace fc': 'crystal-palace',
  '384': 'crystal-palace',
  'everton': 'everton',
  'everton fc': 'everton',
  '368': 'everton',
  'fulham': 'fulham',
  'fulham fc': 'fulham',
  '370': 'fulham',
  'ipswich': 'ipswich',
  'ipswich town': 'ipswich',
  '373': 'ipswich',
  'leicester': 'leicester',
  'leicester city': 'leicester',
  '375': 'leicester',
  'nottingham forest': 'nottingham-forest',
  'nottingham': 'nottingham-forest',
  'forest': 'nottingham-forest',
  '393': 'nottingham-forest',
  'southampton': 'southampton',
  'southampton fc': 'southampton',
  '376': 'southampton',
  'west ham': 'west-ham',
  'west ham united': 'west-ham',
  '371': 'west-ham',
  'wolverhampton wanderers': 'wolves',
  'wolverhampton': 'wolves',
  'wolves': 'wolves',
  '380': 'wolves',

  // EFL Championship
  'leeds united': 'leeds',
  'leeds': 'leeds',
  '357': 'leeds',
  'burnley': 'burnley',
  'burnley fc': 'burnley',
  '379': 'burnley',
  'sunderland': 'sunderland',
  'sunderland afc': 'sunderland',
  '366': 'sunderland',
  'sheffield united': 'sheffield-united',
  'sheffield utd': 'sheffield-united',
  '398': 'sheffield-united',
  'west bromwich albion': 'west-brom',
  'west brom': 'west-brom',
  'wba': 'west-brom',
  '383': 'west-brom',
  'norwich city': 'norwich',
  'norwich': 'norwich',
  '381': 'norwich',
  'wrexham': 'wrexham',
  'wrexham afc': 'wrexham',
  '352': 'wrexham',
  'birmingham city': 'birmingham',
  'birmingham': 'birmingham',
  '392': 'birmingham',
  'blackburn rovers': 'blackburn',
  'blackburn': 'blackburn',
  '365': 'blackburn',
  'bristol city': 'bristol-city',
  '333': 'bristol-city',
  'cardiff city': 'cardiff',
  'cardiff': 'cardiff',
  '347': 'cardiff',
  'coventry city': 'coventry',
  'coventry': 'coventry',
  '388': 'coventry',
  'derby county': 'derby',
  'derby': 'derby',
  '374': 'derby',
  'hull city': 'hull',
  'hull': 'hull',
  '306': 'hull',
  'luton town': 'luton',
  'luton': 'luton',
  '301': 'luton',
  'middlesbrough': 'middlesbrough',
  'boro': 'middlesbrough',
  '369': 'middlesbrough',
  'millwall': 'millwall',
  'millwall fc': 'millwall',
  '391': 'millwall',
  'oxford united': 'oxford',
  'oxford': 'oxford',
  '311': 'oxford',
  'plymouth argyle': 'plymouth',
  'plymouth': 'plymouth',
  '307': 'plymouth',
  'portsmouth': 'portsmouth',
  'portsmouth fc': 'portsmouth',
  '385': 'portsmouth',
  'preston north end': 'preston',
  'preston': 'preston',
  '394': 'preston',
  'queens park rangers': 'qpr',
  'qpr': 'qpr',
  '334': 'qpr',
  'sheffield wednesday': 'sheffield-wednesday',
  '399': 'sheffield-wednesday',
  'stoke city': 'stoke',
  'stoke': 'stoke',
  '336': 'stoke',
  'swansea city': 'swansea',
  'swansea': 'swansea',
  '318': 'swansea',
  'watford': 'watford',
  'watford fc': 'watford',
  '395': 'watford',

  // EFL League One
  'afc wimbledon': 'afc-wimbledon',
  'wimbledon': 'afc-wimbledon',
  '3802': 'afc-wimbledon',
  'barnsley': 'barnsley',
  '397': 'barnsley',
  'blackpool': 'blackpool',
  '346': 'blackpool',
  'bolton wanderers': 'bolton',
  'bolton': 'bolton',
  '358': 'bolton',
  'bristol rovers': 'bristol-rovers',
  '308': 'bristol-rovers',
  'burton albion': 'burton',
  'burton': 'burton',
  '2567': 'burton',
  'cambridge united': 'cambridge',
  'cambridge': 'cambridge',
  '351': 'cambridge',
  'charlton athletic': 'charlton',
  'charlton': 'charlton',
  '372': 'charlton',
  'crawley town': 'crawley',
  'crawley': 'crawley',
  '2594': 'crawley',
  'exeter city': 'exeter',
  'exeter': 'exeter',
  '324': 'exeter',
  'huddersfield town': 'huddersfield',
  'huddersfield': 'huddersfield',
  '335': 'huddersfield',
  'leyton orient': 'leyton-orient',
  '309': 'leyton-orient',
  'lincoln city': 'lincoln',
  'lincoln': 'lincoln',
  '314': 'lincoln',
  'mansfield town': 'mansfield',
  'mansfield': 'mansfield',
  '304': 'mansfield',
  'northampton town': 'northampton',
  'northampton': 'northampton',
  '353': 'northampton',
  'peterborough united': 'peterborough',
  'peterborough': 'peterborough',
  '342': 'peterborough',
  'reading': 'reading',
  'reading fc': 'reading',
  '338': 'reading',
  'rotherham united': 'rotherham',
  'rotherham': 'rotherham',
  '402': 'rotherham',
  'shrewsbury town': 'shrewsbury',
  'shrewsbury': 'shrewsbury',
  '302': 'shrewsbury',
  'stevenage': 'stevenage',
  'stevenage fc': 'stevenage',
  '285': 'stevenage',
  'stockport county': 'stockport',
  'stockport': 'stockport',
  '400': 'stockport',
  'wigan athletic': 'wigan',
  'wigan': 'wigan',
  '350': 'wigan',
  'wycombe wanderers': 'wycombe',
  'wycombe': 'wycombe',
  '344': 'wycombe',

  // EFL League Two
  'accrington stanley': 'accrington',
  'accrington': 'accrington',
  '2731': 'accrington',
  'barnet': 'barnet',
  'barnet fc': 'barnet',
  '280': 'barnet',
  'barrow': 'barrow',
  'barrow afc': 'barrow',
  'bradford city': 'bradford',
  'bradford': 'bradford',
  '387': 'bradford',
  'bromley': 'bromley',
  'bromley fc': 'bromley',
  '3129': 'bromley',
  'carlisle united': 'carlisle',
  'carlisle': 'carlisle',
  'cheltenham town': 'cheltenham',
  'cheltenham': 'cheltenham',
  '320': 'cheltenham',
  'chesterfield': 'chesterfield',
  'chesterfield fc': 'chesterfield',
  '343': 'chesterfield',
  'colchester united': 'colchester',
  'colchester': 'colchester',
  '339': 'colchester',
  'crewe alexandra': 'crewe',
  'crewe': 'crewe',
  '396': 'crewe',
  'doncaster rovers': 'doncaster',
  'doncaster': 'doncaster',
  '279': 'doncaster',
  'fleetwood town': 'fleetwood',
  'fleetwood': 'fleetwood',
  '3891': 'fleetwood',
  'gillingham': 'gillingham',
  'gillingham fc': 'gillingham',
  '389': 'gillingham',
  'grimsby town': 'grimsby',
  'grimsby': 'grimsby',
  '386': 'grimsby',
  'harrogate town': 'harrogate',
  'harrogate': 'harrogate',
  'mk dons': 'mk-dons',
  'milton keynes dons': 'mk-dons',
  '390': 'mk-dons',
  'morecambe': 'morecambe',
  'morecambe fc': 'morecambe',
  'newport county': 'newport',
  'newport': 'newport',
  '635': 'newport',
  'notts county': 'notts-county',
  '340': 'notts-county',
  'port vale': 'port-vale',
  '348': 'port-vale',
  'salford city': 'salford',
  'salford': 'salford',
  '4703': 'salford',
  'swindon town': 'swindon',
  'swindon': 'swindon',
  '341': 'swindon',
  'tranmere rovers': 'tranmere',
  'tranmere': 'tranmere',
  '345': 'tranmere',
  'walsall': 'walsall',
  'walsall fc': 'walsall',
  '401': 'walsall',

  // Grandes de Europa
  'internazionale': 'inter',
  'inter milan': 'inter',
  'inter': 'inter',
  '110': 'inter',
  'juventus': 'juventus',
  '111': 'juventus',
  'ac milan': 'milan',
  'milan': 'milan',
  '103': 'milan',
  'roma': 'roma',
  'as roma': 'roma',
  '104': 'roma',
  'lazio': 'lazio',
  'ss lazio': 'lazio',
  '112': 'lazio',
  'napoli': 'napoli',
  'ssc napoli': 'napoli',
  '114': 'napoli',
  'atalanta': 'atalanta',
  'atalanta bc': 'atalanta',
  '105': 'atalanta',
  'fiorentina': 'fiorentina',
  'acf fiorentina': 'fiorentina',
  '109': 'fiorentina',
  'bayern munich': 'bayern',
  'bayern munchen': 'bayern',
  'bayern': 'bayern',
  '132': 'bayern',
  'borussia dortmund': 'dortmund',
  'dortmund': 'dortmund',
  '124': 'dortmund',
  'bayer leverkusen': 'leverkusen',
  'leverkusen': 'leverkusen',
  '131': 'leverkusen',
  'rb leipzig': 'leipzig',
  'leipzig': 'leipzig',
  '11420': 'leipzig',
  'eintracht frankfurt': 'eintracht',
  'eintracht': 'eintracht',
  'frankfurt': 'eintracht',
  '125': 'eintracht',
  'vfb stuttgart': 'stuttgart',
  'stuttgart': 'stuttgart',
  '134': 'stuttgart',
  'paris saint germain': 'psg',
  'paris saint-germain': 'psg',
  'psg': 'psg',
  '160': 'psg',
  'as monaco': 'monaco',
  'monaco': 'monaco',
  '174': 'monaco',
  'olympique de marseille': 'marseille',
  'marseille': 'marseille',
  'marsella': 'marseille',
  '176': 'marseille',
  'olympique lyonnais': 'lyon',
  'lyon': 'lyon',
  '167': 'lyon',
}

// Incorporar aliases al índice CLUB_LOOKUP
for (const [alias, key] of Object.entries(ALIASES)) {
  const prof = VERIFIED_CLUBS[key]
  if (prof) {
    CLUB_LOOKUP.set(alias, prof)
    CLUB_LOOKUP.set(normalizeKey(alias), prof)
  }
}


/**
 * Resuelve la información verificada completa de un club por su nombre o ID.
 */
export function getVerifiedClubInfo(teamName: string, teamId?: string): VerifiedClubProfile | undefined {
  if (teamId) {
    const rawId = teamId.replace(/^espn-/, '')
    const byId = CLUB_LOOKUP.get(rawId)
    if (byId) return byId
  }
  const clean = teamName.toLowerCase().trim()
  const direct = CLUB_LOOKUP.get(clean)
  if (direct) return direct

  const norm = normalizeKey(teamName)
  const byNorm = CLUB_LOOKUP.get(norm)
  if (byNorm) return byNorm

  // Búsqueda por token significativo
  for (const [k, prof] of CLUB_LOOKUP.entries()) {
    if (k.length >= 4 && (norm.includes(k) || k.includes(norm))) {
      return prof
    }
  }

  return undefined
}

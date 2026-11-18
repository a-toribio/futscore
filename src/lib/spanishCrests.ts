/**
 * Catálogo verificable de escudos reales de clubes españoles (1ª, 2ª, 1ª RFEF, 2ª RFEF, 3ª RFEF y Copa del Rey).
 * Los escudos provienen del repositorio estático oficial de clubes de futbolme.com:
 * https://futbolme.com/static/img/club/escudo{id}.png
 */

import { toFutbolmeUrl } from './runtime'

export const FUTBOLME_CREST_BASE = 'https://futbolme.com/static/img/club'

export function buildFutbolmeCrestUrl(shieldId: number | string): string {
  return toFutbolmeUrl(`${FUTBOLME_CREST_BASE}/escudo${shieldId}.png`)
}

export const SPANISH_CLUB_CREST_IDS: Record<string, number> = {
  "Gimnástica Torrelavega": 4558,
  "San Sebastián de los Reyes": 4543,
  "CD Artistico Navalcarnero": 4107,
  "CD Artístico Navalcarnero": 4107,
  "CD Arnedo": 4306,
  "CD Ebro": 4529,
  "CD Tudelano": 4618,
  "CE Manresa": 4684,
  "CF Calamocha": 2202,
  "Club Atlético Osasuna B": 4467,
  "FC Barcelona Atlètic": 4466,
  "Girona FC B": 4520,
  "Náxara CD": 4266,
  "Peña Sport FC": 4410,
  "RCD Espanyol B": 4454,
  "Reus FC Reddis": 5398,
  "SD Logroñés": 4834,
  "Terrassa FC": 3980,
  "UD Barbastro": 4649,
  "UD Logroñés Promesas": 4224,
  "UE Olot": 3387,
  "Utebo FC": 4525,
  "AD Alcorcón": 4143,
  "Águilas FC": 4461,
  "Algeciras CF": 4304,
  "Antequera CF": 4745,
  "Atlético Madrileño": 4352,
  "CD Teruel": 4435,
  "CE Europa": 4385,
  "CF Rayo Majadahonda": 4133,
  "FC Cartagena": 4234,
  "Gimnàstic de Tarragona": 4274,
  "Hércules de Alicante CF": 4211,
  "Juventud Torremolinos CF": 3017,
  "Real Jaén CF": 4459,
  "Real Madrid-Castilla": 4437,
  "Real Murcia CF": 4493,
  "Real Zaragoza": 4396,
  "SD Huesca": 4623,
  "UD Ibiza": 9116,
  "UE Sant Andreu": 4517,
  "Villarreal CF B": 4425,
  "Atlético Sanluqueño CF": 98,
  "Betis Deportivo Balompié": 4419,
  "CD Badajoz": 8788,
  "CD Ciudad de Lucena": 7934,
  "CD Don Benito": 57,
  "CD Estepona FS": 9178,
  "CD Tenerife B": 4411,
  "Club Atlético Antoniano": 4680,
  "Club Atlético Central": 13242,
  "CP Mijas Las Lagunas": 12935,
  "Las Palmas Atlético": 4449,
  "Linares Deportivo": 5410,
  "Marbella FC": 4109,
  "Puente Genil FC": 3762,
  "RC Recreativo de Huelva": 4491,
  "Sevilla Atlético": 4420,
  "UD Tamaraceite": 1383,
  "Xerez CD": 4303,
  "AD Mérida": 7800,
  "Arenas Club": 4279,
  "Athletic Club B": 4443,
  "Barakaldo CF": 4188,
  "CD Coria": 4581,
  "CD Extremadura": 11866,
  "CD Lugo": 4484,
  "CD Mirandés": 4721,
  "CP Cacereño": 4598,
  "CyD Leonesa": 4389,
  "Pontevedra CF": 4415,
  "Racing Club Ferrol": 4364,
  "RC Deportivo Fabril": 4446,
  "Real Avilés Industrial CF": 15,
  "Real Unión Club": 4557,
  "SD Ponferradina": 4356,
  "UD Logroñés": 4224,
  "UD Ourense": 8874,
  "Unionistas de Salamanca CF": 8879,
  "Zamora CF": 4538,
  "CD Alcoyano": 4083,
  "CD Atlético Baleares": 4775,
  "CD Castellón B": 4299,
  "CD Cieza": 4129,
  "CD Minera": 4447,
  "CF Intercity": 9747,
  "CF La Nucía": 4361,
  "CF Lorca Deportiva": 8114,
  "Elche Ilicitano": 4362,
  "Orihuela CF": 4648,
  "RCD Mallorca B": 4462,
  "Real Murcia Imperial": 4493,
  "SCR Peña Deportiva": 4077,
  "UCAM Murcia CF": 4582,
  "UD Castellonense": 2237,
  "UD Poblense": 4114,
  "Valencia-Mestalla": 4475,
  "Yeclano Deportivo": 4496,
  "Arosa SC": 4570,
  "Atlético Astorga FC": 4243,
  "Bergantiños FC": 4668,
  "CD Basconia": 4311,
  "Club Marino de Luanco": 4254,
  "Club Portugalete": 4673,
  "Coruxo FC": 4287,
  "Deportivo Alavés B": 4476,
  "Ourense CF": 3024,
  "Rayo Cantabria": 4487,
  "Real Oviedo Vetusta": 4537,
  "RS Gimnástica": 4558,
  "SD Amorebieta": 4549,
  "SD Compostela": 7008,
  "SD Eibar B": 4486,
  "SD Gernika Club": 4168,
  "Sestao River Club": 4284,
  "UD Llanera": 3150,
  "Atlético Albacete": 4468,
  "Atlético Tordesillas": 4733,
  "Calvo Sotelo Puertollano CF": 8404,
  "CD Atlético Paso": 2030,
  "CD Guadalajara": 4661,
  "CD Numancia de Soria": 4485,
  "CDA Navalcarnero": 4107,
  "CF Talavera de la Reina": 5958,
  "Club Atlético de Madrid C": 4352,
  "Getafe CF B": 4439,
  "Gimnástica Segoviana CF": 4134,
  "Real Ávila CF": 4709,
  "Real Madrid CF C": 4437,
  "Real Valladolid Promesas": 4481,
  "RSD Alcalá": 4105,
  "Salamanca CF UDS": 7863,
  "UB Conquense": 4262,
  "UD San Sebastián Reyes": 4543,
  "AD Ceuta FC": 55,
  "AD Sporting Hortaleza": 8905,
  "AE Prat": 4681,
  "Albacete Balompié": 4468,
  "Athletic Club": 4443,
  "Atlético Calatayud": 4142,
  "Atlético Melilla CF": 7785,
  "Atlético Unión de Güímar": 7852,
  "Auriense CA": 15996,
  "Burgos CF": 4199,
  "Cádiz CF": 81,
  "CD Anaitasuna": 1929,
  "CD Baztan": 2101,
  "CD Castellón": 4299,
  "CD Ceuta 6 de Junio": 18328,
  "CD Covadonga": 4301,
  "CD Cuarte": 4639,
  "CD Eldense": 4515,
  "CD Guijuelo": 4391,
  "CD Laredo": 4381,
  "CD Leganés": 4349,
  "CD Manacor": 4739,
  "CD Pamplona": 4155,
  "CD San José": 3774,
  "CD Tarancón": 6419,
  "CD Tedeón": 4553,
  "CD Tenerife": 4411,
  "CD Varea": 4835,
  "CE Sabadell FC": 4250,
  "CF San Rafael": 4196,
  "CF Trival Valderas Alcorcón": 4165,
  "CFUE Tavernes de la Valldigna": 3972,
  "Club Atlético de Madrid": 4352,
  "Club Atlético Osasuna": 4467,
  "Córdoba CF": 4360,
  "CP Talayuela": 3963,
  "Deportivo Alavés": 4476,
  "Elche CF": 4362,
  "FC Andorra": 4628,
  "FC Barcelona": 4466,
  "Getafe CF": 4439,
  "Girona FC": 4520,
  "Granada CF": 4561,
  "Levante UD": 4469,
  "Málaga CF": 4424,
  "Rayo Vallecano de Madrid": 4405,
  "RC Celta de Vigo": 4465,
  "RC Deportivo de A Coruña": 4446,
  "RCD Espanyol de Barcelona": 4454,
  "RCD Mallorca": 4462,
  "Real Betis Balompié": 4419,
  "Real Madrid CF": 4437,
  "Real Oviedo": 4537,
  "Real Racing Club": 4487,
  "Real Sociedad de Fútbol": 4464,
  "Real Sporting de Gijón": 4438,
  "Real Valladolid CF": 4481,
  "Ribadesella CF": 4194,
  "SD Eibar": 4486,
  "SD Noja": 4383,
  "Sevilla FC": 4420,
  "Sporting de Alcázar CF": 9360,
  "UB Lebrijana": 5269,
  "UD Almería": 80,
  "UD Las Palmas": 4449,
  "UD Maracena": 4821,
  "UD Pinatar": 14937,
  "Valencia CF": 4475,
  "Villarreal CF": 4425,
  "Sporting Atlético": 4438,
  "CD Lealtad de Villaviciosa": 4255,
  "Condal Club": 4441,
  "Caudal Deportivo": 4169,
  "UD Gijón Industrial": 4192,
  "CD Mosconia": 4147,
  "EI San Martín RA": 8143,
  "CD Praviano": 4223,
  "UP Langreo": 4267,
  "Club Siero": 3870,
  "CD Colunga": 1115,
  "Avilés Stadium CF": 9776,
  "CD Llanes": 4560,
  "UC Ceares": 4125,
  "Astur CF": 1988,
  "L´Entregu CF": 3072,
  "Andés CF": 4314,
  "CF Santomera": 4455,
  "EF Santa Cruz": 14959,
  "Águilas FC B": 4461,
  "Mar Menor San Javier CF": 15647,
  "UCAM Murcia CF B": 4582,
  "Molinense FC": 5951,
  "UD Los Garres": 3169,
  "CD Bala Azul": 4700,
  "Deportivo Marítimo": 5707,
  "Alcantarilla FC": 9174,
  "Club Atlético Pulpileño": 109,
  "Club Olímpico de Totana": 4253,
  "CD Cotillas Estrella Grana": 2548,
  "FC Cartagena B": 4234,
  "SFC Minerva": 8934,
  "CD Algar": 6379,
  "Bullas Deportivo": 14935,
  "Mazarrón FC": 8935,
  "CD Azuaga": 2062,
  "AD Llerenense": 6032,
  "Moralo CP": 4568,
  "CD Castuera": 2249,
  "CF Villanovense": 4720,
  "EF Puebla de la Calzada": 3508,
  "CD Zafra": 9779,
  "CD Cabeza del Buey": 16463,
  "CD Quintana": 1405,
  "SP Villafranca": 99,
  "CF Jaraíz": 378,
  "CD Santa Amalia": 4591,
  "CD Gévora": 8232,
  "Jerez CF": 4268,
  "UP Plasencia": 124,
  "UD Montijo": 3258,
  "Atlético Club Pueblonuevo": 4337,
  "CD Guadiana": 2888,
  "CD Boiro": 2146,
  "SD Sarriana": 7026,
  "Silva SD": 7259,
  "CD Barco": 2090,
  "Atlético Arteixo": 4650,
  "Portonovo SD": 4572,
  "CD Estradense": 4796,
  "CD Lalín": 14082,
  "Racing Club Villalbés": 68,
  "Pontevedra CF B": 4415,
  "Antela FC": 6967,
  "Alondras CF": 4132,
  "UD Somozas": 4238,
  "Céltiga FC": 2347,
  "CD Arenteiro": 1958,
  "AC Montañeros CF": 4324,
  "Gran Peña FC": 2873,
  "Viveiro CF": 5050,
  "Club Haro Deportivo": 4614,
  "FC La Calzada": 3080,
  "CD Alfaro": 4616,
  "CD Calahorra": 4187,
  "CD Berceo": 4112,
  "CD Anguiano": 4122,
  "SD Oyonesa": 4111,
  "CD Agoncillo": 4597,
  "CD San Marcial": 96,
  "CD Pradejón": 4652,
  "Yagüe CF": 5075,
  "CP Calasancio": 4378,
  "Club Atlético River Ebro": 4728,
  "Comillas CF": 2361,
  "CD Cenicero": 4145,
  "Club Atlético Vianés": 4338,
  "Casalarreina CF": 2230,
  "CF Platges de Calvià": 4078,
  "CD Ibiza Islas Pitiusas": 8780,
  "CE Constància": 4827,
  "UE Porreres": 671,
  "PE Sant Jordi": 3671,
  "CD Llosetense": 4480,
  "CD Cardassar": 2221,
  "SD Formentera": 3840,
  "CE Santanyí": 4698,
  "CD Binissalem": 4473,
  "UE Alcúdia": 3,
  "CE Andratx": 1932,
  "CE Mercadal": 4702,
  "CE Sineu": 8893,
  "CD Migjorn": 3225,
  "Inter Ibiza CD": 9249,
  "UD Arenal": 4632,
  "Villarreal CF C": 4425,
  "Atlético Levante UD": 4469,
  "Torrent CF": 4008,
  "Hércules de Alicante CF B": 4211,
  "CD Acero": 4456,
  "Crevillente Deportivo": 4501,
  "CD Eldense B": 4515,
  "UD Vall de Uxó": 4992,
  "CD Roda": 3716,
  "CD Buñol": 2183,
  "Ontinyent 1931 CF": 17894,
  "Atlético Saguntino": 4803,
  "CD Español de San Vicente": 4503,
  "Atzeneta UE": 8899,
  "Athletic Club Torrellano": 16365,
  "SC Torrevieja CF": 15786,
  "CD Soneja": 16317,
  "CD Utiel": 4979,
  "UD San Fernando": 6428,
  "CF Panadería Pulido": 8270,
  "CD Arcángel San Miguel": 49,
  "Real Unión de Tenerife SC": 3561,
  "UD Las Palmas C": 4449,
  "CD Unión Sur Yaiza MlC": 2331,
  "CD Marino": 4323,
  "CD Tenerife C": 4411,
  "UD Los Llanos de Aridane": 3170,
  "Estrella CF": 4843,
  "CD Mensajero": 4413,
  "UD Lanzarote": 4593,
  "AD San Bartolomé CF": 3758,
  "UD Villa de Santa Brígida": 4084,
  "CD Añapro": 15312,
  "SD Villaverde Norte": 588,
  "UD Playas de Sotavento": 4056,
  "CD Laguna": 4601,
  "CD Izarra": 4095,
  "UD Mutilvera": 4685,
  "CD Subiza Cendea de Galar": 2320,
  "CD Valle de Egüés": 4353,
  "Beti Kozkor KE": 8254,
  "AD San Juan": 4672,
  "CF Gazte Berriak": 2282,
  "CD Avance Ezcabarte": 2262,
  "CD Aoiz": 4098,
  "Doneztebe FT": 16489,
  "UDC Txantrea KKE": 4219,
  "Club Atlético Cirbonero": 4121,
  "CD Cantolagua": 2270,
  "CD Beti-Onak": 4408,
  "CD Huarte": 4139,
  "CD Cortes": 4160,
  "FC Bidezarra": 9337,
  "SD Leioa": 4233,
  "CD Aurrera de Vitoria": 4210,
  "Deportivo Alavés C": 4476,
  "Real Sociedad de Fútbol C": 4464,
  "CD Derio": 2493,
  "SCD Durango": 4282,
  "UD Aretxabaleta": 4043,
  "CD Touring": 670,
  "SD Beasain": 4207,
  "CD San Ignacio": 3766,
  "SD Eibar C": 4486,
  "Sodupe UC": 3894,
  "CD Lagun Onak": 120,
  "Real Unión Club B": 4557,
  "Pasaia KE": 4175,
  "CD Santurtzi": 4687,
  "SD Erandio Club": 5423,
  "Amurrio Club": 4200,
  "RZ Deportivo Aragón": 4396,
  "SD Ejea": 4307,
  "CD Brea": 2162,
  "CD La Almunia": 3074,
  "CD Caspe": 4293,
  "Atlético Monzón": 4544,
  "SD Huesca B": 4623,
  "CD Binéfar": 4208,
  "CD Siétamo": 16496,
  "CF Épila": 8167,
  "AD Almudévar": 4933,
  "UD Fraga": 4046,
  "Andorra CF": 4541,
  "CF Illueca": 2966,
  "CDJ Tamarite": 3965,
  "CD Robres": 4514,
  "CD Belchite 97": 2105,
  "CD Móstoles URJC": 2290,
  "CD Colonia Moscardó": 4212,
  "CD Las Rozas": 3974,
  "CD Galapagar": 8171,
  "AD Cala Pozuelo": 9843,
  "AD Unión Adarve": 4653,
  "CD Leganés B": 4349,
  "CF Pozuelo de Alarcón": 4329,
  "AD Torrejón CF": 4873,
  "CF Fuenlabrada": 4463,
  "CP Parla Escuela": 3430,
  "Real Aranjuez CF": 3556,
  "Rayo Vallecano de Madrid B": 4405,
  "Rayo Ciudad Alcobendas CF": 9007,
  "México FC": 4494,
  "UD San Sebastián Reyes  B": 4543,
  "Siello Nuevo Boadilla FC": 5038,
  "UD Melilla": 117,
  "Arenas de Armilla CyD CF": 4719,
  "UDC Torredonjimeno": 5232,
  "UD Almería B": 80,
  "Club Atlético Malagueño": 4424,
  "CF Motril": 8958,
  "Churriana de la Vega CF": 5692,
  "FC Marbellí": 2022,
  "UD San Pedro": 4766,
  "Club Recreativo Granada": 4561,
  "CD Huétor Vega": 2946,
  "Atlético de Porcuna CF": 7939,
  "UD Torre del Mar": 4004,
  "CD Alhaurino": 4738,
  "Atlético de Marbella Balompié": 16450,
  "Atlético Mancha Real": 4679,
  "Cantoria 2017 FC": 16448,
  "Málaga Juniors FC": 2097,
  "CD Tropezón": 4416,
  "CD Cayón": 6,
  "CD Revilla": 3568,
  "CD Bezana": 94,
  "CF Vimenor": 4382,
  "UD Sámano": 3752,
  "SD Torina": 5405,
  "CD Atlético Mineros": 9772,
  "SD Solares-Medio Cudeyo": 4244,
  "SD Atlético La Albericia": 4280,
  "Castro FC": 4380,
  "CD Guarnizo": 4174,
  "CD Barquereño": 40,
  "UM Escobedo": 4310,
  "Selaya FC": 3851,
  "Velarde CF": 7,
  "CD Naval": 3299,
  "CF Vilanova i la Geltrú": 4576,
  "CE Europa B": 4385,
  "CF Badalona": 4387,
  "CF Montañesa": 4801,
  "Cerdanyola del Vallès FC": 2350,
  "CE L´Hospitalet": 4203,
  "CE Atlètic Lleida": 18280,
  "UE Tona": 8867,
  "FE Grama": 9293,
  "CF Pobla de Mafumet": 4495,
  "UE San Juan Atlético de Montcada": 9138,
  "FC Martinenc": 5400,
  "UE Vilassar de Mar": 5026,
  "UE Cornellà": 4312,
  "CF Peralada": 3455,
  "CFJ Mollerussa": 1406,
  "FC L´Escala": 2950,
  "CP San Cristóbal": 3760,
  "CD Manchego Ciudad Real": 2398,
  "CD Toledo": 4186,
  "CD Villacañas": 4099,
  "CD Villa": 9794,
  "CP Villarrobledo": 4666,
  "CD Illescas": 4222,
  "AD San Clemente": 9353,
  "CD Noblejas": 3342,
  "CD Torrijos": 4664,
  "Villarrubia CF": 4838,
  "UD Almansa": 111,
  "CD Marchamalo": 21,
  "CF La Solana": 3102,
  "UD Socuéllamos CF": 4635,
  "CD Huracán de Balazote": 8950,
  "CD Quintanar del Rey": 4579,
  "CD Guadalajara B": 4661,
  "Dos Hermanas CF 1971": 11864,
  "Racing Club Portuense": 4743,
  "CD San Roque de Lepe": 4625,
  "Xerez Deportivo FC": 8989,
  "Real Betis Balompié C": 4419,
  "UD Tomares": 4777,
  "CD Utrera": 4980,
  "CD Egabrense": 6097,
  "CD Pozoblanco": 4771,
  "RB Linense": 79,
  "AD Ceuta FC B": 55,
  "Conil CF": 4807,
  "Cádiz CF Mirandilla": 117,
  "Chiclana CF": 2380,
  "Sevilla FC C": 4420,
  "Atlético Onubense": 4491,
  "Bollullos CF": 4713,
  "Córdoba CF B": 4360,
  "UD Santa Marta de Tormes": 4772,
  "CD Palencia Cristo Atlético": 103,
  "Júpiter Leonés": 4389,
  "Burgos CF Promesas": 4199,
  "Palencia CF": 8921,
  "CD La Virgen del Camino": 4841,
  "SD Almazán": 4732,
  "Atlético Bembibre": 4736,
  "CD Villaralbo": 4782,
  "Atlético Mansillés": 16393,
  "Arandina CF": 1,
  "Turégano CF": 16422,
  "Unionistas de Salamanca CF B": 8879,
  "CD Calasanz": 1180,
  "CD Colegios Diocesanos": 5104,
  "Salamanca CF UDS B": 7863,
  "CD Mirandés B": 4721,
  "Real Unión": 4557,
  "Real Unión de Irún": 4557,
  "Real Unión Irún": 4557,
  "Real Unión Club de Irún": 4557,
  "Real Unión B": 4557,
  "Irún": 4557,
  "CD Real Unión": 4557,
  "Cultural Leonesa": 4389,
  "Cultural y Deportiva Leonesa": 4389,
  "Nàstic de Tarragona": 4274,
  "Gimnàstic": 4274,
  "Nàstic": 4274,
  "Racing de Santander": 4487,
  "Real Racing Club de Santander": 4487,
  "Racing Santander": 4487,
  "Racing de Ferrol": 4364,
  "Racing Ferrol": 4364,
  "Recreativo de Huelva": 4491,
  "Recreativo": 4491,
  "Deportivo de La Coruña": 4446,
  "RC Deportivo": 4446,
  "Deportivo La Coruña": 4446,
  "Sporting de Gijón": 4438,
  "Sporting Gijón": 4438,
  "Gimnástica de Torrelavega": 4558,
  "RS Gimnástica de Torrelavega": 4558,
  "UD San Sebastián de los Reyes": 4543,
  "Sanse": 4543,
  "Atlético Sanluqueño": 98,
  "Atlético Baleares": 4775,
  "CE L'Hospitalet": 4203,
  "L'Hospitalet": 4203,
  "Hospitalet": 4203,
  "Sant Andreu": 4517,
  "CE Sabadell": 4250,
  "Sabadell": 4250,
  "Real Madrid Castilla": 4437,
  "RM Castilla": 4437,
  "Bilbao Athletic": 4443,
  "Athletic Club Bilbao": 4443,
  "Real Sociedad B": 4464,
  "Celta Fortuna": 4465,
  "RC Celta Fortuna": 4465,
  "Celta de Vigo B": 4465,
  "Barcelona Atlètic": 4466,
  "Barça Atlètic": 4466,
  "FC Barcelona B": 4466,
  "Betis Deportivo": 4419,
  "Real Betis B": 4419,
  "Valencia Mestalla": 4475,
  "Valencia CF Mestalla": 4475,
}

const dynamicCrestUrls = new Map<string, string>()

export function normalizeSpanishClubName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[´’']/g, ' ')

  const withoutOrg = base
    .replace(
      /\b(cf|cd|ud|sd|ad|cp|rcd|rc|fc|ca|ce|ue|up|ucam|scr|rb|um|fe|cfj|udc|cyd|rs|cda|club|asociacion|sad)\b/g,
      ' ',
    )
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const withoutConnectors = withoutOrg
    .replace(/\b(de|del|la|las|los|el|i|y)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const core = withoutOrg
    .replace(
      /\b(deportivo|deportiva|real|atletico|atletic|union|balompie|futbol|industrial)\b/g,
      ' ',
    )
    .replace(/\s+/g, ' ')
    .trim()

  // Si todas las palabras sustantivas fueron eliminadas (p. ej. "Real Unión Club" o "Real Unión Club B"),
  // conservamos las palabras descriptivas ("real union") para que nunca quede vacío ni pierda su escudo.
  if (core.replace(/\b[bc]\b/g, '').trim().length < 3) {
    return withoutConnectors || withoutOrg
  }
  return core
}

function cleanExact(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[´’']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

interface IndexedClub {
  original: string
  exact: string
  norm: string
  normCompact: string
  isReserve: boolean
  url: string
}

function stripSpanishConnectors(norm: string): string {
  return norm
    .replace(/\b(de|del|la|las|los|el|i|y)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const indexedClubs: IndexedClub[] = Object.entries(SPANISH_CLUB_CREST_IDS).map(([original, id]) => {
  const norm = normalizeSpanishClubName(original)
  return {
    original,
    exact: cleanExact(original),
    norm,
    normCompact: stripSpanishConnectors(norm),
    isReserve: /\b(b|c|promesas|imperial|ilicitano|mestalla|mirandilla|fabril|fortuna|castilla)\s*$/i.test(original),
    url: buildFutbolmeCrestUrl(id),
  }
})

/**
 * Registra dinámicamente el escudo real de un club extraído en vivo desde una tabla o partido.
 */
export function registerSpanishTeamCrest(name: string, logoUrl?: string): void {
  if (!name || !logoUrl) return
  const trimmed = logoUrl.trim()
  if (!trimmed) return
  const normalizedUrl = trimmed.startsWith('//')
    ? `https:${trimmed}`
    : trimmed.startsWith('/')
      ? `https://futbolme.com${trimmed}`
      : trimmed.replace('https://futbolme.com//static/', 'https://futbolme.com/static/')

  dynamicCrestUrls.set(cleanExact(name), normalizedUrl)
  const norm = normalizeSpanishClubName(name)
  if (norm) {
    dynamicCrestUrls.set(norm, normalizedUrl)
  }
}

/**
 * Resuelve la URL del escudo oficial real de un equipo español cuando el proveedor principal
 * no lo incluye o cuando proviene de competiciones RFEF / Copa del Rey.
 */
export function resolveSpanishTeamCrest(name: string, existingLogoUrl?: string): string | undefined {
  if (existingLogoUrl && existingLogoUrl.trim().length > 0) {
    if (typeof window !== 'undefined' && existingLogoUrl.includes('futbolme.com/')) {
      return toFutbolmeUrl(existingLogoUrl)
    }
    return existingLogoUrl
  }
  if (!name || !name.trim()) return undefined

  const exact = cleanExact(name)
  const fromDynamicExact = dynamicCrestUrls.get(exact)
  if (fromDynamicExact) return toFutbolmeUrl(fromDynamicExact)

  const byExact = indexedClubs.find((c) => c.exact === exact)
  if (byExact) return byExact.url

  const norm = normalizeSpanishClubName(name)
  if (!norm) return undefined

  const fromDynamicNorm = dynamicCrestUrls.get(norm)
  if (fromDynamicNorm) return toFutbolmeUrl(fromDynamicNorm)

  const isQueryReserve =
    /\b(b|c|promesas|imperial|ilicitano|mestalla|mirandilla|fabril|fortuna|castilla)\s*$/i.test(name)

  const normMatches = indexedClubs.filter((c) => c.norm === norm)
  if (normMatches.length > 0) {
    const preferred = normMatches.find((c) => c.isReserve === isQueryReserve) ?? normMatches[0]
    return preferred.url
  }

  // Respaldo sin preposiciones ("Real Unión de Irún" == "Real Unión Irún", "Gimnástica de Torrelavega" == "Gimnástica Torrelavega")
  // manteniendo separados clubes distintos como "Atlético de Madrid" vs "Real Madrid" mediante `exact`/`norm` previos.
  const compact = stripSpanishConnectors(norm)
  if (compact.length >= 4) {
    const compactMatches = indexedClubs.filter((c) => c.normCompact === compact)
    if (compactMatches.length > 0) {
      const preferred = compactMatches.find((c) => c.isReserve === isQueryReserve) ?? compactMatches[0]
      return preferred.url
    }
  }

  // Coincidencia parcial por nombre significativo (>= 4 caracteres)
  if (norm.length >= 4) {
    const candidates = indexedClubs.filter(
      (c) =>
        c.norm.length >= 4 &&
        c.isReserve === isQueryReserve &&
        (c.norm.includes(norm) || norm.includes(c.norm)),
    )
    if (candidates.length > 0) {
      candidates.sort((a, b) => Math.abs(a.norm.length - norm.length) - Math.abs(b.norm.length - norm.length))
      return candidates[0].url
    }
  }

  return undefined
}

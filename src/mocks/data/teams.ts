import type { Team } from '@/types'

const crest = (id: number) => `https://crests.football-data.org/${id}.png`

const t = (id: string, name: string, shortName: string, crestId: number): Team => ({
  id,
  name,
  shortName,
  logoUrl: crest(crestId),
})

export const teams = {
  // LaLiga
  rma: t('rma', 'Real Madrid', 'RMA', 86),
  bar: t('bar', 'FC Barcelona', 'BAR', 81),
  atm: t('atm', 'Atlético de Madrid', 'ATM', 78),
  sev: t('sev', 'Sevilla FC', 'SEV', 559),
  ath: t('ath', 'Athletic Club', 'ATH', 77),
  rso: t('rso', 'Real Sociedad', 'RSO', 92),
  bet: t('bet', 'Real Betis', 'BET', 90),
  vil: t('vil', 'Villarreal CF', 'VIL', 94),
  // Premier League
  mci: t('mci', 'Manchester City', 'MCI', 65),
  liv: t('liv', 'Liverpool', 'LIV', 64),
  ars: t('ars', 'Arsenal', 'ARS', 57),
  che: t('che', 'Chelsea', 'CHE', 61),
  mun: t('mun', 'Manchester United', 'MUN', 66),
  tot: t('tot', 'Tottenham Hotspur', 'TOT', 73),
  new: t('new', 'Newcastle United', 'NEW', 67),
  avl: t('avl', 'Aston Villa', 'AVL', 58),
  // Serie A
  juv: t('juv', 'Juventus', 'JUV', 109),
  int: t('int', 'Inter', 'INT', 108),
  mil: t('mil', 'AC Milan', 'MIL', 98),
  nap: t('nap', 'Napoli', 'NAP', 113),
  rom: t('rom', 'AS Roma', 'ROM', 100),
  laz: t('laz', 'Lazio', 'LAZ', 110),
  // Bundesliga
  bay: t('bay', 'Bayern München', 'BAY', 5),
  bvb: t('bvb', 'Borussia Dortmund', 'BVB', 4),
  b04: t('b04', 'Bayer Leverkusen', 'B04', 3),
  rbl: t('rbl', 'RB Leipzig', 'RBL', 721),
  sge: t('sge', 'Eintracht Frankfurt', 'SGE', 19),
  vfb: t('vfb', 'VfB Stuttgart', 'VFB', 10),
  // Ligue 1
  psg: t('psg', 'Paris Saint-Germain', 'PSG', 524),
  om: t('om', 'Olympique de Marseille', 'OM', 516),
  ol: t('ol', 'Olympique Lyonnais', 'OL', 523),
  asm: t('asm', 'AS Monaco', 'ASM', 548),
  lil: t('lil', 'LOSC Lille', 'LIL', 521),
  nic: t('nic', 'OGC Nice', 'NIC', 522),
} satisfies Record<string, Team>

export type TeamKey = keyof typeof teams

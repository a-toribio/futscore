export interface PositionTranslation {
  code: 'POR' | 'DEF' | 'MED' | 'DEL' | 'SUP'
  label: 'Portero' | 'Defensa' | 'Centrocampista' | 'Delantero' | 'Suplente'
  color: string
}

const POR_EXACT = new Set(['G', 'GK', 'PO', 'POR', 'PT', 'ARQ'])
const DEF_EXACT = new Set([
  'D',
  'DF',
  'DEF',
  'CB',
  'LB',
  'RB',
  'WB',
  'LWB',
  'RWB',
  'SW',
  'CD',
  'CD-L',
  'CD-R',
  'CB-L',
  'CB-R',
  'LCB',
  'RCB',
  'LD',
  'RD',
])
const MED_EXACT = new Set([
  'M',
  'MF',
  'MID',
  'MED',
  'CM',
  'CM-L',
  'CM-R',
  'LCM',
  'RCM',
  'LM',
  'RM',
  'DM',
  'DM-L',
  'DM-R',
  'LDM',
  'RDM',
  'CDM',
  'AM',
  'AM-L',
  'AM-R',
  'LAM',
  'RAM',
  'CAM',
  'MC',
  'MCO',
  'MCD',
  'MI',
  'MD',
  'VOL',
  'PIV',
])
const DEL_EXACT = new Set([
  'F',
  'FW',
  'FWD',
  'CF',
  'CF-L',
  'CF-R',
  'ST',
  'ST-L',
  'ST-R',
  'LS',
  'RS',
  'SS',
  'LW',
  'RW',
  'LF',
  'LF-L',
  'RF',
  'RF-R',
  'WF',
  'W',
  'EI',
  'ED',
  'DC',
  'SD',
  'ATA',
  'ATT',
])
const SUP_EXACT = new Set(['SUB', 'SUP', 'RES', 'B', 'S', 'BENCH'])

const POR_MAP: PositionTranslation = {
  code: 'POR',
  label: 'Portero',
  color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

const DEF_MAP: PositionTranslation = {
  code: 'DEF',
  label: 'Defensa',
  color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
}

const MED_MAP: PositionTranslation = {
  code: 'MED',
  label: 'Centrocampista',
  color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
}

const DEL_MAP: PositionTranslation = {
  code: 'DEL',
  label: 'Delantero',
  color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
}

const SUP_MAP: PositionTranslation = {
  code: 'SUP',
  label: 'Suplente',
  color: 'bg-surface text-fg-muted border-border',
}

/**
 * Traduce y normaliza cualquier denominación o código de posición al estándar en español.
 * Garantiza que nunca se muestren términos o abreviaturas en inglés en las alineaciones.
 */
export function translatePosition(pos?: string): PositionTranslation {
  const p = (pos || '').toUpperCase().trim()
  if (!p) return SUP_MAP

  // 1. Portero (Goalkeeper, G, GK, PO, Portero, Arquero)
  if (POR_EXACT.has(p) || /GOAL|PORTER|ARQUER|GUARDAM/.test(p)) {
    return POR_MAP
  }

  // 2. Suplente / Reserva explícito
  if (SUP_EXACT.has(p) || /SUBSTIT|SUPLENT|RESERV|BANQUILL/.test(p)) {
    return SUP_MAP
  }

  // 3. Centrocampista (evaluado antes de DEL para capturar Attacking Midfielder como MED)
  if (
    MED_EXACT.has(p) ||
    /MIDFIELD|CENTROCAMPIST|MEDIO|MEDIOCENTRO|VOLANTE|PIVOTE|INTERIOR|ORGANIZ/.test(p)
  ) {
    return MED_MAP
  }

  // 4. Delantero (Forward, Striker, Winger, Extremo, Punta)
  if (
    DEL_EXACT.has(p) ||
    /FORWARD|STRIKER|DELANTER|WINGER?|EXTREM|PUNTA|ARIETE|ATTACK/.test(p)
  ) {
    return DEL_MAP
  }

  // 5. Defensa (Defender, Centre-Back, Full-Back, Lateral, Central)
  if (
    DEF_EXACT.has(p) ||
    /DEFEND|DEFENSA|BACK|LATERAL|CENTRAL|SWEEPER|CARRIL|STOPPER/.test(p)
  ) {
    return DEF_MAP
  }

  // Fallback seguro a Suplente
  return SUP_MAP
}

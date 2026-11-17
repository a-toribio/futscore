import clsx from 'clsx'
import { useId, useState } from 'react'
import { useTransparentCrest } from '@/lib/crestTransparency'
import { resolveSpanishTeamCrest } from '@/lib/spanishCrests'
import type { Team } from '@/types'

interface TeamCrestProps {
  team: Team
  className?: string
  /** Tamaño para ajustar escala del texto generado */
  size?: 'sm' | 'md' | 'lg'
}

/** Paletas de color heráldicas para generar escudos con identidad de club */
const CLUB_PALETTES = [
  { primary: '#0f172a', accent: '#10f090', border: '#10b981', text: '#ffffff' }, // Navy / Emerald
  { primary: '#7f1d1d', accent: '#f59e0b', border: '#fbbf24', text: '#ffffff' }, // Crimson / Gold
  { primary: '#1e3a8a', accent: '#38bdf8', border: '#60a5fa', text: '#ffffff' }, // Royal Blue / Cyan
  { primary: '#3b0764', accent: '#d946ef', border: '#c084fc', text: '#ffffff' }, // Purple / Magenta
  { primary: '#14532d', accent: '#86efac', border: '#4ade80', text: '#ffffff' }, // Forest / Mint
  { primary: '#881337', accent: '#fb923c', border: '#f97316', text: '#ffffff' }, // Garnet / Tangerine
  { primary: '#1e293b', accent: '#cbd5e1', border: '#94a3b8', text: '#ffffff' }, // Slate / Silver
  { primary: '#312e81', accent: '#a5b4fc', border: '#818cf8', text: '#ffffff' }, // Indigo / Violet
]

function getClubPalette(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return CLUB_PALETTES[Math.abs(hash) % CLUB_PALETTES.length]
}

/**
 * Escudo heráldico vectorial generado para equipos que no cuentan
 * con logo oficial en el feed o cuya imagen no carga.
 */
export function HeraldicShield({ team, className }: { team: Team; className?: string }) {
  const gradId = useId()
  const palette = getClubPalette(team.name || team.id)
  const initials = (team.shortName || team.name.slice(0, 3)).trim().slice(0, 3).toUpperCase()

  return (
    <svg
      viewBox="0 0 32 36"
      aria-label={`Escudo de ${team.name}`}
      className={clsx('shrink-0 drop-shadow-xs', className)}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.primary} />
          <stop offset="100%" stopColor="#0b0f17" />
        </linearGradient>
      </defs>

      {/* Silueta del escudo clásico */}
      <path
        d="M16 2 L29 6 C29 19 21 29 16 33 C11 29 3 19 3 6 Z"
        fill={`url(#${gradId})`}
        stroke={palette.border}
        strokeWidth="1.6"
      />

      {/* Franja diagonal decorativa de club */}
      <path
        d="M3 10 L22 30 C19.5 32 17.5 32.7 16 33 L3 19 Z"
        fill={palette.accent}
        fillOpacity="0.22"
      />

      {/* Borde interior sutil */}
      <path
        d="M16 4.5 L26.5 8 C26.5 18 19.5 26.5 16 30 C12.5 26.5 5.5 18 5.5 8 Z"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.15"
        strokeWidth="1"
      />

      {/* Iniciales del club */}
      <text
        x="16"
        y="20"
        textAnchor="middle"
        dominantBaseline="central"
        fill={palette.text}
        fontSize={initials.length > 2 ? '8.5' : '10'}
        fontWeight="800"
        letterSpacing="0.4"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {initials}
      </text>

      {/* Detalle superior (corona / estrella sutil) */}
      <circle cx="16" cy="7" r="1.2" fill={palette.accent} />
    </svg>
  )
}

/** Escudo del equipo con imagen oficial (con eliminación de marco blanco) o escudo heráldico de respaldo. */
export function TeamCrest({ team, className, size = 'sm' }: TeamCrestProps) {
  const [failed, setFailed] = useState(false)
  const defaultSize = size === 'lg' ? 'size-12' : size === 'md' ? 'size-9' : 'size-7'
  const box = clsx(defaultSize, 'shrink-0', className)

  const resolvedUrl = resolveSpanishTeamCrest(team.name, team.logoUrl)
  const transparentUrl = useTransparentCrest(resolvedUrl)
  const activeUrl = transparentUrl || resolvedUrl
  const hasValidUrl = Boolean(activeUrl && activeUrl.trim().length > 0)

  if (!hasValidUrl || failed) {
    return <HeraldicShield team={team} className={box} />
  }

  return (
    <img
      src={activeUrl}
      alt={team.name}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx(box, 'object-contain drop-shadow-xs transition-opacity duration-150')}
    />
  )
}

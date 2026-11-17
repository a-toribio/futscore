import clsx from 'clsx'
import { useState } from 'react'
import { formatPitchPlayerName, type PositionedPlayer, type TacticalFormation } from '@/lib/formationLayout'
import { translatePosition } from '@/lib/positions'
import { usePlayerPhoto } from '@/services/real/playerPhotos'
import type { Player } from '@/types'

interface PlayerPitchNodeProps {
  positioned: PositionedPlayer
  onSelectPlayer?: (player: Player) => void
}

function PlayerPitchNode({ positioned, onSelectPlayer }: PlayerPitchNodeProps) {
  const { player, x, y } = positioned
  const [photoFailed, setPhotoFailed] = useState(false)
  const { photoUrl } = usePlayerPhoto(player.name, player.photoUrl, player.id)
  const posInfo = translatePosition(player.position)
  const displayName = formatPitchPlayerName(player.name)

  const activePhoto = !photoFailed && photoUrl ? photoUrl : null

  return (
    <div
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={() => onSelectPlayer?.(player)}
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-10"
      title={`${player.jersey ? `#${player.jersey} ` : ''}${player.name} (${posInfo.label})`}
    >
      {/* Círculo de Avatar / Foto */}
      <div className="relative size-9 sm:size-11 rounded-full ring-2 ring-white/90 shadow-lg bg-surface/90 transition-transform duration-150 group-hover:scale-110">
        {activePhoto ? (
          <img
            src={activePhoto}
            alt={player.name}
            loading="lazy"
            onError={() => setPhotoFailed(true)}
            className="size-full rounded-full object-cover object-top"
          />
        ) : (
          <div className="size-full rounded-full flex items-center justify-center bg-gradient-to-br from-surface to-card text-xs font-black text-accent">
            {player.jersey || player.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Chapa del dorsal en la esquina */}
        {player.jersey && (
          <span
            className={clsx(
              'absolute -bottom-1 -right-1 size-4 sm:size-4.5 rounded-full border border-border text-[9px] sm:text-[10px] font-extrabold flex items-center justify-center tabular-nums shadow-xs',
              posInfo.code === 'POR'
                ? 'bg-amber-500 text-black font-black'
                : 'bg-surface text-fg font-black',
            )}
          >
            {player.jersey}
          </span>
        )}
      </div>

      {/* Etiqueta del nombre del jugador */}
      <div className="mt-1 flex flex-col items-center max-w-[70px] sm:max-w-[85px]">
        <span className="truncate rounded-full bg-black/80 px-1.5 py-0.5 text-center text-[10px] sm:text-[11px] font-bold text-white shadow-xs border border-white/10 backdrop-blur-xs leading-none">
          {displayName}
        </span>
      </div>
    </div>
  )
}

interface FootballPitchProps {
  tactical: TacticalFormation
  className?: string
  onSelectPlayer?: (player: Player) => void
}

export function FootballPitch({ tactical, className, onSelectPlayer }: FootballPitchProps) {
  return (
    <div
      className={clsx(
        'relative w-full aspect-[1/1.24] sm:aspect-[1/1.20] max-h-[460px] overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#092e1a] via-[#0d4427] to-[#092e1a] shadow-2xl select-none',
        className,
      )}
    >
      {/* 1. Franjas alternadas de corte de césped realista */}
      <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
        <div className="flex-1 bg-white/5" />
        <div className="flex-1 bg-black/10" />
        <div className="flex-1 bg-white/5" />
        <div className="flex-1 bg-black/10" />
        <div className="flex-1 bg-white/5" />
        <div className="flex-1 bg-black/10" />
        <div className="flex-1 bg-white/5" />
        <div className="flex-1 bg-black/10" />
      </div>

      {/* 2. Marcaje reglamentario de líneas de campo en SVG */}
      <svg
        viewBox="0 0 100 135"
        className="absolute inset-0 size-full pointer-events-none stroke-white/40 fill-none"
        strokeWidth="0.8"
        preserveAspectRatio="none"
      >
        {/* Perímetro del terreno de juego */}
        <rect x="4" y="4" width="92" height="127" rx="1.5" />

        {/* Línea de medio campo */}
        <line x1="4" y1="67.5" x2="96" y2="67.5" />
        {/* Círculo central */}
        <circle cx="50" cy="67.5" r="13" />
        <circle cx="50" cy="67.5" r="0.8" fill="rgba(255,255,255,0.6)" stroke="none" />

        {/* Área Grande Inferior (Portería propia / Defensiva) */}
        <rect x="22" y="103" width="56" height="28" />
        {/* Área Pequeña Inferior */}
        <rect x="35" y="121" width="30" height="10" />
        {/* Punto de penalti inferior */}
        <circle cx="50" cy="113" r="0.8" fill="rgba(255,255,255,0.6)" stroke="none" />
        {/* Semicírculo del área inferior */}
        <path d="M 38 103 A 12 12 0 0 1 62 103" />
        {/* Red de portería inferior */}
        <rect x="40" y="131" width="20" height="3" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.08)" />

        {/* Área Grande Superior (Portería rival / Ofensiva) */}
        <rect x="22" y="4" width="56" height="28" />
        {/* Área Pequeña Superior */}
        <rect x="35" y="4" width="30" height="10" />
        {/* Punto de penalti superior */}
        <circle cx="50" cy="22" r="0.8" fill="rgba(255,255,255,0.6)" stroke="none" />
        {/* Semicírculo del área superior */}
        <path d="M 38 32 A 12 12 0 0 0 62 32" />
        {/* Red de portería superior */}
        <rect x="40" y="1" width="20" height="3" stroke="rgba(255,255,255,0.3)" fill="rgba(255,255,255,0.08)" />

        {/* Arcos de saque de esquina */}
        <path d="M 4 8 A 4 4 0 0 0 8 4" />
        <path d="M 92 4 A 4 4 0 0 0 96 8" />
        <path d="M 4 127 A 4 4 0 0 1 8 131" />
        <path d="M 92 131 A 4 4 0 0 1 96 127" />
      </svg>

      {/* 3. Jugadores posicionados tácticamente en sus coordenadas */}
      {tactical.allPlayers.map((positioned) => (
        <PlayerPitchNode
          key={positioned.player.id}
          positioned={positioned}
          onSelectPlayer={onSelectPlayer}
        />
      ))}
    </div>
  )
}

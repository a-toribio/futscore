import clsx from 'clsx'
import { useState } from 'react'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { buildTacticalFormation } from '@/lib/formationLayout'
import { translatePosition } from '@/lib/positions'
import { usePlayerPhoto } from '@/services/real/playerPhotos'
import type { Player, Team, TeamLineup } from '@/types'
import { FootballPitch } from './FootballPitch'

function PlayerRow({
  player,
  onSelect,
}: {
  player: Player
  onSelect?: (player: Player) => void
}) {
  const [photoFailed, setPhotoFailed] = useState(false)
  const { photoUrl } = usePlayerPhoto(player.name, player.photoUrl, player.id)
  const posInfo = translatePosition(player.position)
  const hasPhoto = Boolean(!photoFailed && photoUrl)

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect?.(player)}
        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-surface text-left cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative size-7 shrink-0 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden ring-1 ring-white/10 group-hover:ring-accent/40 transition-all">
            {hasPhoto ? (
              <img
                src={photoUrl}
                alt={player.name}
                loading="lazy"
                onError={() => setPhotoFailed(true)}
                className="size-full object-cover object-top"
              />
            ) : (
              <span className="text-[11px] font-bold text-fg-muted tabular-nums">
                {player.jersey || '-'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            {hasPhoto && player.jersey && (
              <span className="text-[11px] font-bold text-fg-subtle tabular-nums shrink-0">
                #{player.jersey}
              </span>
            )}
            <span className="truncate text-xs font-medium text-fg group-hover:text-accent transition-colors">
              {player.name}
            </span>
          </div>
        </div>
        <span
          title={posInfo.label}
          className={clsx(
            'shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase',
            posInfo.color,
          )}
        >
          {posInfo.code}
        </span>
      </button>
    </li>
  )
}

interface MatchLineupsTabProps {
  home: TeamLineup
  away: TeamLineup
  onSelectPlayer?: (player: Player, team: Team) => void
}

export function MatchLineupsTab({ home, away, onSelectPlayer }: MatchLineupsTabProps) {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home')
  const [viewMode, setViewMode] = useState<'pitch' | 'list'>('pitch')

  const current = selectedTeam === 'home' ? home : away
  const hasLineup = current.starters.length > 0
  const tactical = hasLineup ? buildTacticalFormation(current.starters, current.formation) : null

  return (
    <div className="flex flex-col gap-4 py-2">
      {/* Selector de equipo */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
        <button
          type="button"
          onClick={() => setSelectedTeam('home')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
            selectedTeam === 'home'
              ? 'bg-card text-accent shadow-xs'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          <TeamCrest team={home.team} className="size-5" />
          <span className="truncate">{home.team.name}</span>
          {home.formation && (
            <span className="hidden sm:inline-block rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-fg-subtle font-mono">
              {home.formation}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedTeam('away')}
          className={clsx(
            'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
            selectedTeam === 'away'
              ? 'bg-card text-accent shadow-xs'
              : 'text-fg-muted hover:text-fg',
          )}
        >
          <TeamCrest team={away.team} className="size-5" />
          <span className="truncate">{away.team.name}</span>
          {away.formation && (
            <span className="hidden sm:inline-block rounded-md bg-surface px-1.5 py-0.5 text-[10px] text-fg-subtle font-mono">
              {away.formation}
            </span>
          )}
        </button>
      </div>

      {!hasLineup ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-fg-muted">
          <span className="text-2xl mb-2">📋</span>
          <p className="font-medium text-fg">Alineaciones no disponibles aún</p>
          <p className="mt-1 text-xs text-fg-subtle max-w-xs">
            Las alineaciones oficiales se publican habitualmente una hora antes del inicio del encuentro.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Barra de cabecera táctica y conmutador de vista */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-fg-subtle text-[11px]">Formación:</span>{' '}
                <span className="font-extrabold text-accent">
                  {current.formation || tactical?.formation || '4-3-3'}
                </span>
              </div>
              {current.coach && (
                <div className="hidden sm:block border-l border-border pl-3">
                  <span className="text-fg-subtle text-[11px]">Entrenador:</span>{' '}
                  <span className="font-medium text-fg">{current.coach}</span>
                </div>
              )}
            </div>

            {/* Selector de modo: Campo táctico / Lista */}
            <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('pitch')}
                className={clsx(
                  'flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                  viewMode === 'pitch'
                    ? 'bg-accent text-canvas font-bold shadow-xs'
                    : 'text-fg-muted hover:text-fg',
                )}
              >
                <span>Campo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={clsx(
                  'flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-accent text-canvas font-bold shadow-xs'
                    : 'text-fg-muted hover:text-fg',
                )}
              >
                <span>Lista</span>
              </button>
            </div>
          </div>

          {/* 1. Vista de Campo de Fútbol (Táctico) */}
          {viewMode === 'pitch' && tactical ? (
            <div className="space-y-3">
              <FootballPitch
                tactical={tactical}
                onSelectPlayer={(p) => onSelectPlayer?.(p, current.team)}
              />
            </div>
          ) : (
            /* Vista clásica de lista para el 11 titular */
            <section className="rounded-xl border border-border bg-card p-3">
              <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-accent">
                Once Titular ({current.starters.length})
              </h3>
              <ul className="divide-y divide-border/40">
                {current.starters.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onSelect={(p) => onSelectPlayer?.(p, current.team)}
                  />
                ))}
              </ul>
            </section>
          )}

          {/* Entrenador en pantallas pequeñas si no cabía arriba */}
          {current.coach && (
            <div className="sm:hidden rounded-xl border border-border bg-card px-3.5 py-2 text-xs flex items-center justify-between">
              <span className="text-fg-subtle">Entrenador:</span>
              <span className="font-medium text-fg">{current.coach}</span>
            </div>
          )}

          {/* 2. Banquillo / Suplentes */}
          {current.substitutes.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-3">
              <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-fg-muted">
                Banquillo / Suplentes ({current.substitutes.length})
              </h3>
              <ul className="divide-y divide-border/40">
                {current.substitutes.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onSelect={(p) => onSelectPlayer?.(p, current.team)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { getNationalTeamByCountry } from '@/lib/nationalTeams'
import { translatePosition } from '@/lib/positions'
import type { PlayerProfile, PlayerRef, Team } from '@/types'
import { usePlayerProfile } from './usePlayer'

type PlayerTab = 'info' | 'stats' | 'career'

interface PlayerDetailModalProps {
  playerRef: PlayerRef | null
  onClose: () => void
  onOpenTeam?: (team: Team, leagueId?: string) => void
}

function StatCard({
  label,
  value,
  sublabel,
  accent = false,
}: {
  label: string
  value: string | number | undefined
  sublabel?: string
  accent?: boolean
}) {
  if (value === undefined || value === null) return null
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center rounded-xl border border-border p-3 text-center transition-colors',
        accent ? 'bg-accent/10 border-accent/30' : 'bg-surface/50',
      )}
    >
      <span className={clsx('text-xl sm:text-2xl font-black tabular-nums', accent ? 'text-accent' : 'text-fg')}>
        {value}
      </span>
      <span className="text-[11px] font-semibold text-fg-muted mt-0.5">{label}</span>
      {sublabel && <span className="text-[10px] text-fg-subtle">{sublabel}</span>}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-xs">
      <span className="text-fg-muted shrink-0">{label}</span>
      <span className="font-semibold text-fg text-right truncate">{value}</span>
    </div>
  )
}

export function PlayerDetailModal({ playerRef, onClose, onOpenTeam }: PlayerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<PlayerTab>('info')
  const { data: profile, isPending } = usePlayerProfile(playerRef)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (playerRef) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [playerRef])

  if (!playerRef) return null

  const p = playerRef.player
  const displayProfile: Partial<PlayerProfile> = profile || {
    name: p.name,
    jersey: p.jersey,
    position: p.position,
    photoUrl: p.photoUrl,
    currentTeam: playerRef.team,
  }

  const posInfo = translatePosition(displayProfile.position || p.position)
  const isGoalkeeper = posInfo.code === 'POR'
  const natTeamRef = getNationalTeamByCountry(displayProfile.nationality || displayProfile.nationalTeam)
  const hasStats = Boolean(
    displayProfile.stats &&
      (displayProfile.stats.appearances !== undefined ||
        displayProfile.stats.goals !== undefined ||
        displayProfile.stats.saves !== undefined),
  )

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:items-center sm:p-4"
    >
      {/* Fondo clickeable para cerrar */}
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      {/* Contenedor del Modal */}
      <div className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl">
        {/* Barra superior de control */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface/80 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {displayProfile.currentTeam && (
              <button
                type="button"
                onClick={() => {
                  if (displayProfile.currentTeam && onOpenTeam) {
                    onClose()
                    onOpenTeam(displayProfile.currentTeam, playerRef.leagueId)
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-fg-muted hover:text-accent hover:border-accent/40 transition-colors cursor-pointer truncate"
                title="Ver ficha del club"
              >
                <TeamCrest team={displayProfile.currentTeam} className="size-4 shrink-0" />
                <span className="truncate">{displayProfile.currentTeam.name}</span>
                <span className="text-fg-subtle text-[11px]">›</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha de jugador"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-fg-muted transition-colors hover:bg-card-hover hover:text-fg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Cabecera / Hero del Jugador */}
        <div className="shrink-0 bg-gradient-to-b from-surface via-card to-card px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <PlayerAvatar
              name={displayProfile.name || p.name}
              photoUrl={displayProfile.photoUrl}
              jersey={displayProfile.jersey || p.jersey}
              position={displayProfile.position || p.position}
              id={p.id}
              size="xl"
              showJerseyBadge
              ring
              className="shrink-0 shadow-xl"
            />

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={clsx(
                    'rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
                    posInfo.color,
                  )}
                >
                  {posInfo.code} · {posInfo.label}
                </span>

                {displayProfile.jersey && (
                  <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-bold text-fg-muted tabular-nums">
                    Dorsal #{displayProfile.jersey}
                  </span>
                )}
              </div>

              <h2
                id="player-detail-title"
                className="mt-1 text-lg sm:text-xl font-extrabold text-fg truncate tracking-tight"
              >
                {displayProfile.name || p.name}
              </h2>

              {displayProfile.fullName && displayProfile.fullName !== displayProfile.name && (
                <p className="text-xs text-fg-muted truncate">{displayProfile.fullName}</p>
              )}

              {/* Selección / Nacionalidad */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {displayProfile.flagUrl && (
                  <img
                    src={displayProfile.flagUrl}
                    alt=""
                    className="size-4 object-contain shrink-0 rounded-xs"
                    loading="lazy"
                  />
                )}
                {natTeamRef && onOpenTeam ? (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenTeam(natTeamRef.team, natTeamRef.leagueId)
                    }}
                    title={`Ver selección de ${natTeamRef.team.name}`}
                    className="font-semibold text-fg hover:text-accent hover:underline cursor-pointer transition-colors"
                  >
                    {displayProfile.nationalTeam || displayProfile.nationality || `Selección de ${natTeamRef.team.name}`} ›
                  </button>
                ) : (
                  <span className="font-semibold text-fg">
                    {displayProfile.nationalTeam || displayProfile.nationality || 'Jugador profesional'}
                  </span>
                )}
                {displayProfile.age && (
                  <>
                    <span className="text-fg-subtle">·</span>
                    <span className="text-fg-muted">{displayProfile.age} años</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de navegación */}
        <div className="flex shrink-0 border-b border-border bg-card px-4">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={clsx(
              'border-b-2 py-2.5 px-3 text-xs font-bold transition-colors cursor-pointer',
              activeTab === 'info'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Información
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={clsx(
              'border-b-2 py-2.5 px-3 text-xs font-bold transition-colors cursor-pointer',
              activeTab === 'stats'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Estadísticas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('career')}
            className={clsx(
              'border-b-2 py-2.5 px-3 text-xs font-bold transition-colors cursor-pointer',
              activeTab === 'career'
                ? 'border-accent text-accent'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            Trayectoria
          </button>
        </div>

        {/* Cuerpo del Modal con scroll */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:thin] space-y-4">
          {isPending && !profile && (
            <div className="flex items-center justify-center py-8 text-xs text-accent">
              <span className="mr-2 inline-block size-2 animate-ping rounded-full bg-accent" />
              Cargando biografía y estadísticas oficiales...
            </div>
          )}

          {/* TAB 1: INFORMACIÓN */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Ficha técnica */}
              <section className="rounded-xl border border-border bg-surface/50 p-4">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-accent">
                  Ficha Técnica
                </h3>
                <div className="divide-y divide-border/60">
                  <InfoRow label="Nombre completo" value={displayProfile.fullName} />
                  <InfoRow label="Posición" value={posInfo.label} />
                  <InfoRow label="Dorsal" value={displayProfile.jersey ? `#${displayProfile.jersey}` : undefined} />
                  <InfoRow label="Edad" value={displayProfile.age ? `${displayProfile.age} años` : undefined} />
                  <InfoRow label="Fecha de nacimiento" value={displayProfile.dateOfBirth} />
                  <InfoRow label="Nacionalidad" value={displayProfile.nationality} />
                  <InfoRow label="Selección" value={displayProfile.nationalTeam} />
                  <InfoRow label="Altura" value={displayProfile.height} />
                  <InfoRow label="Peso" value={displayProfile.weight} />
                  <InfoRow label="Club actual" value={displayProfile.currentTeam?.name} />
                </div>
              </section>

              {/* Biografía / Resumen de Wikipedia */}
              {displayProfile.bio && (
                <section className="rounded-xl border border-border bg-surface/50 p-4">
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-accent">
                    Sobre el Jugador
                  </h3>
                  <p className="text-xs leading-relaxed text-fg">{displayProfile.bio}</p>
                  {displayProfile.bioSourceUrl && (
                    <a
                      href={displayProfile.bioSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-[11px] font-semibold text-accent hover:underline"
                    >
                      Ver perfil completo en Wikipedia ›
                    </a>
                  )}
                </section>
              )}
            </div>
          )}

          {/* TAB 2: ESTADÍSTICAS */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {hasStats && displayProfile.stats ? (
                <>
                  <section className="rounded-xl border border-border bg-surface/50 p-4">
                    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-accent">
                      Rendimiento de la Temporada
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <StatCard
                        label="Partidos"
                        value={displayProfile.stats.appearances}
                        sublabel={
                          displayProfile.stats.started !== undefined
                            ? `${displayProfile.stats.started} titular${displayProfile.stats.started === 1 ? '' : 'es'}`
                            : undefined
                        }
                      />
                      {!isGoalkeeper && (
                        <>
                          <StatCard
                            label="Goles"
                            value={displayProfile.stats.goals ?? 0}
                            accent={Boolean(displayProfile.stats.goals && displayProfile.stats.goals > 0)}
                          />
                          <StatCard
                            label="Asistencias"
                            value={displayProfile.stats.assists ?? 0}
                            accent={Boolean(displayProfile.stats.assists && displayProfile.stats.assists > 0)}
                          />
                          <StatCard label="Tiros a puerta" value={displayProfile.stats.shots} />
                        </>
                      )}
                      {isGoalkeeper && (
                        <>
                          <StatCard label="Paradas" value={displayProfile.stats.saves} accent />
                          <StatCard
                            label="Porterías a cero"
                            value={displayProfile.stats.cleanSheets}
                            accent={Boolean(displayProfile.stats.cleanSheets && displayProfile.stats.cleanSheets > 0)}
                          />
                          <StatCard label="Goles encajados" value={displayProfile.stats.goalsConceded} />
                        </>
                      )}
                      <StatCard
                        label="Tarjetas amarillas"
                        value={displayProfile.stats.yellowCards ?? 0}
                        sublabel="Amonestaciones"
                      />
                      <StatCard
                        label="Tarjetas rojas"
                        value={displayProfile.stats.redCards ?? 0}
                        sublabel="Expulsiones"
                      />
                    </div>
                  </section>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-surface/50 p-8 text-center text-xs text-fg-muted">
                  <span className="text-2xl mb-2 block">📊</span>
                  <p className="font-semibold text-fg">Estadísticas detalladas en consolidación</p>
                  <p className="mt-1 text-fg-subtle">
                    Las estadísticas individuales de partidos y goles se actualizan en vivo conforme avanza la competición.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRAYECTORIA */}
          {activeTab === 'career' && (
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-surface/50 p-4">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-accent">
                  Historial de Clubes y Selección
                </h3>
                {displayProfile.career && displayProfile.career.length > 0 ? (
                  <ul className="relative border-l-2 border-border/80 ml-3 space-y-4 py-1">
                    {displayProfile.career.map((item, idx) => {
                      const itemNatRef =
                        item.isNationalTeam ? getNationalTeamByCountry(item.teamName) : undefined
                      const canOpenNat = Boolean(itemNatRef && onOpenTeam)

                      return (
                        <li key={idx} className="relative pl-5">
                          <span
                            className={clsx(
                              'absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-card flex items-center justify-center shadow-xs',
                              item.isCurrent
                                ? 'bg-accent text-canvas ring-2 ring-accent/30'
                                : item.isNationalTeam
                                  ? 'bg-sky-400'
                                  : 'bg-surface border-border',
                            )}
                          >
                            <span
                              className={clsx(
                                'size-1.5 rounded-full',
                                item.isCurrent ? 'bg-canvas' : 'bg-fg-muted',
                              )}
                            />
                          </span>

                          <div
                            onClick={() => {
                              if (canOpenNat && itemNatRef && onOpenTeam) {
                                onClose()
                                onOpenTeam(itemNatRef.team, itemNatRef.leagueId)
                              }
                            }}
                            className={clsx(
                              'flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card p-2.5 shadow-2xs',
                              canOpenNat && 'hover:border-accent/50 hover:bg-card-hover cursor-pointer transition-colors',
                            )}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {item.teamLogo ? (
                                <img
                                  src={item.teamLogo}
                                  alt={item.teamName}
                                  loading="lazy"
                                  className="size-6 object-contain shrink-0"
                                />
                              ) : (
                                <div className="size-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] font-black text-fg-subtle shrink-0">
                                  ⚽
                                </div>
                              )}
                              <div className="min-w-0">
                                <span
                                  className={clsx(
                                    'block truncate text-xs font-bold',
                                    item.isCurrent ? 'text-accent' : 'text-fg',
                                  )}
                                >
                                  {item.teamName}
                                  {canOpenNat ? ' ›' : ''}
                                </span>
                                {item.isNationalTeam && (
                                  <span className="block text-[10px] text-sky-400 font-semibold">
                                    Internacional
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.isCurrent && (
                                <span className="hidden sm:inline-block rounded-md bg-accent/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-accent border border-accent/30">
                                  Actual
                                </span>
                              )}
                              <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] font-semibold text-fg-muted tabular-nums">
                                {item.period}
                              </span>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : (
                  <div className="py-4 text-center text-xs text-fg-muted">
                    {displayProfile.currentTeam ? (
                      <p>
                        Jugador en activo en las filas de{' '}
                        <strong className="text-fg">{displayProfile.currentTeam.name}</strong>.
                      </p>
                    ) : (
                      <p>Historial de clubes no disponible en este momento.</p>
                    )}
                  </div>
                )}
              </section>

              {/* Selección nacional */}
              {displayProfile.nationalTeam && (
                <section className="rounded-xl border border-border bg-surface/50 p-4">
                  <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-accent">
                    Selección Nacional
                  </h3>
                  {natTeamRef && onOpenTeam ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        onOpenTeam(natTeamRef.team, natTeamRef.leagueId)
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-left transition-colors hover:border-accent/50 hover:bg-card-hover cursor-pointer"
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        {displayProfile.flagUrl && (
                          <img
                            src={displayProfile.flagUrl}
                            alt=""
                            className="size-5 object-contain shrink-0 rounded-xs"
                          />
                        )}
                        <span className="text-xs font-semibold text-fg truncate">
                          {displayProfile.nationalTeam}
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-accent shrink-0">
                        Ver selección ›
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      {displayProfile.flagUrl && (
                        <img
                          src={displayProfile.flagUrl}
                          alt=""
                          className="size-5 object-contain shrink-0 rounded-xs"
                        />
                      )}
                      <span className="text-xs font-semibold text-fg">{displayProfile.nationalTeam}</span>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

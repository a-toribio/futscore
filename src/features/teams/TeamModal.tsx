import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { MatchCard } from '@/features/matches/components/MatchCard'
import { groupMatchesByDateLabel } from '@/lib/groupMatches'
import { FavoriteStar } from '@/features/favorites/FavoriteStar'
import { useFavoritesStore } from '@/features/favorites/favoritesStore'
import { isNationalTeam } from '@/lib/nationalTeams'
import type { Match, SquadPlayer, TeamProfile, TeamRef } from '@/types'
import { useTeamProfile } from './useTeam'

type TeamTab = 'info' | 'squad' | 'matches'

const TABS: { id: TeamTab; label: string }[] = [
  { id: 'info', label: 'Información' },
  { id: 'squad', label: 'Plantilla' },
  { id: 'matches', label: 'Partidos' },
]

interface TeamModalProps {
  teamRef: TeamRef | null
  onClose: () => void
  onSelectMatch: (match: Match) => void
  onSelectPlayer?: (player: SquadPlayer) => void
}

function InfoRow({
  label,
  value,
  isLink,
  href,
}: {
  label: string
  value?: string
  isLink?: boolean
  href?: string
}) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-xs">
      <dt className="shrink-0 text-fg-muted">{label}</dt>
      <dd className="text-right font-semibold text-fg break-words min-w-0">
        {isLink && href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline inline-block"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function InfoTab({ profile }: { profile: TeamProfile }) {
  const isNat = Boolean(profile.isNationalTeam)
  const v = profile.venue
  const hasStadium = !!v
  const website = profile.website?.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const websiteUrl = profile.website
    ? profile.website.startsWith('http')
      ? profile.website
      : `https://${profile.website}`
    : undefined

  return (
    <div className="space-y-4">
      {profile.description && (
        <section className="rounded-xl border border-border bg-surface/50 p-3.5">
          <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-accent">
            {isNat ? 'Sobre la selección' : 'Sobre el club'}
          </h3>
          <p className="text-xs leading-relaxed text-fg">{profile.description.text}</p>
          {profile.description.url && (
            <a
              href={profile.description.url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[11px] font-semibold text-fg-muted hover:text-accent"
            >
              Fuente: Wikipedia
            </a>
          )}
        </section>
      )}

      <section className="rounded-xl border border-border bg-surface/50 px-3.5 py-1.5">
        <h3 className="pt-2 text-[11px] font-bold uppercase tracking-wider text-accent">
          {isNat ? 'Selección Nacional' : 'Club'}
        </h3>
        <dl className="divide-y divide-border/60">
          <InfoRow label="Nombre oficial" value={profile.fullName} />
          <InfoRow label="Federación" value={profile.federation} />
          <InfoRow label="Confederación" value={profile.confederation} />
          <InfoRow label="Competición" value={profile.leagueName} />
          <InfoRow label="Clasificación" value={profile.standingSummary} />
          <InfoRow label={isNat ? 'Seleccionador' : 'Entrenador'} value={profile.coach} />
          <InfoRow label="Palmarés" value={profile.honors} />
          <InfoRow label={isNat ? 'Sede / Ciudad deportiva' : 'Localidad'} value={profile.location ?? v?.city} />
          <InfoRow label="Fundación" value={profile.founded} />
          <InfoRow label="Equipación" value={profile.kit} />
          <InfoRow label="Web" value={website} isLink={!!websiteUrl} href={websiteUrl} />
        </dl>
      </section>

      {hasStadium && (
        <section className="rounded-xl border border-border bg-surface/50 px-3.5 py-1.5">
          <h3 className="pt-2 text-[11px] font-bold uppercase tracking-wider text-accent">
            {isNat ? 'Sede habitual' : 'Estadio'}
          </h3>
          <dl className="divide-y divide-border/60">
            <InfoRow label="Nombre" value={v.name} />
            <InfoRow label="Ciudad" value={v.city} />
            <InfoRow label="Dirección" value={v.address} />
            <InfoRow
              label="Capacidad"
              value={v.capacity ? `${v.capacity.toLocaleString('es-ES')} espectadores` : undefined}
            />
            <InfoRow label="Inauguración" value={v.opened} />
          </dl>
        </section>
      )}

      {!profile.description && !hasStadium && !profile.fullName && (
        <p className="py-8 text-center text-xs text-fg-muted">
          {isNat
            ? 'No hay información adicional disponible para esta selección.'
            : 'No hay información adicional disponible para este club.'}
        </p>
      )}
    </div>
  )
}

function SquadTab({
  squad,
  isNat,
  onSelectPlayer,
}: {
  squad: SquadPlayer[]
  isNat?: boolean
  onSelectPlayer?: (player: SquadPlayer) => void
}) {
  if (squad.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-fg-muted">
        {isNat
          ? 'La convocatoria de esta selección no está disponible en este momento.'
          : 'La plantilla de este club no está disponible en este momento.'}
      </p>
    )
  }

  const groups = new Map<string, SquadPlayer[]>()
  for (const p of squad) {
    const key = p.position ?? 'Plantilla'
    const list = groups.get(key)
    if (list) list.push(p)
    else groups.set(key, [p])
  }
  const pluralize: Record<string, string> = {
    Portero: 'Porteros',
    Defensa: 'Defensas',
    Centrocampista: 'Centrocampistas',
    Delantero: 'Delanteros',
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([position, players]) => (
        <section key={position} className="overflow-hidden rounded-xl border border-border bg-surface/50">
          <h3 className="bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-fg-muted">
            {pluralize[position] ?? position} ({players.length})
          </h3>
          <ul className="divide-y divide-border/60">
            {players.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelectPlayer?.(p)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-xs text-left transition-colors hover:bg-card-hover cursor-pointer group"
                >
                  <span className="w-6 shrink-0 text-center font-bold tabular-nums text-fg-subtle group-hover:text-accent">
                    {p.jersey || '–'}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-fg group-hover:text-accent transition-colors">
                    {p.name}
                  </span>
                  {p.age ? <span className="shrink-0 text-fg-muted">{p.age} años</span> : null}
                  {p.goals ? (
                    <span className="shrink-0 rounded-md bg-accent/15 px-1.5 py-0.5 font-bold tabular-nums text-accent">
                      {p.goals} {p.goals === 1 ? 'gol' : 'goles'}
                    </span>
                  ) : null}
                  {p.flagUrl && (
                    <img src={p.flagUrl} alt="" loading="lazy" className="size-4 shrink-0 object-contain rounded-xs" />
                  )}
                  <span className="text-fg-subtle text-xs" aria-hidden="true">
                    ›
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function MatchList({
  title,
  matches,
  empty,
  onSelect,
  accent,
}: {
  title: string
  matches: Match[]
  empty: string
  onSelect: (m: Match) => void
  accent?: boolean
}) {
  const groups = groupMatchesByDateLabel(matches)
  return (
    <section className="space-y-2">
      <h3
        className={clsx(
          'px-1 text-xs font-bold uppercase tracking-wider',
          accent ? 'text-accent' : 'text-fg-muted',
        )}
      >
        {title} ({matches.length})
      </h3>
      {groups.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-fg-muted">
          {empty}
        </div>
      ) : (
        <div className="space-y-2.5">
          {groups.map((g) => (
            <div key={g.dateLabel} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="bg-surface px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-fg-muted">
                {g.dateLabel}
              </div>
              <ul className="divide-y divide-border">
                {g.items.map((m) => (
                  <MatchCard key={m.id} match={m} onClick={() => onSelect(m)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function TeamModal({ teamRef, onClose, onSelectMatch, onSelectPlayer }: TeamModalProps) {
  const [tab, setTab] = useState<TeamTab>('info')
  const isFav = useFavoritesStore((s) => (teamRef ? s.teamIds.includes(teamRef.team.id) : false))
  const toggleTeam = useFavoritesStore((s) => s.toggleTeam)
  const { data: profile, isPending, isError, refetch } = useTeamProfile(teamRef)

  useEffect(() => {
    if (!teamRef) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [teamRef, onClose])

  useEffect(() => {
    if (!teamRef) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [teamRef])

  if (!teamRef) return null

  const team = profile?.team ?? teamRef.team
  const isNat = Boolean(profile?.isNationalTeam || isNationalTeam(teamRef.team, teamRef.leagueId))

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-xs p-0 sm:items-center sm:p-4"
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative z-10 flex h-[90dvh] max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-canvas shadow-2xl sm:h-[85dvh] sm:rounded-2xl">
        {/* Cabecera del club o selección */}
        <div className="flex shrink-0 items-center gap-4 border-b border-border bg-gradient-to-b from-surface/70 to-card px-4 py-4">
          <TeamCrest team={team} size="lg" className="size-16 sm:size-20" />
          <div className="min-w-0 flex-1">
            {isNat && (
              <span className="mb-1 inline-block rounded-md border border-sky-400/30 bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
                Selección Nacional
              </span>
            )}
            <h2 id="team-modal-title" className="truncate text-lg font-extrabold text-fg">
              {team.name}
            </h2>
            <p className="truncate text-xs text-fg-muted">
              {profile?.leagueName ?? '\u00A0'}
            </p>
            {profile?.standingSummary && (
              <p className="mt-0.5 text-[11px] font-semibold text-accent">{profile.standingSummary}</p>
            )}
          </div>
          <FavoriteStar active={isFav} label={team.name} onToggle={() => toggleTeam(teamRef.team.id)} />
          <button
            type="button"
            onClick={onClose}
            aria-label={isNat ? 'Cerrar ficha de la selección' : 'Cerrar ficha del club'}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-fg-muted transition-colors hover:bg-card-hover hover:text-fg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Pestañas */}
        <div className="grid shrink-0 grid-cols-3 border-b border-border bg-surface px-2 pt-1 sm:px-4">
          {TABS.map((t) => {
            const label = t.id === 'squad' && isNat ? 'Convocatoria' : t.label
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={clsx(
                  'border-b-2 px-1 py-3 text-center text-xs font-bold transition-colors cursor-pointer truncate',
                  tab === t.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-fg-muted hover:text-fg',
                )}
              >
                {label}
                {t.id === 'squad' && profile ? ` (${profile.squad.length})` : ''}
              </button>
            )
          })}
        </div>

        {/* Contenido */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 [scrollbar-width:thin]">
          {isPending && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
              <span className="mb-3 inline-block size-3 animate-ping rounded-full bg-accent" />
              <span>{isNat ? 'Cargando ficha de la selección...' : 'Cargando ficha del club...'}</span>
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-danger/40 bg-card p-4 text-center text-xs">
              <p className="font-semibold text-danger">
                {isNat ? 'No se pudo cargar la ficha de la selección.' : 'No se pudo cargar la ficha del club.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 rounded-lg bg-accent px-3 py-1.5 font-semibold text-canvas cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {profile && (
            <>
              {tab === 'info' && <InfoTab profile={profile} />}
              {tab === 'squad' && (
                <SquadTab squad={profile.squad} isNat={isNat} onSelectPlayer={onSelectPlayer} />
              )}
              {tab === 'matches' && (
                <div className="flex flex-col gap-5">
                  <MatchList
                    title="Próximos partidos"
                    accent
                    matches={profile.upcomingMatches}
                    empty="No hay próximos partidos programados."
                    onSelect={onSelectMatch}
                  />
                  <MatchList
                    title="Partidos anteriores"
                    matches={profile.pastMatches}
                    empty="No hay resultados recientes registrados."
                    onSelect={onSelectMatch}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

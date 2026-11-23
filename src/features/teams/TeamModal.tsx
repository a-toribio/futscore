import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState, type Ref } from 'react'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { FavoriteStar } from '@/features/favorites/FavoriteStar'
import { useFavoritesStore } from '@/features/favorites/favoritesStore'
import { hasStandingsTable, useStandings } from '@/features/leagues/useStandings'
import { MatchCard } from '@/features/matches/components/MatchCard'
import { useTabSwipe } from '@/hooks/useTabSwipe'
import { groupMatchesByDateLabel } from '@/lib/groupMatches'
import { isNationalTeam } from '@/lib/nationalTeams'
import { findRfefClub } from '@/services/real/rfef'
import type { Match, QualificationZone, SquadPlayer, Team, TeamProfile, TeamRef } from '@/types'
import { useTeamProfile } from './useTeam'

type TeamTab = 'info' | 'standings' | 'squad' | 'matches'

const TABS: { id: TeamTab; label: string }[] = [
  { id: 'info', label: 'Información' },
  { id: 'standings', label: 'Clasificación' },
  { id: 'squad', label: 'Plantilla' },
  { id: 'matches', label: 'Partidos' },
]

const TEAM_TAB_IDS: readonly TeamTab[] = ['info', 'standings', 'squad', 'matches']

interface TeamModalProps {
  teamRef: TeamRef | null
  onClose: () => void
  onSelectMatch: (match: Match) => void
  onSelectPlayer?: (player: SquadPlayer) => void
  onOpenTeam?: (team: Team, leagueId?: string) => void
  onOpenLeague?: (leagueId: string, highlightTeamIds?: string[]) => void
}

function zoneBadgeClass(zone: QualificationZone): string {
  switch (zone) {
    case 'champions':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40'
    case 'europa':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    case 'conference':
      return 'bg-teal-500/20 text-teal-400 border-teal-500/40'
    case 'promotion':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
    case 'relegation':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40'
    default:
      return 'bg-surface text-fg-muted border-border'
  }
}

function normalizeTeamKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
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
  sectionRef,
}: {
  title: string
  matches: Match[]
  empty: string
  onSelect: (m: Match) => void
  accent?: boolean
  sectionRef?: Ref<HTMLElement>
}) {
  const groups = groupMatchesByDateLabel(matches)
  return (
    <section ref={sectionRef} className="space-y-2">
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

function TeamStandingsTab({
  team,
  leagueId,
  groupCode,
  isProfilePending,
  onOpenTeam,
  onOpenLeague,
}: {
  team: Team
  leagueId?: string
  groupCode?: string
  isProfilePending: boolean
  onOpenTeam?: (team: Team, leagueId?: string) => void
  onOpenLeague?: (leagueId: string, highlightTeamIds?: string[]) => void
}) {
  const canShow = Boolean(leagueId && hasStandingsTable(leagueId))
  const standingsQuery = useStandings(canShow ? leagueId! : null, groupCode)

  if (!leagueId && isProfilePending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
        <span className="mb-3 inline-block size-3 animate-ping rounded-full bg-accent" />
        <span>Buscando competición de liga...</span>
      </div>
    )
  }

  if (!leagueId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-fg-muted">
        <p className="font-semibold text-fg">Sin liga asignada</p>
        <p className="mt-1 text-fg-subtle">
          No se conoce la competición de liga regular de este equipo en este momento.
        </p>
      </div>
    )
  }

  if (!canShow) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-fg-muted">
        <p className="font-semibold text-fg">Competición eliminatoria</p>
        <p className="mt-1 text-fg-subtle">
          Esta competición no dispone de tabla de clasificación por puntos.
        </p>
      </div>
    )
  }

  if (standingsQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-xs text-accent">
        <span className="mb-3 inline-block size-3 animate-ping rounded-full bg-accent" />
        <span>Cargando clasificación oficial...</span>
      </div>
    )
  }

  if (standingsQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/40 bg-card p-4 text-center text-xs">
        <p className="font-semibold text-danger">No se pudo cargar la clasificación en este momento.</p>
        <button
          type="button"
          onClick={() => standingsQuery.refetch()}
          className="mt-3 rounded-lg bg-accent px-3 py-1.5 font-semibold text-canvas cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const data = standingsQuery.data
  if (!data || data.rows.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-xs text-fg-muted">
        <p className="font-semibold text-fg">Clasificación no disponible aún</p>
        <p className="mt-1 text-fg-subtle">
          La tabla de esta competición no tiene registros publicados por ahora.
        </p>
      </div>
    )
  }

  const targetNameKey = normalizeTeamKey(team.name)
  const teamRow = data.rows.find(
    (r) => r.team.id === team.id || (targetNameKey && normalizeTeamKey(r.team.name) === targetNameKey),
  )

  return (
    <div className="space-y-3">
      {/* Tarjeta resumen de la posición actual del equipo */}
      {teamRow && (
        <section className="rounded-xl border border-accent/35 bg-gradient-to-br from-surface via-card to-card p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={clsx(
                  'inline-flex size-8 shrink-0 items-center justify-center rounded-lg border text-sm font-black tabular-nums',
                  zoneBadgeClass(teamRow.zone),
                )}
              >
                {teamRow.rank}º
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-fg">{data.leagueName}</p>
                {teamRow.zoneLabel ? (
                  <p className="truncate text-[11px] font-semibold text-accent">{teamRow.zoneLabel}</p>
                ) : (
                  data.seasonName && <p className="truncate text-[11px] text-fg-muted">{data.seasonName}</p>
                )}
              </div>
            </div>

            {onOpenLeague && (
              <button
                type="button"
                onClick={() => onOpenLeague(leagueId, [team.id, teamRow.team.id])}
                className="shrink-0 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-fg-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer"
              >
                Ver competición ›
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
            <div className="rounded-lg border border-accent/25 bg-accent/10 px-1.5 py-1.5">
              <span className="block text-sm font-black tabular-nums text-accent">{teamRow.points}</span>
              <span className="block text-[10px] font-semibold text-fg-muted">PTS</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-surface/60 px-1.5 py-1.5">
              <span className="block text-sm font-bold tabular-nums text-fg">{teamRow.played}</span>
              <span className="block text-[10px] text-fg-muted">PJ</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-surface/60 px-1.5 py-1.5">
              <span className="block text-xs font-bold tabular-nums text-fg mt-0.5">
                {teamRow.wins}-{teamRow.draws}-{teamRow.losses}
              </span>
              <span className="block text-[10px] text-fg-muted">G-E-P</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-surface/60 px-1.5 py-1.5">
              <span className="block text-xs font-bold tabular-nums text-fg mt-0.5">
                {teamRow.goalsFor}:{teamRow.goalsAgainst}
              </span>
              <span className="block text-[10px] text-fg-muted">GF:GC</span>
            </div>
            <div className="rounded-lg border border-border/70 bg-surface/60 px-1.5 py-1.5">
              <span className="block text-sm font-bold tabular-nums text-fg">{teamRow.goalDiff}</span>
              <span className="block text-[10px] text-fg-muted">DG</span>
            </div>
          </div>
        </section>
      )}

      {/* Cabecera de tabla cuando el equipo no figura en las filas (p. ej. torneo multigrupo o subgrupo) */}
      {!teamRow && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="truncate text-xs font-bold text-fg-muted">{data.leagueName}</span>
          {onOpenLeague && (
            <button
              type="button"
              onClick={() => onOpenLeague(leagueId, [team.id])}
              className="shrink-0 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
            >
              Ver competición ›
            </button>
          )}
        </div>
      )}

      {/* Tabla completa de clasificación */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface text-[11px] font-bold uppercase tracking-wider text-fg-muted">
              <th className="py-2.5 pl-3 pr-1.5 text-center w-9">#</th>
              <th className="py-2.5 px-2">Equipo</th>
              <th className="py-2.5 px-1.5 text-center" title="Partidos jugados">
                PJ
              </th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Partidos ganados">
                PG
              </th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Partidos empatados">
                PE
              </th>
              <th className="py-2.5 px-1.5 text-center hidden sm:table-cell" title="Partidos perdidos">
                PP
              </th>
              <th className="py-2.5 px-1.5 text-center hidden md:table-cell" title="Goles a favor y en contra">
                GF:GC
              </th>
              <th className="py-2.5 px-1.5 text-center" title="Diferencia de goles">
                DG
              </th>
              <th className="py-2.5 pl-1.5 pr-3 text-center font-extrabold text-accent" title="Puntos">
                PTS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.rows.map((row) => {
              const isCurrent =
                row.team.id === team.id ||
                Boolean(targetNameKey && normalizeTeamKey(row.team.name) === targetNameKey)

              return (
                <tr
                  key={`${row.rank}-${row.team.id}`}
                  className={clsx(
                    'transition-colors hover:bg-surface/70',
                    isCurrent && 'bg-accent-soft/50 ring-1 ring-inset ring-accent/30',
                  )}
                >
                  <td className="py-2 pl-3 pr-1.5 text-center">
                    <span
                      title={row.zoneLabel}
                      className={clsx(
                        'inline-flex size-5 items-center justify-center rounded-md border text-[11px] font-bold tabular-nums',
                        zoneBadgeClass(row.zone),
                      )}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isCurrent) onOpenTeam?.(row.team, leagueId)
                      }}
                      title={isCurrent ? row.team.name : `Ver ficha de ${row.team.name}`}
                      className={clsx(
                        'group flex min-w-0 max-w-full items-center gap-2 text-left',
                        !isCurrent && 'cursor-pointer',
                      )}
                    >
                      <TeamCrest team={row.team} className="size-5" />
                      <span
                        className={clsx(
                          'truncate',
                          isCurrent
                            ? 'font-extrabold text-accent'
                            : 'font-medium text-fg group-hover:text-accent group-hover:underline underline-offset-2',
                        )}
                      >
                        {row.team.name}
                      </span>
                      {isCurrent && (
                        <span className="hidden sm:inline-block shrink-0 rounded bg-accent/15 border border-accent/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-accent">
                          Actual
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted">{row.played}</td>
                  <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                    {row.wins}
                  </td>
                  <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                    {row.draws}
                  </td>
                  <td className="py-2 px-1.5 text-center tabular-nums text-fg-muted hidden sm:table-cell">
                    {row.losses}
                  </td>
                  <td className="py-2 px-1.5 text-center tabular-nums text-fg-subtle hidden md:table-cell">
                    {row.goalsFor}:{row.goalsAgainst}
                  </td>
                  <td className="py-2 px-1.5 text-center tabular-nums font-medium text-fg">
                    {row.goalDiff}
                  </td>
                  <td className="py-2 pl-1.5 pr-3 text-center tabular-nums font-extrabold text-accent text-sm">
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TeamModal({
  teamRef,
  onClose,
  onSelectMatch,
  onSelectPlayer,
  onOpenTeam,
  onOpenLeague,
}: TeamModalProps) {
  const [tab, setTab] = useState<TeamTab>('info')
  const { offsetX, isDragging, handlers } = useTabSwipe({
    tabs: TEAM_TAB_IDS,
    activeTab: tab,
    onTabChange: setTab,
  })
  const isFav = useFavoritesStore((s) => (teamRef ? s.teamIds.includes(teamRef.team.id) : false))
  const toggleTeam = useFavoritesStore((s) => s.toggleTeam)
  const { data: profile, isPending, isError, refetch } = useTeamProfile(teamRef)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const firstUpcomingRef = useRef<HTMLElement>(null)

  const pastChronological = useMemo(
    () =>
      [...(profile?.pastMatches ?? [])].sort(
        (a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff),
      ),
    [profile?.pastMatches],
  )
  const upcomingChronological = useMemo(
    () =>
      [...(profile?.upcomingMatches ?? [])].sort(
        (a, b) => Date.parse(a.kickoff) - Date.parse(b.kickoff),
      ),
    [profile?.upcomingMatches],
  )

  useEffect(() => {
    if (!teamRef) return
    const container = scrollContainerRef.current
    if (!container) return

    if (tab !== 'matches') {
      container.scrollTop = 0
      return
    }
    if (!profile) return

    const rafId = requestAnimationFrame(() => {
      if (pastChronological.length > 0 && upcomingChronological.length > 0 && firstUpcomingRef.current) {
        const containerRect = container.getBoundingClientRect()
        const targetRect = firstUpcomingRef.current.getBoundingClientRect()
        const targetTop = targetRect.top - containerRect.top + container.scrollTop
        container.scrollTop = Math.max(0, targetTop - container.clientHeight * 0.42)
      } else if (pastChronological.length > 0 && upcomingChronological.length === 0) {
        container.scrollTop = container.scrollHeight
      } else {
        container.scrollTop = 0
      }
    })

    return () => cancelAnimationFrame(rafId)
  }, [teamRef, tab, profile, pastChronological.length, upcomingChronological.length])

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
  const standingsLeagueId = profile?.leagueId ?? teamRef.leagueId
  const standingsGroupCode = profile?.groupCode ?? findRfefClub(teamRef.team.id)?.groupCode

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
              <button
                type="button"
                onClick={() => setTab('standings')}
                title="Ver clasificación completa en su liga"
                className="mt-0.5 text-[11px] font-semibold text-accent hover:underline underline-offset-2 cursor-pointer text-left"
              >
                {profile.standingSummary}
              </button>
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
        <div className="grid shrink-0 grid-cols-4 border-b border-border bg-surface px-2 pt-1 sm:px-4">
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
        <div
          ref={scrollContainerRef}
          className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 [scrollbar-width:thin]"
        >
          <div
            {...handlers}
            style={offsetX !== 0 ? { transform: `translateX(${offsetX}px)` } : undefined}
            className={clsx(
              'min-h-full touch-pan-y',
              !isDragging && 'transition-transform duration-200 ease-out',
            )}
          >
            {tab === 'standings' ? (
              <TeamStandingsTab
                team={team}
                leagueId={standingsLeagueId}
                groupCode={standingsGroupCode}
                isProfilePending={isPending}
                onOpenTeam={onOpenTeam}
                onOpenLeague={onOpenLeague}
              />
            ) : (
              <>
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
                      <div
                        className={clsx(
                          'flex flex-col gap-5',
                          pastChronological.length > 0 &&
                            upcomingChronological.length > 0 &&
                            'pb-[35dvh]',
                        )}
                      >
                        <MatchList
                          title="Partidos anteriores"
                          matches={pastChronological}
                          empty="No hay resultados recientes registrados."
                          onSelect={onSelectMatch}
                        />
                        <MatchList
                          sectionRef={firstUpcomingRef}
                          title="Próximos partidos"
                          accent
                          matches={upcomingChronological}
                          empty="No hay próximos partidos programados."
                          onSelect={onSelectMatch}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

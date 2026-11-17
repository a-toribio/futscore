import { useMemo, useState } from 'react'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { useAppNavigation } from '@/features/navigation/navigationContext'
import { toDateKey } from '@/lib/date'
import { FEATURED_NATIONAL_TEAMS } from '@/lib/nationalTeams'
import type { LeagueMatches } from '@/types'
import { DayTabs, type MatchView } from './components/DayTabs'
import { LeagueSection } from './components/LeagueSection'
import { useMatchesByDate } from './hooks/useMatchesByDate'

function onlyLive(groups: LeagueMatches[]): LeagueMatches[] {
  return groups
    .map((g) => ({ ...g, matches: g.matches.filter((m) => m.status === 'live') }))
    .filter((g) => g.matches.length > 0)
}

/** Calcula la fecha del último domingo con jornada europea completa */
function getRecentMatchdayDate(todayIso: string): string {
  const [y, m, d] = todayIso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  while (date.getDay() !== 0) {
    date.setDate(date.getDate() - 1)
  }
  return toDateKey(date)
}

export function HomePage() {
  const [today] = useState(() => toDateKey(new Date()))
  const [view, setView] = useState<MatchView>(today)
  const { openMatch, openLeague, openTeam } = useAppNavigation()

  // Los directos son siempre de hoy. React Query comparte la caché si ambas claves coinciden.
  const todayQuery = useMatchesByDate(today, today)
  const dayQuery = useMatchesByDate(view === 'live' ? today : view, today)
  const { data, isPending, isError, refetch } = view === 'live' ? todayQuery : dayQuery

  const liveGroups = useMemo(() => onlyLive(todayQuery.data ?? []), [todayQuery.data])
  const liveCount = useMemo(() => liveGroups.reduce((n, g) => n + g.matches.length, 0), [liveGroups])
  const groups = useMemo(
    () => (view === 'live' ? liveGroups : (data ?? [])),
    [view, liveGroups, data],
  )

  const recentSunday = useMemo(() => getRecentMatchdayDate(today), [today])

  return (
    <div className="flex flex-col gap-4">
      <DayTabs
        value={view}
        today={today}
        liveCount={liveCount}
        onChange={setView}
      />

      {/* Acceso rápido a competiciones internacionales y selecciones nacionales */}
      <section
        aria-label="Selecciones nacionales y torneos internacionales"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        <span className="shrink-0 rounded-md bg-sky-500/10 border border-sky-500/25 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-400">
          Selecciones
        </span>
        {FEATURED_NATIONAL_TEAMS.map((nt) => (
          <button
            key={nt.team.id}
            type="button"
            onClick={() => openTeam(nt.team, nt.leagueId)}
            title={`Ver selección de ${nt.team.name}`}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg transition-colors hover:border-accent/50 hover:text-accent cursor-pointer"
          >
            <TeamCrest team={nt.team} className="size-4" />
            <span>{nt.team.name}</span>
          </button>
        ))}
      </section>

      {isPending && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <div className="flex items-center justify-center py-4 text-xs text-accent">
            <span className="inline-block size-2 animate-ping rounded-full bg-accent mr-2" />
            Cargando partidos reales...
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-card" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-danger/40 bg-card p-4 text-sm">
          <p className="text-danger font-semibold">No se pudieron cargar los partidos.</p>
          <p className="mt-1 text-xs text-fg-subtle">
            Verifica tu conexión a Internet o intenta nuevamente.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-canvas transition-colors hover:bg-accent/90"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isPending && !isError && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center text-sm text-fg-muted">
          <p className="text-base font-semibold text-fg">
            {view === 'live' ? 'No hay partidos en directo en este momento' : 'No hay partidos programados para esta fecha'}
          </p>
          <p className="mt-1 text-xs text-fg-subtle max-w-md">
            {view === 'live'
              ? 'Cuando comience a jugarse un partido en cualquiera de las competiciones seguidas, aparecerá aquí con su marcador y minuto en vivo.'
              : 'Las competiciones de liga juegan principalmente fines de semana y copas entre semana. Usa la lupa para consultar cualquier competición o club.'}
          </p>
          {view !== 'live' && recentSunday !== view && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setView(recentSunday)}
                className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-canvas transition-colors cursor-pointer"
              >
                Ver jornada completa (Domingo con LaLiga, 2ª, 1ª/2ª/3ª RFEF, etc.)
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <LeagueSection
            key={group.league.id}
            {...group}
            onSelectMatch={openMatch}
            onOpenStandings={(leagueId) => openLeague(leagueId)}
          />
        ))}
      </div>
    </div>
  )
}

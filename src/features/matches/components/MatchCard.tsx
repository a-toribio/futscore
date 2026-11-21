import clsx from 'clsx'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { LiveDot } from '@/components/ui/LiveDot'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { useAppNavigation } from '@/features/navigation/navigationContext'
import { useChangeFlash } from '@/hooks/useChangeFlash'
import { formatMatchStatus } from '@/lib/format'
import type { Match, Team } from '@/types'

function TeamName({ team }: { team: Team }) {
  return (
    <>
      <span className="truncate sm:hidden">{team.shortName}</span>
      <span className="hidden truncate sm:inline">{team.name}</span>
    </>
  )
}

/** Zona clicable de un equipo dentro de la tarjeta (abre la ficha del club sin abrir el partido). */
function TeamLink({
  team,
  leagueId,
  className,
  children,
}: {
  team: Team
  leagueId: string
  className: string
  children: ReactNode
}) {
  const { openTeam } = useAppNavigation()
  const open = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation()
    openTeam(team, leagueId)
  }
  return (
    <span
      role="link"
      tabIndex={0}
      title={`Ver ficha de ${team.name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          open(e)
        }
      }}
      className={clsx(className, 'hover:text-accent hover:underline underline-offset-2')}
    >
      {children}
    </span>
  )
}

interface MatchCardProps {
  match: Match
  onClick?: () => void
  linkTeams?: boolean
}

export function MatchCard({ match, onClick, linkTeams = true }: MatchCardProps) {
  const { status, score, homeTeam, awayTeam } = match
  const isLive = status === 'live'
  const flashing = useChangeFlash(score ? `${score.home}-${score.away}` : '')

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="grid w-full grid-cols-[3.25rem_1fr_auto_1fr_1.25rem] items-center gap-2 px-3 py-3 text-left text-sm transition-colors hover:bg-card-hover cursor-pointer focus-visible:outline-hidden focus-visible:bg-card-hover"
        title="Ver detalles, eventos, estadísticas y alineaciones"
      >
        <div
          className={clsx(
            'flex items-center gap-1 text-xs font-semibold tabular-nums',
            isLive ? 'text-accent' : 'text-fg-muted',
          )}
        >
          {isLive && <LiveDot className="size-1.5" />}
          {formatMatchStatus(match)}
        </div>

        <div className="flex min-w-0 items-center justify-end gap-2">
          {linkTeams ? (
            <TeamLink
              team={homeTeam}
              leagueId={match.leagueId}
              className="flex min-w-0 items-center justify-end gap-2 text-right font-medium cursor-pointer"
            >
              <TeamName team={homeTeam} />
              <TeamCrest team={homeTeam} />
            </TeamLink>
          ) : (
            <>
              <TeamName team={homeTeam} />
              <TeamCrest team={homeTeam} />
            </>
          )}
        </div>

        <div
          className={clsx(
            'min-w-14 rounded-md px-2 py-0.5 text-center text-base font-bold tabular-nums',
            flashing && 'animate-goal-flash',
            !flashing && isLive && 'text-accent',
            !score && 'text-sm font-medium text-fg-subtle',
          )}
        >
          {score ? `${score.home} - ${score.away}` : 'vs'}
        </div>

        <div className="flex min-w-0 items-center gap-2">
          {linkTeams ? (
            <TeamLink
              team={awayTeam}
              leagueId={match.leagueId}
              className="flex min-w-0 items-center gap-2 font-medium cursor-pointer"
            >
              <TeamCrest team={awayTeam} />
              <TeamName team={awayTeam} />
            </TeamLink>
          ) : (
            <>
              <TeamCrest team={awayTeam} />
              <TeamName team={awayTeam} />
            </>
          )}
        </div>

        <div className="flex justify-end text-fg-subtle text-xs" aria-hidden="true">
          ›
        </div>
      </button>
    </li>
  )
}

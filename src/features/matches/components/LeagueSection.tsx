import { useState } from 'react'
import { FavoriteStar } from '@/features/favorites/FavoriteStar'
import { useFavoritesStore } from '@/features/favorites/favoritesStore'
import type { LeagueMatches, Match } from '@/types'
import { MatchCard } from './MatchCard'

interface LeagueSectionProps extends LeagueMatches {
  onSelectMatch?: (match: Match) => void
  onOpenStandings?: (leagueId: string) => void
}

export function LeagueSection({
  league,
  matches,
  onSelectMatch,
  onOpenStandings,
}: LeagueSectionProps) {
  const [open, setOpen] = useState(true)
  const isFav = useFavoritesStore((s) => s.leagueIds.includes(league.id))
  const toggleLeague = useFavoritesStore((s) => s.toggleLeague)

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex w-full items-center justify-between gap-2 bg-surface px-3 py-2.5">
        <button
          type="button"
          onClick={() => onOpenStandings?.(league.id)}
          title={`Ver clasificación y partidos de ${league.name}`}
          className="group flex min-w-0 flex-1 items-center gap-2 text-left cursor-pointer"
        >
          <span aria-hidden="true" className="text-base">{league.flag}</span>
          <span className="truncate">
            <span className="text-sm font-semibold text-fg transition-colors group-hover:text-accent group-hover:underline underline-offset-2">
              {league.name}
            </span>
            <span className="ml-2 text-xs text-fg-subtle">{league.country}</span>
          </span>
        </button>

        <FavoriteStar
          active={isFav}
          label={league.name}
          onToggle={() => toggleLeague(league.id)}
          className="size-7 border-transparent bg-transparent"
        />
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Contraer competición' : 'Expandir competición'}
          onClick={() => setOpen((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-fg-muted transition-colors hover:bg-card hover:text-fg cursor-pointer"
        >
          <span className="text-xs tabular-nums">{matches.length}</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <ul className="divide-y divide-border">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onClick={() => onSelectMatch?.(match)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

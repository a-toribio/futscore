import { useEffect, useMemo, useRef, useState } from 'react'
import { PlayerAvatar } from '@/components/ui/PlayerAvatar'
import { SearchIcon } from '@/components/ui/SearchIcon'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { useTeamIndex } from '@/features/teams/useTeam'
import {
  isNationalTeam,
} from '@/lib/nationalTeams'
import { searchEntities } from '@/services/real/teams'
import type { SearchResult } from '@/types'

interface SearchModalProps {
  open: boolean
  onClose: () => void
  onSelect: (result: SearchResult) => void
}

function SearchPanel({ onClose, onSelect }: Omit<SearchModalProps, 'open'>) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: teams, isPending, isError } = useTeamIndex(true)

  useEffect(() => {
    inputRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const results = useMemo(() => searchEntities(query, teams ?? []), [query, teams])
  const playerResults = results.filter((r) => r.kind === 'player')
  const leagueResults = results.filter((r) => r.kind === 'league')
  const teamResults = results.filter((r) => r.kind === 'team')
  const hasQuery = query.trim().length > 0

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscador"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 sm:pt-[8vh]"
    >
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />

      <div className="relative z-10 flex h-dvh w-full max-w-2xl flex-col overflow-hidden border border-border bg-canvas shadow-2xl sm:h-auto sm:max-h-[80dvh] sm:rounded-2xl">
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-4 py-3">
          <SearchIcon className="size-5 shrink-0 text-fg-muted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca clubes, selecciones, futbolistas o competiciones..."
            aria-label="Buscar clubes, selecciones, futbolistas o competiciones"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus:outline-hidden"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar buscador"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-fg-muted transition-colors hover:bg-card-hover hover:text-fg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 [scrollbar-width:thin]">
          {!hasQuery && (
            <div className="space-y-5 py-2">
              <p className="text-center text-xs text-fg-muted">
                Escribe el nombre de un club, selección, futbolista o competición, o elige un acceso rápido:
              </p>
            </div>
          )}

          {hasQuery && isPending && (
            <div className="flex items-center justify-center py-3 text-xs text-accent">
              <span className="mr-2 inline-block size-2 animate-ping rounded-full bg-accent" />
              Cargando clubes y jugadores...
            </div>
          )}

          {hasQuery && isError && (
            <p className="py-3 text-center text-xs text-danger">
              No se pudo cargar el listado completo de clubes.
            </p>
          )}

          {hasQuery && !isPending && results.length === 0 && (
            <p className="py-10 text-center text-xs text-fg-muted">
              No hay resultados para «{query.trim()}».
            </p>
          )}

          {/* 1. Competiciones */}
          {leagueResults.length > 0 && (
            <section className="mb-4">
              <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                Competiciones ({leagueResults.length})
              </h3>
              <ul className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
                {leagueResults.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-card-hover cursor-pointer"
                    >
                      <span aria-hidden="true" className="text-lg">
                        {r.kind === 'league' ? r.flag : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-fg">{r.name}</span>
                        <span className="block truncate text-[11px] text-fg-subtle">{r.subtitle}</span>
                      </span>
                      <span className="text-fg-subtle" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 2. Clubes y Selecciones */}
          {teamResults.length > 0 && (
            <section className="mb-4">
              <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                Clubes y Selecciones ({teamResults.length})
              </h3>
              <ul className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
                {teamResults.map((r) => {
                  const isNat = r.kind === 'team' && isNationalTeam(r.ref.team, r.ref.leagueId)
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(r)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-card-hover cursor-pointer"
                      >
                        {r.kind === 'team' && <TeamCrest team={r.ref.team} className="size-7" />}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="truncate text-sm font-semibold text-fg">{r.name}</span>
                            {isNat && (
                              <span className="shrink-0 rounded bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-400">
                                Selección
                              </span>
                            )}
                          </span>
                          <span className="block truncate text-[11px] text-fg-subtle">{r.subtitle}</span>
                        </span>
                        <span className="text-fg-subtle" aria-hidden="true">
                          ›
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* 3. Futbolistas */}
          {playerResults.length > 0 && (
            <section>
              <h3 className="mb-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-accent">
                Futbolistas ({playerResults.length})
              </h3>
              <ul className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
                {playerResults.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(r)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-card-hover cursor-pointer group"
                    >
                      <PlayerAvatar
                        name={r.name}
                        photoUrl={r.kind === 'player' ? r.photoUrl : undefined}
                        jersey={r.kind === 'player' ? r.jersey : undefined}
                        position={r.kind === 'player' ? r.position : undefined}
                        size="sm"
                        showJerseyBadge
                        className="shrink-0"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-fg group-hover:text-accent transition-colors">
                          {r.name}
                        </span>
                        <span className="block truncate text-[11px] text-fg-subtle">{r.subtitle}</span>
                      </span>
                      <span className="text-fg-subtle text-xs" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchModal({ open, onClose, onSelect }: SearchModalProps) {
  if (!open) return null
  return <SearchPanel onClose={onClose} onSelect={onSelect} />
}

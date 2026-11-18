import clsx from 'clsx'
import type { MatchEvent } from '@/types'

function getEventBadge(type: MatchEvent['type']) {
  switch (type) {
    case 'goal':
    case 'penalty':
      return { icon: '⚽', label: 'Gol', color: 'text-accent bg-accent/15 border-accent/40' }
    case 'yellow_card':
      return { icon: '🟨', label: 'Tarjeta amarilla', color: 'text-warning bg-warning/15 border-warning/40' }
    case 'red_card':
      return { icon: '🟥', label: 'Tarjeta roja', color: 'text-danger bg-danger/15 border-danger/40' }
    case 'substitution':
      return { icon: '🔄', label: 'Cambio', color: 'text-sky-400 bg-sky-500/15 border-sky-400/40' }
    case 'var':
      return { icon: '📺', label: 'VAR', color: 'text-purple-400 bg-purple-500/15 border-purple-400/40' }
    default:
      return { icon: '📌', label: 'Incidencia', color: 'text-fg-muted bg-surface border-border' }
  }
}

interface MatchEventsTabProps {
  events: MatchEvent[]
  homeTeamName: string
  awayTeamName: string
  onSelectPlayerName?: (name: string, isHome: boolean) => void
}

export function MatchEventsTab({
  events,
  homeTeamName,
  awayTeamName,
  onSelectPlayerName,
}: MatchEventsTabProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-fg-muted">
        <span className="text-2xl mb-2">⏱️</span>
        <p className="font-medium text-fg">Sin eventos registrados aún</p>
        <p className="mt-1 text-xs text-fg-subtle max-w-xs">
          Los goles, tarjetas y cambios aparecerán aquí en vivo en cuanto se produzcan.
        </p>
      </div>
    )
  }

  return (
    <div className="relative py-3">
      {/* Línea vertical central de la cronología (Local a la izquierda, Visitante a la derecha) */}
      <div className="absolute left-1/2 top-4 bottom-4 -ml-px w-0.5 bg-border" />

      <ul className="space-y-3">
        {events.map((event) => {
          const { icon, color } = getEventBadge(event.type)
          const isHome = event.isHome ?? true
          const teamLabel = isHome ? homeTeamName : awayTeamName

          return (
            <li
              key={event.id}
              className={clsx('relative flex items-start', isHome ? 'justify-start' : 'justify-end')}
            >
              {/* Contenedor de la tarjeta en su columna (Local = izquierda, Visitante = derecha) */}
              <div
                className={clsx(
                  'w-[calc(50%-1rem)] sm:w-[calc(50%-1.25rem)]',
                  isHome ? 'text-left' : 'text-right',
                )}
              >
                <div
                  className={clsx(
                    'rounded-xl border border-border bg-card p-2.5 sm:p-3 shadow-xs transition-colors hover:border-border/80',
                    event.type === 'goal' && 'border-accent/40 bg-accent/5',
                  )}
                >
                  {/* Minuto y Equipo */}
                  <div
                    className={clsx(
                      'flex items-center gap-1.5 text-xs font-semibold min-w-0',
                      isHome ? 'justify-start' : 'justify-end',
                    )}
                  >
                    <span className="text-accent font-bold tabular-nums shrink-0">{event.minute}</span>
                    <span className="text-fg-subtle shrink-0">·</span>
                    <span className="text-fg-muted font-medium text-[11px] truncate">{teamLabel}</span>
                  </div>

                  {/* Detalle sin explicaciones: solo jugador(es) */}
                  <div className="mt-1.5 text-xs">
                    {event.type === 'goal' ? (
                      <div>
                        <div
                          className={clsx(
                            'flex flex-wrap items-center gap-1.5 font-bold text-fg',
                            isHome ? 'justify-start' : 'justify-end',
                          )}
                        >
                          <span className="text-base text-accent leading-none">⚽</span>
                          {event.player ? (
                            <button
                              type="button"
                              onClick={() => onSelectPlayerName?.(event.player!, isHome)}
                              className={clsx(
                                'text-sm hover:text-accent hover:underline cursor-pointer font-bold text-fg',
                                isHome ? 'text-left' : 'text-right',
                              )}
                            >
                              {event.player}
                            </button>
                          ) : (
                            <span className="text-sm">Gol</span>
                          )}
                          {event.isPenalty && (
                            <span className="rounded bg-accent/15 px-1.5 py-0.2 text-[10px] font-semibold text-accent">
                              Penalti
                            </span>
                          )}
                          {event.isOwnGoal && (
                            <span className="rounded bg-danger/15 px-1.5 py-0.2 text-[10px] font-semibold text-danger">
                              En propia puerta
                            </span>
                          )}
                        </div>

                        {event.assistPlayer && (
                          <div
                            className={clsx(
                              'mt-1 flex flex-wrap items-center gap-1 text-[11px] text-fg-subtle',
                              isHome ? 'justify-start' : 'justify-end',
                            )}
                          >
                            <span>Asistencia:</span>
                            <button
                              type="button"
                              onClick={() => onSelectPlayerName?.(event.assistPlayer!, isHome)}
                              className="font-semibold text-fg-muted hover:text-accent hover:underline cursor-pointer"
                            >
                              {event.assistPlayer}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : event.type === 'substitution' ? (
                      <div className="space-y-0.5">
                        {event.subIn && (
                          <div
                            className={clsx(
                              'flex flex-wrap items-center gap-1 text-xs font-semibold text-emerald-400',
                              isHome ? 'justify-start' : 'justify-end',
                            )}
                          >
                            <span>🟢 Entra:</span>
                            <button
                              type="button"
                              onClick={() => onSelectPlayerName?.(event.subIn!, isHome)}
                              className={clsx(
                                'text-fg hover:text-accent hover:underline cursor-pointer',
                                isHome ? 'text-left' : 'text-right',
                              )}
                            >
                              {event.subIn}
                            </button>
                          </div>
                        )}
                        {event.subOut && (
                          <div
                            className={clsx(
                              'flex flex-wrap items-center gap-1 text-[11px] font-medium text-rose-400/90',
                              isHome ? 'justify-start' : 'justify-end',
                            )}
                          >
                            <span>🔴 Sale:</span>
                            <button
                              type="button"
                              onClick={() => onSelectPlayerName?.(event.subOut!, isHome)}
                              className={clsx(
                                'text-fg-muted hover:text-accent hover:underline cursor-pointer',
                                isHome ? 'text-left' : 'text-right',
                              )}
                            >
                              {event.subOut}
                            </button>
                          </div>
                        )}
                        {!event.subIn && !event.subOut && event.player && (
                          <button
                            type="button"
                            onClick={() => onSelectPlayerName?.(event.player!, isHome)}
                            className="font-semibold text-fg hover:text-accent hover:underline cursor-pointer"
                          >
                            {event.player}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div
                        className={clsx(
                          'flex flex-wrap items-center gap-1.5 font-bold text-fg',
                          isHome ? 'justify-start' : 'justify-end',
                        )}
                      >
                        {event.type === 'yellow_card' && <span className="text-xs">🟨</span>}
                        {event.type === 'red_card' && <span className="text-xs">🟥</span>}
                        {event.player ? (
                          <button
                            type="button"
                            onClick={() => onSelectPlayerName?.(event.player!, isHome)}
                            className={clsx(
                              'hover:text-accent hover:underline cursor-pointer',
                              isHome ? 'text-left' : 'text-right',
                            )}
                          >
                            {event.player}
                          </button>
                        ) : (
                          <span>{event.text}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Icono central sobre la línea */}
              <div
                aria-hidden="true"
                className={clsx(
                  'absolute left-1/2 top-3 -translate-x-1/2 z-10 flex size-6 items-center justify-center rounded-full border text-[11px] font-bold shadow-xs',
                  color,
                )}
              >
                {icon}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

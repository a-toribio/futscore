import clsx from 'clsx'

interface FavoriteStarProps {
  active: boolean
  onToggle: () => void
  label: string
  className?: string
}

/** Botón de estrella para marcar/desmarcar un equipo o competición como favorito. */
export function FavoriteStar({ active, onToggle, label, className }: FavoriteStarProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Quitar ${label} de favoritos` : `Marcar ${label} como favorito`}
      title={active ? 'Quitar de favoritos' : 'Marcar como favorito'}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={clsx(
        'flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-card-hover cursor-pointer',
        active ? 'text-amber-400' : 'text-fg-muted hover:text-fg',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5" strokeWidth="2" stroke="currentColor" fill={active ? 'currentColor' : 'none'} strokeLinejoin="round">
        <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
      </svg>
    </button>
  )
}
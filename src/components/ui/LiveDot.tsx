import clsx from 'clsx'

interface LiveDotProps {
  className?: string
}

/** Indicador pulsante de "en directo". */
export function LiveDot({ className }: LiveDotProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-block size-2.5 rounded-full bg-accent shadow-glow animate-live-pulse',
        className,
      )}
    />
  )
}

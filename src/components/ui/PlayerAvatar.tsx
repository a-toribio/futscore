import clsx from 'clsx'
import { useState } from 'react'
import { translatePosition } from '@/lib/positions'
import { usePlayerPhoto } from '@/services/real/playerPhotos'

interface PlayerAvatarProps {
  name: string
  photoUrl?: string
  jersey?: string
  position?: string
  id?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  showJerseyBadge?: boolean
  ring?: boolean
}

const SIZE_CLASSES = {
  xs: 'size-6 text-[10px]',
  sm: 'size-7 sm:size-8 text-[11px]',
  md: 'size-9 sm:size-10 text-xs',
  lg: 'size-12 sm:size-14 text-sm',
  xl: 'size-16 sm:size-20 text-base',
  '2xl': 'size-24 sm:size-28 text-xl',
}

export function PlayerAvatar({
  name,
  photoUrl: initialPhotoUrl,
  jersey,
  position,
  id,
  size = 'md',
  className,
  showJerseyBadge = false,
  ring = true,
}: PlayerAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false)
  const { photoUrl } = usePlayerPhoto(name, initialPhotoUrl, id)
  const posInfo = translatePosition(position)

  const activePhoto = !imgFailed && photoUrl ? photoUrl : null
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || jersey || '⚽'

  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <div
      className={clsx(
        'relative shrink-0 rounded-full select-none overflow-visible flex items-center justify-center',
        sizeClass,
        className,
      )}
    >
      <div
        className={clsx(
          'size-full rounded-full overflow-hidden flex items-center justify-center bg-card shadow-inner',
          ring && 'ring-2 ring-white/15 shadow-md',
          posInfo.code === 'POR' ? 'border-amber-500/40' : 'border-border',
        )}
      >
        {activePhoto ? (
          <img
            src={activePhoto}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="size-full object-cover object-top"
          />
        ) : (
          <div className="size-full flex flex-col items-center justify-center bg-gradient-to-br from-surface via-card to-card-hover font-black text-accent tracking-tighter">
            <span>{jersey || initials}</span>
          </div>
        )}
      </div>

      {showJerseyBadge && jersey && (
        <span
          className={clsx(
            'absolute -bottom-1 -right-1 rounded-full border border-border flex items-center justify-center font-black tabular-nums shadow-xs',
            size === 'xs' || size === 'sm'
              ? 'size-3.5 text-[8px]'
              : size === 'md'
                ? 'size-4.5 text-[9px]'
                : 'size-5 sm:size-6 text-[10px] sm:text-[11px]',
            posInfo.code === 'POR'
              ? 'bg-amber-500 text-black'
              : 'bg-surface text-fg font-black',
          )}
        >
          {jersey}
        </span>
      )}
    </div>
  )
}

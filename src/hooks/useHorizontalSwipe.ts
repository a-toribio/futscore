import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type TouchEvent } from 'react'
import { resolveSwipeDirection } from '@/lib/dayViews'

interface UseHorizontalSwipeOptions {
  canSwipePrev: boolean
  canSwipeNext: boolean
  onSwipePrev: () => void
  onSwipeNext: () => void
}

type LockAxis = 'none' | 'horizontal' | 'vertical'

const DEAD_ZONE_PX = 10
const MAX_OFFSET_PX = 140

/**
 * Detecta deslizamientos horizontales táctiles sobre un contenedor manteniendo intacto
 * el desplazamiento vertical (`touch-pan-y`).
 */
export function useHorizontalSwipe({
  canSwipePrev,
  canSwipeNext,
  onSwipePrev,
  onSwipeNext,
}: UseHorizontalSwipeOptions) {
  const [offsetX, setOffsetX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const gestureRef = useRef<{
    active: boolean
    startX: number
    startY: number
    lastDx: number
    startTime: number
    axis: LockAxis
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastDx: 0,
    startTime: 0,
    axis: 'none',
  })

  const suppressClickRef = useRef(false)
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callbacksRef = useRef({ canSwipePrev, canSwipeNext, onSwipePrev, onSwipeNext })
  callbacksRef.current = { canSwipePrev, canSwipeNext, onSwipePrev, onSwipeNext }

  useEffect(() => {
    return () => {
      if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current)
    }
  }, [])

  const resetSwipe = useCallback(() => {
    gestureRef.current.active = false
    gestureRef.current.axis = 'none'
    setIsDragging(false)
    setOffsetX(0)
  }, [])

  const onTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) {
      gestureRef.current.active = false
      gestureRef.current.axis = 'none'
      setIsDragging(false)
      setOffsetX(0)
      return
    }

    if (suppressTimerRef.current) {
      clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = null
    }
    suppressClickRef.current = false

    const touch = e.touches[0]
    gestureRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      lastDx: 0,
      startTime: Date.now(),
      axis: 'none',
    }
  }, [])

  const onTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    const g = gestureRef.current
    if (!g.active || e.touches.length !== 1) return

    const touch = e.touches[0]
    const dx = touch.clientX - g.startX
    const dy = touch.clientY - g.startY
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)

    if (g.axis === 'none') {
      if (absX < DEAD_ZONE_PX && absY < DEAD_ZONE_PX) return

      if (absY >= absX) {
        g.axis = 'vertical'
        return
      }
      if (absX > absY * 1.25) {
        g.axis = 'horizontal'
        setIsDragging(true)
      } else if (absX > 24 || absY > 24) {
        g.axis = 'vertical'
        return
      } else {
        return
      }
    }

    if (g.axis !== 'horizontal') return

    g.lastDx = dx
    const { canSwipePrev: hasPrev, canSwipeNext: hasNext } = callbacksRef.current
    const canMoveInDirection = (dx > 0 && hasPrev) || (dx < 0 && hasNext)
    const damped = dx * (canMoveInDirection ? 0.65 : 0.25)
    setOffsetX(Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, damped)))
  }, [])

  const onTouchEnd = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      const g = gestureRef.current
      if (!g.active) {
        resetSwipe()
        return
      }

      const wasHorizontal = g.axis === 'horizontal'
      const touch = e.changedTouches[0]
      const finalDx = touch ? touch.clientX - g.startX : g.lastDx
      const elapsed = Date.now() - g.startTime

      resetSwipe()

      if (!wasHorizontal) return

      if (Math.abs(finalDx) >= DEAD_ZONE_PX) {
        suppressClickRef.current = true
        if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current)
        suppressTimerRef.current = setTimeout(() => {
          suppressClickRef.current = false
          suppressTimerRef.current = null
        }, 350)
      }

      const dir = resolveSwipeDirection(finalDx, 0, elapsed)
      const { canSwipePrev: hasPrev, canSwipeNext: hasNext, onSwipePrev: prev, onSwipeNext: next } =
        callbacksRef.current

      if (dir === 1 && hasNext) {
        next()
      } else if (dir === -1 && hasPrev) {
        prev()
      }
    },
    [resetSwipe],
  )

  const onTouchCancel = useCallback(() => {
    resetSwipe()
  }, [resetSwipe])

  const onClickCapture = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    if (suppressTimerRef.current) {
      clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = null
    }
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handlers = useMemo(
    () => ({
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onTouchCancel,
      onClickCapture,
    }),
    [onTouchStart, onTouchMove, onTouchEnd, onTouchCancel, onClickCapture],
  )

  return { offsetX, isDragging, handlers }
}

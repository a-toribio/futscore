import { useHorizontalSwipe } from './useHorizontalSwipe'

export interface UseTabSwipeOptions<T extends string> {
  tabs: readonly T[]
  activeTab: T
  onTabChange: (nextTab: T) => void
  disabled?: boolean
}

/**
 * Devuelve la pestaña anterior (`-1`) o siguiente (`1`) en la lista de pestañas ordenadas,
 * o `null` si está en el extremo o la pestaña no existe.
 */
export function getAdjacentTab<T extends string>(
  tabs: readonly T[],
  activeTab: T,
  direction: -1 | 1,
): T | null {
  const currentIndex = tabs.indexOf(activeTab)
  if (currentIndex === -1) return null
  const targetIndex = currentIndex + direction
  if (targetIndex < 0 || targetIndex >= tabs.length) return null
  return tabs[targetIndex]
}

/**
 * Hook para permitir la navegación horizontal entre pestañas mediante deslizamiento táctil (swipe).
 * Gestiona el orden de pestañas y calcula automáticamente si es posible avanzar o retroceder.
 */
export function useTabSwipe<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
}: UseTabSwipeOptions<T>) {
  const prevTab = !disabled ? getAdjacentTab(tabs, activeTab, -1) : null
  const nextTab = !disabled ? getAdjacentTab(tabs, activeTab, 1) : null

  return useHorizontalSwipe({
    canSwipePrev: Boolean(prevTab),
    canSwipeNext: Boolean(nextTab),
    onSwipePrev: () => {
      if (prevTab) onTabChange(prevTab)
    },
    onSwipeNext: () => {
      if (nextTab) onTabChange(nextTab)
    },
  })
}

import { Outlet } from 'react-router-dom'
import { DataSourceBanner, DataSourceFooter } from '@/components/DataSourceBanner'
import { UpdateModal } from '@/components/UpdateModal'
import { LiveDot } from '@/components/ui/LiveDot'
import { SearchIcon } from '@/components/ui/SearchIcon'
import { NavigationProvider } from '@/features/navigation/NavigationProvider'
import { useAppNavigation } from '@/features/navigation/navigationContext'

function SearchButton() {
  const { openSearch } = useAppNavigation()
  return (
    <button
      type="button"
      onClick={openSearch}
      aria-label="Buscar competiciones, clubes y futbolistas"
      title="Buscar competiciones, clubes y futbolistas"
      className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-fg-muted transition-colors hover:border-accent/50 hover:text-accent cursor-pointer"
    >
      <SearchIcon className="size-4.5" />
    </button>
  )
}

export function AppLayout() {
  return (
    <NavigationProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-canvas/90 backdrop-blur">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <div className="flex items-center gap-2">
              <LiveDot />
              <h1 className="text-lg font-bold tracking-tight">
                Fut<span className="text-accent">Score</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-fg-muted">
                <LiveDot className="size-1.5" />
                <span className="text-fg-subtle">Resultados en vivo</span>
              </div>
              <SearchButton />
            </div>
          </div>
          <DataSourceBanner />
        </header>
        <main className="flex-1 px-4 py-4">
          <Outlet />
        </main>
        <DataSourceFooter />
      </div>
      <UpdateModal />
    </NavigationProvider>
  )
}

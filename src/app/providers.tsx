import { Preferences } from '@capacitor/preferences'
import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useEffect, type ReactNode } from 'react'
import { toDateKey } from '@/lib/date'
import { onMatchesUpdated } from '@/services/updates'
import { isPersistableQuery } from './queryPersistence'

const MATCHES_CACHE_MAX_AGE_MS = 24 * 60 * 60_000

const persister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => (await Preferences.get({ key })).value,
    setItem: async (key, value) => Preferences.set({ key, value }),
    removeItem: async (key) => Preferences.remove({ key }),
  },
  key: 'futscore-query-cache',
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  useEffect(
    () => onMatchesUpdated((date) => void queryClient.invalidateQueries({ queryKey: ['matches', date] })),
    [],
  )

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: MATCHES_CACHE_MAX_AGE_MS,
        buster: 'futscore-matches-v1',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            isPersistableQuery(query, toDateKey(new Date())),
        },
      }}
      onError={() => console.error('No se pudo restaurar la caché local de FutScore.')}
    >
      {children}
    </PersistQueryClientProvider>
  )
}

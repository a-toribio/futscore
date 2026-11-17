import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { onMatchesUpdated } from '@/services/updates'

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

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

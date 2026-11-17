import { useDataSourceStore } from '@/services/dataSourceStore'
import { createFallbackProvider } from '@/services/fallbackProvider'
import type { MatchesProvider } from '@/services/matchesProvider'
import { createMockMatchesProvider } from '@/services/mock/mockMatchesProvider'
import { createApiFootballProvider } from '@/services/real/apiFootball'
import { createEspnProvider } from '@/services/real/espn'
import { createFootballDataProvider } from '@/services/real/footballData'

const mockSafetyProvider = createMockMatchesProvider()

/**
 * Proveedor principal de la aplicación: datos 100% reales.
 * Cadena de resiliencia: ESPN -> API-Football -> football-data.org.
 */
export const matchesProvider: MatchesProvider = createFallbackProvider(
  [
    { name: 'ESPN', provider: createEspnProvider() },
    { name: 'API-Football', provider: createApiFootballProvider() },
    { name: 'football-data.org', provider: createFootballDataProvider() },
    { name: 'Red no disponible', provider: mockSafetyProvider, simulated: true },
  ],
  {
    onSourceChange: (source) => useDataSourceStore.getState().setSource(source),
  },
)

import { create } from 'zustand'
import type { SourceInfo } from '@/services/fallbackProvider'

interface DataSourceState {
  source: SourceInfo | null
  setSource: (source: SourceInfo) => void
}

/** Estado de la fuente de datos real conectada (para atribución y estado). */
export const useDataSourceStore = create<DataSourceState>((set) => ({
  source: null,
  setSource: (source) => set({ source }),
}))

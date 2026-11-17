import { useDataSourceStore } from '@/services/dataSourceStore'

/** Atribución y aviso sutil si la red está caída. */
export function DataSourceBanner() {
  const { source } = useDataSourceStore()
  if (!source?.degraded && !source?.simulated) return null

  return (
    <div role="status" className="border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-xs text-warning">
      <p className="font-semibold">
        {source.simulated
          ? 'Conexión a APIs no disponible; mostrando datos temporales fuera de línea.'
          : `Fuente de respaldo activa: ${source.name}`}
      </p>
    </div>
  )
}

/** Atribución de datos oficial. */
export function DataSourceFooter() {
  const { source } = useDataSourceStore()
  return (
    <footer className="px-4 py-6 text-center text-xs text-fg-subtle">
      Datos y marcadores en directo · {source?.name ?? 'ESPN Fútbol'}
    </footer>
  )
}

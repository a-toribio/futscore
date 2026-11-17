import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

export function RootErrorPage() {
  const error = useRouteError()

  let message = 'Ha ocurrido un error inesperado al cargar la vista.'
  if (isRouteErrorResponse(error)) {
    message = error.statusText || message
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-danger/40 bg-card p-6 max-w-md w-full">
        <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-danger/15 text-danger font-bold text-lg">
          !
        </div>
        <h2 className="text-base font-bold text-fg">Error en la aplicación</h2>
        <p className="mt-2 text-xs text-fg-muted">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-canvas transition-colors hover:bg-accent/90 cursor-pointer"
        >
          Recargar aplicación
        </button>
      </div>
    </div>
  )
}

import { addDaysToDateKey } from '@/lib/date'

interface PersistableQuery {
  queryKey: readonly unknown[]
  state: { status: string }
}

export function isPersistableQuery(query: PersistableQuery, today: string): boolean {
  if (
    query.state.status !== 'success' ||
    query.queryKey[0] !== 'matches' ||
    typeof query.queryKey[1] !== 'string'
  ) {
    return false
  }

  return [-1, 0, 1].some((offset) => addDaysToDateKey(today, offset) === query.queryKey[1])
}

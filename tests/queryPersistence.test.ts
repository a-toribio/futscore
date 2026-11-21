import { describe, expect, it } from 'vitest'
import { isPersistableQuery } from '@/app/queryPersistence'

function query(queryKey: unknown[], status = 'success') {
  return { queryKey, state: { status } }
}

describe('isPersistableQuery', () => {
  it('persists successful match lists for yesterday, today, and tomorrow only', () => {
    expect(isPersistableQuery(query(['matches', '2026-11-20']), '2026-11-21')).toBe(true)
    expect(isPersistableQuery(query(['matches', '2026-11-21']), '2026-11-21')).toBe(true)
    expect(isPersistableQuery(query(['matches', '2026-11-22']), '2026-11-21')).toBe(true)
    expect(isPersistableQuery(query(['matches', '2026-11-19']), '2026-11-21')).toBe(false)
  })

  it('does not persist failed queries or unrelated data', () => {
    expect(isPersistableQuery(query(['matches', '2026-11-21'], 'error'), '2026-11-21')).toBe(false)
    expect(isPersistableQuery(query(['match-detail', 'match-1']), '2026-11-21')).toBe(false)
  })
})

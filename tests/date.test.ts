import { describe, expect, it } from 'vitest'
import { addDaysToDateKey } from '@/lib/date'

describe('addDaysToDateKey', () => {
  it('handles month and year boundaries', () => {
    expect(addDaysToDateKey('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDaysToDateKey('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('handles leap days', () => {
    expect(addDaysToDateKey('2024-02-28', 1)).toBe('2024-02-29')
  })
})

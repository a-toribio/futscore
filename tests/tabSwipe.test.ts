import { describe, expect, it } from 'vitest'
import { getAdjacentTab } from '@/hooks/useTabSwipe'

describe('getAdjacentTab', () => {
  const matchTabs = ['events', 'stats', 'lineups', 'h2h', 'info'] as const
  const teamTabs = ['info', 'standings', 'squad', 'matches'] as const
  const playerTabs = ['info', 'stats', 'career'] as const
  const leagueTabs = ['standings', 'matches'] as const

  it('navigates forward and backward in match tabs', () => {
    expect(getAdjacentTab(matchTabs, 'events', -1)).toBeNull()
    expect(getAdjacentTab(matchTabs, 'events', 1)).toBe('stats')

    expect(getAdjacentTab(matchTabs, 'stats', -1)).toBe('events')
    expect(getAdjacentTab(matchTabs, 'stats', 1)).toBe('lineups')

    expect(getAdjacentTab(matchTabs, 'lineups', -1)).toBe('stats')
    expect(getAdjacentTab(matchTabs, 'lineups', 1)).toBe('h2h')

    expect(getAdjacentTab(matchTabs, 'h2h', -1)).toBe('lineups')
    expect(getAdjacentTab(matchTabs, 'h2h', 1)).toBe('info')

    expect(getAdjacentTab(matchTabs, 'info', -1)).toBe('h2h')
    expect(getAdjacentTab(matchTabs, 'info', 1)).toBeNull()
  })

  it('navigates forward and backward in team tabs', () => {
    expect(getAdjacentTab(teamTabs, 'info', -1)).toBeNull()
    expect(getAdjacentTab(teamTabs, 'info', 1)).toBe('standings')

    expect(getAdjacentTab(teamTabs, 'standings', -1)).toBe('info')
    expect(getAdjacentTab(teamTabs, 'standings', 1)).toBe('squad')

    expect(getAdjacentTab(teamTabs, 'squad', -1)).toBe('standings')
    expect(getAdjacentTab(teamTabs, 'squad', 1)).toBe('matches')

    expect(getAdjacentTab(teamTabs, 'matches', -1)).toBe('squad')
    expect(getAdjacentTab(teamTabs, 'matches', 1)).toBeNull()
  })

  it('navigates forward and backward in player tabs', () => {
    expect(getAdjacentTab(playerTabs, 'info', -1)).toBeNull()
    expect(getAdjacentTab(playerTabs, 'info', 1)).toBe('stats')

    expect(getAdjacentTab(playerTabs, 'stats', -1)).toBe('info')
    expect(getAdjacentTab(playerTabs, 'stats', 1)).toBe('career')

    expect(getAdjacentTab(playerTabs, 'career', -1)).toBe('stats')
    expect(getAdjacentTab(playerTabs, 'career', 1)).toBeNull()
  })

  it('navigates forward and backward in league tabs', () => {
    expect(getAdjacentTab(leagueTabs, 'standings', -1)).toBeNull()
    expect(getAdjacentTab(leagueTabs, 'standings', 1)).toBe('matches')

    expect(getAdjacentTab(leagueTabs, 'matches', -1)).toBe('standings')
    expect(getAdjacentTab(leagueTabs, 'matches', 1)).toBeNull()
  })

  it('returns null if tab does not exist in array', () => {
    expect(getAdjacentTab(matchTabs, 'non_existent' as any, 1)).toBeNull()
    expect(getAdjacentTab(matchTabs, 'non_existent' as any, -1)).toBeNull()
  })
})

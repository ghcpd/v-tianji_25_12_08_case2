import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { analyticsService, userService, dashboardService } from './api'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(axios)
})

afterEach(() => {
  mock.restore()
})

describe('API service compatibility', () => {
  it('uses /api/v2/analytics/trends and normalizes values', async () => {
    mock.onGet('/api/v2/analytics/trends').reply(200, [
      { date: '2025-12-08', value: '42' },
    ])

    const res = await analyticsService.getTrends('views')
    expect(res).toEqual([{ date: '2025-12-08', value: 42 }])
  })

  it('normalizes users with missing profile', async () => {
    mock.onGet('/api/v1/users').reply(200, [
      {
        id: 1,
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'admin',
        createdAt: '2025-01-01T00:00:00Z',
        status: 'active',
        // profile intentionally missing
      },
    ])

    const users = await userService.getUsers()
    expect(users[0].profile).toEqual({ avatar: '', department: '', location: '' })
  })

  it('normalizes dashboard stats with snake_case keys', async () => {
    mock.onGet('/api/v1/dashboard/stats').reply(200, {
      total_users: 100,
      active_users: 80,
      revenue: 1500,
      growth: 5,
      recent_activity: [
        { id: 1, type: 'login', description: 'User logged in', timestamp: '2025-12-08T12:00:00Z', user_id: 1 },
      ],
    })

    const stats = await dashboardService.getStats()
    expect(stats.totalUsers).toBe(100)
    expect(stats.activeUsers).toBe(80)
    expect(stats.recentActivity[0].userId).toBe(1)
  })
})
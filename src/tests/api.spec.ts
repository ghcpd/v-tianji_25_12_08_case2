import MockAdapter from 'axios-mock-adapter'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import { userService, dashboardService, analyticsService, apiClient } from '../services/api'

const mock = new MockAdapter(apiClient)

describe('API Services Compatibility', () => {
  afterEach(() => {
    mock.reset()
  })

  it('normalizes user data: created_at -> createdAt, status enabled -> active, fills missing profile', async () => {
    mock.onGet('https://api.example.com/api/v1/users').reply(200, [
      {
        id: 1,
        full_name: 'Alice Smith',
        email: 'alice@example.com',
        user_role: 'admin',
        created_at: '2025-12-01T12:00:00Z',
        status: 'enabled',
        // profile missing intentionally
      },
    ])

    const users = await userService.getUsers()
    expect(users).toHaveLength(1)
    const u = users[0]
    expect(u.name).toBe('Alice Smith')
    expect(u.createdAt).toBe('2025-12-01T12:00:00Z')
    expect(u.status).toBe('active')
    expect(u.profile.department).toBe('General')
  })

  it('analyticsService uses v1 endpoint and normalizes snake_case metrics and summary', async () => {
    mock.onGet('https://api.example.com/api/v1/analytics/metrics').reply(200, {
      period: '30d',
      metrics: [
        { period: '2025-11-30', view_count: '100', click_count: '10', conversion_count: '1', revenue_usd: '50.5' },
      ],
      summary: { total_views: '100', total_clicks: '10', conversion_rate: '0.01' },
    })

    const data = await analyticsService.getMetrics('2025-11-01', '2025-11-30')
    expect(data.period).toBe('30d')
    expect(data.metrics[0].views).toBe(100)
    expect(data.metrics[0].revenue).toBe(50.5)
    expect(data.summary.totalViews).toBe(100)
    expect(data.summary.conversionRate).toBeCloseTo(0.01)
  })

  it('dashboardService normalizes growth value and recent_activity snake_case', async () => {
    mock.onGet('https://api.example.com/api/v1/dashboard/stats').reply(200, {
      total_users: 1000,
      active_users: 800,
      revenue: 12345.67,
      growth_rate: 0.05,
      recent_activity: [
        { id: 10, action: 'login', desc: 'User logged in', created_at: '2025-12-07T10:00:00Z', user_id: 2 },
      ],
    })

    const stats = await dashboardService.getStats()
    expect(stats.totalUsers).toBe(1000)
    expect(stats.activeUsers).toBe(800)
    expect(stats.growth).toBe(5) // 0.05 -> 5%
    expect(stats.recentActivity[0].type).toBe('login')
    expect(stats.recentActivity[0].userId).toBe(2)
  })
})

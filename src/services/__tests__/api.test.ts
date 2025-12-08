import MockAdapter from 'axios-mock-adapter'
import { describe, it, expect, beforeEach } from 'vitest'
import { apiClient, userService, dashboardService, analyticsService, User } from '../api'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(apiClient)
  mock.reset()
})

describe('userService', () => {
  it('getUsers returns array of users', async () => {
    const users: User[] = [
      { id: 1, name: 'Alice', email: 'a@example.com', role: 'admin', createdAt: '2025-01-01T00:00:00Z', status: 'active', profile: { avatar: '', department: 'Eng', location: 'NY' } },
    ]

    mock.onGet('/api/v1/users').reply(200, users)

    const result = await userService.getUsers()
    expect(result).toHaveLength(1)
    expect(result[0].email).toBe('a@example.com')
  })

  it('getUserById handles missing profile', async () => {
    const user = { id: 2, name: 'Bob', email: 'b@example.com', role: 'user', createdAt: '2025-01-02T00:00:00Z', status: 'inactive' }
    mock.onGet('/api/v1/users/2').reply(200, user)

    const result = await userService.getUserById(2)
    expect(result.id).toBe(2)
    expect(result.profile).toBeUndefined()
  })
})

describe('dashboardService', () => {
  it('getStats returns DashboardStats with recentActivity array', async () => {
    const stats = {
      totalUsers: 1000,
      activeUsers: 800,
      revenue: 12345.67,
      growth: 12.3,
      recentActivity: [ { id: 1, type: 'login', description: 'User login', timestamp: '2025-12-01T12:00:00Z', userId: 1 } ]
    }

    mock.onGet('/api/v1/dashboard/stats').reply(200, stats)

    const result = await dashboardService.getStats()
    expect(result.totalUsers).toBe(1000)
    expect(Array.isArray(result.recentActivity)).toBe(true)
  })

  it('getActivity accepts limit param', async () => {
    const activities = [ { id: 2, type: 'update', description: 'Profile update', timestamp: '2025-12-02T12:00:00Z', userId: 2 } ]
    mock.onGet('/api/v1/dashboard/activity', { params: { limit: 5 } }).reply(200, activities)

    const result = await dashboardService.getActivity(5)
    expect(result[0].id).toBe(2)
  })
})

describe('analyticsService', () => {
  it('getMetrics returns AnalyticsData with metrics entries having period', async () => {
    const metrics = {
      metrics: [ { period: '2025-11-01', views: 100, clicks: 10, conversions: 1, revenue: 99.99 } ],
      summary: { totalViews: 100, totalClicks: 10, conversionRate: 0.01 }
    }

    mock.onGet('/api/v2/analytics/metrics').reply(200, metrics)

    const result = await analyticsService.getMetrics('2025-11-01', '2025-11-30')
    expect(result.metrics[0].period).toBe('2025-11-01')
  })

  it('getTrends calls v2 endpoint', async () => {
    const trends = [ { date: '2025-11-01', value: 100 } ]
    mock.onGet('/api/v2/analytics/trends', { params: { metric: 'views' } }).reply(200, trends)

    const result = await analyticsService.getTrends('views')
    expect(result[0].value).toBe(100)
  })
})

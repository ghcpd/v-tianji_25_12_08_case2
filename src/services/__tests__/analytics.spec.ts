import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { analyticsService, apiClient } from '../api'

let mock: MockAdapter

beforeEach(() => {
  mock = new MockAdapter(apiClient)
})

afterEach(() => {
  mock.restore()
})

describe('analyticsService', () => {
  it('normalizes conversionRate when API returns percentage (0-100)', async () => {
    const response = {
      metrics: [
        { period: '2025-01-01', views: 100, clicks: 10, conversions: 1, revenue: 10 },
      ],
      summary: {
        totalViews: 100,
        totalClicks: 10,
        // API returns 5 meaning 5% — our service should normalize to 0.05
        conversionRate: 5,
      },
    }

    mock.onGet('/api/v2/analytics/metrics').reply(200, response)

    const data = await analyticsService.getMetrics('2025-01-01', '2025-01-31')

    expect(data.summary.conversionRate).toBeCloseTo(0.05)
  })

  it('preserves conversionRate when already in fraction (0-1)', async () => {
    const response = {
      metrics: [
        { period: '2025-01-01', views: 100, clicks: 10, conversions: 1, revenue: 10 },
      ],
      summary: {
        totalViews: 100,
        totalClicks: 10,
        conversionRate: 0.03,
      },
    }

    mock.onGet('/api/v2/analytics/metrics').reply(200, response)

    const data = await analyticsService.getMetrics('2025-01-01', '2025-01-31')

    expect(data.summary.conversionRate).toBeCloseTo(0.03)
  })

  it('calls the v2 trends endpoint (was v1)', async () => {
    const metric = 'views'
    const trendsResp = [{ date: '2025-12-01', value: 42 }]

    mock.onGet('/api/v2/analytics/trends').reply((cfg) => {
      // axios-mock-adapter provides config.params if present
      expect(cfg.params.metric).toBe(metric)
      return [200, trendsResp]
    })

    const t = await analyticsService.getTrends(metric)
    expect(t).toEqual(trendsResp)
  })
})

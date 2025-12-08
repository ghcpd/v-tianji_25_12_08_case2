const assert = require('assert')
const { analyticsService, userService, dashboardService, apiClient } = require('../src/services/api.cjs')

async function testTrends() {
  const originalGet = apiClient.get
  apiClient.get = async (url, config) => {
    if (url === '/api/v2/analytics/trends') {
      return { data: [{ date: '2025-12-08', value: '42' }] }
    }
    throw new Error('Unexpected URL ' + url)
  }

  const res = await analyticsService.getTrends('views')
  assert.deepStrictEqual(res, [{ date: '2025-12-08', value: 42 }])
  apiClient.get = originalGet
  console.log('✓ trends endpoint test passed')
}

async function testUsersNormalization() {
  const originalGet = apiClient.get
  apiClient.get = async (url) => {
    if (url === '/api/v1/users') {
      return {
        data: [
          { id: 1, name: 'Jane', email: 'j@ex.com', role: 'admin', createdAt: '2025-01-01', status: 'active' },
        ],
      }
    }
    throw new Error('Unexpected URL ' + url)
  }

  const users = await userService.getUsers()
  assert.strictEqual(users.length, 1)
  assert.deepStrictEqual(users[0].profile, { avatar: '', department: '', location: '' })
  apiClient.get = originalGet
  console.log('✓ users normalization test passed')
}

async function testDashboardStatsNormalization() {
  const originalGet = apiClient.get
  apiClient.get = async (url) => {
    if (url === '/api/v1/dashboard/stats') {
      return {
        data: {
          total_users: 100,
          active_users: 80,
          revenue: 1500,
          growth: 5,
          recent_activity: [
            { id: 1, type: 'login', description: 'User logged in', timestamp: '2025-12-08T12:00:00Z', user_id: 1 },
          ],
        },
      }
    }
    throw new Error('Unexpected URL ' + url)
  }

  const stats = await dashboardService.getStats()
  assert.strictEqual(stats.totalUsers, 100)
  assert.strictEqual(stats.activeUsers, 80)
  assert.strictEqual(stats.recentActivity[0].userId, 1)
  apiClient.get = originalGet
  console.log('✓ dashboard stats normalization test passed')
}

async function run() {
  try {
    await testTrends()
    await testUsersNormalization()
    await testDashboardStatsNormalization()
    console.log('\nAll lightweight API compatibility tests passed ✔')
    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err)
    process.exit(1)
  }
}

run()
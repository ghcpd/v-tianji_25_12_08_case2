let axios
try {
  axios = require('axios')
} catch (err) {
  axios = null
}

const API_BASE_URL = 'https://api.example.com'

const apiClient = (axios && axios.create)
  ? axios.create({ baseURL: API_BASE_URL, timeout: 10000, headers: { 'Content-Type': 'application/json' } })
  : {
      get: async () => {
        throw new Error('No HTTP client available (axios not installed)')
      },
      post: async () => {
        throw new Error('No HTTP client available (axios not installed)')
      },
      put: async () => {
        throw new Error('No HTTP client available (axios not installed)')
      },
    }

function normalizeUser(raw) {
  const profile = raw.profile || {}
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    createdAt: raw.createdAt,
    status: raw.status || 'inactive',
    profile: {
      avatar: profile.avatar ?? '',
      department: profile.department ?? '',
      location: profile.location ?? '',
    },
  }
}

function normalizeActivity(raw) {
  return {
    id: raw.id,
    type: raw.type,
    description: raw.description,
    timestamp: raw.timestamp,
    userId: raw.userId ?? raw.user_id,
  }
}

function normalizeDashboardStats(raw) {
  return {
    totalUsers: raw.totalUsers ?? raw.total_users ?? 0,
    activeUsers: raw.activeUsers ?? raw.active_users ?? 0,
    revenue: raw.revenue ?? 0,
    growth: raw.growth ?? 0,
    recentActivity: (raw.recentActivity ?? raw.recent_activity ?? []).map(normalizeActivity),
  }
}

const userService = {
  getUsers: async () => {
    const response = await apiClient.get('/api/v1/users')
    const data = response.data
    const list = Array.isArray(data) ? data : (data.users || [])
    return list.map(normalizeUser)
  },
}

const dashboardService = {
  getStats: async () => {
    const response = await apiClient.get('/api/v1/dashboard/stats')
    return normalizeDashboardStats(response.data)
  },
}

const analyticsService = {
  getTrends: async (metric) => {
    const response = await apiClient.get('/api/v2/analytics/trends', { params: { metric } })
    const data = response.data
    const list = Array.isArray(data) ? data : (data.trends || [])
    return list.map((t) => ({ date: String(t.date), value: Number(t.value) }))
  },
}

module.exports = { apiClient, userService, dashboardService, analyticsService }
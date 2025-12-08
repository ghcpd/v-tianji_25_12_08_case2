import axios from 'axios'

const API_BASE_URL = 'https://api.example.com'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface User {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
  status: 'active' | 'inactive'
  profile: {
    avatar: string
    department: string
    location: string
  }
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  revenue: number
  growth: number
  recentActivity: Activity[]
}

export interface Activity {
  id: number
  type: string
  description: string
  timestamp: string
  userId: number
}

export interface AnalyticsData {
  period: string
  metrics: {
    views: number
    clicks: number
    conversions: number
    revenue: number
  }[]
  summary: {
    totalViews: number
    totalClicks: number
    conversionRate: number
  }
}

export interface Settings {
  theme: string
  notifications: boolean
  language: string
  timezone: string
  preferences: {
    emailDigest: boolean
    weeklyReport: boolean
  }
}

function normalizeUser(apiUser: any): User {
  // Map API fields (snake_case) and handle variations
  return {
    id: Number(apiUser.id),
    name: apiUser.name || apiUser.full_name || '',
    email: apiUser.email || '',
    role: apiUser.role || apiUser.user_role || 'user',
    createdAt: apiUser.createdAt || apiUser.created_at || new Date().toISOString(),
    status:
      apiUser.status === 'enabled' || apiUser.status === 'active'
        ? 'active'
        : 'inactive',
    profile: {
      avatar: apiUser.profile?.avatar || apiUser.avatar || '',
      department: apiUser.profile?.department || apiUser.department || 'General',
      location: apiUser.profile?.location || apiUser.location || 'Unknown',
    },
  }
}

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/v1/users')
    const raw = response.data || []
    return raw.map((u: any) => normalizeUser(u))
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/v1/users/${id}`)
    return normalizeUser(response.data)
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const response = await apiClient.post('/api/v1/users', userData)
    return normalizeUser(response.data)
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/v1/users/${id}`, userData)
    return normalizeUser(response.data)
  },
}

function normalizeActivity(a: any): Activity {
  return {
    id: Number(a.id),
    type: a.type || a.action || 'unknown',
    description: a.description || a.desc || '',
    timestamp: a.timestamp || a.created_at || new Date().toISOString(),
    userId: Number(a.userId ?? a.user_id ?? 0),
  }
}

function normalizeDashboardStats(api: any): DashboardStats {
  const growthRaw = api.growth ?? api.growth_rate ?? 0
  const growth = typeof growthRaw === 'number' && growthRaw <= 1 ? growthRaw * 100 : Number(growthRaw)

  return {
    totalUsers: Number(api.totalUsers ?? api.total_users ?? 0),
    activeUsers: Number(api.activeUsers ?? api.active_users ?? 0),
    revenue: Number(api.revenue ?? 0),
    growth,
    recentActivity: (api.recentActivity ?? api.recent_activity ?? []).map(normalizeActivity),
  }
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/dashboard/stats')
    return normalizeDashboardStats(response.data)
  },

  getActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await apiClient.get('/api/v1/dashboard/activity', {
      params: { limit },
    })
    const raw = response.data || []
    return raw.map((a: any) => normalizeActivity(a))
  },
}

function normalizeAnalyticsData(api: any): AnalyticsData {
  const metricsRaw = api.metrics ?? api.data ?? []
  const metrics = (metricsRaw as any[]).map((m) => ({
    period: m.period || m.date || '',
    views: Number(m.views ?? m.view_count ?? 0),
    clicks: Number(m.clicks ?? m.click_count ?? 0),
    conversions: Number(m.conversions ?? m.conversion_count ?? 0),
    revenue: Number(m.revenue ?? m.revenue_usd ?? 0),
  }))

  return {
    period: api.period ?? 'custom',
    metrics,
    summary: {
      totalViews: Number(api.summary?.totalViews ?? api.summary?.total_views ?? metrics.reduce((s, m) => s + m.views, 0)),
      totalClicks: Number(api.summary?.totalClicks ?? api.summary?.total_clicks ?? metrics.reduce((s, m) => s + m.clicks, 0)),
      conversionRate: Number(api.summary?.conversionRate ?? api.summary?.conversion_rate ?? (metrics.reduce((s, m) => s + m.conversions, 0) / Math.max(metrics.reduce((s, m) => s + m.views, 0), 1))),
    },
  }
}

export const analyticsService = {
  getMetrics: async (startDate: string, endDate: string): Promise<AnalyticsData> => {
    // Align to v1 endpoint (server uses v1) and normalize response
    const response = await apiClient.get('/api/v1/analytics/metrics', {
      params: { startDate, endDate },
    })
    return normalizeAnalyticsData(response.data)
  },

  getTrends: async (metric: string): Promise<{ date: string; value: number }[]> => {
    const response = await apiClient.get('/api/v1/analytics/trends', {
      params: { metric },
    })
    return (response.data || []).map((t: any) => ({ date: t.date, value: Number(t.value) }))
  },
}

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await apiClient.get('/api/v1/settings')
    return response.data
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await apiClient.put('/api/v1/settings', settings)
    return response.data
  },
}


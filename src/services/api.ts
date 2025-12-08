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
  profile?: {
    avatar?: string
    department?: string
    location?: string
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

// Normalizers: make the service resilient to API schema variations (snake_case, missing nested objects)
function normalizeUser(raw: any): User {
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

function normalizeActivity(raw: any) {
  return {
    id: raw.id,
    type: raw.type,
    description: raw.description,
    timestamp: raw.timestamp,
    userId: raw.userId ?? raw.user_id,
  }
}

function normalizeDashboardStats(raw: any) {
  return {
    totalUsers: raw.totalUsers ?? raw.total_users ?? 0,
    activeUsers: raw.activeUsers ?? raw.active_users ?? 0,
    revenue: raw.revenue ?? 0,
    growth: raw.growth ?? 0,
    recentActivity: (raw.recentActivity ?? raw.recent_activity ?? []).map(normalizeActivity),
  }
}

export const userService = { 
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/v1/users')
    const data = response.data
    // support either top-level array or { users: [] } wrapper
    const list = Array.isArray(data) ? data : (data.users ?? [])
    return list.map(normalizeUser)
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

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/dashboard/stats')
    return normalizeDashboardStats(response.data)
  },

  getActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await apiClient.get('/api/v1/dashboard/activity', {
      params: { limit },
    })
    const data = response.data
    const list = Array.isArray(data) ? data : (data.activities ?? [])
    return list.map(normalizeActivity)
  },
}

export const analyticsService = {
  getMetrics: async (startDate: string, endDate: string): Promise<AnalyticsData> => {
    const response = await apiClient.get('/api/v2/analytics/metrics', {
      params: { startDate, endDate },
    })
    return response.data
  },

  getTrends: async (metric: string): Promise<{ date: string; value: number }[]> => {
    const response = await apiClient.get('/api/v2/analytics/trends', {
      params: { metric },
    })
    const data = response.data
    const list = Array.isArray(data) ? data : (data.trends ?? [])
    return list.map((t: any) => ({ date: String(t.date), value: Number(t.value) }))
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


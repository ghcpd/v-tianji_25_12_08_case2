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

// Helper: normalize raw user objects coming from the API into the canonical User interface
function normalizeUser(raw: any): User {
  return {
    id: Number(raw.id),
    name: raw.name ?? raw.fullName ?? '',
    email: raw.email ?? raw.emailAddress ?? '',
    role: raw.role ?? raw.user_role ?? 'user',
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    status: (() => {
      if (typeof raw.status === 'string') {
        const s = raw.status.toLowerCase()
        if (s === 'active' || s === 'inactive') return s as 'active' | 'inactive'
        if (s === 'enabled' || s === 'true' || s === '1') return 'active'
        return 'inactive'
      }
      if (typeof raw.enabled === 'boolean') return raw.enabled ? 'active' : 'inactive'
      return 'inactive'
    })(),
    profile: {
      avatar: (raw.profile && (raw.profile.avatar ?? raw.profile.avatar_url)) ?? raw.avatar ?? '',
      department: (raw.profile && (raw.profile.department ?? raw.profile.dept)) ?? raw.department ?? '',
      location: (raw.profile && (raw.profile.location ?? raw.profile.city)) ?? raw.location ?? '',
    },
  }
}

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/v1/users')
    const raw = response.data
    // API may return either an array of users or wrapped inside an object, normalize both
    const list = Array.isArray(raw) ? raw : raw?.users ?? []
    return list.map(normalizeUser)
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/v1/users/${id}`)
    return normalizeUser(response.data)
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const response = await apiClient.post('/api/v1/users', userData)
    return response.data
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/v1/users/${id}`, userData)
    return response.data
  },
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/dashboard/stats')
    return response.data
  },

  getActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await apiClient.get('/api/v1/dashboard/activity', {
      params: { limit },
    })
    return response.data
  },
}

export const analyticsService = {
  getMetrics: async (startDate: string, endDate: string): Promise<AnalyticsData> => {
    const response = await apiClient.get('/api/v2/analytics/metrics', {
      params: { startDate, endDate },
    })
    // Normalize conversionRate unit: allow servers to return either 0-1 or 0-100
    const data = response.data as AnalyticsData
    if (data?.summary && typeof data.summary.conversionRate === 'number' && data.summary.conversionRate > 1) {
      data.summary.conversionRate = data.summary.conversionRate / 100
    }

    return data
  },

  getTrends: async (metric: string): Promise<{ date: string; value: number }[]> => {
    // trends moved to v2 alongside metrics — use v2 endpoint
    const response = await apiClient.get('/api/v2/analytics/trends', {
      params: { metric },
    })
    return response.data
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


import axios, { AxiosResponse } from 'axios'

const API_BASE_URL = 'https://api.example.com'
const API_VERSION = 'v2' // Updated API version for consistency

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response validation and normalization utilities
const normalizeSnakeToCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(normalizeSnakeToCamelCase)
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
      acc[camelCaseKey] = normalizeSnakeToCamelCase(obj[key])
      return acc
    }, {} as any)
  }
  return obj
}

// Validation functions
const validateUser = (data: any): User => {
  const normalized = normalizeSnakeToCamelCase(data)
  if (!normalized.id || !normalized.name || !normalized.email) {
    throw new Error('Invalid user response: missing required fields')
  }
  return normalized as User
}

const validateActivity = (data: any): Activity => {
  const normalized = normalizeSnakeToCamelCase(data)
  if (!normalized.id || !normalized.type || !normalized.description || !normalized.timestamp) {
    throw new Error('Invalid activity response: missing required fields')
  }
  return normalized as Activity
}

const validateAnalyticsData = (data: any): AnalyticsData => {
  const normalized = normalizeSnakeToCamelCase(data)
  if (!normalized.metrics || !Array.isArray(normalized.metrics)) {
    throw new Error('Invalid analytics data: metrics must be an array')
  }
  if (!normalized.summary) {
    throw new Error('Invalid analytics data: missing summary')
  }
  return normalized as AnalyticsData
}

const validateSettings = (data: any): Settings => {
  const normalized = normalizeSnakeToCamelCase(data)
  if (!normalized.theme || typeof normalized.notifications !== 'boolean') {
    throw new Error('Invalid settings response: missing required fields')
  }
  return normalized as Settings
}

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

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/api/v2/users')
    return response.data.map((user: any) => validateUser(user))
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/v2/users/${id}`)
    return validateUser(response.data)
  },

  createUser: async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const response = await apiClient.post('/api/v2/users', userData)
    return validateUser(response.data)
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/v2/users/${id}`, userData)
    return validateUser(response.data)
  },
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v2/dashboard/stats')
    return response.data
  },

  getActivity: async (limit: number = 10): Promise<Activity[]> => {
    const response = await apiClient.get('/api/v2/dashboard/activity', {
      params: { limit },
    })
    return response.data.map((activity: any) => validateActivity(activity))
  },
}

export const analyticsService = {
  getMetrics: async (startDate: string, endDate: string): Promise<AnalyticsData> => {
    const response = await apiClient.get('/api/v2/analytics/metrics', {
      params: { startDate, endDate },
    })
    return validateAnalyticsData(response.data)
  },

  getTrends: async (metric: string): Promise<{ date: string; value: number }[]> => {
    const response = await apiClient.get('/api/v2/analytics/trends', {
      params: { metric },
    })
    // Validate that trends data has required fields
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid trends response: expected array')
    }
    return response.data.map((trend: any) => {
      const normalized = normalizeSnakeToCamelCase(trend)
      if (!normalized.date && !normalized.timestamp) {
        throw new Error('Invalid trend item: missing date/timestamp field')
      }
      return {
        date: normalized.date || normalized.timestamp,
        value: normalized.value,
      }
    })
  },
}

export const settingsService = {
  getSettings: async (): Promise<Settings> => {
    const response = await apiClient.get('/api/v2/settings')
    return validateSettings(response.data)
  },

  updateSettings: async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await apiClient.put('/api/v2/settings', settings)
    return validateSettings(response.data)
  },
}


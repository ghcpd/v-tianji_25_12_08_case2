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
  status: string
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
  period?: string
  metrics: {
    period: string
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
    const response = await apiClient.get('/api/v1/users')
    return response.data
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/api/v1/users/${id}`)
    return response.data
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
    return response.data
  },

  getTrends: async (metric: string): Promise<{ date: string; value: number }[]> => {
    // trends endpoint updated to v2 to match metrics versioning
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


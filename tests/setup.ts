/**
 * Test Setup and Mock Configuration
 * Provides mock API responses for testing API compatibility
 */

// Mock response for User data validation
export const mockUserResponse = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'admin',
  createdAt: '2023-01-15T10:30:00Z',
  status: 'active' as const,
  profile: {
    avatar: 'https://example.com/avatar.jpg',
    department: 'Engineering',
    location: 'New York',
  },
}

// Mock response with snake_case to test normalization
export const mockUserResponseSnakeCase = {
  id: 2,
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  role: 'user',
  created_at: '2023-02-20T14:45:00Z', // snake_case
  status: 'inactive',
  profile: {
    avatar: 'https://example.com/jane.jpg',
    department: 'Sales',
    location: 'San Francisco',
  },
}

// Mock activity response
export const mockActivityResponse = {
  id: 101,
  type: 'user_created',
  description: 'New user account created',
  timestamp: '2023-12-01T09:15:00Z',
  userId: 1,
}

// Mock activity response with snake_case
export const mockActivityResponseSnakeCase = {
  id: 102,
  type: 'user_updated',
  description: 'User profile updated',
  timestamp: '2023-12-01T10:20:00Z',
  user_id: 2, // snake_case
}

// Mock analytics data response
export const mockAnalyticsDataResponse = {
  period: 'monthly',
  metrics: [
    {
      period: '2023-11-01',
      views: 1500,
      clicks: 450,
      conversions: 45,
      revenue: 2250,
    },
    {
      period: '2023-11-02',
      views: 1800,
      clicks: 540,
      conversions: 54,
      revenue: 2700,
    },
    {
      period: '2023-11-03',
      views: 1200,
      clicks: 360,
      conversions: 36,
      revenue: 1800,
    },
  ],
  summary: {
    totalViews: 4500,
    totalClicks: 1350,
    conversionRate: 0.12,
  },
}

// Mock analytics data with snake_case
export const mockAnalyticsDataResponseSnakeCase = {
  period: 'monthly',
  metrics: [
    {
      period: '2023-12-01',
      views: 2000,
      clicks: 600,
      conversions: 60,
      revenue: 3000,
    },
  ],
  summary: {
    total_views: 2000, // snake_case
    total_clicks: 600,
    conversion_rate: 0.15,
  },
}

// Mock trends response
export const mockTrendsResponse = [
  {
    date: '2023-11-01',
    value: 1500,
  },
  {
    date: '2023-11-02',
    value: 1800,
  },
  {
    date: '2023-11-03',
    value: 1200,
  },
]

// Mock trends response with snake_case and timestamp instead of date
export const mockTrendsResponseSnakeCase = [
  {
    timestamp: '2023-12-01',
    value: 2000,
  },
  {
    timestamp: '2023-12-02',
    value: 2200,
  },
]

// Mock settings response
export const mockSettingsResponse = {
  theme: 'dark',
  notifications: true,
  language: 'en',
  timezone: 'America/New_York',
  preferences: {
    emailDigest: true,
    weeklyReport: false,
  },
}

// Mock settings response with snake_case
export const mockSettingsResponseSnakeCase = {
  theme: 'light',
  notifications: false,
  language: 'es',
  timezone: 'Europe/Madrid',
  preferences: {
    email_digest: true,
    weekly_report: true,
  },
}

// Mock dashboard stats response
export const mockDashboardStatsResponse = {
  totalUsers: 1050,
  activeUsers: 842,
  revenue: 125750,
  growth: 12.5,
  recentActivity: [
    {
      id: 1,
      type: 'user_signup',
      description: 'New user registration',
      timestamp: '2023-12-01T15:30:00Z',
      userId: 101,
    },
    {
      id: 2,
      type: 'payment_received',
      description: 'Payment processed',
      timestamp: '2023-12-01T14:20:00Z',
      userId: 102,
    },
  ],
}

// Simulate network error scenarios
export class MockNetworkError extends Error {
  constructor(
    public status: number,
    public statusText: string
  ) {
    super(`Network error: ${status} ${statusText}`)
  }
}

// Validation test helper functions
export const validateResponseStructure = (data: any, expectedFields: string[]): boolean => {
  if (typeof data !== 'object' || data === null) {
    return false
  }
  return expectedFields.every((field) => field in data)
}

export const validateArrayStructure = (
  data: any[],
  expectedFields: string[]
): boolean => {
  if (!Array.isArray(data)) {
    return false
  }
  return data.length > 0 && data.every((item) => validateResponseStructure(item, expectedFields))
}

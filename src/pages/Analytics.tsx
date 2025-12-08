import { useEffect, useState } from 'react'
import { analyticsService, AnalyticsData } from '../services/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { format, subDays } from 'date-fns'
import './Analytics.css'

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [trends, setTrends] = useState<{ date: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState('views')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const endDate = format(new Date(), 'yyyy-MM-dd')
        const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
        
        const [metricsData, trendsData] = await Promise.all([
          analyticsService.getMetrics(startDate, endDate),
          analyticsService.getTrends(selectedMetric),
        ])
        
        setAnalyticsData(metricsData)
        setTrends(trendsData)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedMetric])

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>
  }

  if (error) {
    return <div className="analytics-error">Error: {error}</div>
  }

  if (!analyticsData) {
    return <div className="analytics-error">No analytics data available</div>
  }

  return (
    <div className="analytics">
      <h1>Analytics Dashboard</h1>
      <div className="analytics-summary">
        <div className="summary-card">
          <h3>Total Views</h3>
          <p className="summary-value">{analyticsData.summary.totalViews.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Total Clicks</h3>
          <p className="summary-value">{analyticsData.summary.totalClicks.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Conversion Rate</h3>
          <p className="summary-value">{(analyticsData.summary.conversionRate * 100).toFixed(2)}%</p>
        </div>
      </div>
      <div className="analytics-charts">
        <div className="chart-container">
          <h2>Metrics Over Time</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={analyticsData.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3498db" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#2ecc71" strokeWidth={2} />
              <Line type="monotone" dataKey="conversions" stroke="#e74c3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h2>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#9b59b6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h2>Trend Analysis</h2>
          <div className="metric-selector">
            <button
              className={selectedMetric === 'views' ? 'active' : ''}
              onClick={() => setSelectedMetric('views')}
            >
              Views
            </button>
            <button
              className={selectedMetric === 'clicks' ? 'active' : ''}
              onClick={() => setSelectedMetric('clicks')}
            >
              Clicks
            </button>
            <button
              className={selectedMetric === 'conversions' ? 'active' : ''}
              onClick={() => setSelectedMetric('conversions')}
            >
              Conversions
            </button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#f39c12" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Analytics


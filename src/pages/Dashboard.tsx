import { useEffect, useState } from 'react'
import { dashboardService, DashboardStats, Activity } from '../services/api'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [statsData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getActivity(5),
        ])
        setStats(statsData)
        setActivities(activityData)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>
  }

  if (!stats) {
    return <div className="dashboard-error">No data available</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-value">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-value">{stats.activeUsers.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Revenue</h3>
          <p className="stat-value">${stats.revenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Growth</h3>
          <p className="stat-value">{stats.growth}%</p>
        </div>
      </div>
      <div className="activity-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-type">{activity.type}</div>
              <div className="activity-description">{activity.description}</div>
              <div className="activity-timestamp">
                {new Date(activity.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard


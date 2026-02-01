import { useEffect, useState } from 'react'
import { userService, User } from '../services/api'
import './Users.css'

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const data = await userService.getUsers()
        setUsers(data)
        setError(null)
      } catch (err: any) {
        setError(err.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleUserClick = async (userId: number) => {
    try {
      const user = await userService.getUserById(userId)
      setSelectedUser(user)
    } catch (err: any) {
      setError(err.message || 'Failed to load user details')
    }
  }

  if (loading) {
    return <div className="users-loading">Loading users...</div>
  }

  if (error) {
    return <div className="users-error">Error: {error}</div>
  }

  return (
    <div className="users">
      <h1>User Management</h1>
      <div className="users-container">
        <div className="users-list">
          <h2>All Users ({users.length})</h2>
          <div className="users-grid">
            {users.map((user) => (
              <div
                key={user.id}
                className="user-card"
                onClick={() => handleUserClick(user.id)}
              >
                <div className="user-avatar">
                  {user.profile && user.profile.avatar ? (
                    <img src={user.profile.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                  <p className="user-role">{user.role}</p>
                  <span
                    className={`user-status ${user.status}`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {selectedUser && (
          <div className="user-details">
            <h2>User Details</h2>
            <div className="detail-section">
              <h3>Basic Information</h3>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
              {selectedUser.profile && (
                <div className="detail-section">
                  <h3>Profile</h3>
                  <p><strong>Department:</strong> {selectedUser.profile.department || '—'}</p>
                  <p><strong>Location:</strong> {selectedUser.profile.location || '—'}</p>
                </div>
              )}
            <button onClick={() => setSelectedUser(null)}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Users


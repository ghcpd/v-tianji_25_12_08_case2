import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-brand">Enterprise Dashboard</div>
      <div className="nav-links">
        <Link
          to="/"
          className={location.pathname === '/' ? 'active' : ''}
        >
          Dashboard
        </Link>
        <Link
          to="/users"
          className={location.pathname === '/users' ? 'active' : ''}
        >
          Users
        </Link>
        <Link
          to="/analytics"
          className={location.pathname === '/analytics' ? 'active' : ''}
        >
          Analytics
        </Link>
        <Link
          to="/settings"
          className={location.pathname === '/settings' ? 'active' : ''}
        >
          Settings
        </Link>
      </div>
    </nav>
  )
}

export default Navigation


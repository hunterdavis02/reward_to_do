import { NavLink } from 'react-router-dom'
import { useTheme } from '../theme/useTheme'
import { useBalance } from '../balance/useBalance'
import { useAuth } from '../auth/useAuth'
import './NavBar.css'

function NavBar() {
  const { theme, toggleTheme } = useTheme()
  const { balance } = useBalance()
  const { signOut } = useAuth()

  return (
    <header className="nav-bar">
      <div className="nav-bar-inner">
        <span className="nav-brand">Reward To-Do</span>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/widgets" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Widgets
          </NavLink>
        </nav>

        <span className="balance-display" aria-label={`Balance: ${balance} points`}>
          🪙 {balance}
        </span>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Currently ${theme} theme, switch to ${theme === 'dark' ? 'light' : 'dark'}`}
        >
          {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
        </button>

        <button type="button" className="theme-toggle" onClick={signOut}>
          Sign out
        </button>
      </div>
    </header>
  )
}

export default NavBar

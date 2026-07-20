import { Link } from 'react-router-dom'

function WidgetsPage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <h1>Widgets</h1>
      </section>

      <section className="widget-grid">
        <Link to="/widgets/reward-to-do" className="widget-card primary">
          <div>
            <p className="widget-label">Main widget</p>
            <h2>To-Do</h2>
            <p>Track tasks, earn points, and keep momentum going.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>

        <Link to="/widgets/spend-points" className="widget-card rewards">
          <div>
            <p className="widget-label">Points shop</p>
            <h2>Spend Points</h2>
            <p>Set up rewards and redeem your points on them.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>

        <Link to="/widgets/goals" className="widget-card goals">
          <div>
            <p className="widget-label">Categories</p>
            <h2>Goals</h2>
            <p>Set overarching goals to organize your tasks around.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>

        <Link to="/widgets/archive" className="widget-card archive">
          <div>
            <p className="widget-label">History</p>
            <h2>Archive</h2>
            <p>Review recently completed to-dos before they clear out.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>

        <Link to="/widgets/links" className="widget-card links">
          <div>
            <p className="widget-label">Quick access</p>
            <h2>Links</h2>
            <p>Keep your important links in one place, sorted your way.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>
      </section>
    </main>
  )
}

export default WidgetsPage

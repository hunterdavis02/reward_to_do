import { Link } from 'react-router-dom'

function WidgetsPage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Widgets</p>
        <h1>Your widgets</h1>
        <p className="subtitle">Pick a widget below to open it.</p>
      </section>

      <section className="widget-grid">
        <Link to="/widgets/reward-to-do" className="widget-card primary">
          <div>
            <p className="widget-label">Main widget</p>
            <h2>Reward To-Do</h2>
            <p>Track tasks, earn points, and keep momentum going.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>

        <Link to="/widgets/spend-points" className="widget-card">
          <div>
            <p className="widget-label">Points shop</p>
            <h2>Spend Points</h2>
            <p>Set up rewards and redeem your points on them.</p>
          </div>
          <span className="widget-arrow">Open →</span>
        </Link>
      </section>
    </main>
  )
}

export default WidgetsPage

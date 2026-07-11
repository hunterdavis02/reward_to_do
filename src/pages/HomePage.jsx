import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Dashboard</p>
        <h1>Welcome to your widget-based home screen.</h1>
        <p className="subtitle">
          Start with a simple overview, then head over to your widgets when you are ready.
        </p>
        <Link to="/widgets" className="cta-button">
          Browse widgets →
        </Link>
      </section>
    </main>
  )
}

export default HomePage

import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <h1>Home</h1>
        <Link to="/widgets" className="cta-button">
          Browse widgets →
        </Link>
      </section>
    </main>
  )
}

export default HomePage

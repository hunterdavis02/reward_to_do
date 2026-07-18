import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOwnedTable } from '../lib/useOwnedTable'

// How long a completed to-do stays in the archive before it's auto-deleted.
// TODO: switch to 30 days (30 * 24 * 60 * 60 * 1000) once done testing.
const RETENTION_MS = 2 * 60 * 1000
const SWEEP_INTERVAL_MS = 5000

function ArchiveWidgetPage() {
  const { rows: tasks, loading, removeRow } = useOwnedTable('tasks')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), SWEEP_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.completed && task.completed_at)
        .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)),
    [tasks],
  )

  useEffect(() => {
    completedTasks.forEach((task) => {
      const completedAt = new Date(task.completed_at).getTime()
      if (now - completedAt >= RETENTION_MS) {
        removeRow(task.id)
      }
    })
    // removeRow is stable per render from useOwnedTable; only re-sweep when the
    // completed set or the clock changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedTasks, now])

  return (
    <main className="app-shell theme-archive">
      <Link to="/widgets" className="back-link">
        ← Back to widgets
      </Link>

      <section className="hero-card compact">
        <div>
          <p className="eyebrow">Archive widget</p>
          <h1>See what you've finished lately.</h1>
          <p className="subtitle">
            Completed to-dos land here, then clear out automatically after a while.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Archived</span>
            <strong>{completedTasks.length}</strong>
          </article>
        </div>
      </section>

      <section className="panel">
        {loading ? (
          <p className="subtitle">Loading archive…</p>
        ) : completedTasks.length === 0 ? (
          <p className="subtitle">Nothing completed recently.</p>
        ) : (
          <ul className="task-list">
            {completedTasks.map((task) => (
              <li key={task.id} className="task-item done">
                <div className="task-summary">
                  <span className="task-title">{task.title}</span>

                  <div className="task-summary-controls">
                    {task.due_date != null && (
                      <span className="reward-badge">
                        Due {new Date(task.due_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    )}
                    <span className="reward-badge">{task.reward} pts</span>
                    <span className="archive-completed-at">
                      Completed {new Date(task.completed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default ArchiveWidgetPage

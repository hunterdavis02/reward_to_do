import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBalance } from '../balance/useBalance'
import { useOwnedTable } from '../lib/useOwnedTable'

const DEFAULT_TASK_REWARD = 5

function RewardWidgetPage() {
  const { rows: tasks, loading, insertRow, updateRow, removeRow } = useOwnedTable('tasks')
  const { rows: goals } = useOwnedTable('goals')
  const [draft, setDraft] = useState('')
  const [draftReward, setDraftReward] = useState(DEFAULT_TASK_REWARD)
  const [draftGoalId, setDraftGoalId] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const { balance, earn, spend } = useBalance()

  const goalTitle = (goalId) => goals.find((goal) => goal.id === goalId)?.title

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  )
  const totalPoints = useMemo(
    () => tasks.filter((task) => task.completed).reduce((sum, task) => sum + task.reward, 0),
    [tasks],
  )
  const maxPoints = useMemo(() => tasks.reduce((sum, task) => sum + task.reward, 0), [tasks])
  const progress = maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0

  const handleAddTask = (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    insertRow({
      title,
      completed: false,
      reward: Math.max(0, Number(draftReward) || 0),
      goal_id: draftGoalId ? Number(draftGoalId) : null,
    })
    setDraft('')
    setDraftReward(DEFAULT_TASK_REWARD)
    setDraftGoalId('')
  }

  const setTaskCompleted = (id, completed) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.completed === completed) return

    if (completed) {
      earn(task.reward)
    } else {
      spend(task.reward)
    }

    updateRow(id, { completed })
  }

  const resetTask = (id) => {
    updateRow(id, { completed: false })
  }

  const renameTask = (id, title) => {
    updateRow(id, { title })
  }

  const deleteTask = (id) => {
    removeRow(id)
    setExpandedIds((current) => {
      if (!current.has(id)) return current
      const next = new Set(current)
      next.delete(id)
      return next
    })
  }

  const toggleExpanded = (id) => {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const updateReward = (id, value) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    const reward = Math.max(0, Number(value) || 0)
    if (task.completed) {
      const delta = reward - task.reward
      if (delta > 0) earn(delta)
      if (delta < 0) spend(-delta)
    }

    updateRow(id, { reward })
  }

  const updateGoal = (id, value) => {
    updateRow(id, { goal_id: value ? Number(value) : null })
  }

  return (
    <main className="app-shell">
      <Link to="/widgets" className="back-link">
        ← Back to widgets
      </Link>

      <section className="hero-card compact">
        <div>
          <p className="eyebrow">To-Do widget</p>
          <h1>Keep your day moving and earn points as you go.</h1>
          <p className="subtitle">
            Add simple tasks, complete them, and watch your reward balance grow.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Balance</span>
            <strong>{balance} pts</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Done</span>
            <strong>
              {completedCount}/{tasks.length}
            </strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <div className="progress-row">
          <span>Daily progress</span>
          <strong>{progress}%</strong>
        </div>
        <div className="progress-bar" aria-hidden="true">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <form className="task-form" onSubmit={handleAddTask}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a task"
            aria-label="Add a task"
          />
          <input
            type="number"
            className="task-form-reward"
            min="0"
            value={draftReward}
            onChange={(event) => setDraftReward(event.target.value)}
            aria-label="Points for new task"
          />
          <select
            className="task-form-goal"
            value={draftGoalId}
            onChange={(event) => setDraftGoalId(event.target.value)}
            aria-label="Goal for new task"
          >
            <option value="">No goal</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p className="subtitle">Loading tasks…</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => {
              const isExpanded = expandedIds.has(task.id)

              return (
                <li key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
                  <div
                    className="task-summary"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(task.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleExpanded(task.id)
                      }
                    }}
                  >
                    <div className="task-title-group">
                      <span className="task-title">{task.title}</span>
                      {task.goal_id && (
                        <span className="task-goal-tag">{goalTitle(task.goal_id)}</span>
                      )}
                    </div>

                    <div className="task-summary-controls">
                      {task.completed && (
                        <button
                          type="button"
                          className="reset-button"
                          aria-label={`Reset "${task.title}" to incomplete`}
                          title="Reset to incomplete"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetTask(task.id)
                          }}
                        >
                          ↻
                        </button>
                      )}

                      <button
                        type="button"
                        className={`status-toggle-btn ${task.completed ? 'complete' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setTaskCompleted(task.id, !task.completed)
                        }}
                      >
                        {task.completed ? 'Complete' : 'Incomplete'}
                      </button>

                      <span className="reward-badge">{task.reward} pts</span>

                      <span className="expand-indicator" aria-hidden="true">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="task-details">
                      <label className="task-detail-field">
                        <span>Title</span>
                        <input
                          value={task.title}
                          onChange={(event) => renameTask(task.id, event.target.value)}
                          aria-label={`Rename ${task.title}`}
                        />
                      </label>
                      <label className="task-detail-field task-detail-field-reward">
                        <span>Points</span>
                        <input
                          type="number"
                          min="0"
                          value={task.reward}
                          onChange={(event) => updateReward(task.id, event.target.value)}
                          aria-label={`Points for ${task.title}`}
                        />
                      </label>
                      <label className="task-detail-field">
                        <span>Goal</span>
                        <select
                          value={task.goal_id ?? ''}
                          onChange={(event) => updateGoal(task.id, event.target.value)}
                          aria-label={`Goal for ${task.title}`}
                        >
                          <option value="">No goal</option>
                          {goals.map((goal) => (
                            <option key={goal.id} value={goal.id}>
                              {goal.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        type="button"
                        className="delete-task-button"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete task
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </main>
  )
}

export default RewardWidgetPage

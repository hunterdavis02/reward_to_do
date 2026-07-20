import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBalance } from '../balance/useBalance'
import { useOwnedTable } from '../lib/useOwnedTable'
import EditableField from '../components/EditableField'

function GoalWidgetPage() {
  const { rows: goals, loading, insertRow, updateRow, removeRow } = useOwnedTable('goals')
  const { rows: tasks, updateRow: updateTask, removeRow: removeTask } = useOwnedTable('tasks')
  const { earn, spend } = useBalance()
  const [draft, setDraft] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const xpByGoal = useMemo(() => {
    const xp = new Map()
    tasks.forEach((task) => {
      if (task.completed && task.goal_id != null) {
        xp.set(task.goal_id, (xp.get(task.goal_id) || 0) + task.reward)
      }
    })
    return xp
  }, [tasks])

  const handleAddGoal = (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    insertRow({ title, completed: false })
    setDraft('')
  }

  const setGoalCompleted = (id, completed) => {
    updateRow(id, { completed })
  }

  const renameGoal = (id, title) => {
    updateRow(id, { title })
  }

  const deleteGoal = (id) => {
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

  const setTaskCompleted = (id, completed) => {
    const task = tasks.find((item) => item.id === id)
    if (!task || task.completed === completed) return

    if (completed) {
      earn(task.reward)
    } else {
      spend(task.reward)
    }

    updateTask(id, { completed, completed_at: completed ? new Date().toISOString() : null })
  }

  const resetTask = (id) => {
    updateTask(id, { completed: false, completed_at: null })
  }

  const archiveTask = (id) => {
    updateTask(id, { archived: true, archived_at: new Date().toISOString() })
  }

  const deleteTask = (id) => {
    removeTask(id)
  }

  const updateTaskGoal = (id, value) => {
    updateTask(id, { goal_id: value ? Number(value) : null })
  }

  return (
    <main className="app-shell theme-goals">
      <Link to="/widgets" className="back-link">
        ← Back to widgets
      </Link>

      <section className="hero-card">
        <h1>Goals</h1>
      </section>

      <section className="panel">
        <form className="task-form" onSubmit={handleAddGoal}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a goal"
            aria-label="Add a goal"
          />
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p className="subtitle">Loading goals…</p>
        ) : (
          <ul className="task-list">
            {goals.map((goal) => {
              const isExpanded = expandedIds.has(goal.id)
              const goalTasks = tasks.filter((task) => task.goal_id === goal.id && !task.archived)

              return (
                <li key={goal.id} className={`task-item ${goal.completed ? 'done' : ''}`}>
                  <div
                    className="task-summary"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(goal.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleExpanded(goal.id)
                      }
                    }}
                  >
                    <span className="task-title">{goal.title}</span>

                    <div className="task-summary-controls">
                      {goal.completed && (
                        <button
                          type="button"
                          className="reset-button"
                          aria-label={`Reset "${goal.title}" to in progress`}
                          title="Reset to in progress"
                          onClick={(event) => {
                            event.stopPropagation()
                            setGoalCompleted(goal.id, false)
                          }}
                        >
                          ↻
                        </button>
                      )}

                      <button
                        type="button"
                        className={`status-toggle-btn ${goal.completed ? 'complete' : ''}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          setGoalCompleted(goal.id, !goal.completed)
                        }}
                      >
                        {goal.completed ? 'Achieved' : 'In progress'}
                      </button>

                      <span className="reward-badge">{xpByGoal.get(goal.id) || 0} XP</span>

                      <span className="expand-indicator" aria-hidden="true">
                        {isExpanded ? '▲' : '▼'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="task-details">
                      <label className="task-detail-field">
                        <span>Title</span>
                        <EditableField
                          value={goal.title}
                          onCommit={(value) => renameGoal(goal.id, value)}
                          aria-label={`Rename ${goal.title}`}
                        />
                      </label>
                      <button
                        type="button"
                        className="delete-task-button"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        Delete goal
                      </button>

                      <div className="goal-tasks">
                        <span className="goal-tasks-label">To-dos under this goal</span>
                        {goalTasks.length === 0 ? (
                          <p className="subtitle">No to-dos assigned yet.</p>
                        ) : (
                          <ul className="goal-task-list">
                            {goalTasks.map((task) => (
                              <li
                                key={task.id}
                                className={`goal-task-item ${task.completed ? 'done' : ''}`}
                              >
                                <span className="goal-task-title">{task.title}</span>

                                <div className="goal-task-controls">
                                  {task.completed && (
                                    <button
                                      type="button"
                                      className="reset-button"
                                      aria-label={`Reset "${task.title}" to incomplete`}
                                      title="Reset to incomplete"
                                      onClick={() => resetTask(task.id)}
                                    >
                                      ↻
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className={`status-toggle-btn ${task.completed ? 'complete' : ''}`}
                                    onClick={() => setTaskCompleted(task.id, !task.completed)}
                                  >
                                    {task.completed ? 'Complete' : 'Incomplete'}
                                  </button>

                                  <select
                                    value={task.goal_id ?? ''}
                                    onChange={(event) => updateTaskGoal(task.id, event.target.value)}
                                    aria-label={`Goal for ${task.title}`}
                                  >
                                    <option value="">No goal</option>
                                    {goals.map((g) => (
                                      <option key={g.id} value={g.id}>
                                        {g.title}
                                      </option>
                                    ))}
                                  </select>

                                  <span className="reward-badge">{task.reward} pts</span>

                                  {task.completed && (
                                    <button
                                      type="button"
                                      className="archive-task-button"
                                      onClick={() => archiveTask(task.id)}
                                    >
                                      Archive
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    className="delete-task-button"
                                    onClick={() => deleteTask(task.id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
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

export default GoalWidgetPage

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBalance } from '../balance/useBalance'
import { useOwnedTable } from '../lib/useOwnedTable'
import EditableField from '../components/EditableField'

const DEFAULT_ITEM_COST = 5

function SpendWidgetPage() {
  const { rows: items, loading, insertRow, updateRow, removeRow } = useOwnedTable('spend_items')
  const [draft, setDraft] = useState('')
  const [draftCost, setDraftCost] = useState(DEFAULT_ITEM_COST)
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const { balance, earn, spend } = useBalance()

  const redeemedCount = useMemo(
    () => items.filter((item) => item.redeemed).length,
    [items],
  )

  const handleAddItem = (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    insertRow({
      title,
      redeemed: false,
      cost: Math.max(0, Number(draftCost) || 0),
    })
    setDraft('')
    setDraftCost(DEFAULT_ITEM_COST)
  }

  const setItemRedeemed = (id, redeemed) => {
    const item = items.find((entry) => entry.id === id)
    if (!item || item.redeemed === redeemed) return
    if (redeemed && item.cost > balance) return

    if (redeemed) {
      spend(item.cost)
    } else {
      earn(item.cost)
    }

    updateRow(id, { redeemed })
  }

  const resetItem = (id) => {
    updateRow(id, { redeemed: false })
  }

  const renameItem = (id, title) => {
    updateRow(id, { title })
  }

  const deleteItem = (id) => {
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

  const updateCost = (id, value) => {
    const item = items.find((entry) => entry.id === id)
    if (!item) return

    const cost = Math.max(0, Number(value) || 0)
    if (item.redeemed) {
      const delta = cost - item.cost
      if (delta > 0) spend(delta)
      if (delta < 0) earn(-delta)
    }

    updateRow(id, { cost })
  }

  return (
    <main className="app-shell theme-rewards">
      <Link to="/widgets" className="back-link">
        ← Back to widgets
      </Link>

      <section className="hero-card compact">
        <div>
          <p className="eyebrow">Spend widget</p>
          <h1>Redeem your points for things you enjoy.</h1>
          <p className="subtitle">
            Add rewards, set what they cost, and redeem them as your balance allows.
          </p>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span className="stat-label">Balance</span>
            <strong>{balance} pts</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Redeemed</span>
            <strong>
              {redeemedCount}/{items.length}
            </strong>
          </article>
        </div>
      </section>

      <section className="panel">
        <form className="task-form" onSubmit={handleAddItem}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Add a reward"
            aria-label="Add a reward"
          />
          <input
            type="number"
            className="task-form-reward"
            min="0"
            value={draftCost}
            onChange={(event) => setDraftCost(event.target.value)}
            aria-label="Cost for new reward"
          />
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p className="subtitle">Loading rewards…</p>
        ) : (
          <ul className="task-list">
            {items.map((item) => {
              const isExpanded = expandedIds.has(item.id)
              const canRedeem = item.redeemed || item.cost <= balance

              return (
                <li key={item.id} className={`task-item ${item.redeemed ? 'done' : ''}`}>
                  <div
                    className="task-summary"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpanded(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        toggleExpanded(item.id)
                      }
                    }}
                  >
                    <span className="task-title">{item.title}</span>

                    <div className="task-summary-controls">
                      {item.redeemed && (
                        <button
                          type="button"
                          className="reset-button"
                          aria-label={`Reset "${item.title}" to available`}
                          title="Reset to available"
                          onClick={(event) => {
                            event.stopPropagation()
                            resetItem(item.id)
                          }}
                        >
                          ↻
                        </button>
                      )}

                      <button
                        type="button"
                        className={`status-toggle-btn ${item.redeemed ? 'complete' : ''}`}
                        disabled={!canRedeem}
                        title={!canRedeem ? 'Not enough points' : undefined}
                        onClick={(event) => {
                          event.stopPropagation()
                          setItemRedeemed(item.id, !item.redeemed)
                        }}
                      >
                        {item.redeemed ? 'Redeemed' : 'Available'}
                      </button>

                      <span className="reward-badge">{item.cost} pts</span>

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
                          value={item.title}
                          onCommit={(value) => renameItem(item.id, value)}
                          aria-label={`Rename ${item.title}`}
                        />
                      </label>
                      <label className="task-detail-field task-detail-field-reward">
                        <span>Cost</span>
                        <EditableField
                          type="number"
                          min="0"
                          value={item.cost}
                          onCommit={(value) => updateCost(item.id, value)}
                          aria-label={`Cost for ${item.title}`}
                        />
                      </label>
                      <button
                        type="button"
                        className="delete-task-button"
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete reward
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

export default SpendWidgetPage

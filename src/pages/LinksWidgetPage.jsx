import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOwnedTable } from '../lib/useOwnedTable'
import EditableField from '../components/EditableField'

// Prefixes a bare "example.com" style entry with https:// so links always
// open somewhere instead of being treated as a relative in-app path.
function normalizeUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

function LinksWidgetPage() {
  const { rows: links, loading, insertRow, updateRow, removeRow, reorderRows } = useOwnedTable('links', {
    orderBy: 'position',
  })
  const [draftTitle, setDraftTitle] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const handleAddLink = (event) => {
    event.preventDefault()
    const title = draftTitle.trim()
    const url = draftUrl.trim()
    if (!title || !url) return

    insertRow({ title, url: normalizeUrl(url), position: links.length })
    setDraftTitle('')
    setDraftUrl('')
  }

  const renameLink = (id, title) => {
    const trimmed = title.trim()
    if (trimmed) updateRow(id, { title: trimmed })
  }

  const updateLinkUrl = (id, url) => {
    const trimmed = url.trim()
    if (trimmed) updateRow(id, { url: normalizeUrl(trimmed) })
  }

  const deleteLink = (id) => {
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

  const moveLink = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= links.length || fromIndex === toIndex) return
    const reordered = [...links]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    reorderRows(reordered)
  }

  const handleDrop = (targetId) => {
    setDragOverId(null)
    if (draggedId == null || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const fromIndex = links.findIndex((link) => link.id === draggedId)
    const toIndex = links.findIndex((link) => link.id === targetId)
    setDraggedId(null)
    if (fromIndex === -1 || toIndex === -1) return
    moveLink(fromIndex, toIndex)
  }

  return (
    <main className="app-shell theme-links">
      <Link to="/widgets" className="back-link">
        ← Back to widgets
      </Link>

      <section className="hero-card">
        <h1>Links</h1>
      </section>

      <section className="panel">
        <form className="task-form" onSubmit={handleAddLink}>
          <input
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="Link name"
            aria-label="Link name"
          />
          <input
            value={draftUrl}
            onChange={(event) => setDraftUrl(event.target.value)}
            placeholder="https://…"
            aria-label="Link URL"
          />
          <button type="submit">Add</button>
        </form>

        {loading ? (
          <p className="subtitle">Loading links…</p>
        ) : links.length === 0 ? (
          <p className="subtitle">No links yet. Add your first one above.</p>
        ) : (
          <ul className="task-list">
            {links.map((link, index) => {
              const isExpanded = expandedIds.has(link.id)

              return (
                <li
                  key={link.id}
                  className={`task-item link-item ${draggedId === link.id ? 'dragging' : ''} ${
                    dragOverId === link.id ? 'drag-over' : ''
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    if (dragOverId !== link.id) setDragOverId(link.id)
                  }}
                  onDragLeave={() => {
                    setDragOverId((current) => (current === link.id ? null : current))
                  }}
                  onDrop={(event) => {
                    event.preventDefault()
                    handleDrop(link.id)
                  }}
                >
                  <div className="link-summary">
                    <button
                      type="button"
                      className="link-drag-handle"
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = 'move'
                        event.dataTransfer.setData('text/plain', String(link.id))
                        setDraggedId(link.id)
                      }}
                      onDragEnd={() => {
                        setDraggedId(null)
                        setDragOverId(null)
                      }}
                      aria-label={`Drag to reorder "${link.title}"`}
                      title="Drag to reorder"
                    >
                      ⠿
                    </button>

                    <div className="reorder-buttons">
                      <button
                        type="button"
                        disabled={index === 0}
                        aria-label={`Move "${link.title}" up`}
                        title="Move up"
                        onClick={() => moveLink(index, index - 1)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={index === links.length - 1}
                        aria-label={`Move "${link.title}" down`}
                        title="Move down"
                        onClick={() => moveLink(index, index + 1)}
                      >
                        ▼
                      </button>
                    </div>

                    <a
                      className="link-info"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <span className="link-title">{link.title}</span>
                      <span className="link-url">{link.url}</span>
                    </a>

                    <div className="link-summary-controls">
                      <button
                        type="button"
                        className="reset-button"
                        aria-label={isExpanded ? `Collapse "${link.title}"` : `Edit "${link.title}"`}
                        title={isExpanded ? 'Collapse' : 'Edit'}
                        onClick={() => toggleExpanded(link.id)}
                      >
                        {isExpanded ? '▲' : '✎'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="task-details">
                      <label className="task-detail-field">
                        <span>Name</span>
                        <EditableField
                          value={link.title}
                          onCommit={(value) => renameLink(link.id, value)}
                          aria-label={`Rename ${link.title}`}
                        />
                      </label>
                      <label className="task-detail-field">
                        <span>URL</span>
                        <EditableField
                          value={link.url}
                          onCommit={(value) => updateLinkUrl(link.id, value)}
                          aria-label={`URL for ${link.title}`}
                        />
                      </label>
                      <button
                        type="button"
                        className="delete-task-button"
                        onClick={() => deleteLink(link.id)}
                      >
                        Delete link
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

export default LinksWidgetPage

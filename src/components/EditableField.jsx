import { useEffect, useRef, useState } from 'react'

/**
 * A controlled input that keeps what you type in local state and only
 * reports the value back (via onCommit) when you leave the field or press
 * Enter. This avoids writing to the database on every keystroke, which
 * otherwise races async round-trips and clobbers characters as you type.
 */
function EditableField({ value, onCommit, ...rest }) {
  const [draft, setDraft] = useState(value)
  const focused = useRef(false)

  // Sync the local draft when the underlying value changes from elsewhere,
  // but never while the field is focused (that would wipe out your typing).
  useEffect(() => {
    if (!focused.current) setDraft(value)
  }, [value])

  const commit = () => {
    focused.current = false
    if (draft !== value) onCommit(draft)
  }

  return (
    <input
      {...rest}
      value={draft}
      onFocus={() => {
        focused.current = true
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
    />
  )
}

export default EditableField

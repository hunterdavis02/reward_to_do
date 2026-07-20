import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from '../auth/useAuth'

export function useOwnedTable(table, { orderBy = 'id' } = {}) {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    Promise.resolve().then(() => {
      if (cancelled) return
      setLoading(true)
    })

    const request = user
      ? supabase.from(table).select('*').eq('user_id', user.id).order(orderBy, { ascending: true })
      : Promise.resolve({ data: [], error: null })

    request.then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error(`Failed to load ${table}`, error)
        setRows([])
      } else {
        setRows(data)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [table, orderBy, user])

  const insertRow = async (fields) => {
    const { data, error } = await supabase
      .from(table)
      .insert({ ...fields, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error(`Failed to insert into ${table}`, error)
      return
    }

    setRows((current) => [...current, data])
  }

  const updateRow = async (id, fields) => {
    const { data, error } = await supabase
      .from(table)
      .update(fields)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Failed to update ${table}`, error)
      return
    }

    setRows((current) => current.map((row) => (row.id === id ? data : row)))
  }

  const removeRow = async (id) => {
    const { error } = await supabase.from(table).delete().eq('id', id)

    if (error) {
      console.error(`Failed to delete from ${table}`, error)
      return
    }

    setRows((current) => current.filter((row) => row.id !== id))
  }

  // Persists a new row order by writing sequential values into the orderBy
  // column. Updates local state immediately so drag-and-drop feels instant.
  const reorderRows = async (orderedRows) => {
    const previousRows = rows
    const optimisticRows = orderedRows.map((row, index) => ({
      ...row,
      [orderBy]: index,
    }))

    setRows(optimisticRows)

    const results = await Promise.all(
      optimisticRows.map((row, index) => {
        const previousRow = previousRows.find((existingRow) => existingRow.id === row.id)
        const previousOrderValue = previousRow?.[orderBy]

        return previousOrderValue === index
          ? Promise.resolve({ error: null })
          : supabase.from(table).update({ [orderBy]: index }).eq('id', row.id)
      }),
    )

    const failed = results.find((result) => result.error)
    if (failed) {
      console.error(`Failed to reorder ${table}`, failed.error)
      setRows(previousRows)
    }
  }

  return { rows, loading, insertRow, updateRow, removeRow, reorderRows }
}

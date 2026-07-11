import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useAuth } from '../auth/useAuth'

export function useOwnedTable(table) {
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
      ? supabase.from(table).select('*').eq('user_id', user.id).order('id', { ascending: true })
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
  }, [table, user])

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

  return { rows, loading, insertRow, updateRow, removeRow }
}

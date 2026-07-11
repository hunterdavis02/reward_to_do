import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../auth/useAuth'
import { BalanceContext } from './BalanceContext'

export function BalanceProvider({ children }) {
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    let cancelled = false

    const request = user
      ? supabase.from('balances').select('amount').eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null, error: null })

    request.then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        console.error('Failed to load balance', error)
        return
      }
      setBalance(data?.amount ?? 0)
    })

    return () => {
      cancelled = true
    }
  }, [user])

  const adjust = async (delta) => {
    const { data, error } = await supabase.rpc('adjust_balance', { delta })
    if (error) {
      console.error('Failed to adjust balance', error)
      return
    }
    setBalance(data)
  }

  const value = useMemo(
    () => ({
      balance,
      earn: (amount) => adjust(amount),
      spend: (amount) => adjust(-amount),
    }),
    [balance],
  )

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>
}

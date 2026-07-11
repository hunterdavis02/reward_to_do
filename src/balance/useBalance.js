import { useContext } from 'react'
import { BalanceContext } from './BalanceContext'

export function useBalance() {
  const context = useContext(BalanceContext)
  if (!context) throw new Error('useBalance must be used within a BalanceProvider')
  return context
}

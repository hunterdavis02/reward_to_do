import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import WidgetsPage from './pages/WidgetsPage'
import RewardWidgetPage from './pages/RewardWidgetPage'
import SpendWidgetPage from './pages/SpendWidgetPage'
import GoalWidgetPage from './pages/GoalWidgetPage'
import LoginPage from './pages/LoginPage'
import { useAuth } from './auth/useAuth'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <LoginPage />

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<WidgetsPage />} />
        <Route path="/widgets" element={<WidgetsPage />} />
        <Route path="/widgets/reward-to-do" element={<RewardWidgetPage />} />
        <Route path="/widgets/spend-points" element={<SpendWidgetPage />} />
        <Route path="/widgets/goals" element={<GoalWidgetPage />} />
      </Routes>
    </>
  )
}

export default App

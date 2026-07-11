import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import WidgetsPage from './pages/WidgetsPage'
import RewardWidgetPage from './pages/RewardWidgetPage'
import SpendWidgetPage from './pages/SpendWidgetPage'
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
        <Route path="/" element={<HomePage />} />
        <Route path="/widgets" element={<WidgetsPage />} />
        <Route path="/widgets/reward-to-do" element={<RewardWidgetPage />} />
        <Route path="/widgets/spend-points" element={<SpendWidgetPage />} />
      </Routes>
    </>
  )
}

export default App

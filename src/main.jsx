import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import { BalanceProvider } from './balance/BalanceProvider.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BalanceProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </BalanceProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

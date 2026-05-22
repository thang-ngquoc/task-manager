import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ConfirmPage from './pages/ConfirmPage'
import "@/amplifyConfig"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/confirm" element={<ConfirmPage />} />
    </Routes>
  )
}

export default App

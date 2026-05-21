import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { HomePage } from './components/HomePage'
import { LeaderboardPage } from './components/LeaderboardPage'
import { Sidebar } from './components/Sidebar'

function App() {
  return (
    <main className="app-shell">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </main>
  )
}

export default App

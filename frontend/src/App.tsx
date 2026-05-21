import './App.css'
import { HomePage } from './components/HomePage'
import { Sidebar } from './components/Sidebar'

function App() {
  return (
    <main className="app-shell">
      <Sidebar activeItem="HOME" />
      <HomePage />
    </main>
  )
}

export default App

import { useState } from 'react'
import { Dumbbell, MessageSquare, Utensils, LineChart, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import WorkoutGenerator from './components/WorkoutGenerator'
import MealGenerator from './components/MealGenerator'
import Login from './components/Login'
import Signup from './components/Signup'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [showLogin, setShowLogin] = useState(true)
  const { currentUser, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  // Show auth screens if not logged in
  if (!currentUser) {
    return showLogin ? (
      <Login onToggle={() => setShowLogin(false)} />
    ) : (
      <Signup onToggle={() => setShowLogin(true)} />
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'chat':
        return <Chat />
      case 'workout':
        return <WorkoutGenerator />
      case 'meal':
        return <MealGenerator />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img src="/setlogic-logo.png" alt="SetLogic" className="logo-image" />
            <div className="logo-text">
              <h1>SetLogic</h1>
              <span className="logo-tagline">AI Fitness Coach</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('dashboard')}
            >
              <LineChart size={20} />
              <span>Dashboard</span>
            </button>
            <button
              className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveView('chat')}
            >
              <MessageSquare size={20} />
              <span>AI Coach</span>
            </button>
            <button
              className={`nav-item ${activeView === 'workout' ? 'active' : ''}`}
              onClick={() => setActiveView('workout')}
            >
              <Dumbbell size={20} />
              <span>Workout Plan</span>
            </button>
            <button
              className={`nav-item ${activeView === 'meal' ? 'active' : ''}`}
              onClick={() => setActiveView('meal')}
            >
              <Utensils size={20} />
              <span>Meal Plan</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="ai-badge">
              <Sparkles size={14} />
              <span>Powered by Claude</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App

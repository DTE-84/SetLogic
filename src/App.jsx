import { useState } from 'react'
import { Dumbbell, MessageSquare, Utensils, LineChart, LogOut, Watch } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import WorkoutGenerator from './components/WorkoutGenerator'
import MealGenerator from './components/MealGenerator'
import Wearables from './components/Wearables'
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
      case 'wearables':
        return <Wearables />
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
          <div className="header-user">
            <div className="user-greeting">
              <span className="greeting-text">Welcome back,</span>
              <span className="user-name">{currentUser?.displayName || 'Athlete'}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="app-layout">
        {/* Main Content - Full Width */}
        <main className="main-content">
          {renderView()}
        </main>

        {/* Bottom Navigation Bar */}
        <nav className="bottom-nav">
          <button
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LineChart size={24} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeView === 'workout' ? 'active' : ''}`}
            onClick={() => setActiveView('workout')}
          >
            <Dumbbell size={24} />
            <span>Workout</span>
          </button>
          <button
            className={`nav-item ${activeView === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveView('chat')}
          >
            <MessageSquare size={24} />
            <span>AI Coach</span>
          </button>
          <button
            className={`nav-item ${activeView === 'meal' ? 'active' : ''}`}
            onClick={() => setActiveView('meal')}
          >
            <Utensils size={24} />
            <span>Nutrition</span>
          </button>
          <button
            className={`nav-item ${activeView === 'wearables' ? 'active' : ''}`}
            onClick={() => setActiveView('wearables')}
          >
            <Watch size={24} />
            <span>Devices</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export default App

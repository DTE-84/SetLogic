import { useState } from 'react'
import { Dumbbell, MessageSquare, Utensils, LineChart, Sparkles } from 'lucide-react'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import WorkoutGenerator from './components/WorkoutGenerator'
import MealGenerator from './components/MealGenerator'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('dashboard')

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
            <Sparkles className="logo-icon" size={32} strokeWidth={1.5} />
            <div className="logo-text">
              <h1>SetLogic</h1>
              <span className="logo-tagline">AI Fitness Coach</span>
            </div>
          </div>
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

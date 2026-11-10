import { useState, useEffect, useCallback } from 'react'
import { Target, Plus, CheckCircle, Droplet, Moon, Footprints } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getHabits, saveEntry } from '../services/trackingService'
import './HabitTracker.css'

const today = () => new Date().toISOString().slice(0, 10)

function HabitTracker() {
  const { currentUser } = useAuth()
  const [habits, setHabits] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newHabit, setNewHabit] = useState({ name: '', target_value: '', unit: '' })

  const fetchHabits = useCallback(async () => {
    if (!currentUser) return
    try {
      setHabits(await getHabits(currentUser.uid, today()))
    } catch (error) {
      console.error('Could not load habits', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchHabits()
  }, [currentUser, fetchHabits])

  const handleAddHabit = async (e) => {
    e.preventDefault()
    try {
      await saveEntry(currentUser.uid, 'habit', {
        name: newHabit.name,
        target_value: parseFloat(newHabit.target_value),
        unit: newHabit.unit
      })
      setNewHabit({ name: '', target_value: '', unit: '' })
      setShowAdd(false)
      fetchHabits()
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogProgress = async (habitId, increment) => {
    try {
      await saveEntry(currentUser.uid, 'habit_progress', { habitId, increment, date: today() })
      setHabits(previous => previous.map(habit => {
        if (habit.id !== habitId) return habit
        return { ...habit, current_value: habit.current_value + increment }
      }))
    } catch (error) {
      console.error(error)
    }
  }

  const getIcon = (name) => {
    const lower = name.toLowerCase()
    if (lower.includes('water')) return <Droplet size={24} />
    if (lower.includes('sleep')) return <Moon size={24} />
    if (lower.includes('step')) return <Footprints size={24} />
    return <Target size={24} />
  }

  return (
    <div className="habit-container">
      <div className="habit-header">
        <Target color="#00d9ff" size={32} className="header-icon" />
        <div>
          <h2>Daily Habits</h2>
          <p className="habit-subtitle">Track your daily progress</p>
        </div>
        <button className="add-habit-btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={20} />
          <span>New Habit</span>
        </button>
      </div>

      {showAdd && (
        <form className="add-habit-form" onSubmit={handleAddHabit}>
          <input 
            type="text" 
            placeholder="Habit Name (e.g., Water)" 
            value={newHabit.name}
            onChange={e => setNewHabit({...newHabit, name: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Daily Target (e.g., 3)" 
            value={newHabit.target_value}
            onChange={e => setNewHabit({...newHabit, target_value: e.target.value})}
            required
          />
          <input 
            type="text" 
            placeholder="Unit (e.g., Liters)" 
            value={newHabit.unit}
            onChange={e => setNewHabit({...newHabit, unit: e.target.value})}
            required
          />
          <button type="submit">Save to SQL</button>
        </form>
      )}

      <div className="habits-grid">
        {isLoading ? (
          <p>Connecting to Python Backend...</p>
        ) : habits.length === 0 ? (
          <div className="no-habits">No habits tracked yet. Create one above!</div>
        ) : (
          habits.map((habit) => {
            const progressPercent = Math.min((habit.current_value / habit.target_value) * 100, 100)
            const isComplete = habit.current_value >= habit.target_value

            return (
              <div key={habit.id} className={`habit-card ${isComplete ? 'complete' : ''}`}>
                <div className="habit-card-header">
                  <div className="habit-icon" style={{ color: isComplete ? 'var(--success)' : 'var(--blue-primary)' }}>
                    {getIcon(habit.name)}
                  </div>
                  <h3>{habit.name}</h3>
                  {isComplete && <CheckCircle color="#00d9ff" size={20} className="success-icon" />}
                </div>

                <div className="habit-progress-bar">
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>

                <div className="habit-stats">
                  <span>{habit.current_value} / {habit.target_value} {habit.unit}</span>
                  <div className="habit-actions">
                    <button onClick={() => handleLogProgress(habit.id, 1)}>+1</button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default HabitTracker

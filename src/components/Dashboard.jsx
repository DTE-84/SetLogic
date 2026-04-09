import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Dumbbell, Apple, Flame, Target, Footprints, Loader2, Plus, X } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { 
  getBodyMeasurements, 
  getWorkouts, 
  getWearableData, 
  getUserProfile,
  saveBodyMeasurement,
  saveWearableData
} from '../services/firestoreService'
import './Dashboard.css'

function Dashboard() {
  const { currentUser } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'Athlete'
  
  const [loading, setLoading] = useState(true)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [entryType, setEntryType] = useState('weight') // 'weight' or 'steps'
  const [entryValue, setEntryValue] = useState('')
  const [saving, setSaving] = useState(false)
  
  const [stats, setStats] = useState({
    weightTrend: [],
    workoutVolume: [],
    calorieIntake: [],
    metrics: {
      massTrajectory: { value: '0.0', delta: '0.0', trend: 'neutral', label: '0% Delta' },
      powerOutput: { value: '0', trend: 'Stable' },
      stepsToday: { value: '0' },
      streak: { value: '0' }
    }
  })

  const fetchTelemetry = useCallback(async () => {
    if (!currentUser) return
    setLoading(true)
    try {
      const [measurements, workouts, wearables, profile] = await Promise.all([
        getBodyMeasurements(currentUser.uid, 7),
        getWorkouts(currentUser.uid, 7),
        getWearableData(currentUser.uid, 7),
        getUserProfile(currentUser.uid)
      ])

      // 1. Process Weight Trend
      const weightTrend = [...measurements].reverse().map(m => ({
        week: new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleDateString([], { weekday: 'short' }),
        weight: parseFloat(m.weight),
        goal: profile?.goalWeight || 180 
      }))

      // Calculate Mass Trajectory Delta
      let massTrajectory = { value: '0.0', delta: '0.0', trend: 'neutral', label: '0% Delta' }
      if (measurements.length >= 2) {
        const latest = parseFloat(measurements[0].weight)
        const previous = parseFloat(measurements[1].weight)
        const delta = (latest - previous).toFixed(1)
        const deltaPct = ((delta / previous) * 100).toFixed(1)
        massTrajectory = {
          value: `${latest} kg`,
          delta: `${delta > 0 ? '+' : ''}${delta} kg`,
          trend: delta <= 0 ? 'success' : 'warning',
          label: `${deltaPct}% Delta`
        }
      } else if (measurements.length === 1) {
        massTrajectory = {
          value: `${measurements[0].weight} kg`,
          delta: 'Inaugural',
          trend: 'success',
          label: 'Baseline Established'
        }
      }

      // 2. Process Workout Volume (Last 7 Days)
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return { day: days[d.getDay()], sets: 0, date: d.toISOString().split('T')[0] }
      })

      workouts.forEach(w => {
        const wDate = new Date(w.createdAt?.toDate?.() || Date.now()).toISOString().split('T')[0]
        const dayIdx = last7Days.findIndex(d => d.date === wDate)
        if (dayIdx !== -1) {
          last7Days[dayIdx].sets += (w.sets || 0)
        }
      })

      const totalSets = workouts.reduce((acc, w) => acc + (w.sets || 0), 0)

      // 3. Process Calories (From LocalStorage)
      const dateKey = new Date().toISOString().split('T')[0]
      const storedMeals = localStorage.getItem(`meals_${currentUser.uid}_${dateKey}`)
      const todayMeals = storedMeals ? JSON.parse(storedMeals) : []
      const todayCalories = todayMeals.reduce((acc, m) => acc + (m.calories * (m.servings || 1)), 0)

      // 4. Steps
      const stepsToday = wearables.find(w => 
        new Date(w.createdAt?.toDate?.() || Date.now()).toISOString().split('T')[0] === dateKey
      )?.data?.steps || 0

      setStats({
        weightTrend,
        workoutVolume: last7Days,
        calorieIntake: [{ day: 'Today', calories: todayCalories, target: profile?.dailyCalorieTarget || 2500 }],
        metrics: {
          massTrajectory,
          powerOutput: { value: `${totalSets} sets`, trend: totalSets > 50 ? 'High Velocity' : 'Establishing' },
          stepsToday: { value: stepsToday.toLocaleString() },
          streak: { value: '12 days' }
        }
      })

    } catch (error) {
      console.error("Dashboard Sync Failed:", error)
    } finally {
      setLoading(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchTelemetry()
  }, [fetchTelemetry])

  const handleManualEntry = async (e) => {
    e.preventDefault()
    if (!entryValue || saving) return
    
    setSaving(true)
    try {
      if (entryType === 'weight') {
        await saveBodyMeasurement(currentUser.uid, { weight: parseFloat(entryValue) })
      } else {
        await saveWearableData(currentUser.uid, { 
          provider: 'manual', 
          data: { steps: parseInt(entryValue) } 
        })
      }
      setShowEntryModal(false)
      setEntryValue('')
      fetchTelemetry()
    } catch (error) {
      console.error("Entry failed:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <span className="ml-4 font-black uppercase tracking-widest text-xs">Synchronizing Telemetry...</span>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">{firstName}'s Telemetry</h2>
          <p className="dashboard-subtitle text-[10px] font-black uppercase tracking-[0.2em] text-primary">Personalized fitness insights and planning</p>
        </div>
        <button 
          onClick={() => setShowEntryModal(true)}
          className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
        >
          <Plus size={14} />
          Log Entry
        </button>
      </div>

      {/* Manual Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0907] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 relative shadow-2xl">
            <button 
              onClick={() => setShowEntryModal(false)}
              className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">Establish Telemetry</h3>
            
            <div className="flex gap-4 mb-8">
              <button 
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${entryType === 'weight' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}
                onClick={() => setEntryType('weight')}
              >
                Weight (kg)
              </button>
              <button 
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${entryType === 'steps' ? 'bg-primary/10 border-primary text-primary' : 'bg-white/5 border-white/5 text-muted-foreground'}`}
                onClick={() => setEntryType('steps')}
              >
                Steps
              </button>
            </div>

            <form onSubmit={handleManualEntry} className="space-y-6">
              <div className="form-group">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                  Current {entryType === 'weight' ? 'Mass' : 'Velocity'}
                </label>
                <input
                  type="number"
                  step={entryType === 'weight' ? "0.1" : "1"}
                  value={entryValue}
                  onChange={(e) => setEntryValue(e.target.value)}
                  placeholder={entryType === 'weight' ? "e.g. 82.5" : "e.g. 10000"}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-primary/40 text-white font-bold"
                  autoFocus
                />
              </div>

              <button 
                type="submit"
                disabled={saving || !entryValue}
                className="w-full bg-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Log Measurement'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className={`stat-icon ${stats.metrics.massTrajectory.trend}`}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Mass Trajectory</span>
            <div className="stat-value">{stats.metrics.massTrajectory.value}</div>
            <span className={`stat-trend ${stats.metrics.massTrajectory.trend}`}>
              {stats.metrics.massTrajectory.delta} | {stats.metrics.massTrajectory.label}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Dumbbell size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Power Output</span>
            <div className="stat-value">{stats.metrics.powerOutput.value}</div>
            <span className="stat-trend primary">{stats.metrics.powerOutput.trend}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Footprints size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Steps Today</span>
            <div className="stat-value">{stats.metrics.stepsToday.value}</div>
            <span className="stat-trend">Real-time Sync</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Protocol Streak</span>
            <div className="stat-value">{stats.metrics.streak.value}</div>
            <span className="stat-trend success">On track</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Weight Progress */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>Weight Progress</h3>
            <span className="chart-subtitle">7-day live trajectory</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.weightTrend}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#808080" domain={['dataMin - 2', 'dataMax + 2']} style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#00d9ff" strokeWidth={3} dot={{ fill: '#00d9ff', r: 5 }} fill="url(#weightGradient)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Volume */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly Volume</h3>
            <span className="chart-subtitle">Total sets per day (Real-time)</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.workoutVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                }}
              />
              <Bar dataKey="sets" fill="#00d9ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Calorie Tracking */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Calorie Intake</h3>
            <span className="chart-subtitle">Daily drift vs target</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.calorieIntake}>
              <defs>
                <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a8598a" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#a8598a" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                }}
              />
              <Area type="monotone" dataKey="calories" stroke="#a8598a" strokeWidth={2} fill="url(#calorieGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="dashboard-footer">
        <div className="legal-links">
          <a href="https://dte-solutions.icu/legal/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="https://dte-solutions.icu/legal/terms.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>
        </div>
        <p className="copyright">© 2026 DTE Solutions LLC // SetLogic Division</p>
      </footer>
    </div>
  )
}

export default Dashboard


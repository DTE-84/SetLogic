import { useState, useEffect, useCallback } from 'react'
import { TrendingDown, Dumbbell, Target, Footprints, Loader2, X, Activity, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { 
  getBodyMeasurements, 
  getWorkouts, 
  getWearableData, 
  getUserProfile,
  saveBodyMeasurement,
  saveWearableData,
  saveWorkout
} from '../services/firestoreService'
import './Dashboard.css'

function Dashboard() {
  const { currentUser } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'Athlete'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const [loading, setLoading] = useState(true)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncData, setSyncData] = useState({ weight: '', steps: '', sets: '', bodyFat: '', muscleMass: '' })
  const [saving, setSaving] = useState(false)
  const [todayMeals, setTodayMeals] = useState([])
  
  const [stats, setStats] = useState({
    weightTrend: [],
    workoutVolume: [],
    calorieIntake: [],
    metrics: {
      massTrajectory: { value: '0.0', delta: '0.0', trend: 'neutral', label: '0% Delta' },
      powerOutput: { value: '0', trend: 'Stable' },
      stepsToday: { value: '0' },
      streak: { value: '0' },
      bodyFat: { value: '0', trend: 'Stable' },
      muscleMass: { value: '0', trend: 'Stable' }
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

      const weightTrend = [...measurements].reverse().map(m => ({
        week: new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleDateString([], { weekday: 'short' }),
        weight: parseFloat(m.weight),
        goal: profile?.goalWeight || 180 
      }))

      let massTrajectory = { value: '0.0', delta: '0.0', trend: 'neutral', label: '0% Delta' }
      let bodyFatMetric = { value: '0%', trend: 'Stable' }
      let muscleMassMetric = { value: '0 kg', trend: 'Stable' }

      if (measurements.length >= 2) {
        const latest = measurements[0]
        const previous = measurements[1]
        
        const latestWeight = parseFloat(latest.weight)
        const previousWeight = parseFloat(previous.weight)
        const delta = (latestWeight - previousWeight).toFixed(1)
        const deltaPct = ((delta / previousWeight) * 100).toFixed(1)
        
        massTrajectory = {
          value: `${latestWeight} kg`,
          delta: `${delta > 0 ? '+' : ''}${delta} kg`,
          trend: delta <= 0 ? 'success' : 'warning',
          label: `${deltaPct}% Delta`
        }

        if (latest.bodyFat) {
          const bfDelta = (latest.bodyFat - (previous.bodyFat || latest.bodyFat)).toFixed(1)
          bodyFatMetric = { value: `${latest.bodyFat}%`, trend: bfDelta <= 0 ? 'Decreasing' : 'Increasing' }
        }
        
        if (latest.muscleMass) {
          const mmDelta = (latest.muscleMass - (previous.muscleMass || latest.muscleMass)).toFixed(1)
          muscleMassMetric = { value: `${latest.muscleMass} kg`, trend: mmDelta >= 0 ? 'Gaining' : 'Loss' }
        }
      }

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

      const dateKey = new Date().toISOString().split('T')[0]
      const storedMeals = localStorage.getItem(`meals_${currentUser.uid}_${dateKey}`)
      const meals = storedMeals ? JSON.parse(storedMeals) : []
      setTodayMeals(meals)
      const todayCalories = meals.reduce((acc, m) => acc + (m.calories * (m.servings || 1)), 0)

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
          streak: { value: '12 days' },
          bodyFat: bodyFatMetric,
          muscleMass: muscleMassMetric
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

  const handleTelemetrySync = async (e) => {
    e.preventDefault()
    if (saving) return
    
    setSaving(true)
    try {
      const promises = []
      
      if (syncData.weight || syncData.bodyFat || syncData.muscleMass) {
        promises.push(saveBodyMeasurement(currentUser.uid, { 
          weight: parseFloat(syncData.weight),
          bodyFat: parseFloat(syncData.bodyFat),
          muscleMass: parseFloat(syncData.muscleMass)
        }))
      }
      
      if (syncData.steps) {
        promises.push(saveWearableData(currentUser.uid, { 
          provider: 'manual', 
          data: { steps: parseInt(syncData.steps) } 
        }))
      }

      if (syncData.sets) {
        promises.push(saveWorkout(currentUser.uid, {
          type: 'Manual Log',
          sets: parseInt(syncData.sets),
          status: 'completed',
          createdAt: new Date()
        }))
      }

      await Promise.all(promises)
      setShowSyncModal(false)
      setSyncData({ weight: '', steps: '', sets: '', bodyFat: '', muscleMass: '' })
      fetchTelemetry()
    } catch (error) {
      console.error("Telemetry sync failed:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={32} className="dashboard-spinner" />
        <span>Synchronizing Telemetry...</span>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>{firstName}'s Telemetry</h2>
          <p className="dashboard-subtitle">Personalized fitness insights and planning</p>
        </div>
        <button onClick={() => setShowSyncModal(true)} className="sync-log-btn">
          <div className="btn-glow" />
          <Activity size={18} />
          <span>Add Log</span>
        </button>
      </div>

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

      {/* AI Intelligence Layer */}

      {/* Biometric Analysis Layer */}
      <div className="charts-grid" style={{marginBottom: '2rem'}}>
        <div className="chart-card full">
          <div className="chart-header">
            <h3>Mass Trajectory</h3>
            <span className="chart-subtitle">Biometric progression analysis</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.weightTrend}>
              <defs>
                <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00d9ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" stroke="#808080" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#808080" domain={['dataMin - 1', 'dataMax + 1']} style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{
                  background: 'var(--surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '6px',
                }}
              />
              <Area type="monotone" dataKey="weight" stroke="#00d9ff" strokeWidth={3} fill="url(#weightArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Unified Telemetry Sync Modal */}
      {showSyncModal && (
        <div className="sync-modal-overlay">
          <div className="sync-drawer">
            <button 
              onClick={() => setShowSyncModal(false)}
              className="sync-drawer-close"
            >
              <X size={20} />
            </button>

            <div className="sync-drawer-header">
              <div className="diagnostic-circle">
                <Zap color="#00d9ff" size={24} className="icon-shadow" />
              </div>
              <div>
                <h3>Log Today's Data</h3>
                <p>Update your daily biometric telemetry</p>
              </div>
            </div>

            <form onSubmit={handleTelemetrySync} className="sync-form">
              <div className="sync-form-grid">
                <div className="sync-field">
                  <label><TrendingDown size={14} /> Body Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 82.5"
                    value={syncData.weight}
                    onChange={e => setSyncData({...syncData, weight: e.target.value})}
                  />
                </div>
                <div className="sync-field">
                  <label><Footprints size={14} /> Steps Today</label>
                  <input
                    type="number"
                    placeholder="e.g. 8500"
                    value={syncData.steps}
                    onChange={e => setSyncData({...syncData, steps: e.target.value})}
                  />
                </div>
                <div className="sync-field">
                  <label><Target size={14} /> Body Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 15.5"
                    value={syncData.bodyFat}
                    onChange={e => setSyncData({...syncData, bodyFat: e.target.value})}
                  />
                </div>
                <div className="sync-field">
                  <label><Activity size={14} /> Muscle Mass (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 65.2"
                    value={syncData.muscleMass}
                    onChange={e => setSyncData({...syncData, muscleMass: e.target.value})}
                  />
                </div>
                <div className="sync-field sync-field-full">
                  <label><Dumbbell size={14} /> Workout Sets</label>
                  <input
                    type="number"
                    placeholder="e.g. 24"
                    value={syncData.sets}
                    onChange={e => setSyncData({...syncData, sets: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="generate-btn"
                disabled={saving || (!syncData.weight && !syncData.steps && !syncData.sets)}
              >
                {saving ? (
                  <><Loader2 size={18} className="spinner" /> Saving...</>
                ) : (
                  <><Activity size={18} /> Commit Telemetry</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}


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
              <YAxis stroke="#808080" domain={['dataMin - 1', 'dataMax + 1']} style={{ fontSize: '0.75rem' }} />
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

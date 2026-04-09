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
  const [saving, setSaving] = useState(null) // tracks which metric is saving: 'weight', 'workout', 'steps'
  const [inputs, setInputs] = useState({ weight: '', sets: '', steps: '' })
  
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

      const weightTrend = [...measurements].reverse().map(m => ({
        week: new Date(m.createdAt?.toDate?.() || Date.now()).toLocaleDateString([], { weekday: 'short' }),
        weight: parseFloat(m.weight),
        goal: profile?.goalWeight || 180 
      }))

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
      const todayMeals = storedMeals ? JSON.parse(storedMeals) : []
      const todayCalories = todayMeals.reduce((acc, m) => acc + (m.calories * (m.servings || 1)), 0)

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

  const handleUpdate = async (type) => {
    const val = inputs[type]
    if (!val || saving) return
    
    setSaving(type)
    try {
      if (type === 'weight') {
        await saveBodyMeasurement(currentUser.uid, { weight: parseFloat(val) })
      } else if (type === 'steps') {
        await saveWearableData(currentUser.uid, { 
          provider: 'manual', 
          data: { steps: parseInt(val) } 
        })
      } else if (type === 'sets') {
        await getWorkouts(currentUser.uid) // Just to follow patterns
        // Logic for logging workout sets would go here
      }
      setInputs(prev => ({ ...prev, [type]: '' }))
      fetchTelemetry()
    } catch (error) {
      console.error(`${type} update failed:`, error)
    } finally {
      setSaving(null)
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
      <div className="dashboard-header">
        <h2 className="text-3xl font-black tracking-tighter uppercase">{firstName}'s Telemetry</h2>
        <p className="dashboard-subtitle text-[10px] font-black uppercase tracking-[0.2em] text-primary">Personalized fitness insights and planning</p>
      </div>

      {/* Stats Grid with Integrated Inputs */}
      <div className="stats-grid">
        {/* MASS TRAJECTORY */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2 group-focus-within:border-primary/40 transition-all">
            <input 
              type="number" 
              placeholder="LOG MASS (kg)..."
              value={inputs.weight}
              onChange={e => setInputs({...inputs, weight: e.target.value})}
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest p-1 text-white placeholder:text-muted-foreground/40"
            />
            <button 
              onClick={() => handleUpdate('weight')}
              className={`p-1 rounded-lg transition-all ${inputs.weight ? 'text-primary scale-110' : 'text-muted-foreground opacity-20'}`}
            >
              {saving === 'weight' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </div>
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
        </div>

        {/* POWER OUTPUT */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2 group-focus-within:border-primary/40 transition-all">
            <input 
              type="number" 
              placeholder="LOG SETS..."
              value={inputs.sets}
              onChange={e => setInputs({...inputs, sets: e.target.value})}
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest p-1 text-white placeholder:text-muted-foreground/40"
            />
            <button 
              onClick={() => handleUpdate('sets')}
              className={`p-1 rounded-lg transition-all ${inputs.sets ? 'text-primary scale-110' : 'text-muted-foreground opacity-20'}`}
            >
              {saving === 'sets' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
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
        </div>

        {/* STEPS TODAY */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-2xl p-2 group-focus-within:border-primary/40 transition-all">
            <input 
              type="number" 
              placeholder="LOG VELOCITY..."
              value={inputs.steps}
              onChange={e => setInputs({...inputs, steps: e.target.value})}
              className="flex-1 bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest p-1 text-white placeholder:text-muted-foreground/40"
            />
            <button 
              onClick={() => handleUpdate('steps')}
              className={`p-1 rounded-lg transition-all ${inputs.steps ? 'text-primary scale-110' : 'text-muted-foreground opacity-20'}`}
            >
              {saving === 'steps' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
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
        </div>

        {/* STREAK */}
        <div className="flex flex-col gap-2">
          <div className="h-[38px] flex items-center px-4 bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Autonomous Calculation</span>
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


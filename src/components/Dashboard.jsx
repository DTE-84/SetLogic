import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Dumbbell, Apple, Flame, Target, Footprints, Loader2, Plus, X, Activity, Zap } from 'lucide-react'
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
  
  const [loading, setLoading] = useState(true)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [syncData, setSyncData] = useState({ weight: '', steps: '', sets: '' })
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

  const handleTelemetrySync = async (e) => {
    e.preventDefault()
    if (saving) return
    
    setSaving(true)
    try {
      const promises = []
      
      if (syncData.weight) {
        promises.push(saveBodyMeasurement(currentUser.uid, { weight: parseFloat(syncData.weight) }))
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
      setSyncData({ weight: '', steps: '', sets: '' })
      fetchTelemetry()
    } catch (error) {
      console.error("Telemetry sync failed:", error)
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
          onClick={() => setShowSyncModal(true)}
          className="bg-primary text-black px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 hover:bg-primary/80 active:scale-95 shadow-[0_0_30px_rgba(0,217,255,0.2)] border border-white/10"
        >
          <Activity size={18} />
          Sync Telemetry
        </button>
      </div>

      {/* Unified Telemetry Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/70 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[4rem] w-full max-w-2xl p-12 relative shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Background Kinetic Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <button 
              onClick={() => setShowSyncModal(false)}
              className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all z-10"
            >
              <X size={24} />
            </button>
            
            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-12">
                <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(0,217,255,0.2)]">
                  <Zap size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">Telemetry Sync</h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mt-3">Establish Daily Biometric Signal</p>
                </div>
              </div>

              <form onSubmit={handleTelemetrySync} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mass Input */}
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block ml-1">Body Mass (KG)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="00.0"
                        value={syncData.weight}
                        onChange={e => setSyncData({...syncData, weight: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-6 px-8 text-3xl font-black text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all tracking-tighter"
                      />
                      <TrendingDown className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary/40 transition-colors" size={24} />
                    </div>
                  </div>

                  {/* Steps Input */}
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block ml-1">Step Velocity</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0000"
                        value={syncData.steps}
                        onChange={e => setSyncData({...syncData, steps: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-6 px-8 text-3xl font-black text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all tracking-tighter"
                      />
                      <Footprints className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary/40 transition-colors" size={24} />
                    </div>
                  </div>

                  {/* Power Output (Sets) */}
                  <div className="group md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 block ml-1">Workload (Total Sets)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="00"
                        value={syncData.sets}
                        onChange={e => setSyncData({...syncData, sets: e.target.value})}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-[2rem] py-6 px-8 text-3xl font-black text-white focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all tracking-tighter"
                      />
                      <Dumbbell className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-primary/40 transition-colors" size={28} />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saving || (!syncData.weight && !syncData.steps && !syncData.sets)}
                  className="w-full bg-white text-black py-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs hover:bg-primary hover:shadow-[0_0_40px_rgba(0,217,255,0.4)] transition-all duration-500 disabled:opacity-10 disabled:grayscale flex items-center justify-center gap-4 group/btn"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>Commit Telemetry</span>
                      <Activity size={20} className="group-hover/btn:scale-125 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
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

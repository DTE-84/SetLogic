import { useState } from 'react'
import { TrendingUp, TrendingDown, Dumbbell, Apple, Flame, Target, Footprints } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import './Dashboard.css'

// Sample data
const weightData = [
  { week: 'Week 1', weight: 82.5, goal: 79 },
  { week: 'Week 2', weight: 81.8, goal: 79 },
  { week: 'Week 3', weight: 81.2, goal: 79 },
  { week: 'Week 4', weight: 80.6, goal: 79 },
  { week: 'Week 5', weight: 79.9, goal: 79 },
  { week: 'Week 6', weight: 79.4, goal: 79 },
]

const workoutData = [
  { day: 'Mon', sets: 18 },
  { day: 'Tue', sets: 15 },
  { day: 'Wed', sets: 20 },
  { day: 'Thu', sets: 0 },
  { day: 'Fri', sets: 22 },
  { day: 'Sat', sets: 16 },
  { day: 'Sun', sets: 0 },
]

const calorieData = [
  { day: 'Mon', calories: 2340, target: 2400 },
  { day: 'Tue', calories: 2420, target: 2400 },
  { day: 'Wed', calories: 2380, target: 2400 },
  { day: 'Thu', calories: 2450, target: 2400 },
  { day: 'Fri', calories: 2390, target: 2400 },
  { day: 'Sat', calories: 2600, target: 2400 },
  { day: 'Sun', calories: 2200, target: 2400 },
]

function Dashboard() {
  const { currentUser } = useAuth()
  const firstName = currentUser?.displayName?.split(' ')[0] || 'Athlete'

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2 className="text-3xl font-black tracking-tighter uppercase">{firstName}'s Telemetry</h2>
        <p className="dashboard-subtitle text-[10px] font-black uppercase tracking-[0.2em] text-primary">High-Fidelity Behavioral Analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon success">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Mass Trajectory</span>
            <div className="stat-value">-3.1 kg</div>
            <span className="stat-trend success">↓ 3.8% Delta</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Dumbbell size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Power Output</span>
            <div className="stat-value">91 sets</div>
            <span className="stat-trend primary">High Velocity</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Footprints size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Kinetic Velocity</span>
            <div className="stat-value">8,432</div>
            <span className="stat-trend">Steps Today</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Protocol Streak</span>
            <div className="stat-value">12 days</div>
            <span className="stat-trend success">Operational</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Weight Progress */}
        <div className="chart-card full">
          <div className="chart-header">
            <h3>Weight Progress</h3>
            <span className="chart-subtitle">6-week trend vs goal</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={weightData}>
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
              <Line type="monotone" dataKey="goal" stroke="#6b2647" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Workout Volume */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Weekly Workouts</h3>
            <span className="chart-subtitle">Total sets per day</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workoutData}>
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
            <span className="chart-subtitle">Daily vs target</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={calorieData}>
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

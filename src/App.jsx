import { Dumbbell, MessageSquare, Utensils, LineChart, LogOut, Footprints } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { AppRoutes } from './AppRoutes'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import Workout from './components/Workout'
import Nutrition from './components/Nutrition'
import Lifestyle from './components/Lifestyle'
import './App.css'

const navigation = [
  { path: '/dashboard', label: 'Dashboard', Icon: LineChart, View: Dashboard },
  { path: '/nutrition', label: 'Nutrition', Icon: Utensils, View: Nutrition },
  { path: '/training', label: 'Training', Icon: Dumbbell, View: Workout },
  { path: '/lifestyle', label: 'Lifestyle', Icon: Footprints, View: Lifestyle },
  { path: '/coach', label: 'Coach', Icon: MessageSquare, View: Chat }
]
const routes = navigation.map(item => item.path)

function SignedInApp({ path }) {
  const { currentUser, logout } = useAuth()
  const { View } = navigation.find(item => item.path === path)

  async function handleLogout() {
    try {
      await logout()
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <div className="app">
      <header className='header'>
				<div className='header-content'>
					<div className='logo'>
						<div
							style={{
								width: "90px",
								height: "90px",
								position: "relative",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								marginRight: "12px",
							}}>
							<div
								style={{
									width: "90px",
									height: "90px",
									position: "relative",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									marginRight: "12px",
								}}
							/>
							<img
								src='/SetLogicTransp.png'
								alt='SetLogic'
								style={{
									width: "80px",
									height: "80px",
									objectFit: "contain",
									position: "relative",
									zIndex: 10,
									filter: "drop-shadow(0 0 8px rgba(0, 217, 255, 0.4))",
								}}
							/>
						</div>
						<div className='logo-text'>
							<h1 className='tracking-tighter font-black uppercase text-xl'>
								SetLogic
							</h1>
							<span className='text-10px font-black uppercase tracking-wide text-primary'>
								AI Fitness & Nutrition Coach
							</span>
						</div>
					</div>
					<div className='header-user'>
						<div className='user-greeting hidden sm:flex'>
							<span className='greeting-text text-[10px] uppercase font-bold text-muted-foreground'>
								Signed in as:
							</span>
							<span className='user-name text-xs font-black uppercase tracking-tight ml-2'>
								{currentUser?.displayName || "Athlete"}
							</span>
						</div>
						<button className='logout-btn' onClick={handleLogout}>
							<LogOut size={16} />
							<span className='text-[10px] font-black uppercase tracking-widest ml-2'>
								Log Out
							</span>
						</button>
					</div>
				</div>
			</header>
      <div className="app-layout">
        <main className="main-content"><View /></main>
        <nav className="bottom-nav" aria-label="Main navigation">
          {navigation.map(item => {
            const { path: target, label, Icon } = item
            return (
              <a key={target} href={`#${target}`} className={`nav-item ${target === path ? 'active' : ''}`}
                aria-current={target === path ? 'page' : undefined} style={{ textDecoration: 'none' }}>
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </a>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  return <AppRoutes routes={routes} renderProtected={(path, userId) => <SignedInApp key={userId} path={path} />} />
}

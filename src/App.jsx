import { useState } from "react";
import {
	Dumbbell,
	MessageSquare,
	Utensils,
	LineChart,
	LogOut,
	Footprints,
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import Workout from "./components/Workout";
import Nutrition from "./components/Nutrition";
import Lifestyle from "./components/Lifestyle";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";

function App() {
	const [activeView, setActiveView] = useState("dashboard");
	const [showLogin, setShowLogin] = useState(true);
	const { currentUser, logout } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Failed to log out:", error);
		}
	};

	if (!currentUser) {
		return showLogin ? (
			<Login onToggle={() => setShowLogin(false)} />
		) : (
			<Signup onToggle={() => setShowLogin(true)} />
		);
	}

	const renderView = () => {
		switch (activeView) {
			case "dashboard":
				return <Dashboard />;
			case "nutrition":
				return <Nutrition />;
			case "workout":
				return <Workout />;
			case "lifestyle":
				return <Lifestyle />;
			case "chat":
				return <Chat />;
			default:
				return <Dashboard />;
		}
	};

	return (
		<div className='app'>
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

			<div className='app-layout'>
				<main className='main-content'>{renderView()}</main>

				<nav className='bottom-nav'>
					<button
						className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
						onClick={() => setActiveView("dashboard")}>
						<LineChart size={20} />
						<span>Dashboard</span>
					</button>
					<button
						className={`nav-item ${activeView === "nutrition" ? "active" : ""}`}
						onClick={() => setActiveView("nutrition")}>
						<Utensils size={20} />
						<span>Nutrition</span>
					</button>
					<button
						className={`nav-item ${activeView === "workout" ? "active" : ""}`}
						onClick={() => setActiveView("workout")}>
						<Dumbbell size={20} />
						<span>Training</span>
					</button>
					<button
						className={`nav-item ${activeView === "lifestyle" ? "active" : ""}`}
						onClick={() => setActiveView("lifestyle")}>
						<Footprints size={20} />
						<span>Lifestyle</span>
					</button>
					<button
						className={`nav-item ${activeView === "chat" ? "active" : ""}`}
						onClick={() => setActiveView("chat")}>
						<MessageSquare size={20} />
						<span>Coach</span>
					</button>
				</nav>
			</div>
		</div>
	);
}

export default App;

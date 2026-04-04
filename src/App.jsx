import { useState } from "react";
import {
	Dumbbell,
	MessageSquare,
	Utensils,
	LineChart,
	LogOut,
	Watch,
	Sparkles,
	ScanBarcode,
	BookOpen,
	Footprints,
} from "lucide-react";
import { useAuth } from "./contexts/AuthContext";
import Dashboard from "./components/Dashboard";
import Chat from "./components/Chat";
import WorkoutGenerator from "./components/WorkoutGenerator";
import MealGenerator from "./components/MealGenerator";
import Wearables from "./components/Wearables";
import Login from "./components/Login";
import Signup from "./components/Signup";
import HabitTracker from "./components/HabitTracker";
import ExerciseLibrary from "./components/ExerciseLibrary";
import NexusFeed from "./components/NexusFeed";
import FoodLogger from "./components/FoodLogger";
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
			case "chat":
				return <Chat />;
			case "food":
				return <FoodLogger />;
			case "workout":
				return <WorkoutGenerator />;
			case "library":
				return <ExerciseLibrary />;
			case "nexus":
				return <NexusFeed />;
			case "meal":
				return <MealGenerator />;
			case "wearables":
				return <Wearables />;
			case "habits":
				return <HabitTracker />;
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
								AI Analytical Coach
							</span>
						</div>
					</div>
					<div className='header-user'>
						<div className='user-greeting hidden sm:flex'>
							<span className='greeting-text text-[10px] uppercase font-bold text-muted-foreground'>
								Uplink Established:
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
    className={`nav-item ${activeView === "meal" ? "active" : ""}`}
    onClick={() => setActiveView("meal")}>
    <Utensils size={20} />
    <span>Meal</span>
  </button>
					<button
						className={`nav-item ${activeView === "food" ? "active" : ""}`}
						onClick={() => setActiveView("food")}>
						<ScanBarcode size={20} />
						<span>Food</span>
					</button>
					<button
						className={`nav-item ${activeView === "library" ? "active" : ""}`}
						onClick={() => setActiveView("library")}>
						<BookOpen size={20} />
						<span>Library</span>
					</button>
					<button
						className={`nav-item ${activeView === "workout" ? "active" : ""}`}
						onClick={() => setActiveView("workout")}>
						<Dumbbell size={20} />
						<span>Execute</span>
					</button>
					<button
						className={`nav-item ${activeView === "nexus" ? "active" : ""}`}
						onClick={() => setActiveView("nexus")}>
						<Sparkles size={20} />
						<span>Nexus</span>
					</button>
					<button
						className={`nav-item ${activeView === "chat" ? "active" : ""}`}
						onClick={() => setActiveView("chat")}>
						<MessageSquare size={20} />
						<span>Nova</span>
					</button>
					<button
						className={`nav-item ${activeView === "wearables" ? "active" : ""}`}
						onClick={() => setActiveView("wearables")}>
						<Footprints size={20} />
						<span>Wearables</span>
					</button>
				</nav>
			</div>
		</div>
	);
}

export default App;

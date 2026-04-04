import { useState, useEffect } from "react";
import { Search, Info, Play, ChevronRight, Loader2, Dumbbell } from "lucide-react";
import "./Generator.css"; // Reuse generator styles for consistency

// Placeholder data for high-fidelity demonstration
const placeholderExercises = [
  {
    id: "0001",
    name: "Barbell Squat",
    target: "Quads",
    equipment: "Barbell",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6xYFmR0I/giphy.gif",
    instructions: ["Place barbell on traps", "Feet shoulder width apart", "Sit back into hips", "Drive through heels to stand"]
  },
  {
    id: "0002",
    name: "Dumbbell Bench Press",
    target: "Chest",
    equipment: "Dumbbells",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6xYFmR0I/giphy.gif",
    instructions: ["Lie flat on bench", "Press dumbbells upward", "Control the descent", "Keep elbows at 45 degrees"]
  },
  {
    id: "0003",
    name: "Deadlift",
    target: "Posterior Chain",
    equipment: "Barbell",
    gifUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJ4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxx6xYFmR0I/giphy.gif",
    instructions: ["Hinge at hips", "Grip bar just outside legs", "Keep back flat", "Pull weight up keeping bar close to shins"]
  }
];

const ExerciseLibrary = () => {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    // In a real scenario, this would fetch from ExerciseDB API
    const timer = setTimeout(() => {
      setExercises(placeholderExercises);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Dumbbell size={32} className="header-icon" />
        <div>
          <h2>Visual Logic Library</h2>
          <p className="generator-subtitle">High-fidelity form protocols and anatomical targeting.</p>
        </div>
      </div>

      <div className="search-bar-container" style={{ marginBottom: '2rem' }}>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search exercises (e.g. Squat, Chest)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] transition-all font-semibold text-white placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((ex) => (
            <div 
              key={ex.id} 
              className="bg-[#0A0907] border border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all group cursor-pointer"
              onClick={() => setSelectedExercise(ex)}
            >
              <div className="relative aspect-video rounded-2xl bg-black mb-4 overflow-hidden border border-white/5">
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <Play size={40} className="text-primary" />
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  {ex.target}
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1">{ex.name}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{ex.equipment}</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail Overlay */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0907] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
            <button 
              onClick={() => setSelectedExercise(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
                <Info size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter">{selectedExercise.name}</h2>
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">{selectedExercise.target} Protocol</p>
              </div>
            </div>

            <div className="aspect-video rounded-[2rem] bg-black mb-8 overflow-hidden border border-white/5 shadow-inner">
               <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-cover opacity-80" />
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={16} className="text-primary" />
                Execution Steps
              </h4>
              <ul className="space-y-4">
                {selectedExercise.instructions.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-white/5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;

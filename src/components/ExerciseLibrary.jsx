import { useState, useEffect, useCallback } from "react";
import { Search, Info, Play, ChevronRight, Loader2, Dumbbell } from "lucide-react";
import { fetchAllExercises, searchExercises } from "../services/exerciseService";
import "./Generator.css"; // Reuse generator styles for consistency

const ExerciseLibrary = () => {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllExercises(50);
      setExercises(data);
    } catch (error) {
      console.error("Error loading exercises:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);
    
    if (query.length > 2) {
      setLoading(true);
      try {
        const data = await searchExercises(query.toLowerCase());
        setExercises(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      loadExercises();
    }
  };

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Dumbbell size={32} className="header-icon" />
        <div>
          <h2>Visual Logic Library</h2>
          <p className="generator-subtitle">High-fidelity form protocols and anatomical targeting.</p>
        </div>
      </div>

      <div className="search-bar-container" style={{ marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
          <input
            type="text"
            placeholder="Search anatomical protocols (e.g. Squat, Chest, Quads)..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-8 focus:outline-none focus:border-primary/40 focus:bg-white/[0.05] focus:shadow-[0_0_30px_rgba(0,217,255,0.15)] transition-all font-bold text-white placeholder:text-muted-foreground/30 text-lg tracking-tight"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((ex) => (
            <div 
              key={ex.id} 
              className="bg-[#0A0907] border border-white/5 rounded-3xl p-6 hover:border-primary/20 transition-all group cursor-pointer"
              onClick={() => setSelectedExercise(ex)}
            >
              <div className="relative aspect-video rounded-2xl bg-black mb-4 overflow-hidden border border-white/5">
                <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <Play size={40} className="text-primary" />
                </div>
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  {ex.target}
                </div>
              </div>
              <h3 className="font-bold text-white text-lg mb-1 capitalize">{ex.name}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider capitalize">{ex.equipment}</p>
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
                <h2 className="text-2xl font-black text-white tracking-tighter capitalize">{selectedExercise.name}</h2>
                <p className="text-xs font-black text-primary uppercase tracking-[0.2em]">{selectedExercise.target} Protocol</p>
              </div>
            </div>

            <div className="aspect-video rounded-[2rem] bg-black mb-8 overflow-hidden border border-white/5 shadow-inner">
               <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={16} className="text-primary" />
                Execution Steps
              </h4>
              <ul className="space-y-4">
                {selectedExercise.instructions?.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-primary shrink-0 border border-white/5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">{step}</p>
                  </li>
                )) || <p className="text-sm text-muted-foreground italic">No specific instructions available for this protocol.</p>}
              </ul>
              
              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Primary Equipment</p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-white capitalize">
                  <Dumbbell size={12} className="text-primary" />
                  {selectedExercise.equipment}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;

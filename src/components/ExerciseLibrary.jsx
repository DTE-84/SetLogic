import { useState, useEffect, useCallback } from "react";
import { Search, Info, Play, ChevronRight, Loader2, Dumbbell } from "lucide-react";
import { fetchAllExercises, searchExercises } from "../services/exerciseService";
import "./Generator.css"; // Reuse generator styles for consistency

const ExerciseLibrary = () => {
  const [search, setSearch] = useState("");
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("EXERCISE UPLINK INITIATED...");
      const data = await fetchAllExercises(50);
      console.log("EXERCISE DATA RECEIVED:", data.length, "protocols");
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("EXERCISE UPLINK FAILED:", err);
      setError(`Telemetry Link Failure: ${err.message}`);
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
      setError(null);
      try {
        const data = await searchExercises(query.toLowerCase());
        setExercises(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Search query rejected by host.");
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

      <div className="search-bar-wrapper" style={{ 
        width: '100%', 
        maxWidth: '1200px', 
        margin: '0 auto 4rem',
        padding: '0 1rem'
      }}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
          </div>
          <input
            type="text"
            placeholder="Search anatomical protocols (e.g. Squat, Chest, Quads)..."
            value={search}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '2.5rem',
              padding: '1.5rem 1.5rem 1.5rem 4.5rem',
              outline: 'none',
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '700',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 217, 255, 0.4)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.target.style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.target.style.boxShadow = 'none';
            }}
            className="placeholder:text-muted-foreground/30 tracking-tight"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Synchronizing Visual Protocols...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
          <Info className="w-12 h-12 text-warning/40" />
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-2">{error}</p>
            <p className="text-muted-foreground text-sm max-w-md">The anatomical database is currently unresponsive. Verify RapidAPI credentials in system configuration.</p>
          </div>
          <button 
            onClick={loadExercises}
            className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Retry Uplink
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exercises.map((ex) => (
            <div 
              key={ex.id} 
              className="bg-[#0A0907] border border-white/5 rounded-[2.5rem] p-6 hover:border-primary/20 transition-all group cursor-pointer"
              onClick={() => setSelectedExercise(ex)}
            >
              <div className="relative aspect-video rounded-3xl bg-black mb-6 overflow-hidden border border-white/5">
                <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                   <Play size={40} className="text-primary" />
                </div>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                  {ex.target}
                </div>
              </div>
              <h3 className="font-bold text-white text-xl mb-2 capitalize tracking-tight">{ex.name}</h3>
              <div className="flex items-center gap-2">
                <Dumbbell size={14} className="text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider capitalize">{ex.equipment}</p>
              </div>
            </div>
          ))}
          {exercises.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No matching protocols found in database.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Overlay */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0907] border border-white/10 rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 relative shadow-2xl">
            <button 
              onClick={() => setSelectedExercise(null)}
              className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all text-xl"
            >
              ✕
            </button>
            <div className="flex items-center gap-5 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                <Info size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter capitalize leading-none">{selectedExercise.name}</h2>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">{selectedExercise.target} Protocol Established</p>
              </div>
            </div>

            <div className="aspect-video rounded-[2.5rem] bg-black mb-10 overflow-hidden border border-white/5 shadow-inner">
               <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                <ChevronRight size={18} className="text-primary" />
                Execution Steps
              </h4>
              <ul className="space-y-5">
                {selectedExercise.instructions?.map((step, i) => (
                  <li key={i} className="flex gap-5 items-start">
                    <span className="w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center text-[11px] font-black text-primary shrink-0 border border-white/5">
                      {i + 1}
                    </span>
                    <p className="text-base text-muted-foreground font-medium leading-relaxed">{step}</p>
                  </li>
                )) || <p className="text-sm text-muted-foreground italic">No specific instructions available for this protocol.</p>}
              </ul>
              
              <div className="pt-8 border-t border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Primary Equipment Signature</p>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-xs text-white capitalize font-bold">
                  <Dumbbell size={14} className="text-primary" />
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

import { useState, useEffect, useCallback } from "react";
import { Search, Info, Play, ChevronRight, Loader2, Dumbbell, Target } from "lucide-react";
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
      const data = await fetchAllExercises(50);
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
    <div className="generator-container" style={{ padding: '2rem' }}>
      {/* Header Section */}
      <div className="generator-header" style={{ marginBottom: '4rem', border: 'none' }}>
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(0,217,255,0.2)] mb-6">
          <Dumbbell size={32} className="text-primary" />
        </div>
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Visual Logic Library</h2>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mt-2">High-Fidelity Form Protocols</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section" style={{ marginBottom: '6rem', maxWidth: '900px' }}>
        <div className="relative group">
          <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
            <Search className="w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
          </div>
          <input
            type="text"
            placeholder="Search anatomical protocols (e.g. Chest, Quads, Squat)..."
            value={search}
            onChange={handleSearchChange}
            className="w-full bg-white/[0.03] border border-white/10 rounded-full py-6 pl-20 pr-8 outline-none text-xl font-bold text-white focus:border-primary/40 focus:bg-white/[0.05] transition-all tracking-tight shadow-2xl placeholder:text-muted-foreground/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Establishing Signal...</p>
        </div>
      ) : error ? (
        <div className="p-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
          <p className="text-white font-bold text-xl mb-4 uppercase">{error}</p>
          <button onClick={loadExercises} className="bg-primary text-black px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest">Retry Uplink</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {exercises.map((ex) => (
            <div 
              key={ex.id} 
              className="group bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 hover:border-primary/20 transition-all duration-500 h-full flex flex-col shadow-2xl cursor-pointer"
              onClick={() => setSelectedExercise(ex)}
            >
              {/* Image Box */}
              <div className="relative aspect-square rounded-[2rem] bg-black mb-8 overflow-hidden border border-white/5">
                <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                   <div className="w-16 h-16 rounded-full bg-primary/90 text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,217,255,0.5)]">
                     <Play size={28} fill="currentColor" className="ml-1" />
                   </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <div className="bg-primary/10 self-start px-4 py-1.5 rounded-full border border-primary/20 mb-4">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">{ex.target}</span>
                </div>
                
                <h3 className="text-2xl font-black text-white capitalize tracking-tighter leading-tight mb-6 group-hover:text-primary transition-colors">
                  {ex.name}
                </h3>
                
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-3">
                  <Dumbbell size={14} className="text-muted-foreground/40" />
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{ex.equipment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail View */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[4rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 relative shadow-[0_0_100px_rgba(0,0,0,0.9)]">
            <button onClick={() => setSelectedExercise(null)} className="absolute top-10 right-10 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all text-xl">✕</button>
            
            <div className="flex items-center gap-8 mb-12">
              <div className="w-20 h-20 rounded-[2rem] bg-primary/20 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(0,217,255,0.2)]">
                <Info size={40} className="text-primary" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white tracking-tighter capitalize leading-none mb-3">{selectedExercise.name}</h2>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{selectedExercise.target} Protocol</span>
                  <span className="text-white/10">/</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Hardware: {selectedExercise.equipment}</span>
                </div>
              </div>
            </div>

            <div className="aspect-video rounded-[3rem] bg-black mb-16 overflow-hidden border border-white/10 shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]">
               <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-12">
              <div className="flex items-center gap-6">
                <div className="h-px flex-1 bg-white/5"></div>
                <h4 className="text-xs font-black text-white uppercase tracking-[0.5em] shrink-0">Execution Logic</h4>
                <div className="h-px flex-1 bg-white/5"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {selectedExercise.instructions?.map((step, i) => (
                  <div key={i} className="flex gap-8 items-start bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center text-lg font-black shrink-0 shadow-[0_0_30px_rgba(0,217,255,0.3)]">
                      {i + 1}
                    </div>
                    <p className="text-xl text-muted-foreground font-medium leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;

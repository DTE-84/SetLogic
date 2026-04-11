import { useState, useEffect, useCallback } from 'react'
import { Search, Dumbbell, Loader2, X, ChevronRight } from 'lucide-react'
import { fetchAllExercises, searchExercises } from '../services/exerciseService'
import './Generator.css'

const MUSCLE_FILTERS = ['All', 'Abs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Legs', 'Cardio']

const PAGE_SIZE = 1000

const ExerciseLibrary = () => {
  const [search, setSearch] = useState('')
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const loadExercises = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Explicitly request full library (1300)
      const data = await fetchAllExercises(1300)
      let exercises = Array.isArray(data) ? data : []
      
      // Shuffle the exercises for better default variety
      exercises = exercises.sort(() => Math.random() - 0.5);
      
      console.log(`✅ SetLogic: Loaded ${exercises.length} exercises from telemetry.`);
      setExercises(exercises)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadExercises() }, [loadExercises])

  const handleSearch = async (e) => {
    const query = e.target.value
    setSearch(query)
    setVisibleCount(1000)
    if (query.length > 2) {
      setLoading(true)
      try {
        const data = await searchExercises(query.toLowerCase())
        setExercises(Array.isArray(data) ? data : [])
      } catch {
        setError('Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    } else if (query.length === 0) {
      loadExercises()
    }
  }

  const filtered = activeFilter === 'All'
    ? exercises
    : exercises.filter(ex => {
        const target = ex.target?.toLowerCase() || '';
        const bodyPart = ex.bodyPart?.toLowerCase() || '';
        const filter = activeFilter.toLowerCase();
        
        if (filter === 'abs') return target === 'abs' || bodyPart === 'waist';
        if (filter === 'arms') return bodyPart.includes('arms') || target.includes('biceps') || target.includes('triceps') || target.includes('forearms');
        if (filter === 'shoulders') return bodyPart.includes('shoulders') || target.includes('delts');
        if (filter === 'legs') return bodyPart.includes('legs') || target.includes('quads') || target.includes('glutes') || target.includes('hamstrings') || target.includes('calves');
        return target.includes(filter) || bodyPart.includes(filter);
      })

  const visible = filtered.slice(0, visibleCount)
  console.log(`🔍 SetLogic: Displaying ${visible.length} of ${filtered.length} filtered exercises (VisibleCount: ${visibleCount})`);

  return (
    <div className="generator-container">

      {/* Header */}
      <div className="generator-header">
        <Dumbbell color="#00d9ff" size={32} className="generator-icon" />
        <div>
          <h2>Exercise Library</h2>
          <p className="generator-subtitle">Browse and search {exercises.length}+ exercises with form guides</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="library-controls">
        <div className="library-search">
          <Search size={18} className="library-search-icon" />
          <input
            type="text"
            placeholder="Search by name, muscle, or equipment..."
            value={search}
            onChange={handleSearch}
            className="library-search-input"
          />
          {search && (
            <button className="library-search-clear" onClick={() => { setSearch(''); loadExercises() }}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="library-filters">
          {MUSCLE_FILTERS.map(f => (
            <button
              key={f}
              className={`library-filter-btn ${activeFilter === f ? 'active' : ''}`}
              onClick={() => { setActiveFilter(f); setVisibleCount(1000) }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="library-loading">
          <Loader2 size={32} className="library-spinner" />
          <p>Loading exercises...</p>
        </div>
      ) : error ? (
        <div className="library-error">
          <p>{error}</p>
          <button className="generate-btn" style={{ width: 'auto', marginTop: '1rem' }} onClick={loadExercises}>
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="library-empty">
          <Dumbbell size={40} />
          <p>No exercises found for "{search || activeFilter}"</p>
        </div>
      ) : (
        <>
          <p className="library-count">{filtered.length} exercises</p>
          <div className="library-grid">
            {visible.map(ex => (
              <div key={ex.id} className="exercise-card" onClick={() => setSelected(ex)}>
                <div className="exercise-card-image">
                  <div className="exercise-placeholder">
                    <Dumbbell size={32} className="exercise-placeholder-icon" />
                    <span className="exercise-placeholder-part">{ex.bodyPart}</span>
                  </div>
                </div>
                <div className="exercise-card-body">
                  <span className="exercise-tag">{ex.target}</span>
                  <h3 className="exercise-name">{ex.name}</h3>
                  <div className="exercise-meta">
                    <Dumbbell size={12} />
                    <span>{ex.equipment}</span>
                    <ChevronRight size={14} className="exercise-arrow" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <button
              className="library-load-more"
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            >
              Load more ({filtered.length - visibleCount} remaining)
            </button>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="exercise-modal-overlay" onClick={() => setSelected(null)}>
          <div className="exercise-modal" onClick={e => e.stopPropagation()}>
            <button className="exercise-modal-close" onClick={() => setSelected(null)}>
              <X size={20} />
            </button>

            <div className="exercise-modal-header">
              <span className="exercise-tag">{selected.target}</span>
              <h2>{selected.name}</h2>
              <p className="exercise-modal-meta">
                <Dumbbell size={14} />
                {selected.equipment} &nbsp;·&nbsp; {selected.bodyPart}
              </p>
            </div>

            <div className="exercise-modal-gif">
              <div className="exercise-placeholder exercise-placeholder-large">
                <Dumbbell size={48} className="exercise-placeholder-icon" />
                <span className="exercise-placeholder-part">{selected.bodyPart}</span>
                {selected.difficulty && <span className="exercise-difficulty-badge">{selected.difficulty}</span>}
              </div>
            </div>

            {selected.instructions?.length > 0 && (
              <div className="exercise-modal-instructions">
                <h4>Instructions</h4>
                <ol className="exercise-steps">
                  {selected.instructions.map((step, i) => (
                    <li key={i} className="exercise-step">
                      <span className="exercise-step-num">{i + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .library-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .library-search {
          position: relative;
          display: flex;
          align-items: center;
        }

        .library-search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .library-search-input {
          width: 100%;
          background: var(--surface);
          border: 1px solid var(--border-medium);
          border-radius: 8px;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .library-search-input:focus {
          outline: none;
          border-color: var(--blue-primary);
          box-shadow: 0 0 0 3px var(--gold-glow);
        }

        .library-search-input::placeholder {
          color: var(--text-quaternary);
        }

        .library-search-clear {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-tertiary);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .library-search-clear:hover { color: var(--text-primary); }

        .library-filters {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .library-filter-btn {
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          padding: 0.4rem 0.875rem;
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .library-filter-btn:hover {
          border-color: var(--border-medium);
          color: var(--text-primary);
        }

        .library-filter-btn.active {
          background: var(--blue-primary);
          border-color: var(--blue-primary);
          color: var(--background-primary);
        }

        .library-count {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.25rem;
        }

        .library-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .exercise-card {
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .exercise-card:hover {
          border-color: var(--blue-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        .exercise-card-image {
          aspect-ratio: 1;
          background: var(--background-secondary);
          overflow: hidden;
        }

        .exercise-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, var(--background-secondary), var(--surface));
        }

        .exercise-placeholder-large {
          min-height: 180px;
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          gap: 0.75rem;
        }

        .exercise-placeholder-icon {
          color: rgba(0, 217, 255, 0.3);
        }

        .exercise-placeholder-part {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
        }

        .exercise-difficulty-badge {
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--blue-primary);
          background: rgba(0, 217, 255, 0.08);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
        }

        .exercise-card-body {
          padding: 1rem 1.25rem 1.25rem;
        }

        .exercise-tag {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--blue-primary);
          background: rgba(0, 217, 255, 0.08);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          margin-bottom: 0.5rem;
        }

        .exercise-name {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          text-transform: capitalize;
          margin: 0 0 0.75rem;
          line-height: 1.3;
        }

        .exercise-meta {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          text-transform: capitalize;
        }

        .exercise-arrow {
          margin-left: auto;
          color: var(--border-medium);
          transition: color 0.2s, transform 0.2s;
        }

        .exercise-card:hover .exercise-arrow {
          color: var(--blue-primary);
          transform: translateX(2px);
        }

        .library-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 6rem 0;
          color: var(--text-tertiary);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .library-spinner {
          color: var(--blue-primary);
          animation: spin 1s linear infinite;
        }

        .library-error, .library-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 4rem;
          text-align: center;
          border: 1px dashed var(--border-subtle);
          border-radius: 12px;
          color: var(--text-tertiary);
        }

        .exercise-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: fadeInUp 0.2s ease-out;
        }

        .exercise-modal {
          background: var(--surface);
          border: 1px solid var(--border-medium);
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 2rem;
        }

        .exercise-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: var(--background-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .exercise-modal-close:hover {
          border-color: var(--border-medium);
          color: var(--text-primary);
        }

        .exercise-modal-header {
          margin-bottom: 1.5rem;
          padding-right: 3rem;
        }

        .exercise-modal-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text-primary);
          text-transform: capitalize;
          margin: 0.5rem 0 0.5rem;
          line-height: 1.2;
        }

        .exercise-modal-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-tertiary);
          text-transform: capitalize;
          margin: 0;
        }

        .exercise-modal-gif {
          background: var(--background-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .exercise-modal-gif img {
          max-height: 320px;
          object-fit: contain;
        }

        .exercise-modal-instructions h4 {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          margin: 0 0 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .exercise-steps {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .exercise-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          background: var(--background-secondary);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          padding: 0.875rem 1rem;
        }

        .exercise-step-num {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--blue-primary);
          color: var(--background-primary);
          font-size: 0.8rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .exercise-step p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          padding-top: 0.2rem;
        }

        @media (max-width: 768px) {
          .library-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 1rem;
          }
          .exercise-modal { padding: 1.5rem; }
          .exercise-modal-header h2 { font-size: 1.4rem; }
        }

        .library-load-more {
          display: block;
          width: 100%;
          margin-top: 1.5rem;
          padding: 0.875rem;
          background: var(--surface);
          border: 1px solid rgba(0, 217, 255, 0.25);
          border-radius: 8px;
          color: var(--blue-primary);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s;
        }

        .library-load-more:hover {
          background: rgba(0, 217, 255, 0.06);
          border-color: rgba(0, 217, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

export default ExerciseLibrary

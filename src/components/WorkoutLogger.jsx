import { useState, useEffect, useCallback } from 'react'
import { Dumbbell, Plus, Trash2, Save, Loader2, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { saveWorkout, getWorkouts, deleteWorkout } from '../services/firestoreService'
import './WorkoutLogger.css'

let uid = 0
const nextId = () => `row-${Date.now()}-${uid++}`

function WorkoutLogger() {
  const { currentUser } = useAuth()
  const [exercises, setExercises] = useState([])
  const [newExerciseName, setNewExerciseName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadHistory = useCallback(async () => {
    if (!currentUser) return
    setHistoryLoading(true)
    try {
      const workouts = await getWorkouts(currentUser.uid, 20)
      setHistory(workouts)
    } catch (err) {
      console.error('Failed to load workout history:', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [currentUser])

  useEffect(() => { loadHistory() }, [loadHistory])

  const addExercise = () => {
    const name = newExerciseName.trim()
    if (!name) return
    setExercises(prev => [
      ...prev,
      { id: nextId(), name, sets: [{ id: nextId(), weight: '', reps: '' }] }
    ])
    setNewExerciseName('')
  }

  const handleNewExerciseKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addExercise()
    }
  }

  const removeExercise = (exerciseId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId))
  }

  const addSet = (exerciseId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      const lastSet = ex.sets[ex.sets.length - 1]
      return {
        ...ex,
        sets: [...ex.sets, { id: nextId(), weight: lastSet?.weight || '', reps: lastSet?.reps || '' }]
      }
    }))
  }

  const removeSet = (exerciseId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
    }))
  }

  const updateSet = (exerciseId, setId, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
      }
    }))
  }

  const resetSession = () => {
    setExercises([])
    setNewExerciseName('')
  }

  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess(false)

    const cleanedExercises = exercises
      .map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(s => s.reps !== '' && !isNaN(parseInt(s.reps, 10)))
          .map(s => ({
            weight: s.weight === '' ? 0 : parseFloat(s.weight) || 0,
            reps: parseInt(s.reps, 10) || 0
          }))
      }))
      .filter(ex => ex.sets.length > 0)

    if (cleanedExercises.length === 0) {
      setSaveError('Add at least one exercise with a rep count before saving.')
      return
    }

    const totalSets = cleanedExercises.reduce((acc, ex) => acc + ex.sets.length, 0)

    setSaving(true)
    try {
      await saveWorkout(currentUser.uid, {
        type: 'Logged Workout',
        date: new Date().toISOString().split('T')[0],
        exercises: cleanedExercises,
        sets: totalSets,
        status: 'completed'
      })
      setSaveSuccess(true)
      resetSession()
      await loadHistory()
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to save workout:', err)
      setSaveError('Failed to save workout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (workoutId) => {
    setDeletingId(workoutId)
    try {
      await deleteWorkout(currentUser.uid, workoutId)
      setHistory(prev => prev.filter(w => w.id !== workoutId))
      if (expandedId === workoutId) setExpandedId(null)
    } catch (err) {
      console.error('Failed to delete workout:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (workout) => {
    const d = workout.createdAt?.toDate?.() || (workout.date ? new Date(workout.date) : new Date())
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="logger-container">
      <div className="generator-header">
        <Dumbbell color="#00d9ff" size={32} className="generator-icon" />
        <div>
          <h2>Log Workout</h2>
          <p className="generator-subtitle">Record today's exercises, sets, and reps</p>
        </div>
      </div>

      <div className="logger-add-row">
        <input
          type="text"
          className="logger-add-input"
          placeholder="Exercise name, e.g. Bench Press"
          value={newExerciseName}
          onChange={e => setNewExerciseName(e.target.value)}
          onKeyDown={handleNewExerciseKeyDown}
        />
        <button className="logger-add-btn" onClick={addExercise} disabled={!newExerciseName.trim()}>
          <Plus size={18} />
          Add Exercise
        </button>
      </div>

      {exercises.length === 0 ? (
        <div className="logger-empty">
          <Dumbbell size={36} />
          <p>No exercises added yet. Add one above to start logging.</p>
        </div>
      ) : (
        <div className="logger-exercise-list">
          {exercises.map(ex => (
            <div key={ex.id} className="logger-exercise-card">
              <div className="logger-exercise-header">
                <h3>{ex.name}</h3>
                <button className="logger-icon-btn danger" onClick={() => removeExercise(ex.id)} title="Remove exercise">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="logger-sets">
                <div className="logger-set-row logger-set-labels">
                  <span>Set</span>
                  <span>Weight</span>
                  <span>Reps</span>
                  <span></span>
                </div>
                {ex.sets.map((set, idx) => (
                  <div key={set.id} className="logger-set-row">
                    <span className="logger-set-num">{idx + 1}</span>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="lb/kg"
                      value={set.weight}
                      onChange={e => updateSet(ex.id, set.id, 'weight', e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="reps"
                      value={set.reps}
                      onChange={e => updateSet(ex.id, set.id, 'reps', e.target.value)}
                    />
                    <button
                      className="logger-icon-btn"
                      onClick={() => removeSet(ex.id, set.id)}
                      disabled={ex.sets.length === 1}
                      title="Remove set"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="logger-add-set-btn" onClick={() => addSet(ex.id)}>
                <Plus size={14} />
                Add Set
              </button>
            </div>
          ))}
        </div>
      )}

      {saveError && <div className="logger-message error">{saveError}</div>}
      {saveSuccess && <div className="logger-message success">Workout saved.</div>}

      <button className="generate-btn" onClick={handleSave} disabled={saving || exercises.length === 0}>
        {saving ? (
          <><Loader2 size={20} className="spinner" /> Saving...</>
        ) : (
          <><Save size={20} /> Save Workout</>
        )}
      </button>

      <div className="logger-history">
        <h3 className="logger-history-title"><Calendar size={18} /> Recent Workouts</h3>

        {historyLoading ? (
          <div className="logger-empty">
            <Loader2 size={28} className="spinner" />
            <p>Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="logger-empty">
            <p>No workouts logged yet.</p>
          </div>
        ) : (
          <div className="logger-history-list">
            {history.map(w => {
              const isExpanded = expandedId === w.id
              const hasExercises = Array.isArray(w.exercises) && w.exercises.length > 0
              return (
                <div key={w.id} className="logger-history-card">
                  <button
                    className="logger-history-summary"
                    onClick={() => setExpandedId(isExpanded ? null : w.id)}
                    disabled={!hasExercises}
                  >
                    <div>
                      <span className="logger-history-date">{formatDate(w)}</span>
                      <span className="logger-history-meta">
                        {w.type === 'Manual Log' ? 'Manual Log' : (hasExercises ? `${w.exercises.length} exercise${w.exercises.length === 1 ? '' : 's'}` : 'Logged Workout')}
                        {' · '}{w.sets || 0} sets
                      </span>
                    </div>
                    <div className="logger-history-actions">
                      <button
                        className="logger-icon-btn danger"
                        onClick={(e) => { e.stopPropagation(); handleDelete(w.id) }}
                        disabled={deletingId === w.id}
                        title="Delete workout"
                      >
                        {deletingId === w.id ? <Loader2 size={16} className="spinner" /> : <Trash2 size={16} />}
                      </button>
                      {hasExercises && (isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                    </div>
                  </button>

                  {isExpanded && hasExercises && (
                    <div className="logger-history-detail">
                      {w.exercises.map((ex, i) => (
                        <div key={i} className="logger-history-exercise">
                          <span className="logger-history-exercise-name">{ex.name}</span>
                          <span className="logger-history-exercise-sets">
                            {ex.sets.map(s => `${s.weight || 0}×${s.reps}`).join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutLogger

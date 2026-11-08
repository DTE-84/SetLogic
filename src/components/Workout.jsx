import { useState } from 'react'
import { ListChecks, Sparkles, BookOpen } from 'lucide-react'
import WorkoutLogger from './WorkoutLogger'
import WorkoutGenerator from './WorkoutGenerator'
import ExerciseLibrary from './ExerciseLibrary'
import './WorkoutLogger.css'
import './PillarTabs.css'

function Workout() {
  const [tab, setTab] = useState('log')

  return (
    <div>
      <div className="pillar-subtabs">
        <button
          className={`pillar-subtab ${tab === 'log' ? 'active' : ''}`}
          onClick={() => setTab('log')}
        >
          <ListChecks size={16} />
          Log Workout
        </button>
        <button
          className={`pillar-subtab ${tab === 'generate' ? 'active' : ''}`}
          onClick={() => setTab('generate')}
        >
          <Sparkles size={16} />
          AI Plan
        </button>
        <button
          className={`pillar-subtab ${tab === 'library' ? 'active' : ''}`}
          onClick={() => setTab('library')}
        >
          <BookOpen size={16} />
          Library
        </button>
      </div>

      {tab === 'log' && <WorkoutLogger />}
      {tab === 'generate' && <WorkoutGenerator />}
      {tab === 'library' && <ExerciseLibrary />}
    </div>
  )
}

export default Workout

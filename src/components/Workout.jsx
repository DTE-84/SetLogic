import { useState } from 'react'
import { ListChecks, Sparkles } from 'lucide-react'
import WorkoutLogger from './WorkoutLogger'
import WorkoutGenerator from './WorkoutGenerator'
import './WorkoutLogger.css'

function Workout() {
  const [tab, setTab] = useState('log')

  return (
    <div>
      <div className="workout-subtabs">
        <button
          className={`workout-subtab ${tab === 'log' ? 'active' : ''}`}
          onClick={() => setTab('log')}
        >
          <ListChecks size={16} />
          Log Workout
        </button>
        <button
          className={`workout-subtab ${tab === 'generate' ? 'active' : ''}`}
          onClick={() => setTab('generate')}
        >
          <Sparkles size={16} />
          AI Plan
        </button>
      </div>

      {tab === 'log' ? <WorkoutLogger /> : <WorkoutGenerator />}
    </div>
  )
}

export default Workout

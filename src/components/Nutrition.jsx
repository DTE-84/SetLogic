import { useState } from 'react'
import { ListChecks, Sparkles } from 'lucide-react'
import FoodLogger from './FoodLogger'
import MealGenerator from './MealGenerator'
import './PillarTabs.css'

function Nutrition() {
  const [tab, setTab] = useState('log')

  return (
    <div>
      <div className="pillar-subtabs">
        <button
          className={`pillar-subtab ${tab === 'log' ? 'active' : ''}`}
          onClick={() => setTab('log')}
        >
          <ListChecks size={16} />
          Log Food
        </button>
        <button
          className={`pillar-subtab ${tab === 'generate' ? 'active' : ''}`}
          onClick={() => setTab('generate')}
        >
          <Sparkles size={16} />
          AI Plan
        </button>
      </div>

      {tab === 'log' && <FoodLogger />}
      {tab === 'generate' && <MealGenerator />}
    </div>
  )
}

export default Nutrition

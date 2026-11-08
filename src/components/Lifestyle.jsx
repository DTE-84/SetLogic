import { useState } from 'react'
import { Footprints, Target, Sparkles } from 'lucide-react'
import Wearables from './Wearables'
import HabitTracker from './HabitTracker'
import NexusFeed from './NexusFeed'
import './PillarTabs.css'

function Lifestyle() {
  const [tab, setTab] = useState('wearables')

  return (
    <div>
      <div className="pillar-subtabs">
        <button
          className={`pillar-subtab ${tab === 'wearables' ? 'active' : ''}`}
          onClick={() => setTab('wearables')}
        >
          <Footprints size={16} />
          Wearables
        </button>
        <button
          className={`pillar-subtab ${tab === 'habits' ? 'active' : ''}`}
          onClick={() => setTab('habits')}
        >
          <Target size={16} />
          Habits
        </button>
        <button
          className={`pillar-subtab ${tab === 'feed' ? 'active' : ''}`}
          onClick={() => setTab('feed')}
        >
          <Sparkles size={16} />
          Feed
        </button>
      </div>

      {tab === 'wearables' && <Wearables />}
      {tab === 'habits' && <HabitTracker />}
      {tab === 'feed' && <NexusFeed />}
    </div>
  )
}

export default Lifestyle

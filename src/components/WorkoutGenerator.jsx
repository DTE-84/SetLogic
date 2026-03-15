import { useState } from 'react'
import { Dumbbell, Loader, CheckCircle } from 'lucide-react'
import { generateWorkoutPlan } from '../services/claudeAPI'
import './Generator.css'

function WorkoutGenerator() {
  const [formData, setFormData] = useState({
    goals: '',
    experience: 'intermediate',
    equipment: '',
    frequency: '4',
    duration: '60',
    notes: ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [plan, setPlan] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setPlan(null)

    try {
      const result = await generateWorkoutPlan(formData)
      setPlan(result)
    } catch (error) {
      setPlan('Error generating workout plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Dumbbell size={32} className="generator-icon" />
        <div>
          <h2>AI Workout Plan Generator</h2>
          <p className="generator-subtitle">Get a personalized training program in seconds</p>
        </div>
      </div>

      <div className="generator-content">
        <div className="generator-form">
          <div className="form-group">
            <label>Primary Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleChange}
              placeholder="E.g., Build muscle, lose fat, increase strength, improve endurance..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Experience Level</label>
              <select name="experience" value={formData.experience} onChange={handleChange}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label>Days Per Week</label>
              <select name="frequency" value={formData.frequency} onChange={handleChange}>
                <option value="2">2 days</option>
                <option value="3">3 days</option>
                <option value="4">4 days</option>
                <option value="5">5 days</option>
                <option value="6">6 days</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Available Equipment</label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleChange}
              placeholder="E.g., Barbell, dumbbells, machines, bodyweight only..."
            />
          </div>

          <div className="form-group">
            <label>Session Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="30"
              max="120"
            />
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Injuries, preferences, specific exercises to include/avoid..."
              rows={2}
            />
          </div>

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !formData.goals || !formData.equipment}
          >
            {isGenerating ? (
              <>
                <Loader size={20} className="spinner" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Generate Workout Plan
              </>
            )}
          </button>
        </div>

        {plan && (
          <div className="generator-result">
            <div className="result-header">
              <CheckCircle size={24} className="success-icon" />
              <h3>Your Personalized Workout Plan</h3>
            </div>
            <div className="result-content">
              <pre>{plan}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WorkoutGenerator

import { useState } from 'react'
import { Utensils, Loader, CheckCircle } from 'lucide-react'
import { generateMealPlan } from '../services/claudeAPI'
import './Generator.css'

function MealGenerator() {
  const [formData, setFormData] = useState({
    goal: 'muscle_gain',
    weight: '',
    calories: '',
    protein: '',
    diet: 'flexible',
    meals: '4',
    allergies: '',
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
      const result = await generateMealPlan(formData)
      setPlan(result)
    } catch (error) {
      setPlan('Error generating meal plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Utensils size={32} className="generator-icon" />
        <div>
          <h2>AI Meal Plan Generator</h2>
          <p className="generator-subtitle">Get a personalized nutrition plan tailored to your goals</p>
        </div>
      </div>

      <div className="generator-content">
        <div className="generator-form">
          <div className="form-row">
            <div className="form-group">
              <label>Primary Goal</label>
              <select name="goal" value={formData.goal} onChange={handleChange}>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="maintenance">Maintenance</option>
                <option value="performance">Athletic Performance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Current Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="75"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Target Calories (kcal/day)</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleChange}
                placeholder="2400"
              />
            </div>

            <div className="form-group">
              <label>Protein Target (grams)</label>
              <input
                type="number"
                name="protein"
                value={formData.protein}
                onChange={handleChange}
                placeholder="180"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dietary Preference</label>
              <select name="diet" value={formData.diet} onChange={handleChange}>
                <option value="flexible">Flexible (All Foods)</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="paleo">Paleo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Meals Per Day</label>
              <select name="meals" value={formData.meals} onChange={handleChange}>
                <option value="3">3 meals</option>
                <option value="4">4 meals</option>
                <option value="5">5 meals</option>
                <option value="6">6 meals</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Allergies / Restrictions (Optional)</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="E.g., Dairy, gluten, shellfish..."
            />
          </div>

          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Preferences, cooking restrictions, meal timing..."
              rows={2}
            />
          </div>

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !formData.weight || !formData.calories || !formData.protein}
          >
            {isGenerating ? (
              <>
                <Loader size={20} className="spinner" />
                Generating Your Plan...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Generate Meal Plan
              </>
            )}
          </button>
        </div>

        {plan && (
          <div className="generator-result">
            <div className="result-header">
              <CheckCircle size={24} className="success-icon" />
              <h3>Your Personalized Meal Plan</h3>
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

export default MealGenerator

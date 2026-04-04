import { useState } from 'react'
import { Utensils, Loader, CheckCircle, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react'
import { generateMealPlan } from '../services/claudeAPI'
import './Generator.css'

function MealGenerator() {
  const [formData, setFormData] = useState({
    // CRITICAL SAFETY
    medical_conditions: [],
    medications: '',
    allergies: '',
    pregnancy_breastfeeding: 'none',
    
    // GOALS
    primary_goal: 'muscle_gain',
    timeline: 'moderate',
    activity_level: 'moderate',
    training_days_per_week: '4',
    
    // BIOMETRICS
    weight: '',
    height: '',
    age: '',
    sex: 'male',
    
    // NUTRITION TARGETS
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    
    // DIETARY FRAMEWORK
    diet_type: 'flexible',
    cultural_restrictions: '',
    food_preferences: '',
    cooking_ability: 'intermediate',
    
    // MICRONUTRIENTS
    known_deficiencies: '',
    current_supplements: '',
    
    // LIFESTYLE
    budget: 'moderate',
    meals_per_day: '4',
    meal_prep_time: 'moderate',
    eating_out_frequency: 'occasional'
  })

  const [expandedSections, setExpandedSections] = useState({
    safety: true,
    goals: false,
    biometrics: false,
    nutrition: false,
    dietary: false,
    micros: false,
    lifestyle: false
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [plan, setPlan] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      // Handle checkbox arrays (medical conditions)
      const currentValues = formData[name] || []
      setFormData({
        ...formData,
        [name]: checked 
          ? [...currentValues, value]
          : currentValues.filter(v => v !== value)
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    })
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setPlan(null)

    try {
      const result = await generateMealPlan(formData)
      setPlan(result)
    } catch {
      setPlan('Error generating meal plan. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const medicalConditionOptions = [
    'Type 1 Diabetes',
    'Type 2 Diabetes',
    'Kidney Disease',
    'Heart Disease',
    'High Blood Pressure',
    'High Cholesterol',
    'PCOS',
    'Thyroid Issues',
    'IBS/Crohn\'s/Celiac',
    'Cancer (current/recent)',
    'Anemia',
    'Osteoporosis'
  ]

  return (
    <div className="generator-container">
      <div className="generator-header">
        <Utensils size={32} className="generator-icon" />
        <div>
          <h2>Medical-Grade Nutrition Planning</h2>
          <p className="generator-subtitle">
            Comprehensive meal planning with medical contraindication checking and micronutrient optimization
          </p>
        </div>
      </div>

      <div className="generator-content">
        <div className="generator-form">
          
          {/* CRITICAL SAFETY SECTION */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('safety')}>
              <div className="section-title">
                <AlertTriangle size={20} className="section-icon critical" />
                <h3>Critical Safety Information</h3>
                <span className="required-badge">REQUIRED</span>
              </div>
              {expandedSections.safety ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.safety && (
              <div className="section-content">
                <div className="form-group">
                  <label>Medical Conditions (Select all that apply)</label>
                  <div className="checkbox-grid">
                    {medicalConditionOptions.map(condition => (
                      <label key={condition} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="medical_conditions"
                          value={condition}
                          checked={formData.medical_conditions.includes(condition)}
                          onChange={handleChange}
                        />
                        <span>{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Current Medications</label>
                  <input
                    type="text"
                    name="medications"
                    value={formData.medications}
                    onChange={handleChange}
                    placeholder="e.g., Metformin, Lisinopril, Levothyroxine..."
                  />
                  <small className="field-hint">Important for nutrient-drug interactions (e.g., grapefruit + statins)</small>
                </div>

                <div className="form-group">
                  <label>Food Allergies (Severe reactions only)</label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g., Shellfish, peanuts, tree nuts..."
                  />
                  <small className="field-hint">List only true allergies, not preferences or intolerances</small>
                </div>

                <div className="form-group">
                  <label>Pregnancy / Breastfeeding Status</label>
                  <select name="pregnancy_breastfeeding" value={formData.pregnancy_breastfeeding} onChange={handleChange}>
                    <option value="none">Not Applicable</option>
                    <option value="pregnant_1st">Pregnant - 1st Trimester</option>
                    <option value="pregnant_2nd">Pregnant - 2nd Trimester</option>
                    <option value="pregnant_3rd">Pregnant - 3rd Trimester</option>
                    <option value="breastfeeding">Breastfeeding</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* GOALS SECTION */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('goals')}>
              <div className="section-title">
                <h3>Goals & Activity</h3>
              </div>
              {expandedSections.goals ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.goals && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Primary Goal</label>
                    <select name="primary_goal" value={formData.primary_goal} onChange={handleChange}>
                      <option value="fat_loss">Fat Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="performance">Athletic Performance</option>
                      <option value="health">Health / Longevity</option>
                      <option value="disease_management">Disease Management</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Timeline</label>
                    <select name="timeline" value={formData.timeline} onChange={handleChange}>
                      <option value="aggressive">Aggressive (Fast results, harder adherence)</option>
                      <option value="moderate">Moderate (Balanced approach)</option>
                      <option value="slow">Slow & Steady (Easy adherence, sustainable)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Activity Level</label>
                    <select name="activity_level" value={formData.activity_level} onChange={handleChange}>
                      <option value="sedentary">Sedentary (Desk job, minimal activity)</option>
                      <option value="light">Light (1-3 days/week exercise)</option>
                      <option value="moderate">Moderate (4-5 days/week exercise)</option>
                      <option value="very_active">Very Active (6-7 days/week intense training)</option>
                      <option value="athlete">Competitive Athlete</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Training Days Per Week</label>
                    <select name="training_days_per_week" value={formData.training_days_per_week} onChange={handleChange}>
                      <option value="0">0 (Rest/Recovery focus)</option>
                      <option value="2">2 days</option>
                      <option value="3">3 days</option>
                      <option value="4">4 days</option>
                      <option value="5">5 days</option>
                      <option value="6">6 days</option>
                      <option value="7">7 days (Advanced)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* BIOMETRICS SECTION */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('biometrics')}>
              <div className="section-title">
                <h3>Biometrics</h3>
                <span className="required-badge">REQUIRED</span>
              </div>
              {expandedSections.biometrics ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.biometrics && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Weight (lbs)</label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="185"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Height (inches)</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="70"
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="30"
                    />
                  </div>

                  <div className="form-group">
                    <label>Sex</label>
                    <select name="sex" value={formData.sex} onChange={handleChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* NUTRITION TARGETS (Optional - AI will calculate if left blank) */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('nutrition')}>
              <div className="section-title">
                <h3>Nutrition Targets (Optional)</h3>
              </div>
              {expandedSections.nutrition ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.nutrition && (
              <div className="section-content">
                <small className="section-hint">Leave blank to have AI calculate optimal macros based on your goals</small>
                <div className="form-row">
                  <div className="form-group">
                    <label>Calories (kcal/day)</label>
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleChange}
                      placeholder="Auto-calculate"
                    />
                  </div>

                  <div className="form-group">
                    <label>Protein (g)</label>
                    <input
                      type="number"
                      name="protein"
                      value={formData.protein}
                      onChange={handleChange}
                      placeholder="Auto-calculate"
                    />
                  </div>

                  <div className="form-group">
                    <label>Carbs (g)</label>
                    <input
                      type="number"
                      name="carbs"
                      value={formData.carbs}
                      onChange={handleChange}
                      placeholder="Auto-calculate"
                    />
                  </div>

                  <div className="form-group">
                    <label>Fat (g)</label>
                    <input
                      type="number"
                      name="fat"
                      value={formData.fat}
                      onChange={handleChange}
                      placeholder="Auto-calculate"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DIETARY FRAMEWORK */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('dietary')}>
              <div className="section-title">
                <h3>Dietary Preferences</h3>
              </div>
              {expandedSections.dietary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.dietary && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Diet Type</label>
                    <select name="diet_type" value={formData.diet_type} onChange={handleChange}>
                      <option value="flexible">Flexible (All Foods)</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Ketogenic</option>
                      <option value="paleo">Paleo</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="carnivore">Carnivore</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Cooking Ability</label>
                    <select name="cooking_ability" value={formData.cooking_ability} onChange={handleChange}>
                      <option value="beginner">Beginner (Microwave, basic prep)</option>
                      <option value="intermediate">Intermediate (Can follow recipes)</option>
                      <option value="advanced">Advanced (Comfortable with complex cooking)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Cultural / Religious Restrictions</label>
                  <input
                    type="text"
                    name="cultural_restrictions"
                    value={formData.cultural_restrictions}
                    onChange={handleChange}
                    placeholder="e.g., Kosher, Halal, No pork, No beef..."
                  />
                </div>

                <div className="form-group">
                  <label>Food Preferences (What you actually like eating)</label>
                  <textarea
                    name="food_preferences"
                    value={formData.food_preferences}
                    onChange={handleChange}
                    placeholder="e.g., Love: Chicken, rice, eggs, Greek yogurt. Hate: Fish, broccoli, protein shakes..."
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* MICRONUTRIENTS */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('micros')}>
              <div className="section-title">
                <h3>Micronutrient Intelligence</h3>
              </div>
              {expandedSections.micros ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.micros && (
              <div className="section-content">
                <div className="form-group">
                  <label>Known Deficiencies</label>
                  <input
                    type="text"
                    name="known_deficiencies"
                    value={formData.known_deficiencies}
                    onChange={handleChange}
                    placeholder="e.g., Vitamin D, B12, Iron, Magnesium..."
                  />
                  <small className="field-hint">From recent blood work or doctor diagnosis</small>
                </div>

                <div className="form-group">
                  <label>Current Supplements</label>
                  <textarea
                    name="current_supplements"
                    value={formData.current_supplements}
                    onChange={handleChange}
                    placeholder="e.g., Multivitamin, Creatine 5g, Vitamin D 5000IU, Fish Oil 2g..."
                    rows={2}
                  />
                  <small className="field-hint">Include doses to check for redundancy/toxicity</small>
                </div>
              </div>
            )}
          </div>

          {/* LIFESTYLE */}
          <div className="form-section">
            <div className="section-header" onClick={() => toggleSection('lifestyle')}>
              <div className="section-title">
                <h3>Lifestyle Factors</h3>
              </div>
              {expandedSections.lifestyle ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </div>
            
            {expandedSections.lifestyle && (
              <div className="section-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Budget</label>
                    <select name="budget" value={formData.budget} onChange={handleChange}>
                      <option value="tight">Tight ($50-75/week)</option>
                      <option value="moderate">Moderate ($75-150/week)</option>
                      <option value="flexible">Flexible ($150+/week)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Meals Per Day</label>
                    <select name="meals_per_day" value={formData.meals_per_day} onChange={handleChange}>
                      <option value="2">2 meals (OMAD / IF)</option>
                      <option value="3">3 meals</option>
                      <option value="4">4 meals</option>
                      <option value="5">5 meals</option>
                      <option value="6">6 meals</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Meal Prep Time Available</label>
                    <select name="meal_prep_time" value={formData.meal_prep_time} onChange={handleChange}>
                      <option value="minimal">Minimal (15 min/day)</option>
                      <option value="moderate">Moderate (30-45 min/day)</option>
                      <option value="extensive">Extensive (1+ hour/day, batch cooking)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Eating Out Frequency</label>
                    <select name="eating_out_frequency" value={formData.eating_out_frequency} onChange={handleChange}>
                      <option value="never">Never / Rare</option>
                      <option value="occasional">Occasional (1-2x/week)</option>
                      <option value="frequent">Frequent (3-5x/week)</option>
                      <option value="daily">Daily</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !formData.weight}
          >
            {isGenerating ? (
              <>
                <Loader size={20} className="spinner" />
                Generating Medical-Grade Plan...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Generate Comprehensive Meal Plan
              </>
            )}
          </button>
        </div>

        {plan && (
          <div className="generator-result">
            <div className="result-header">
              <CheckCircle size={24} className="success-icon" />
              <h3>Your Personalized Nutrition Protocol</h3>
            </div>
            <div className="result-content">
              <pre>{plan}</pre>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .form-section {
          background: var(--surface);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .section-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s;
          user-select: none;
        }

        .section-header:hover {
          background: var(--surface-elevated);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-title h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .section-icon {
          color: var(--text-secondary);
        }

        .section-icon.critical {
          color: #FF6B35;
        }

        .required-badge {
          font-size: 0.7rem;
          font-weight: 800;
          background: #FF6B35;
          color: #fff;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .section-content {
          padding: 0 1.5rem 1.5rem;
          animation: slideDown 0.2s ease-out;
        }

        .section-hint {
          display: block;
          color: var(--text-tertiary);
          font-size: 0.875rem;
          margin-bottom: 1rem;
          font-style: italic;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .checkbox-label:hover {
          background: var(--surface-elevated);
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .field-hint {
          display: block;
          color: var(--text-tertiary);
          font-size: 0.8rem;
          margin-top: 0.25rem;
          font-style: italic;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default MealGenerator
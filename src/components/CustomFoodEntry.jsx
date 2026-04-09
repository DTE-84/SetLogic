import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const CustomFoodEntry = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    serving_size: '',
    serving_unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    sugar: '',
    sodium: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Food name is required';
    }
    
    if (!formData.calories || parseFloat(formData.calories) < 0) {
      newErrors.calories = 'Valid calories required';
    }
    
    if (!formData.protein || parseFloat(formData.protein) < 0) {
      newErrors.protein = 'Valid protein amount required';
    }
    
    if (!formData.carbs || parseFloat(formData.carbs) < 0) {
      newErrors.carbs = 'Valid carbs amount required';
    }
    
    if (!formData.fat || parseFloat(formData.fat) < 0) {
      newErrors.fat = 'Valid fat amount required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const foodData = {
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      serving_size: formData.serving_size,
      serving_unit: formData.serving_unit,
      calories: parseFloat(formData.calories),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat),
      fiber: formData.fiber ? parseFloat(formData.fiber) : 0,
      sugar: formData.sugar ? parseFloat(formData.sugar) : 0,
      sodium: formData.sodium ? parseFloat(formData.sodium) : 0,
    };

    onSave(foodData);
  };

  return (
    <div className="custom-food-overlay">
      <div className="custom-food-modal">
        <div className="modal-header">
          <h3>Add Custom Food</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-food-form">
          {/* Basic Info */}
          <div className="form-section">
            <h4 className="section-title">Basic Information</h4>
            
            <div className="form-group">
              <label htmlFor="name">Food Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Chicken Breast, Grilled"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand (optional)</label>
              <input
                id="brand"
                type="text"
                placeholder="e.g., Tyson, Perdue"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="serving_size">Serving Size</label>
                <input
                  id="serving_size"
                  type="text"
                  placeholder="e.g., 8, 1, 100"
                  value={formData.serving_size}
                  onChange={(e) => handleChange('serving_size', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="serving_unit">Unit</label>
                <select
                  id="serving_unit"
                  value={formData.serving_unit}
                  onChange={(e) => handleChange('serving_unit', e.target.value)}
                >
                  <option value="g">grams (g)</option>
                  <option value="oz">ounces (oz)</option>
                  <option value="lb">pounds (lb)</option>
                  <option value="ml">milliliters (ml)</option>
                  <option value="cup">cup</option>
                  <option value="tbsp">tablespoon</option>
                  <option value="tsp">teaspoon</option>
                  <option value="piece">piece</option>
                  <option value="serving">serving</option>
                </select>
              </div>
            </div>
          </div>

          {/* Macros */}
          <div className="form-section">
            <h4 className="section-title">Macronutrients *</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calories">Calories</label>
                <input
                  id="calories"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.calories}
                  onChange={(e) => handleChange('calories', e.target.value)}
                  className={errors.calories ? 'error' : ''}
                />
                {errors.calories && <span className="error-text">{errors.calories}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="protein">Protein (g)</label>
                <input
                  id="protein"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.protein}
                  onChange={(e) => handleChange('protein', e.target.value)}
                  className={errors.protein ? 'error' : ''}
                />
                {errors.protein && <span className="error-text">{errors.protein}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carbs">Carbs (g)</label>
                <input
                  id="carbs"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => handleChange('carbs', e.target.value)}
                  className={errors.carbs ? 'error' : ''}
                />
                {errors.carbs && <span className="error-text">{errors.carbs}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="fat">Fat (g)</label>
                <input
                  id="fat"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.fat}
                  onChange={(e) => handleChange('fat', e.target.value)}
                  className={errors.fat ? 'error' : ''}
                />
                {errors.fat && <span className="error-text">{errors.fat}</span>}
              </div>
            </div>
          </div>

          {/* Optional Micros */}
          <div className="form-section">
            <h4 className="section-title">Additional (optional)</h4>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fiber">Fiber (g)</label>
                <input
                  id="fiber"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.fiber}
                  onChange={(e) => handleChange('fiber', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="sugar">Sugar (g)</label>
                <input
                  id="sugar"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0"
                  value={formData.sugar}
                  onChange={(e) => handleChange('sugar', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="sodium">Sodium (mg)</label>
              <input
                id="sodium"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                value={formData.sodium}
                onChange={(e) => handleChange('sodium', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              <Plus size={20} />
              Add Food
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .custom-food-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
        }

        .custom-food-modal {
          background: var(--surface);
          border: 1px solid var(--border-medium);
          border-radius: 1.5rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          background: var(--surface);
          z-index: 10;
        }

        .modal-header h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: var(--surface-elevated);
          color: var(--kinetic-green);
        }

        .custom-food-form {
          padding: 1.5rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--kinetic-green);
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
          flex: 1;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        input,
        select {
          width: 100%;
          padding: 0.75rem;
          background: var(--background-primary);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: var(--kinetic-green);
          box-shadow: 0 0 0 3px var(--kinetic-glow);
        }

        input.error {
          border-color: var(--danger);
        }

        .error-text {
          display: block;
          color: var(--danger);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        input::placeholder {
          color: var(--text-tertiary);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        .cancel-btn,
        .submit-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .cancel-btn {
          background: var(--surface-elevated);
          color: var(--text-secondary);
        }

        .cancel-btn:hover {
          background: var(--border-medium);
          color: var(--text-primary);
        }

        .submit-btn {
          background: var(--kinetic-green);
          color: var(--background-primary);
        }

        .submit-btn:hover {
          background: var(--kinetic-light);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px var(--kinetic-glow);
        }

        @media (max-width: 640px) {
          .custom-food-modal {
            max-width: 100%;
            border-radius: 1rem 1rem 0 0;
            max-height: 95vh;
          }

          .form-row {
            flex-direction: column;
          }

          .custom-food-overlay {
            padding: 0;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default CustomFoodEntry;

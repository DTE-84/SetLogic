import { useState, useEffect, useCallback } from 'react';
import { ScanBarcode, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BarcodeScanner from './BarcodeScanner';
import { 
  getFoodByBarcode, 
  addToUserPantry, 
  getUserPantryDetails 
} from '../services/foodVault';
import './FoodLogger.css';

const FoodLogger = () => {
  const { currentUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [myPantry, setMyPantry] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserPantry = useCallback(async () => {
    setLoading(true);
    try {
      const pantry = await getUserPantryDetails(currentUser.uid);
      setMyPantry(pantry);
    } catch (error) {
      console.error('Error loading pantry:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadTodaysMeals = useCallback(() => {
    // Load from localStorage for now (will integrate with backend later)
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`meals_${currentUser.uid}_${today}`);
    setTodaysMeals(stored ? JSON.parse(stored) : []);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadUserPantry();
      loadTodaysMeals();
    }
  }, [currentUser, loadUserPantry, loadTodaysMeals]);

  const saveTodaysMeals = (meals) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`meals_${currentUser.uid}_${today}`, JSON.stringify(meals));
    setTodaysMeals(meals);
  };

  const handleScan = async (barcode) => {
    try {
      // Look up food in vault/API
      const food = await getFoodByBarcode(barcode, currentUser.uid);
      
      if (!food) {
        alert('Food not found. Try creating a custom entry.');
        setShowScanner(false);
        return;
      }

      // Add to user's pantry
      await addToUserPantry(currentUser.uid, barcode);
      
      // Log to today's meals
      const newMeal = {
        id: Date.now(),
        ...food,
        servings: 1,
        timestamp: new Date().toISOString()
      };
      
      saveTodaysMeals([...todaysMeals, newMeal]);
      
      // Reload pantry
      await loadUserPantry();
      
      // Close scanner
      setShowScanner(false);
      
    } catch (error) {
      console.error('Error handling scan:', error);
      alert('Error processing barcode. Please try again.');
    }
  };

  const handleQuickLog = (food) => {
    const newMeal = {
      id: Date.now(),
      ...food,
      servings: 1,
      timestamp: new Date().toISOString()
    };
    saveTodaysMeals([...todaysMeals, newMeal]);
  };

  const removeMeal = (mealId) => {
    saveTodaysMeals(todaysMeals.filter(m => m.id !== mealId));
  };

  const updateServings = (mealId, servings) => {
    saveTodaysMeals(
      todaysMeals.map(m => m.id === mealId ? { ...m, servings: parseFloat(servings) } : m)
    );
  };

  // Calculate daily totals
  const dailyTotals = todaysMeals.reduce((acc, meal) => {
    const multiplier = meal.servings || 1;
    return {
      calories: acc.calories + (meal.calories * multiplier),
      protein: acc.protein + (meal.protein * multiplier),
      carbs: acc.carbs + (meal.carbs * multiplier),
      fat: acc.fat + (meal.fat * multiplier)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="food-logger-container">
      <div className="logger-header">
        <div className="header-title-group">
          <ScanBarcode size={32} className="header-icon" />
          <div>
            <h2>Nutrition Tracker</h2>
            <p className="logger-subtitle">Community-powered food database. High-fidelity macro intelligence.</p>
          </div>
        </div>
        <button className="scan-btn" onClick={() => setShowScanner(true)}>
          <ScanBarcode size={20} />
          Scan Food
        </button>
      </div>

      {/* Daily Summary */}
      <div className="daily-summary">
        <h3 className="summary-title">Today's Totals</h3>
        <div className="macro-grid">
          <div className="macro-card">
            <span className="macro-label">Calories</span>
            <span className="macro-value">{Math.round(dailyTotals.calories)}</span>
            <span className="macro-unit">kcal</span>
          </div>
          <div className="macro-card">
            <span className="macro-label">Protein</span>
            <span className="macro-value">{Math.round(dailyTotals.protein)}</span>
            <span className="macro-unit">g</span>
          </div>
          <div className="macro-card">
            <span className="macro-label">Carbs</span>
            <span className="macro-value">{Math.round(dailyTotals.carbs)}</span>
            <span className="macro-unit">g</span>
          </div>
          <div className="macro-card">
            <span className="macro-label">Fat</span>
            <span className="macro-value">{Math.round(dailyTotals.fat)}</span>
            <span className="macro-unit">g</span>
          </div>
        </div>
      </div>

      {/* Today's Meals */}
      <div className="meals-section">
        <h3 className="section-title">Today's Log</h3>
        {todaysMeals.length === 0 ? (
          <div className="empty-state">
            <p>No meals logged yet. Scan or select from your pantry to start tracking.</p>
          </div>
        ) : (
          <div className="meals-list">
            {todaysMeals.map(meal => (
              <div key={meal.id} className="meal-card">
                <div className="meal-info">
                  <h4 className="meal-name">{meal.name}</h4>
                  {meal.brand && <p className="meal-brand">{meal.brand}</p>}
                  <div className="meal-macros">
                    <span>{Math.round(meal.calories * meal.servings)} cal</span>
                    <span>•</span>
                    <span>P: {Math.round(meal.protein * meal.servings)}g</span>
                    <span>•</span>
                    <span>C: {Math.round(meal.carbs * meal.servings)}g</span>
                    <span>•</span>
                    <span>F: {Math.round(meal.fat * meal.servings)}g</span>
                  </div>
                </div>
                <div className="meal-controls">
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    value={meal.servings}
                    onChange={(e) => updateServings(meal.id, e.target.value)}
                    className="servings-input"
                  />
                  <span className="servings-label">servings</span>
                  <button className="remove-btn" onClick={() => removeMeal(meal.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Pantry Quick Access */}
      <div className="pantry-section">
        <h3 className="section-title">My Pantry ({myPantry.length} items)</h3>
        {loading ? (
          <p className="loading-text">Loading your pantry...</p>
        ) : myPantry.length === 0 ? (
          <div className="empty-state">
            <p>Scan foods to build your personal pantry for quick logging.</p>
          </div>
        ) : (
          <div className="pantry-grid">
            {myPantry.slice(0, 8).map(food => (
              <div key={food.id} className="pantry-item" onClick={() => handleQuickLog(food)}>
                <div className="pantry-item-name">{food.name}</div>
                <div className="pantry-item-cal">{Math.round(food.calories)} cal</div>
                <button className="quick-add-btn">
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner 
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default FoodLogger;

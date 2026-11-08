import { useState, useEffect, useCallback } from 'react';
import { ScanBarcode, Plus, Trash2, Edit3, Search, Star, BookmarkPlus, PlayCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BarcodeScanner from './BarcodeScanner';
import CustomFoodEntry from './CustomFoodEntry';
import {
  getFoodByBarcode,
  addToUserPantry,
  getUserPantryDetails,
  createCustomFood,
  searchFoodVault,
  setFavoriteFood,
  getUserFavoriteDetails,
  recordRecentFood,
  getUserRecentDetails,
  createSavedMeal,
  getSavedMeals,
  deleteSavedMeal
} from '../services/foodVault';
import './FoodLogger.css';

const FoodLogger = () => {
  const { currentUser } = useAuth();
  const [showScanner, setShowScanner] = useState(false);
  const [showCustomEntry, setShowCustomEntry] = useState(false);
  const [myPantry, setMyPantry] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [selectedMealIds, setSelectedMealIds] = useState(new Set());
  const [newMealName, setNewMealName] = useState('');

  const favoriteIds = new Set(favorites.map(f => f.barcode || f.id));

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

  const loadFavorites = useCallback(async () => {
    const details = await getUserFavoriteDetails(currentUser.uid);
    setFavorites(details);
  }, [currentUser]);

  const loadRecentFoods = useCallback(async () => {
    const details = await getUserRecentDetails(currentUser.uid);
    setRecentFoods(details);
  }, [currentUser]);

  const loadSavedMeals = useCallback(async () => {
    const meals = await getSavedMeals(currentUser.uid);
    setSavedMeals(meals);
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
      loadFavorites();
      loadRecentFoods();
      loadSavedMeals();
      loadTodaysMeals();
    }
  }, [currentUser, loadUserPantry, loadFavorites, loadRecentFoods, loadSavedMeals, loadTodaysMeals]);

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
        // If not found, open custom entry modal
        setShowScanner(false);
        setShowCustomEntry(true);
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
      recordRecentFood(currentUser.uid, barcode).then(loadRecentFoods);

      // Reload pantry
      await loadUserPantry();

      // Close scanner
      setShowScanner(false);

    } catch (error) {
      console.error('Error handling scan:', error);
      alert('Error processing barcode. Please try again.');
    }
  };

  const handleCustomFood = async (foodData) => {
    try {
      // Create custom food in vault
      const customId = await createCustomFood(currentUser.uid, foodData);

      // Log to today's meals
      const newMeal = {
        id: Date.now(),
        ...foodData,
        barcode: customId,
        servings: 1,
        timestamp: new Date().toISOString()
      };

      saveTodaysMeals([...todaysMeals, newMeal]);
      recordRecentFood(currentUser.uid, customId).then(loadRecentFoods);

      // Reload pantry
      await loadUserPantry();

      // Close modal
      setShowCustomEntry(false);

    } catch (error) {
      console.error('Error creating custom food:', error);
      alert('Error saving custom food. Please try again.');
    }
  };

  const handleQuickLog = (food) => {
    const barcode = food.barcode || food.id;
    const newMeal = {
      id: Date.now(),
      ...food,
      barcode,
      servings: 1,
      timestamp: new Date().toISOString()
    };
    saveTodaysMeals([...todaysMeals, newMeal]);
    recordRecentFood(currentUser.uid, barcode).then(loadRecentFoods);
  };

  const handleLogFromSearch = async (food) => {
    const barcode = food.barcode || food.id;
    await addToUserPantry(currentUser.uid, barcode);
    handleQuickLog(food);
    await loadUserPantry();
  };

  const toggleFavorite = async (food, event) => {
    event.stopPropagation();
    const barcode = food.barcode || food.id;
    const isFav = favoriteIds.has(barcode);
    await setFavoriteFood(currentUser.uid, barcode, !isFav);
    await loadFavorites();
  };

  const removeMeal = (mealId) => {
    saveTodaysMeals(todaysMeals.filter(m => m.id !== mealId));
    setSelectedMealIds(prev => {
      const next = new Set(prev);
      next.delete(mealId);
      return next;
    });
  };

  const updateServings = (mealId, servings) => {
    saveTodaysMeals(
      todaysMeals.map(m => m.id === mealId ? { ...m, servings: parseFloat(servings) } : m)
    );
  };

  const toggleMealSelection = (mealId) => {
    setSelectedMealIds(prev => {
      const next = new Set(prev);
      if (next.has(mealId)) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }
      return next;
    });
  };

  const cancelMealSelection = () => {
    setSelectedMealIds(new Set());
    setNewMealName('');
  };

  const confirmSaveMeal = async () => {
    if (!newMealName.trim() || selectedMealIds.size === 0) return;

    const items = todaysMeals
      .filter(m => selectedMealIds.has(m.id))
      .map(m => ({
        barcode: m.barcode || m.id,
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        servings: m.servings || 1
      }));

    await createSavedMeal(currentUser.uid, newMealName.trim(), items);
    await loadSavedMeals();
    cancelMealSelection();
  };

  const logSavedMeal = (meal) => {
    const timestamp = new Date().toISOString();
    const newEntries = meal.items.map((item, index) => ({
      id: Date.now() + index,
      ...item,
      timestamp
    }));
    saveTodaysMeals([...todaysMeals, ...newEntries]);
    meal.items.forEach(item => recordRecentFood(currentUser.uid, item.barcode));
    setTimeout(loadRecentFoods, 500);
  };

  const handleDeleteSavedMeal = async (mealId) => {
    await deleteSavedMeal(currentUser.uid, mealId);
    await loadSavedMeals();
  };

  const runSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchFoodVault(searchTerm);
      setSearchResults(results);
    } finally {
      setSearching(false);
    }
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
          <ScanBarcode color="#00d9ff" size={32} className="header-icon" />
          <div>
            <h2>Nutrition Tracker</h2>
            <p className="logger-subtitle">Community-powered food database with accurate macro tracking.</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="scan-btn" onClick={() => setShowScanner(true)}>
            <ScanBarcode size={20} />
            Scan Food
          </button>
          <button className="custom-btn" onClick={() => setShowCustomEntry(true)}>
            <Edit3 size={20} />
            Add Custom
          </button>
        </div>
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
          <>
            <div className="meals-list">
              {todaysMeals.map(meal => (
                <div key={meal.id} className="meal-card">
                  <input
                    type="checkbox"
                    className="meal-select-checkbox"
                    checked={selectedMealIds.has(meal.id)}
                    onChange={() => toggleMealSelection(meal.id)}
                    title="Select to save as a meal"
                  />
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

            {selectedMealIds.size > 0 && (
              <div className="save-meal-bar">
                <span className="save-meal-count">{selectedMealIds.size} selected</span>
                <input
                  type="text"
                  placeholder="Name this meal (e.g. Breakfast Shake)"
                  value={newMealName}
                  onChange={(e) => setNewMealName(e.target.value)}
                  className="save-meal-input"
                />
                <button className="save-meal-confirm-btn" onClick={confirmSaveMeal} disabled={!newMealName.trim()}>
                  <BookmarkPlus size={16} />
                  Save as Meal
                </button>
                <button className="save-meal-cancel-btn" onClick={cancelMealSelection}>
                  <X size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* My Meals (saved combos) */}
      <div className="saved-meals-section">
        <h3 className="section-title">My Meals ({savedMeals.length})</h3>
        {savedMeals.length === 0 ? (
          <div className="empty-state">
            <p>Select logged foods above and save them as a named meal for one-tap logging.</p>
          </div>
        ) : (
          <div className="saved-meals-list">
            {savedMeals.map(meal => {
              const totalCal = meal.items.reduce((sum, i) => sum + (i.calories * (i.servings || 1)), 0);
              return (
                <div key={meal.id} className="saved-meal-card">
                  <div className="saved-meal-info">
                    <h4 className="meal-name">{meal.name}</h4>
                    <p className="saved-meal-meta">{meal.items.length} items • {Math.round(totalCal)} cal</p>
                  </div>
                  <div className="saved-meal-actions">
                    <button className="log-all-btn" onClick={() => logSavedMeal(meal)}>
                      <PlayCircle size={16} />
                      Log All
                    </button>
                    <button className="remove-btn" onClick={() => handleDeleteSavedMeal(meal.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Universal Library Search */}
      <div className="search-section">
        <h3 className="section-title">Universal Library</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search foods by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            className="search-input"
          />
          <button className="search-btn" onClick={runSearch} disabled={searching}>
            <Search size={18} />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="meals-list">
            {searchResults.map(food => (
              <div key={food.id} className="meal-card">
                <div className="meal-info">
                  <h4 className="meal-name">{food.name}</h4>
                  {food.brand && <p className="meal-brand">{food.brand}</p>}
                  <div className="meal-macros">
                    <span>{Math.round(food.calories)} cal</span>
                    <span>•</span>
                    <span>P: {Math.round(food.protein)}g</span>
                    <span>•</span>
                    <span>C: {Math.round(food.carbs)}g</span>
                    <span>•</span>
                    <span>F: {Math.round(food.fat)}g</span>
                  </div>
                </div>
                <div className="meal-controls">
                  <button
                    className={`favorite-toggle-btn ${favoriteIds.has(food.barcode || food.id) ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(food, e)}
                    title="Toggle favorite"
                  >
                    <Star size={16} />
                  </button>
                  <button className="quick-add-inline-btn" onClick={() => handleLogFromSearch(food)}>
                    <Plus size={16} />
                    Add
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
                <button
                  className={`favorite-star-btn ${favoriteIds.has(food.barcode || food.id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(food, e)}
                  title="Toggle favorite"
                >
                  <Star size={14} />
                </button>
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

      {/* Favorites Quick Access */}
      <div className="pantry-section">
        <h3 className="section-title">Favorites ({favorites.length})</h3>
        {favorites.length === 0 ? (
          <div className="empty-state">
            <p>Tap the star on any food to pin it here for quick logging.</p>
          </div>
        ) : (
          <div className="pantry-grid">
            {favorites.map(food => (
              <div key={food.id} className="pantry-item" onClick={() => handleQuickLog(food)}>
                <button
                  className="favorite-star-btn active"
                  onClick={(e) => toggleFavorite(food, e)}
                  title="Remove favorite"
                >
                  <Star size={14} />
                </button>
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

      {/* Recent Foods Quick Access */}
      <div className="pantry-section">
        <h3 className="section-title">Recent Foods</h3>
        {recentFoods.length === 0 ? (
          <div className="empty-state">
            <p>Foods you log will show up here for quick re-logging.</p>
          </div>
        ) : (
          <div className="pantry-grid">
            {recentFoods.map(food => (
              <div key={food.id} className="pantry-item" onClick={() => handleQuickLog(food)}>
                <button
                  className={`favorite-star-btn ${favoriteIds.has(food.barcode || food.id) ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(food, e)}
                  title="Toggle favorite"
                >
                  <Star size={14} />
                </button>
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

      {/* Custom Food Entry Modal */}
      {showCustomEntry && (
        <CustomFoodEntry
          onSave={handleCustomFood}
          onClose={() => setShowCustomEntry(false)}
        />
      )}
    </div>
  );
};

export default FoodLogger;

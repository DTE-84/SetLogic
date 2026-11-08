import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';

/**
 * FoodVault Service - Universal Food Database
 * Community-powered nutrition data storage
 */

const FOOD_VAULT_COLLECTION = 'universal_food_vault';
const USERS_COLLECTION = 'users';

/**
 * Lookup food in Open Food Facts API
 * @param {string} barcode - Product barcode
 * @returns {Object|null} - Nutrition data or null
 */
export const fetchFromOpenFoodFacts = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 0) return null; // Product not found
    
    const product = data.product;
    
    // Extract nutrition data
    return {
      barcode,
      name: product.product_name || 'Unknown Product',
      name_lower: (product.product_name || 'Unknown Product').toLowerCase(),
      brand: product.brands || '',
      serving_size: product.serving_size || '',
      serving_unit: product.serving_quantity || 100,
      
      // Macros (per 100g)
      calories: product.nutriments['energy-kcal_100g'] || 0,
      protein: product.nutriments.proteins_100g || 0,
      carbs: product.nutriments.carbohydrates_100g || 0,
      fat: product.nutriments.fat_100g || 0,
      fiber: product.nutriments.fiber_100g || 0,
      sugar: product.nutriments.sugars_100g || 0,
      
      // Micros
      sodium: product.nutriments.sodium_100g || 0,
      cholesterol: product.nutriments.cholesterol_100g || 0,
      saturated_fat: product.nutriments['saturated-fat_100g'] || 0,
      
      // Additional info
      image_url: product.image_url || '',
      ingredients: product.ingredients_text || '',
      allergens: product.allergens || '',
      
      // Metadata
      data_source: 'open_food_facts',
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching from Open Food Facts:', error);
    return null;
  }
};

/**
 * Get food from universal vault or fetch from API if not found
 * @param {string} barcode - Product barcode
 * @param {string} userId - Current user ID (for tracking)
 * @returns {Object|null} - Food data
 */
export const getFoodByBarcode = async (barcode, userId) => {
  try {
    // Check universal vault first
    const foodRef = doc(db, FOOD_VAULT_COLLECTION, barcode);
    const foodSnap = await getDoc(foodRef);
    
    if (foodSnap.exists()) {
      // Food exists in vault - increment scan count
      await updateDoc(foodRef, {
        scan_count: increment(1),
        last_scanned: serverTimestamp(),
        scanned_by: arrayUnion(userId)
      });
      
      return {
        id: foodSnap.id,
        ...foodSnap.data(),
        fromVault: true
      };
    }
    
    // Not in vault - fetch from API
    const foodData = await fetchFromOpenFoodFacts(barcode);
    
    if (!foodData) return null; // Not found anywhere
    
    // Save to universal vault
    await setDoc(foodRef, {
      ...foodData,
      scan_count: 1,
      verified: false, // Not verified yet
      first_scanned_by: userId,
      scanned_by: [userId],
      created_at: serverTimestamp(),
      last_scanned: serverTimestamp()
    });
    
    return {
      id: barcode,
      ...foodData,
      fromVault: false // Newly added
    };
    
  } catch (error) {
    console.error('Error getting food by barcode:', error);
    return null;
  }
};

/**
 * Add food to user's personal pantry
 * @param {string} userId - User ID
 * @param {string} barcode - Food barcode
 */
export const addToUserPantry = async (userId, barcode) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create user document if doesn't exist
      await setDoc(userRef, {
        my_pantry: [barcode],
        created_at: serverTimestamp()
      });
    } else {
      // Add to existing pantry (if not already there)
      await updateDoc(userRef, {
        my_pantry: arrayUnion(barcode)
      });
    }
  } catch (error) {
    console.error('Error adding to user pantry:', error);
    throw error;
  }
};

/**
 * Get user's pantry (list of barcodes)
 * @param {string} userId - User ID
 * @returns {Array} - Array of barcodes
 */
export const getUserPantry = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];
    
    return userSnap.data().my_pantry || [];
  } catch (error) {
    console.error('Error getting user pantry:', error);
    return [];
  }
};

/**
 * Look up full food documents for a list of barcodes, preserving order
 * @param {Array<string>} barcodes
 * @returns {Array} - Array of food objects (nulls for missing docs filtered out)
 */
const getFoodDetailsForBarcodes = async (barcodes) => {
  const foods = await Promise.all(
    barcodes.map(async (barcode) => {
      const foodRef = doc(db, FOOD_VAULT_COLLECTION, barcode);
      const foodSnap = await getDoc(foodRef);

      if (foodSnap.exists()) {
        return {
          id: foodSnap.id,
          ...foodSnap.data()
        };
      }
      return null;
    })
  );

  return foods.filter(food => food !== null);
};

/**
 * Get full food details for user's pantry
 * @param {string} userId - User ID
 * @returns {Array} - Array of food objects
 */
export const getUserPantryDetails = async (userId) => {
  try {
    const barcodes = await getUserPantry(userId);
    return await getFoodDetailsForBarcodes(barcodes);
  } catch (error) {
    console.error('Error getting user pantry details:', error);
    return [];
  }
};

/**
 * Search the universal food vault by name (prefix match)
 * @param {string} term - Search text
 * @returns {Array} - Matching food objects (max 20)
 */
export const searchFoodVault = async (term) => {
  const termLower = term.trim().toLowerCase();
  if (!termLower) return [];

  try {
    const vaultRef = collection(db, FOOD_VAULT_COLLECTION);
    const q = query(
      vaultRef,
      where('name_lower', '>=', termLower),
      where('name_lower', '<=', termLower + ''),
      limit(20)
    );
    const snap = await getDocs(q);

    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Error searching food vault:', error);
    return [];
  }
};

/**
 * Toggle a food as a favorite for the user
 * @param {string} userId - User ID
 * @param {string} barcode - Food barcode/id
 * @param {boolean} shouldFavorite - true to add, false to remove
 */
export const setFavoriteFood = async (userId, barcode, shouldFavorite) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        favorite_foods: shouldFavorite ? [barcode] : [],
        created_at: serverTimestamp()
      });
      return;
    }

    await updateDoc(userRef, {
      favorite_foods: shouldFavorite ? arrayUnion(barcode) : arrayRemove(barcode)
    });
  } catch (error) {
    console.error('Error updating favorite food:', error);
    throw error;
  }
};

/**
 * Get user's favorite food barcodes
 * @param {string} userId - User ID
 * @returns {Array} - Array of barcodes
 */
export const getUserFavorites = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    return userSnap.data().favorite_foods || [];
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

/**
 * Get full food details for user's favorites
 * @param {string} userId - User ID
 * @returns {Array} - Array of food objects
 */
export const getUserFavoriteDetails = async (userId) => {
  try {
    const barcodes = await getUserFavorites(userId);
    return await getFoodDetailsForBarcodes(barcodes);
  } catch (error) {
    console.error('Error getting user favorite details:', error);
    return [];
  }
};

/**
 * Record a food as recently logged, keeping the list deduped and capped
 * @param {string} userId - User ID
 * @param {string} barcode - Food barcode/id
 */
export const recordRecentFood = async (userId, barcode) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    const existing = userSnap.exists() ? (userSnap.data().recent_foods || []) : [];
    const withoutThisFood = existing.filter(entry => entry.barcode !== barcode);
    const updated = [{ barcode, logged_at: new Date().toISOString() }, ...withoutThisFood].slice(0, 15);

    if (!userSnap.exists()) {
      await setDoc(userRef, { recent_foods: updated, created_at: serverTimestamp() });
    } else {
      await updateDoc(userRef, { recent_foods: updated });
    }
  } catch (error) {
    console.error('Error recording recent food:', error);
  }
};

/**
 * Get full food details for user's recently logged foods, most recent first
 * @param {string} userId - User ID
 * @returns {Array} - Array of food objects
 */
export const getUserRecentDetails = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    const entries = userSnap.data().recent_foods || [];
    const details = await getFoodDetailsForBarcodes(entries.map(e => e.barcode));

    // getFoodDetailsForBarcodes resolves in parallel, so re-sort to match recency order
    const orderIndex = entries.map(e => e.barcode);
    return details.sort((a, b) => orderIndex.indexOf(a.id) - orderIndex.indexOf(b.id));
  } catch (error) {
    console.error('Error getting user recent foods:', error);
    return [];
  }
};

/**
 * Save a named combination of foods as a one-tap-loggable meal
 * @param {string} userId - User ID
 * @param {string} name - Meal name
 * @param {Array} items - Array of { barcode, name, calories, protein, carbs, fat, servings }
 * @returns {string} - Saved meal ID
 */
export const createSavedMeal = async (userId, name, items) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    const savedMeal = {
      id: `meal_${Date.now()}`,
      name,
      items,
      created_at: new Date().toISOString()
    };

    if (!userSnap.exists()) {
      await setDoc(userRef, { saved_meals: [savedMeal], created_at: serverTimestamp() });
    } else {
      await updateDoc(userRef, { saved_meals: arrayUnion(savedMeal) });
    }

    return savedMeal.id;
  } catch (error) {
    console.error('Error creating saved meal:', error);
    throw error;
  }
};

/**
 * Get user's saved meal combos
 * @param {string} userId - User ID
 * @returns {Array} - Array of saved meal objects
 */
export const getSavedMeals = async (userId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return [];

    return userSnap.data().saved_meals || [];
  } catch (error) {
    console.error('Error getting saved meals:', error);
    return [];
  }
};

/**
 * Delete a saved meal combo
 * @param {string} userId - User ID
 * @param {string} mealId - Saved meal ID
 */
export const deleteSavedMeal = async (userId, mealId) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const remaining = (userSnap.data().saved_meals || []).filter(m => m.id !== mealId);
    await updateDoc(userRef, { saved_meals: remaining });
  } catch (error) {
    console.error('Error deleting saved meal:', error);
    throw error;
  }
};

/**
 * Create custom food (user-defined)
 * @param {string} userId - User ID
 * @param {Object} foodData - Custom food data
 * @returns {string} - Custom food ID
 */
export const createCustomFood = async (userId, foodData) => {
  try {
    const customId = `custom_${Date.now()}`;
    const foodRef = doc(db, FOOD_VAULT_COLLECTION, customId);
    
    await setDoc(foodRef, {
      ...foodData,
      barcode: customId,
      name_lower: (foodData.name || '').toLowerCase(),
      data_source: 'user_created',
      created_by: userId,
      scan_count: 1,
      verified: false,
      scanned_by: [userId],
      created_at: serverTimestamp()
    });
    
    // Add to user's pantry
    await addToUserPantry(userId, customId);
    
    return customId;
  } catch (error) {
    console.error('Error creating custom food:', error);
    throw error;
  }
};

/**
 * Flag food for incorrect data
 * @param {string} barcode - Food barcode
 * @param {string} userId - User reporting
 * @param {string} reason - Why it's being flagged
 */
export const flagFoodData = async (barcode, userId, reason) => {
  try {
    const foodRef = doc(db, FOOD_VAULT_COLLECTION, barcode);
    
    await updateDoc(foodRef, {
      flags: arrayUnion({
        user: userId,
        reason,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error('Error flagging food:', error);
    throw error;
  }
};

/**
 * Get community stats for a food
 * @param {string} barcode - Food barcode
 * @returns {Object} - Stats object
 */
export const getFoodStats = async (barcode) => {
  try {
    const foodRef = doc(db, FOOD_VAULT_COLLECTION, barcode);
    const foodSnap = await getDoc(foodRef);
    
    if (!foodSnap.exists()) return null;
    
    const data = foodSnap.data();
    
    return {
      scan_count: data.scan_count || 0,
      verified: data.verified || false,
      unique_users: data.scanned_by?.length || 0,
      flags: data.flags?.length || 0
    };
  } catch (error) {
    console.error('Error getting food stats:', error);
    return null;
  }
};

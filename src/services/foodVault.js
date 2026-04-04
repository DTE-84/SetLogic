import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion,
  increment,
  serverTimestamp 
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
 * Get full food details for user's pantry
 * @param {string} userId - User ID
 * @returns {Array} - Array of food objects
 */
export const getUserPantryDetails = async (userId) => {
  try {
    const barcodes = await getUserPantry(userId);
    
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
    
    // Filter out any null results
    return foods.filter(food => food !== null);
  } catch (error) {
    console.error('Error getting user pantry details:', error);
    return [];
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

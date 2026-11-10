import { supabase, unwrap } from '../supabase'
import { deleteEntry, getEntries, saveEntry } from './trackingService'

const catalog = () => supabase.from('food_catalog')
const lists = () => supabase.from('user_food_lists')
const food = row => ({ ...row.nutrition, name: row.name, barcode: row.barcode, id: row.barcode })
const lookup = async barcode => unwrap(await catalog().select('barcode,name,nutrition').eq('barcode', barcode).maybeSingle())

export const fetchFromOpenFoodFacts = async (barcode) => {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`);
    if (!response.ok) throw new Error('Open Food Facts lookup failed');
    const data = await response.json();
    
    if (data.status === 0) return null; // Product not found
    
    const product = data.product;
    const nutrients = product.nutriments || {};
    
    // Extract nutrition data
    return {
      barcode,
      name: product.product_name || 'Unknown Product',
      name_lower: (product.product_name || 'Unknown Product').toLowerCase(),
      brand: product.brands || '',
      serving_size: product.serving_size || '',
      serving_unit: product.serving_quantity || 100,
      
      // Macros (per 100g)
      calories: nutrients['energy-kcal_100g'] || 0,
      protein: nutrients.proteins_100g || 0,
      carbs: nutrients.carbohydrates_100g || 0,
      fat: nutrients.fat_100g || 0,
      fiber: nutrients.fiber_100g || 0,
      sugar: nutrients.sugars_100g || 0,
      
      // Micros
      sodium: nutrients.sodium_100g || 0,
      cholesterol: nutrients.cholesterol_100g || 0,
      saturated_fat: nutrients['saturated-fat_100g'] || 0,
      
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

export async function getFoodByBarcode(barcode, userId) {
  if (!/^\d{6,18}$/.test(barcode)) return null
  const cached = await lookup(barcode)
  if (cached) return { ...food(cached), fromVault: true }
  const found = await fetchFromOpenFoodFacts(barcode)
  if (!found) return null
  const { error } = await catalog().insert({
    barcode, owner_id: userId, is_shared: true, name: found.name, nutrition: found
  })
  if (error && error.code !== '23505') throw error
  const saved = error ? await lookup(barcode) : null
  return saved ? { ...food(saved), fromVault: true } : { ...found, id: barcode, fromVault: false }
}

export async function searchFoodVault(term) {
  const text = term.trim()
  if (!text) return []
  const request = catalog().select('barcode,name,nutrition').eq('is_shared', true).limit(20)
  const query = /^\d+$/.test(text) ? request.eq('barcode', text) : request.ilike('name', text.replace(/[\\%_*]/g, '\\$&') + '%')
  return unwrap(await query).map(food)
}

async function getList(userId, list, count = 1000) {
  const rows = unwrap(await lists().select('food_catalog(barcode,name,nutrition)')
    .eq('user_id', userId).eq('list', list).order('touched_at', { ascending: false }).limit(count))
  return rows.filter(row => row.food_catalog).map(row => food(row.food_catalog))
}

async function addToList(userId, list, barcode, updateTime = false) {
  unwrap(await lists().upsert({
    user_id: userId, list, barcode, touched_at: new Date().toISOString()
  }, { onConflict: 'user_id,list,barcode', ignoreDuplicates: !updateTime }))
}

export const addToUserPantry = (userId, barcode) => addToList(userId, 'pantry', barcode)
export const getUserPantryDetails = userId => getList(userId, 'pantry')
export const getUserFavoriteDetails = userId => getList(userId, 'favorite')
export const getUserRecentDetails = userId => getList(userId, 'recent', 15)

export async function setFavoriteFood(userId, barcode, shouldFavorite) {
  if (shouldFavorite) return addToList(userId, 'favorite', barcode)
  unwrap(await lists().delete().eq('user_id', userId).eq('list', 'favorite').eq('barcode', barcode))
}

export async function recordRecentFood(userId, barcode) {
  if (!barcode) return
  try {
    await addToList(userId, 'recent', barcode, true)
  } catch (error) {
    console.error('Could not update recent foods:', error)
  }
}

export async function createSavedMeal(userId, name, items) {
  const meal = await saveEntry(userId, 'saved_meal', { name, items, created_at: new Date().toISOString() })
  return meal.id
}
export const getSavedMeals = userId => getEntries(userId, 'saved_meal')
export const deleteSavedMeal = (userId, id) => deleteEntry(userId, 'saved_meal', id)

export async function createCustomFood(userId, data) {
  const barcode = `custom_${crypto.randomUUID()}`
  unwrap(await catalog().insert({
    barcode, owner_id: userId, name: data.name, nutrition: { ...data, data_source: 'user_created' }
  }))
  await addToUserPantry(userId, barcode)
  return barcode
}

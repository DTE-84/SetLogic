/**
 * ExerciseDB API Service
 * High-fidelity anatomical protocols and GIF visualization
 */

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'exercisedb.p.rapidapi.com';

const options = {
  method: 'GET',
  headers: {
    'x-rapidapi-key': RAPIDAPI_KEY,
    'x-rapidapi-host': RAPIDAPI_HOST
  }
};

/**
 * Fetch all exercises (cached locally if possible)
 * Note: API may cap results per request, so we fetch multiple pages
 */
export const fetchAllExercises = async (totalLimit = 1300) => {
  const PAGE_SIZE = 10; // API cap confirmed in telemetry
  const numPages = Math.ceil(totalLimit / PAGE_SIZE);
  
  try {
    console.log(`📡 SetLogic: Starting batch fetch of ${totalLimit} exercises...`);
    
    // Create an array of fetch promises for parallel execution with slight staggered delay
    const fetchPromises = Array.from({ length: numPages }, (_, i) => {
      const offset = i * PAGE_SIZE;
      return new Promise(resolve => setTimeout(resolve, i * 15)).then(() => 
        fetch(`https://${RAPIDAPI_HOST}/exercises?limit=${PAGE_SIZE}&offset=${offset}`, options)
          .then(response => {
            if (!response.ok) throw new Error(`Fetch failed for offset ${offset}`);
            return response.json();
          })
      );
    });

    const results = await Promise.all(fetchPromises);
    const combined = results.flat();
    
    // Filter out duplicates just in case (API offset behavior varies)
    const unique = Array.from(new Map(combined.map(ex => [ex.id, ex])).values());
    
    console.log(`✅ SetLogic: Successfully aggregated ${unique.length} unique exercises.`);
    return unique;
  } catch (error) {
    console.error('Error fetching exercises in batch:', error);
    throw error;
  }
};

/**
 * Search exercises by name
 */
export const searchExercises = async (name) => {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/exercises/name/${name}`, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error searching exercises:', error);
    throw error;
  }
};

/**
 * Get exercises by target muscle group
 */
export const fetchByTarget = async (target) => {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/exercises/target/${target}`, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercises for target ${target}:`, error);
    throw error;
  }
};

/**
 * Get exercise details by ID
 */
export const fetchExerciseById = async (id) => {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/exercises/exercise/${id}`, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching exercise ${id}:`, error);
    throw error;
  }
};

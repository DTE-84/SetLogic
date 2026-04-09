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
 */
export const fetchAllExercises = async (limit = 50) => {
  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/exercises?limit=${limit}`, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
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

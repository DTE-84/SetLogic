import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// User Profile
export const saveUserProfile = async (userId, profileData) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profileData,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Workouts
export const saveWorkout = async (userId, workoutData) => {
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  return await addDoc(workoutsRef, {
    ...workoutData,
    createdAt: serverTimestamp()
  });
};

export const getWorkouts = async (userId, limitCount = 30) => {
  const workoutsRef = collection(db, 'users', userId, 'workouts');
  const q = query(workoutsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Meals
export const saveMeal = async (userId, mealData) => {
  const mealsRef = collection(db, 'users', userId, 'meals');
  return await addDoc(mealsRef, {
    ...mealData,
    createdAt: serverTimestamp()
  });
};

export const getMeals = async (userId, limitCount = 30) => {
  const mealsRef = collection(db, 'users', userId, 'meals');
  const q = query(mealsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Body Measurements
export const saveBodyMeasurement = async (userId, measurementData) => {
  const measurementsRef = collection(db, 'users', userId, 'measurements');
  return await addDoc(measurementsRef, {
    ...measurementData,
    createdAt: serverTimestamp()
  });
};

export const getBodyMeasurements = async (userId, limitCount = 50) => {
  const measurementsRef = collection(db, 'users', userId, 'measurements');
  const q = query(measurementsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Generated Plans (AI workout/meal plans)
export const saveGeneratedPlan = async (userId, planType, planData) => {
  const plansRef = collection(db, 'users', userId, 'plans');
  return await addDoc(plansRef, {
    type: planType, // 'workout' or 'meal'
    ...planData,
    createdAt: serverTimestamp()
  });
};

export const getGeneratedPlans = async (userId, planType = null) => {
  const plansRef = collection(db, 'users', userId, 'plans');
  let q;
  if (planType) {
    q = query(plansRef, where('type', '==', planType), orderBy('createdAt', 'desc'), limit(10));
  } else {
    q = query(plansRef, orderBy('createdAt', 'desc'), limit(20));
  }
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Wearable Data
export const saveWearableData = async (userId, wearableData) => {
  const wearableRef = collection(db, 'users', userId, 'wearable');
  return await addDoc(wearableRef, {
    ...wearableData,
    createdAt: serverTimestamp()
  });
};

export const getWearableData = async (userId, limitCount = 30) => {
  const wearableRef = collection(db, 'users', userId, 'wearable');
  const q = query(wearableRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Chat History
export const saveChatMessage = async (userId, message) => {
  const chatRef = collection(db, 'users', userId, 'chat');
  return await addDoc(chatRef, {
    ...message,
    createdAt: serverTimestamp()
  });
};

export const getChatHistory = async (userId, limitCount = 50) => {
  const chatRef = collection(db, 'users', userId, 'chat');
  const q = query(chatRef, orderBy('createdAt', 'asc'), limit(limitCount));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

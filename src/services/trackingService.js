import { supabase, unwrap } from '../supabase'

const entries = () => supabase.from('tracking_entries')
const forUser = (userId, kind) => entries().select().eq('user_id', userId).eq('kind', kind)

function toEntry(row) {
  return {
    ...row.data,
    ...(row.servings === null ? {} : { servings: Number(row.servings) }),
    id: row.id,
    createdAt: row.created_at
  }
}

export async function saveEntry(userId, kind, data) {
  const row = unwrap(await entries().insert({ user_id: userId, kind, data }).select().single())
  return toEntry(row)
}

export async function getEntries(userId, kind, count = 100) {
  return unwrap(await forUser(userId, kind).order('created_at', { ascending: false }).limit(count)).map(toEntry)
}

export async function deleteEntry(userId, kind, id) {
  unwrap(await entries().delete().eq('user_id', userId).eq('kind', kind).eq('id', id))
}

export async function getUserProfile(userId) {
  const row = unwrap(await forUser(userId, 'profile').maybeSingle())
  return row?.data ?? null
}

export const saveWorkout = (userId, data) => saveEntry(userId, 'workout', data)
export const getWorkouts = (userId, count = 30) => getEntries(userId, 'workout', count)
export const deleteWorkout = (userId, id) => deleteEntry(userId, 'workout', id)

export const saveMeal = (userId, data) => saveEntry(userId, 'meal', data)
export async function getMealsForDate(userId, date) {
  const rows = unwrap(await forUser(userId, 'meal').filter('data->>date', 'eq', date)
    .order('created_at', { ascending: false }))
  return rows.map(toEntry)
}
export const deleteMeal = (userId, id) => deleteEntry(userId, 'meal', id)

export async function updateMeal(userId, id, { servings }) {
  unwrap(await entries().update({ servings }).eq('user_id', userId).eq('kind', 'meal').eq('id', id).select('id').single())
}

export async function saveMeals(userId, meals) {
  const rows = meals.map(data => ({ user_id: userId, kind: 'meal', data }))
  return unwrap(await entries().insert(rows).select()).map(toEntry)
}

export const saveBodyMeasurement = (userId, data) => saveEntry(userId, 'measurement', data)
export const getBodyMeasurements = (userId, count = 50) => getEntries(userId, 'measurement', count)
export const saveWearableData = (userId, data) => saveEntry(userId, 'wearable', data)
export const getWearableData = (userId, count = 30) => getEntries(userId, 'wearable', count)

export async function getHabits(userId, date) {
  const [habits, progress] = await Promise.all([
    getEntries(userId, 'habit'),
    forUser(userId, 'habit_progress').filter('data->>date', 'eq', date).then(unwrap)
  ])
  const totals = new Map()
  for (const { data } of progress) {
    totals.set(data.habitId, (totals.get(data.habitId) || 0) + data.increment)
  }
  return habits.map(habit => ({ ...habit, current_value: totals.get(habit.id) || 0 }))
}

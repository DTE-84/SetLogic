import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = url && key ? createClient(url, key, {
  auth: { flowType: 'pkce' }
}) : null

export function unwrap({ data, error }) {
  if (error) throw error
  return data
}

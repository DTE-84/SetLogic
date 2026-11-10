/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, unwrap } from '../supabase'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

const redirectUrl = () => new URL(window.location.pathname, window.location.origin)
const recoveryUrl = () => {
  const url = redirectUrl()
  url.searchParams.set('auth', 'recovery')
  return url.href
}

const signup = async (email, password, displayName) => unwrap(await supabase.auth.signUp({
  email, password,
  options: { data: { display_name: displayName }, emailRedirectTo: redirectUrl().href }
}))
const login = async (email, password) => unwrap(await supabase.auth.signInWithPassword({ email, password }))
const logout = async () => unwrap(await supabase.auth.signOut({ scope: 'local' }))
const resetPassword = async email => unwrap(await supabase.auth.resetPasswordForEmail(email, { redirectTo: recoveryUrl() }))
const updatePassword = async password => unwrap(await supabase.auth.updateUser({ password }))
const signInWithProvider = async provider => unwrap(await supabase.auth.signInWithOAuth({
  provider, options: { redirectTo: redirectUrl().href }
}))

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [recovering, setRecovering] = useState(() => new URLSearchParams(location.search).get('auth') === 'recovery')

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const user = session?.user
  const currentUser = user ? {
    uid: user.id,
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name,
    photoURL: user.user_metadata?.avatar_url
  } : null

  const finishRecovery = () => {
    const url = new URL(location.href)
    url.searchParams.delete('auth')
    history.replaceState(null, '', url)
    setRecovering(false)
  }

  return (
    <AuthContext.Provider value={{
      currentUser, loading, recovering, finishRecovery, configured: Boolean(supabase),
      signup, login, logout, resetPassword, updatePassword,
      signInWithGoogle: () => signInWithProvider('google'),
      signInWithApple: () => signInWithProvider('apple'),
      googleEnabled: import.meta.env.VITE_SUPABASE_GOOGLE === 'true',
      appleEnabled: import.meta.env.VITE_SUPABASE_APPLE === 'true'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

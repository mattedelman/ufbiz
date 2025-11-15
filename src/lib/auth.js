import { supabase } from './supabase'

// Sign in with email and password
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get user's organization
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*, organizations(*)')
      .eq('id', data.user.id)
      .single()

    // If profile doesn't exist, user isn't linked to a club
    if (profileError && profileError.code === 'PGRST116') {
      throw new Error('Your account is not linked to any organization. Please contact an administrator.')
    }

    if (profileError) throw profileError

    return { user: data.user, profile }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Get current user with organization
export async function getCurrentUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  if (!user) return { user: null, profile: null }

  // Get user's organization
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .eq('id', user.id)
    .single()

  if (profileError && profileError.code === 'PGRST116') {
    // Profile doesn't exist
    return { user, profile: null }
  }

  if (profileError) {
    console.error('Profile fetch error:', profileError)
    return { user, profile: null }
  }

  return { user, profile }
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}


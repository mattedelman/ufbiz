import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pllbuzhsbamsovqjuyyl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if we have valid Supabase credentials
const hasValidUrl = supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseUrl !== 'your_project_url_here' &&
  !supabaseUrl.includes('placeholder')

const hasValidKey = supabaseAnonKey && 
  supabaseAnonKey !== 'your_anon_key_here' &&
  supabaseAnonKey.length > 20

// Only create client if we have valid credentials
let supabase = null

if (hasValidUrl && hasValidKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    supabase = null
  }
} else {
  console.warn('⚠️ Missing or invalid Supabase environment variables.')
  console.warn('Please update your .env file with valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  console.warn('The app will load but authentication and database features will not work.')
  
  // Create a minimal mock client that won't crash
  supabase = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase not configured. Please update your .env file.')),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback) => {
        callback('SIGNED_OUT', null)
        return { data: { subscription: { unsubscribe: () => {} } } }
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.reject(new Error('Supabase not configured')),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null })
      }),
      insert: () => Promise.reject(new Error('Supabase not configured')),
      update: () => Promise.reject(new Error('Supabase not configured')),
      delete: () => Promise.reject(new Error('Supabase not configured'))
    })
  }
}

export { supabase }

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return hasValidUrl && hasValidKey && supabase !== null
}


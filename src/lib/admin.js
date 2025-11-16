import { supabase } from './supabase'
import { createClient } from '@supabase/supabase-js'

// Create admin client for invite functionality
// Note: In production, this should be done via a backend API for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pllbuzhsbamsovqjuyyl.supabase.co'
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Admin client (only for invite functionality)
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Get all users (for admin)
export async function getAllUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*, organizations(*)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Get all users without organizations
export async function getUnlinkedUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .is('organization_id', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Link user to organization
export async function linkUserToOrganization(userId, organizationId, email) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: email,
      organization_id: organizationId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Get all organizations
export async function getAllOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

// Invite user by email
export async function inviteUserByEmail(email, organizationId, organizationName) {
  if (!supabaseAdmin) {
    throw new Error('Service role key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file.')
  }

  // Get the site URL for redirect - use production URL, fallback to current origin for dev
  const siteUrl = import.meta.env.VITE_SITE_URL || (import.meta.env.PROD ? 'https://ufbiz.com' : window.location.origin)
  const redirectTo = `${siteUrl}/signup?invite=true&org=${encodeURIComponent(organizationName || '')}`

  // Invite user with custom redirect
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: redirectTo,
    data: {
      organization_id: organizationId,
      organization_name: organizationName
    }
  })

  if (error) throw error

  // If user profile was auto-created, link them to organization
  if (data.user) {
    try {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Link user to organization
      await linkUserToOrganization(data.user.id, organizationId, email)
    } catch (linkError) {
      // Profile might not exist yet, that's okay - it will be created by trigger
      console.log('Note: User profile will be created automatically by trigger')
    }
  }

  return data
}



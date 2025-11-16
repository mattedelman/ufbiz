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
  // Use upsert to create or update the profile
  // This will create the profile if it doesn't exist, or update it if it does
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: email,
      organization_id: organizationId
    }, {
      onConflict: 'id' // Update if profile already exists
    })
    .select()
    .single()

  if (error) {
    console.error('Link user error:', error)
    throw error
  }
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

// Update organization
export async function updateOrganization(organizationId, organizationData) {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      description: organizationData.description || null,
      category: organizationData.category || null,
      website: organizationData.website || null,
      email: organizationData.email || null,
      image: organizationData.image || null
    })
    .eq('id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Update organization error:', error)
    throw error
  }
  return data
}

// Invite user by email
export async function inviteUserByEmail(email, organizationId, organizationName) {
  if (!supabaseAdmin) {
    throw new Error('Service role key not configured. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file.')
  }

  // Always use production URL for invites (so they work regardless of where invite is sent from)
  // Can be overridden with VITE_SITE_URL environment variable
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://ufbiz.com'
  const redirectTo = `${siteUrl}/signup?invite=true&org=${encodeURIComponent(organizationName || '')}&orgId=${organizationId}`

  console.log('Inviting user with organization:', { email, organizationId, organizationName, redirectTo })
  
  // Invite user with custom redirect
  const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    redirectTo: redirectTo,
    data: {
      organization_id: organizationId,
      organization_name: organizationName
    }
  })

  if (error) {
    console.error('Error inviting user:', error)
    throw error
  }

  console.log('User invited successfully:', { userId: data.user?.id, userMetadata: data.user?.app_metadata })

  // If user profile was auto-created, link them to organization
  if (data.user) {
    try {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Link user to organization immediately (backup in case sign-up linking fails)
      const linkResult = await linkUserToOrganization(data.user.id, organizationId, email)
      console.log('User linked to organization immediately after invite:', linkResult)
    } catch (linkError) {
      // Profile might not exist yet, that's okay - it will be created by trigger and linked during sign-up
      console.log('Note: Could not link immediately, will be linked during sign-up:', linkError.message)
    }
  }

  return data
}



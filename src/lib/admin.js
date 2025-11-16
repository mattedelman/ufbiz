import { supabase } from './supabase'

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



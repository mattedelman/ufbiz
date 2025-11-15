import { supabase } from './supabase'

// Get all published events (for public Events page)
export async function getPublishedEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*, organizations(name, image)')
    .eq('status', 'published')
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

// Get events for a specific organization
export async function getEventsByOrganization(organizationId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

// Get all events for current user's organization (includes drafts)
export async function getMyOrganizationEvents(organizationId) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true })

  if (error) throw error
  return data
}

// Create a new event
export async function createEvent(eventData) {
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single()

  if (error) throw error
  return data
}

// Create multiple events (for recurring events)
export async function createEvents(eventsData) {
  const { data, error } = await supabase
    .from('events')
    .insert(eventsData)
    .select()

  if (error) throw error
  return data
}

// Update an event
export async function updateEvent(eventId, eventData) {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete an event
export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) throw error
}

// Delete multiple events
export async function deleteEvents(eventIds) {
  const { error } = await supabase
    .from('events')
    .delete()
    .in('id', eventIds)

  if (error) throw error
}

// Publish an event
export async function publishEvent(eventId) {
  return updateEvent(eventId, { status: 'published' })
}

// Unpublish an event (make it draft)
export async function unpublishEvent(eventId) {
  return updateEvent(eventId, { status: 'draft' })
}

// Bulk publish events
export async function bulkPublishEvents(eventIds) {
  const { data, error } = await supabase
    .from('events')
    .update({ status: 'published' })
    .in('id', eventIds)
    .select()

  if (error) throw error
  return data
}

// Bulk unpublish events
export async function bulkUnpublishEvents(eventIds) {
  const { data, error } = await supabase
    .from('events')
    .update({ status: 'draft' })
    .in('id', eventIds)
    .select()

  if (error) throw error
  return data
}


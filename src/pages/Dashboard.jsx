import { useState, useEffect } from 'react'
import { Plus, Calendar, MapPin, Clock, ExternalLink, Edit2, Trash2, LogOut, Building2, BarChart3, Copy, List, CalendarDays, X, CheckSquare, Square, Loader2, Mail, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { getAllUsers, getUnlinkedUsers, linkUserToOrganization, getAllOrganizations, inviteUserByEmail } from '../lib/admin'
import { clubs } from '../data/clubs'
import { 
  getMyOrganizationEvents, 
  createEvent, 
  createEvents, 
  updateEvent, 
  deleteEvent, 
  deleteEvents,
  publishEvent,
  unpublishEvent,
  bulkPublishEvents,
  bulkUnpublishEvents
} from '../lib/events'

function Dashboard() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [activeTab, setActiveTab] = useState('events') // 'events', 'calendar', 'users'
  const [showOrgModal, setShowOrgModal] = useState(false)
  const [selectedEvents, setSelectedEvents] = useState([]) // For bulk actions
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [loggedInOrganization, setLoggedInOrganization] = useState(null)
  
  // Check authentication and load data on mount
  useEffect(() => {
    const loadDashboard = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        // Redirect to sign in if Supabase not configured
        navigate('/signin')
        return
      }

      try {
        const { user: currentUser, profile } = await getCurrentUser()
        
        if (!currentUser) {
          navigate('/signin')
          return
        }

        setUser(currentUser)
        
        if (profile?.organizations) {
          setLoggedInOrganization(profile.organizations)
          
          // Load events for this organization
          try {
            const orgEvents = await getMyOrganizationEvents(profile.organizations.id)
            // Transform events to match dashboard format (add 'club' field for compatibility)
            const transformedEvents = orgEvents.map(event => ({
              ...event,
              club: profile.organizations.name,
              // Map database fields to component fields
              linkUrl: event.link_url,
              linkText: event.link_text
            }))
            setEvents(transformedEvents)
          } catch (error) {
            console.error('Error loading events:', error)
            setEvents([])
          }
        } else {
          // User not linked to organization - redirect to sign in
          alert('Your account is not linked to any organization. Please contact an administrator.')
          navigate('/signin')
          return
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
        navigate('/signin')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate])
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    linkUrl: '',
    linkText: '',
    isRecurring: false,
    recurrenceType: 'none', // 'none', 'daily', 'weekly', 'monthly', 'custom'
    recurrenceEndDate: '',
    recurrenceCount: 1,
    recurrenceInterval: 1, // For custom: every X days/weeks/months
    status: 'draft' // 'draft' or 'published'
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      localStorage.removeItem('organizationName')
      localStorage.removeItem('organizationId')
      navigate('/signin')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      category: '',
      linkUrl: '',
      linkText: '',
      isRecurring: false,
      recurrenceType: 'none',
      recurrenceEndDate: '',
      recurrenceCount: 1,
      recurrenceInterval: 1,
      status: 'draft'
    })
    setShowAddForm(false)
    setEditingEvent(null)
  }

  const generateRecurringEvents = (baseEventData, recurrenceData = null) => {
    const data = recurrenceData || formData
    if (!data.isRecurring || data.recurrenceType === 'none') {
      return [baseEventData]
    }

    const events = [baseEventData]
    const startDate = new Date(data.date)
    let currentDate = new Date(startDate)
    const endDate = data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : null
    const maxCount = data.recurrenceCount || 10
    const interval = data.recurrenceInterval || 1

    let count = 1
    while (count < maxCount && (!endDate || currentDate <= endDate)) {
      // Calculate next date based on recurrence type
      switch (data.recurrenceType) {
        case 'daily':
          currentDate = new Date(currentDate)
          currentDate.setDate(currentDate.getDate() + interval)
          break
        case 'weekly':
          currentDate = new Date(currentDate)
          currentDate.setDate(currentDate.getDate() + (7 * interval))
          break
        case 'monthly':
          currentDate = new Date(currentDate)
          currentDate.setMonth(currentDate.getMonth() + interval)
          break
        default:
          break
      }

      if (endDate && currentDate > endDate) break

      const recurringEvent = {
        ...baseEventData,
        date: currentDate.toISOString().split('T')[0],
        title: `${baseEventData.title}${count > 0 ? ` (Recurring ${count + 1})` : ''}`,
        status: baseEventData.status // Keep same status for all recurring events
      }
      events.push(recurringEvent)
      count++
    }

    return events
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!loggedInOrganization?.id) {
      alert('Organization not found. Please refresh the page.')
      return
    }

    try {
      if (editingEvent) {
        // Update existing event
        const eventData = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location || null,
          category: formData.category,
          link_url: formData.linkUrl || null,
          link_text: formData.linkText || null,
          status: formData.status || 'draft'
        }
        
        const updatedEvent = await updateEvent(editingEvent.id, eventData)
        
        // Update local state
        setEvents(events.map(event => 
          event.id === editingEvent.id 
            ? { 
                ...updatedEvent, 
                club: loggedInOrganization.name,
                linkUrl: updatedEvent.link_url,
                linkText: updatedEvent.link_text
              }
            : event
        ))
      } else {
        // Create new event(s)
        const baseEventData = {
          organization_id: loggedInOrganization.id,
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location || null,
          category: formData.category,
          link_url: formData.linkUrl || null,
          link_text: formData.linkText || null,
          status: formData.status || 'draft'
        }

        // Generate recurring events if needed
        const eventsToCreate = generateRecurringEvents(baseEventData, formData)
        
        // Create events in database
        const createdEvents = await createEvents(eventsToCreate)
        
        // Transform and add to local state
        const transformedEvents = createdEvents.map(event => ({
          ...event,
          club: loggedInOrganization.name,
          linkUrl: event.link_url,
          linkText: event.link_text
        }))
        
        setEvents([...events, ...transformedEvents])
      }
      
      resetForm()
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

  const handleEdit = (event) => {
    // When editing, don't include recurring fields
    // Map database fields back to form fields
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location || '',
      category: event.category,
      linkUrl: event.linkUrl || event.link_url || '',
      linkText: event.linkText || event.link_text || '',
      isRecurring: false,
      recurrenceType: 'none',
      recurrenceEndDate: '',
      recurrenceCount: 1,
      recurrenceInterval: 1,
      status: event.status || 'draft'
    })
    setEditingEvent(event)
    setShowAddForm(true)
    setSelectedEvents([]) // Clear selection when editing
  }

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId)
        setEvents(events.filter(event => event.id !== eventId))
      } catch (error) {
        console.error('Error deleting event:', error)
        alert('Failed to delete event. Please try again.')
      }
    }
  }

  const handleDuplicate = async (event) => {
    try {
      const duplicatedEventData = {
        organization_id: loggedInOrganization.id,
        title: `${event.title} (Copy)`,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location || null,
        category: event.category,
        link_url: event.linkUrl || event.link_url || null,
        link_text: event.linkText || event.link_text || null,
        status: 'draft'
      }
      
      const createdEvent = await createEvent(duplicatedEventData)
      const transformedEvent = {
        ...createdEvent,
        club: loggedInOrganization.name,
        linkUrl: createdEvent.link_url,
        linkText: createdEvent.link_text
      }
      setEvents([...events, transformedEvent])
    } catch (error) {
      console.error('Error duplicating event:', error)
      alert('Failed to duplicate event. Please try again.')
    }
  }

  const handlePublish = async (eventId) => {
    try {
      await publishEvent(eventId)
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, status: 'published' }
          : event
      ))
    } catch (error) {
      console.error('Error publishing event:', error)
      alert('Failed to publish event. Please try again.')
    }
  }

  const handleUnpublish = async (eventId) => {
    try {
      await unpublishEvent(eventId)
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, status: 'draft' }
          : event
      ))
    } catch (error) {
      console.error('Error unpublishing event:', error)
      alert('Failed to unpublish event. Please try again.')
    }
  }

  // Bulk action handlers
  const toggleEventSelection = (eventId) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    )
  }

  const selectAllEvents = () => {
    setSelectedEvents(events.map(e => e.id))
  }

  const deselectAllEvents = () => {
    setSelectedEvents([])
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEvents.length} event(s)?`)) {
      try {
        await deleteEvents(selectedEvents)
        setEvents(events.filter(event => !selectedEvents.includes(event.id)))
        setSelectedEvents([])
      } catch (error) {
        console.error('Error deleting events:', error)
        alert('Failed to delete events. Please try again.')
      }
    }
  }

  const handleBulkDuplicate = async () => {
    try {
      const eventsToDuplicate = events.filter(event => selectedEvents.includes(event.id))
      const duplicatedEventsData = eventsToDuplicate.map(event => ({
        organization_id: loggedInOrganization.id,
        title: `${event.title} (Copy)`,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location || null,
        category: event.category,
        link_url: event.linkUrl || event.link_url || null,
        link_text: event.linkText || event.link_text || null,
        status: 'draft'
      }))
      
      const createdEvents = await createEvents(duplicatedEventsData)
      const transformedEvents = createdEvents.map(event => ({
        ...event,
        club: loggedInOrganization.name,
        linkUrl: event.link_url,
        linkText: event.link_text
      }))
      setEvents([...events, ...transformedEvents])
      setSelectedEvents([])
    } catch (error) {
      console.error('Error duplicating events:', error)
      alert('Failed to duplicate events. Please try again.')
    }
  }

  const handleBulkPublish = async () => {
    try {
      await bulkPublishEvents(selectedEvents)
      setEvents(events.map(event => 
        selectedEvents.includes(event.id)
          ? { ...event, status: 'published' }
          : event
      ))
      setSelectedEvents([])
    } catch (error) {
      console.error('Error publishing events:', error)
      alert('Failed to publish events. Please try again.')
    }
  }

  const handleBulkUnpublish = async () => {
    try {
      await bulkUnpublishEvents(selectedEvents)
      setEvents(events.map(event => 
        selectedEvents.includes(event.id)
          ? { ...event, status: 'draft' }
          : event
      ))
      setSelectedEvents([])
    } catch (error) {
      console.error('Error unpublishing events:', error)
      alert('Failed to unpublish events. Please try again.')
    }
  }

  // Get upcoming and past events
  const now = new Date()
  const upcomingEvents = events.filter(event => new Date(event.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date))
  const pastEvents = events.filter(event => new Date(event.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date))
  
  // Separate published and draft events
  const publishedEvents = events.filter(event => event.status === 'published')
  const draftEvents = events.filter(event => event.status === 'draft' || !event.status)

  // Group events by month for calendar view
  const eventsByMonth = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(event)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-uf-orange mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!loggedInOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No organization found. Please contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-uf-blue to-blue-700 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Organization Profile - Clickable */}
              <button
                onClick={() => setShowOrgModal(true)}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-4 py-2 transition-colors"
              >
                <div className="relative flex items-center justify-center w-10 h-10 bg-white/20 rounded-full overflow-hidden">
                  {loggedInOrganization.image ? (
                    <img 
                      src={loggedInOrganization.image} 
                      alt={loggedInOrganization.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : null}
                  {(!loggedInOrganization.image || loggedInOrganization.image === null) && (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-blue-200">Organization</p>
                  <p className="text-sm font-semibold">{loggedInOrganization.name}</p>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-uf-blue">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-uf-blue" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Past Events</p>
                <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Drafts</p>
                <p className="text-2xl font-bold text-gray-900">{draftEvents.length}</p>
              </div>
              <Edit2 className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('events')
              setSelectedEvents([]) // Clear selection when switching tabs
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-uf-orange text-uf-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Manage Events
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('calendar')
              setSelectedEvents([]) // Clear selection when switching tabs
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'calendar'
                ? 'border-uf-orange text-uf-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('users')
              setSelectedEvents([]) // Clear selection when switching tabs
            }}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-uf-orange text-uf-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Link Users
            </div>
          </button>
        </div>

        {/* Add Event Button and Bulk Actions - Only show in events tab */}
        {activeTab === 'events' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add New Event
              </button>
            </div>

            {/* Bulk Actions Toolbar */}
            {selectedEvents.length > 0 && (
              <div className="bg-uf-blue text-white rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">
                    {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={deselectAllEvents}
                    className="text-sm underline hover:no-underline"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleBulkPublish}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Calendar className="h-4 w-4" />
                    Publish
                  </button>
                  <button
                    onClick={handleBulkUnpublish}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Edit2 className="h-4 w-4" />
                    Unpublish
                  </button>
                  <button
                    onClick={handleBulkDuplicate}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Select All / Deselect All */}
            {events.length > 0 && selectedEvents.length === 0 && (
              <div className="mb-4">
                <button
                  onClick={selectAllEvents}
                  className="text-sm text-uf-blue hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <CheckSquare className="h-4 w-4" />
                  Select all events
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Event Form */}
        {showAddForm && (
          <div className="card p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Organization:</span> {loggedInOrganization.name}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Networking">Networking</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Social">Social</option>
                    <option value="Career">Career</option>
                    <option value="Competition">Competition</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Applications">Applications</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-uf-orange text-gray-900 font-medium shadow-sm hover:border-uf-orange/50 transition-all bg-white cursor-pointer"
                      style={{
                        colorScheme: 'light',
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Time *
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-uf-orange text-gray-900 font-medium shadow-sm hover:border-uf-orange/50 transition-all bg-white cursor-pointer"
                      style={{
                        colorScheme: 'light',
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                    placeholder="e.g., Stuzin Hall 103 (optional)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors resize-none"
                  rows="4"
                  placeholder="Describe your event in detail..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Registration/Info Link
                  </label>
                  <input
                    type="url"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                    placeholder="https://example.com/register"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={(e) => setFormData({...formData, linkText: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm hover:border-gray-400 transition-colors"
                    placeholder="e.g., Register Now, Learn More"
                  />
                </div>
              </div>

              {/* Status Selector - Show when editing */}
              {editingEvent && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Status
                  </label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.status === 'draft' ? 'Event is saved as draft and not visible to public' : 'Event is published and visible to all users'}
                  </p>
                </div>
              )}

              {/* Recurring Event Options - Only show when creating new events */}
              {!editingEvent && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({...formData, isRecurring: e.target.checked, recurrenceType: e.target.checked ? 'weekly' : 'none'})}
                      className="w-4 h-4 text-uf-orange focus:ring-uf-orange border-gray-300 rounded"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Make this a recurring event
                    </label>
                  </div>

                {formData.isRecurring && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat Frequency *
                      </label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData({...formData, recurrenceType: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                        required
                      >
                        <option value="none">Select frequency</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {formData.recurrenceType !== 'none' && (
                      <>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Repeat Every (interval)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.recurrenceInterval}
                              onChange={(e) => setFormData({...formData, recurrenceInterval: parseInt(e.target.value) || 1})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                              placeholder="1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.recurrenceType === 'daily' && 'days'}
                              {formData.recurrenceType === 'weekly' && 'weeks'}
                              {formData.recurrenceType === 'monthly' && 'months'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Number of Occurrences
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={formData.recurrenceCount}
                              onChange={(e) => setFormData({...formData, recurrenceCount: parseInt(e.target.value) || 1})}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                              placeholder="10"
                            />
                            <p className="text-xs text-gray-500 mt-1">Max 50 occurrences</p>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Date (optional)
                          </label>
                          <input
                            type="date"
                            value={formData.recurrenceEndDate}
                            onChange={(e) => setFormData({...formData, recurrenceEndDate: e.target.value})}
                            min={formData.date}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">Events will stop on this date or after the number of occurrences, whichever comes first</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  {editingEvent ? 'Update Event' : formData.isRecurring ? 'Create Recurring Events' : 'Save as Draft'}
                </button>
                {!editingEvent && (
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault()
                      if (!loggedInOrganization?.id) {
                        alert('Organization not found. Please refresh the page.')
                        return
                      }

                      try {
                        const publishedFormData = { ...formData, status: 'published' }
                        const baseEventData = {
                          organization_id: loggedInOrganization.id,
                          title: formData.title,
                          description: formData.description,
                          date: formData.date,
                          time: formData.time,
                          location: formData.location || null,
                          category: formData.category,
                          link_url: formData.linkUrl || null,
                          link_text: formData.linkText || null,
                          status: 'published'
                        }
                        const eventsToCreate = generateRecurringEvents(baseEventData, publishedFormData)
                        const createdEvents = await createEvents(eventsToCreate)
                        const transformedEvents = createdEvents.map(event => ({
                          ...event,
                          club: loggedInOrganization.name,
                          linkUrl: event.link_url,
                          linkText: event.link_text
                        }))
                        setEvents([...events, ...transformedEvents])
                        resetForm()
                      } catch (error) {
                        console.error('Error publishing event:', error)
                        alert('Failed to publish event. Please try again.')
                      }
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Publish Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List Tab */}
        {activeTab === 'events' && events.length === 0 && !showAddForm ? (
          <div className="card p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">
              Start by adding your first event to share with the UF business community
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Your First Event
            </button>
          </div>
        ) : activeTab === 'events' && !showAddForm ? (
          <div className="space-y-4">
            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  Upcoming Events ({upcomingEvents.length})
                </h3>
                <div className="grid gap-4">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onPublish={handlePublish}
                      onUnpublish={handleUnpublish}
                      isSelected={selectedEvents.includes(event.id)}
                      onToggleSelect={toggleEventSelection}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-600 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                  Past Events ({pastEvents.length})
                </h3>
                <div className="grid gap-4 opacity-75">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onPublish={handlePublish}
                      onUnpublish={handleUnpublish}
                      isPast
                      isSelected={selectedEvents.includes(event.id)}
                      onToggleSelect={toggleEventSelection}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'calendar' && !showAddForm ? (
          <CalendarView events={events} eventsByMonth={eventsByMonth} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />
        ) : activeTab === 'users' ? (
          <UserLinkingView 
            loggedInOrgId={loggedInOrganization?.id}
            onUserLinked={() => {
              // Refresh the page or reload user data
              window.location.reload()
            }}
          />
        ) : null}

        {/* Organization Info Modal */}
        {showOrgModal && (
          <OrganizationModal 
            organization={loggedInOrganization} 
            onClose={() => setShowOrgModal(false)} 
          />
        )}

      </div>
    </div>
  )
}

// Event Card Component
function EventCard({ event, onEdit, onDelete, onDuplicate, isPast = false, isSelected = false, onToggleSelect, onPublish, onUnpublish }) {
  const isDraft = event.status === 'draft' || !event.status
  
  return (
    <div className={`card p-6 ${isPast ? 'bg-gray-50' : ''} ${isSelected ? 'ring-2 ring-uf-blue' : ''} ${isDraft ? 'border-l-4 border-yellow-500' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Selection Checkbox */}
        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(event.id)}
            className="mt-1 flex-shrink-0"
          >
            {isSelected ? (
              <CheckSquare className="h-5 w-5 text-uf-blue" />
            ) : (
              <Square className="h-5 w-5 text-gray-400 hover:text-uf-blue" />
            )}
          </button>
        )}
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                {isDraft && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                    DRAFT
                  </span>
                )}
                {!isDraft && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded">
                    PUBLISHED
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{event.club}</p>
            </div>
            <span className="px-3 py-1 bg-uf-orange/10 text-uf-orange text-sm font-medium rounded-full">
              {event.category}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4">{event.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-uf-orange" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-uf-orange" />
              <span>{event.time}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-uf-orange" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.linkUrl && (
            <a
              href={event.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-uf-blue hover:text-blue-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              {event.linkText || 'Learn More'}
            </a>
          )}
        </div>

        <div className="flex gap-2 ml-4 flex-wrap">
          {isDraft && onPublish && (
            <button
              onClick={() => onPublish(event.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Publish event"
            >
              <Calendar className="h-5 w-5" />
            </button>
          )}
          {!isDraft && onUnpublish && (
            <button
              onClick={() => onUnpublish(event.id)}
              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Unpublish event"
            >
              <Edit2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDuplicate(event)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicate event"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit event"
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete event"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Calendar View Component
function CalendarView({ events, eventsByMonth, onEdit, onDelete, onDuplicate }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Get previous month's last days
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  const prevMonthDays = Array.from(
    { length: startingDayOfWeek },
    (_, i) => prevMonthLastDay - startingDayOfWeek + i + 1
  )

  // Get current month days
  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Get next month days to fill grid
  const totalCells = prevMonthDays.length + currentMonthDays.length
  const nextMonthDays = Array.from(
    { length: 42 - totalCells },
    (_, i) => i + 1
  )

  const changeMonth = (offset) => {
    setCurrentDate(new Date(year, month + offset, 1))
    setSelectedDate(null)
    setSelectedDayEvents([])
  }

  const getEventsForDay = (day, isCurrentMonth, isPrevMonth) => {
    let checkDate
    if (isPrevMonth) {
      checkDate = new Date(year, month - 1, day)
    } else if (!isCurrentMonth) {
      checkDate = new Date(year, month + 1, day)
    } else {
      checkDate = new Date(year, month, day)
    }
    
    const dateString = checkDate.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
  }

  const handleDayClick = (day, isCurrentMonth, isPrevMonth) => {
    let clickedDate
    if (isPrevMonth) {
      clickedDate = new Date(year, month - 1, day)
    } else if (!isCurrentMonth) {
      clickedDate = new Date(year, month + 1, day)
    } else {
      clickedDate = new Date(year, month, day)
    }
    
    const dayEvents = getEventsForDay(day, isCurrentMonth, isPrevMonth)
    setSelectedDate(clickedDate)
    setSelectedDayEvents(dayEvents)
  }

  const isToday = (day) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 bg-uf-blue text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Previous Month Days */}
          {prevMonthDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day, false, true)
            return (
              <div
                key={`prev-${idx}`}
                onClick={() => handleDayClick(day, false, true)}
                className="min-h-24 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="text-gray-400 text-sm font-medium">{day}</div>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className="text-xs bg-uf-orange/20 text-uf-orange px-1 py-0.5 rounded truncate">
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Current Month Days */}
          {currentMonthDays.map((day) => {
            const dayEvents = getEventsForDay(day, true, false)
            const isTodayDate = isToday(day)
            return (
              <div
                key={day}
                onClick={() => handleDayClick(day, true, false)}
                className={`min-h-24 p-2 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                  isTodayDate
                    ? 'bg-uf-blue/10 border-uf-blue'
                    : 'bg-white border-gray-200 hover:border-uf-orange'
                }`}
              >
                <div className={`text-sm font-bold ${isTodayDate ? 'text-uf-blue' : 'text-gray-900'}`}>
                  {day}
                  {isTodayDate && <span className="ml-1 text-xs">(Today)</span>}
                </div>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className="text-xs bg-uf-orange text-white px-1 py-0.5 rounded truncate font-medium">
                        {event.time} - {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-uf-orange font-semibold">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Next Month Days */}
          {nextMonthDays.map((day, idx) => {
            const dayEvents = getEventsForDay(day, false, false)
            return (
              <div
                key={`next-${idx}`}
                onClick={() => handleDayClick(day, false, false)}
                className="min-h-24 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="text-gray-400 text-sm font-medium">{day}</div>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div key={event.id} className="text-xs bg-uf-orange/20 text-uf-orange px-1 py-0.5 rounded truncate">
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && selectedDayEvents.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Events on {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                setSelectedDate(null)
                setSelectedDayEvents([])
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {selectedDayEvents.map((event) => (
              <div key={event.id} className="border-l-4 border-uf-orange pl-4 py-2 bg-gray-50 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-gray-900">{event.title}</h4>
                      <span className="px-2 py-0.5 bg-uf-orange/10 text-uf-orange text-xs font-medium rounded">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{event.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => onDuplicate(event)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Organization Modal Component
function OrganizationModal({ organization, onClose }) {
  if (!organization) {
    return null
  }
  
  const orgData = clubs.find(c => c.name === organization.name)
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Organization Information</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-gray-200 flex-shrink-0">
              {organization.image ? (
                <img 
                  src={organization.image} 
                  alt={organization.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                <Building2 className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{organization.name}</h3>
              <p className="text-gray-600 text-sm mt-1">Organization Logo</p>
            </div>
          </div>

          {/* Description */}
          {orgData?.description && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {orgData.description}
              </p>
            </div>
          )}

          {/* Categories */}
          {orgData?.category && orgData.category.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(orgData.category) ? orgData.category : [orgData.category]).map((cat, idx) => (
                  <span key={idx} className="px-3 py-1 bg-uf-blue/10 text-uf-blue text-sm font-medium rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              {orgData?.website ? (
                <a 
                  href={orgData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-uf-blue hover:text-blue-700 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visit Website
                </a>
              ) : (
                <p className="text-gray-500">No website</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              {orgData?.email ? (
                <a 
                  href={`mailto:${orgData.email}`}
                  className="text-uf-blue hover:text-blue-700"
                >
                  {orgData.email}
                </a>
              ) : (
                <p className="text-gray-500">No email</p>
              )}
            </div>
          </div>

          {/* Edit Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Organization profile editing will be available when backend integration is complete. 
              For now, contact the admin to update your organization information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OldEventsListSection() {
  return (
    <div className="grid gap-4">
      {[].map((event) => (
              <div key={event.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.club}</p>
                      </div>
                      <span className="px-3 py-1 bg-uf-orange/10 text-uf-orange text-sm font-medium rounded-full">
                        {event.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-uf-orange" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-uf-orange" />
                        <span>{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-uf-orange" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>

                    {event.linkUrl && (
                      <a
                        href={event.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-uf-blue hover:text-blue-700 font-medium"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {event.linkText || 'Learn More'}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit event"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

// User Linking View Component
function UserLinkingView({ loggedInOrgId, onUserLinked }) {
  const [unlinkedUsers, setUnlinkedUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [linking, setLinking] = useState(null)
  const [selectedOrg, setSelectedOrg] = useState({})
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteOrgId, setInviteOrgId] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [unlinked, all, orgs] = await Promise.all([
        getUnlinkedUsers(),
        getAllUsers(),
        getAllOrganizations()
      ])
      setUnlinkedUsers(unlinked)
      setAllUsers(all)
      setOrganizations(orgs)
    } catch (error) {
      console.error('Error loading users:', error)
      alert('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkUser = async (userId, email) => {
    const orgId = selectedOrg[userId]
    if (!orgId) {
      alert('Please select an organization')
      return
    }

    try {
      setLinking(userId)
      await linkUserToOrganization(userId, orgId, email)
      alert('User linked successfully!')
      await loadData()
      if (onUserLinked) onUserLinked()
    } catch (error) {
      console.error('Error linking user:', error)
      alert('Failed to link user. Please try again.')
    } finally {
      setLinking(null)
    }
  }

  const handleInviteUser = async (e) => {
    e.preventDefault()
    setInviteError('')
    setInviteSuccess(false)

    if (!inviteEmail || !inviteOrgId) {
      setInviteError('Please enter an email and select an organization')
      return
    }

    const selectedOrg = organizations.find(org => org.id === inviteOrgId)
    if (!selectedOrg) {
      setInviteError('Invalid organization selected')
      return
    }

    try {
      setInviting(true)
      await inviteUserByEmail(inviteEmail, inviteOrgId, selectedOrg.name)
      setInviteSuccess(true)
      setInviteEmail('')
      setInviteOrgId('')
      setTimeout(() => {
        setShowInviteForm(false)
        setInviteSuccess(false)
        loadData() // Refresh to show newly invited user
      }, 2000)
    } catch (error) {
      console.error('Error inviting user:', error)
      setInviteError(error.message || 'Failed to send invite. Please check that VITE_SUPABASE_SERVICE_ROLE_KEY is set in your .env file.')
    } finally {
      setInviting(false)
    }
  }

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-uf-orange mx-auto mb-4" />
        <p className="text-gray-600">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Link Users section commented out - using Supabase dashboard for invites only */}
      {/* 
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Invite New User</h2>
          <button
            onClick={() => {
              setShowInviteForm(!showInviteForm)
              setInviteError('')
              setInviteSuccess(false)
            }}
            className="px-4 py-2 bg-uf-orange text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            {showInviteForm ? (
              <>
                <X className="h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Invite User
              </>
            )}
          </button>
        </div>

        {showInviteForm && (
          <form onSubmit={handleInviteUser} className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {inviteError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{inviteError}</p>
              </div>
            )}
            {inviteSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ Invite sent successfully! The user will receive an email to create their account.
                </p>
              </div>
            )}
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="inviteEmail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="inviteOrg" className="block text-sm font-medium text-gray-700 mb-2">
                Organization <span className="text-red-500">*</span>
              </label>
              <select
                id="inviteOrg"
                value={inviteOrgId}
                onChange={(e) => setInviteOrgId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                required
              >
                <option value="">Select organization...</option>
                {organizations.length === 0 ? (
                  <option value="" disabled>Loading organizations...</option>
                ) : (
                  organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The user will be automatically linked to this organization when they create their account.
              </p>
            </div>
            <button
              type="submit"
              disabled={inviting}
              className="w-full px-4 py-2 bg-uf-blue text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {inviting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending invite...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              The user will receive an email with a link to create their account. They'll be automatically linked to the selected organization.
            </p>
          </form>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Users to Organizations</h2>
        <p className="text-gray-600 mb-6">
          Link existing users (who were created manually) to organizations below.
        </p>

        {unlinkedUsers.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">All users are linked!</h3>
            <p className="text-gray-600">No unlinked users found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Unlinked Users ({unlinkedUsers.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Organization</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {unlinkedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={selectedOrg[user.id] || ''}
                          onChange={(e) => setSelectedOrg({ ...selectedOrg, [user.id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                        >
                          <option value="">Select organization...</option>
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleLinkUser(user.id, user.email)}
                          disabled={!selectedOrg[user.id] || linking === user.id}
                          className="px-4 py-2 bg-uf-blue text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {linking === user.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Linking...
                            </>
                          ) : (
                            'Link User'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Linked Users</h3>
        {allUsers.filter(u => u.organizations).length === 0 ? (
          <p className="text-gray-600">No linked users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Organization</th>
                </tr>
              </thead>
              <tbody>
                {allUsers
                  .filter(u => u.organizations)
                  .map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-3 py-1 bg-uf-blue/10 text-uf-blue rounded-full text-sm font-medium">
                          {user.organizations?.name || 'Unknown'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      */}
      
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
        <p className="text-gray-600 mb-4">
          To invite users, please use the Supabase dashboard. Go to Authentication → Users → Invite User.
        </p>
        <p className="text-sm text-gray-500">
          After inviting users through Supabase, you can link them to organizations manually in the database if needed.
        </p>
      </div>
    </div>
  )
}

export default Dashboard


import { useState, useEffect, useRef } from 'react'
import { Plus, Calendar, MapPin, Clock, ExternalLink, Edit2, Trash2, LogOut, Building2, BarChart3, Copy, List, CalendarDays, X, CheckSquare, Square, Loader2, Mail, Send, ChevronDown } from 'lucide-react'
import CalendarComponent from '../components/Calendar'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { getAllUsers, getUnlinkedUsers, linkUserToOrganization, getAllOrganizations, inviteUserByEmail, updateOrganization } from '../lib/admin'
import { clubs } from '../data/clubs'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Custom Time Picker with Simple Up/Down Stepper
function CustomTimePicker({ value, onChange, required }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [displayValue, setDisplayValue] = useState('')
  const dropdownRef = useRef(null)
  
  // Parse time value (HH:MM format to 12-hour)
  const parseTime = (timeStr) => {
    if (!timeStr) return { hour: 12, minute: 0, period: 'PM' }
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours, 10)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const period = hour24 >= 12 ? 'PM' : 'AM'
    return { hour: hour12, minute: parseInt(minutes, 10), period }
  }
  
  const [selectedTime, setSelectedTime] = useState(parseTime(value))
  
  // Update display value when value changes
  useEffect(() => {
    if (value) {
      const { hour, minute, period } = parseTime(value)
      setDisplayValue(`${hour}:${minute.toString().padStart(2, '0')} ${period}`)
      setSelectedTime({ hour, minute, period })
    } else {
      setDisplayValue('')
    }
  }, [value])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Convert to 24-hour format
  const convertTo24Hour = (hour, minute, period) => {
    let hour24 = hour
    if (period === 'PM' && hour24 !== 12) hour24 += 12
    if (period === 'AM' && hour24 === 12) hour24 = 0
    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
  
  const updateTime = (newTime) => {
    setSelectedTime(newTime)
    const time24 = convertTo24Hour(newTime.hour, newTime.minute, newTime.period)
    onChange(time24)
    setDisplayValue(`${newTime.hour}:${newTime.minute.toString().padStart(2, '0')} ${newTime.period}`)
  }
  
  const incrementHour = () => {
    const newHour = selectedTime.hour === 12 ? 1 : selectedTime.hour + 1
    updateTime({ ...selectedTime, hour: newHour })
  }
  
  const decrementHour = () => {
    const newHour = selectedTime.hour === 1 ? 12 : selectedTime.hour - 1
    updateTime({ ...selectedTime, hour: newHour })
  }
  
  const incrementMinute = () => {
    const newMinute = selectedTime.minute >= 55 ? 0 : selectedTime.minute + 5
    updateTime({ ...selectedTime, minute: newMinute })
  }
  
  const decrementMinute = () => {
    const newMinute = selectedTime.minute === 0 ? 55 : selectedTime.minute - 5
    updateTime({ ...selectedTime, minute: newMinute })
  }
  
  const togglePeriod = () => {
    const newPeriod = selectedTime.period === 'AM' ? 'PM' : 'AM'
    updateTime({ ...selectedTime, period: newPeriod })
  }
  
  // Typing functionality disabled - use dropdown only
  // const handleInputChange = (e) => { ... } // Commented out - typing disabled
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        value={displayValue}
        // onChange={handleInputChange} // Typing disabled - use dropdown only
        onFocus={() => setShowDropdown(true)}
        onClick={() => setShowDropdown(true)}
        placeholder="Select time"
        readOnly
        className="w-full pl-11 pr-10 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-uf-orange text-gray-900 font-semibold shadow-sm hover:border-uf-orange/50 transition-all bg-white cursor-pointer"
        required={required}
      />
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronDown className="h-5 w-5" />
      </button>
      
      {showDropdown && (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-xl border-2 border-gray-200 p-3" style={{ width: '240px' }}>
          <div className="flex items-center justify-center gap-2">
            {/* Hour Scroll */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1 font-medium">Hour</span>
              <div className="h-32 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-2 border-gray-200 rounded-lg bg-gray-50">
                {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime({ ...selectedTime, hour: h })}
                    className={`w-16 py-2 text-center font-semibold transition-colors ${
                      selectedTime.hour === h
                        ? 'bg-uf-orange text-white'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-uf-orange'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-2xl font-semibold text-gray-300 self-center pt-5">:</div>
            
            {/* Minute Scroll */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1 font-medium">Minute</span>
              <div className="h-32 overflow-y-scroll scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent border-2 border-gray-200 rounded-lg bg-gray-50">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateTime({ ...selectedTime, minute: m })}
                    className={`w-16 py-2 text-center font-semibold transition-colors ${
                      selectedTime.minute === m
                        ? 'bg-uf-orange text-white'
                        : 'text-gray-700 hover:bg-orange-50 hover:text-uf-orange'
                    }`}
                  >
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AM/PM Scroll */}
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1 font-medium">&nbsp;</span>
              <div className="h-32 flex flex-col gap-1 justify-center">
                <button
                  type="button"
                  onClick={() => updateTime({ ...selectedTime, period: 'AM' })}
                  className={`w-14 py-3 text-center font-semibold rounded transition-colors ${
                    selectedTime.period === 'AM'
                      ? 'bg-uf-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-uf-orange'
                  }`}
                >
                  AM
                </button>
                <button
                  type="button"
                  onClick={() => updateTime({ ...selectedTime, period: 'PM' })}
                  className={`w-14 py-3 text-center font-semibold rounded transition-colors ${
                    selectedTime.period === 'PM'
                      ? 'bg-uf-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-uf-orange'
                  }`}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => setShowDropdown(false)}
            className="w-full mt-3 py-2 bg-uf-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm shadow-sm"
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

// Custom Date Input with Auto-Formatting AND Calendar Picker
function AutoFormatDateInput({ value, onChange, required }) {
  const [displayValue, setDisplayValue] = useState('')
  const [showCalendar, setShowCalendar] = useState(false)
  
  useEffect(() => {
    if (value) {
      // Convert YYYY-MM-DD to M-D-YYYY for display
      const [year, month, day] = value.split('-')
      setDisplayValue(`${parseInt(month)}-${parseInt(day)}-${year}`)
    }
  }, [value])
  
  const handleInputChange = (e) => {
    let input = e.target.value.replace(/\D/g, '') // Remove non-digits
    
    // Auto-format as user types: M-D-YYYY
    if (input.length >= 2) {
      input = input.slice(0, 2) + '-' + input.slice(2)
    }
    if (input.length >= 5) {
      input = input.slice(0, 5) + '-' + input.slice(5, 9)
    }
    
    setDisplayValue(input)
    
    // Parse complete date and convert to YYYY-MM-DD for storage
    if (input.length === 10) {
      const parts = input.split('-')
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0')
        const day = parts[1].padStart(2, '0')
        const year = parts[2]
        
        // Validate date
        const date = new Date(`${year}-${month}-${day}`)
        if (!isNaN(date.getTime()) && date >= new Date().setHours(0,0,0,0)) {
          onChange(`${year}-${month}-${day}`)
        }
      }
    }
  }
  
  const handleDatePickerChange = (date) => {
    if (date) {
      // Use local date to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      onChange(dateStr)
      setShowCalendar(false)
    }
  }
  
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
      <input
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setShowCalendar(true)}
        placeholder="1-15-2025"
        maxLength={10}
        className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-uf-orange text-gray-900 font-semibold shadow-sm hover:border-uf-orange/50 transition-all bg-white"
        required={required}
      />
      {showCalendar && (
        <div className="absolute z-50 mt-2">
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={handleDatePickerChange}
            onClickOutside={() => setShowCalendar(false)}
            minDate={new Date()}
            inline
            calendarClassName="modern-datepicker"
          />
        </div>
      )}
    </div>
  )
}
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
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])
  
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
          // Merge organization data with clubs.js to get image from file
          const orgFromClubs = clubs.find(c => c.name === profile.organizations.name)
          const mergedOrganization = {
            ...profile.organizations,
            // Always use image from clubs.js file, not database
            image: orgFromClubs?.image || profile.organizations.image
          }
          setLoggedInOrganization(mergedOrganization)
          
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

      // Use local date to avoid timezone issues
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const recurringEvent = {
        ...baseEventData,
        date: dateStr,
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
    setActiveTab('events') // Switch to Manage Events tab when editing
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
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-uf-blue to-blue-700 text-white py-4 md:py-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Organization Profile - Clickable */}
              <button
                onClick={() => setShowOrgModal(true)}
                className="flex items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/20 rounded-lg px-2 sm:px-4 py-2 transition-colors"
              >
                <div className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full overflow-hidden flex-shrink-0">
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
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs text-blue-200">Organization</p>
                  <p className="text-sm font-semibold truncate max-w-[150px] md:max-w-none">{loggedInOrganization.name}</p>
                </div>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Sign Out</span>
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

        {/* Tab Navigation - Mobile Optimized */}
        <div className="mb-6 flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('events')
              setSelectedEvents([]) // Clear selection when switching tabs
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'events'
                ? 'border-uf-orange text-uf-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <List className="h-4 w-4" />
              <span className="hidden xs:inline">Manage </span>Events
            </div>
          </button>
          <button
            onClick={() => {
              setActiveTab('calendar')
              setSelectedEvents([]) // Clear selection when switching tabs
            }}
            className={`px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'calendar'
                ? 'border-uf-orange text-uf-orange'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <CalendarDays className="h-4 w-4" />
              Calendar
            </div>
          </button>
          {/* Link Users tab commented out - using Supabase dashboard for invites only */}
          {/*
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
          */}
        </div>

        {/* Add Event Button and Bulk Actions - Only show in events tab */}
        {activeTab === 'events' && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <button
                onClick={() => {
                  setShowAddForm(true)
                  setActiveTab('events') // Ensure we're on events tab
                }}
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

        {/* Add/Edit Event Form - Mobile Optimized - Only show in Events tab */}
        {showAddForm && activeTab === 'events' && (
          <div className="card p-4 sm:p-6 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-900">
                  <span className="font-semibold">Organization:</span> {loggedInOrganization.name}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Date *
                  </label>
                  <AutoFormatDateInput
                    value={formData.date}
                    onChange={(date) => setFormData({...formData, date})}
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Type like "1-15-2025" (auto-formats) or click to open calendar</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1 text-uf-orange" />
                    Time *
                  </label>
                  <CustomTimePicker
                    value={formData.time}
                    onChange={(time) => setFormData({...formData, time})}
                    required
                  />
                  <p className="mt-1.5 text-xs text-gray-500">Click to open time selector</p>
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
                          <DatePicker
                            selected={formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : null}
                            onChange={(date) => {
                              if (date) {
                                // Use local date to avoid timezone issues
                                const year = date.getFullYear()
                                const month = String(date.getMonth() + 1).padStart(2, '0')
                                const day = String(date.getDate()).padStart(2, '0')
                                const dateStr = `${year}-${month}-${day}`
                                setFormData({...formData, recurrenceEndDate: dateStr})
                              } else {
                                setFormData({...formData, recurrenceEndDate: ''})
                              }
                            }}
                            minDate={formData.date ? new Date(formData.date) : new Date()}
                            dateFormat="MMMM d, yyyy"
                            placeholderText="Select end date"
                            isClearable
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                            wrapperClassName="w-full"
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
              onClick={() => {
                setShowAddForm(true)
                setActiveTab('events') // Ensure we're on events tab
              }}
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
        ) : activeTab === 'calendar' ? (
          <div className="space-y-4">
            {/* Legend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center gap-4 text-sm">
              <span className="font-semibold text-gray-700">Legend:</span>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Draft</span>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 min-h-0">
                <div className="h-full">
                  <CalendarComponent 
                    events={events} 
                    onDayClick={(dateString, dayEvents) => {
                      setSelectedDate(dateString)
                      setSelectedDayEvents(dayEvents)
                    }}
                    selectedDate={selectedDate}
                    showEventIndicators={true}
                  />
                </div>
              </div>
              
              {/* Side Panel for Selected Day Events */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-lg sticky top-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
                  {selectedDayEvents.length > 0 ? (
                    <div>
                      <div className="bg-uf-blue text-white p-4 sticky top-0 rounded-t-xl">
                        <p className="text-xs uppercase tracking-wide text-blue-200">
                          {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <h3 className="text-2xl font-bold">
                          {selectedDate && new Date(selectedDate).getDate()}
                        </h3>
                        <p className="text-sm text-blue-100">
                          {selectedDate && `Events on ${new Date(selectedDate).toLocaleDateString('en-US', { 
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}`}
                        </p>
                      </div>
                      <div className="p-4 space-y-4">
                        {selectedDayEvents.map((event) => {
                          const isDraft = event.status === 'draft' || !event.status
                          return (
                            <div 
                              key={event.id} 
                              className={`p-4 rounded-lg border-2 ${
                                isDraft 
                                  ? 'bg-yellow-50 border-yellow-300' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                                    {isDraft && (
                                      <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-semibold rounded">
                                        Draft
                                      </span>
                                    )}
                                    {!isDraft && (
                                      <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded">
                                        Published
                                      </span>
                                    )}
                                  </div>
                                  {event.time && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                      <Clock className="h-4 w-4" />
                                      {event.time.includes('AM') || event.time.includes('PM') 
                                        ? event.time 
                                        : (() => {
                                            const [hours, minutes] = event.time.split(':')
                                            const hour = parseInt(hours, 10)
                                            const ampm = hour >= 12 ? 'PM' : 'AM'
                                            const hour12 = hour % 12 || 12
                                            return `${hour12}:${minutes} ${ampm}`
                                          })()}
                                    </div>
                                  )}
                                  {event.location && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                      <MapPin className="h-4 w-4" />
                                      {event.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleEdit(event)}
                                  className="flex-1 px-3 py-1.5 bg-uf-blue text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  className="px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-sm">Click on a date to view events</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : /* activeTab === 'users' ? (
          <UserLinkingView 
            loggedInOrgId={loggedInOrganization?.id}
            onUserLinked={() => {
              // Refresh the page or reload user data
              window.location.reload()
            }}
          />
        ) : */ null}

        {/* Organization Info Modal */}
        {showOrgModal && (
          <OrganizationModal 
            organization={loggedInOrganization} 
            onClose={() => setShowOrgModal(false)}
            onUpdate={(updatedOrg) => {
              // Merge with clubs.js to ensure image comes from file
              const orgFromClubs = clubs.find(c => c.name === updatedOrg.name)
              const mergedOrg = {
                ...updatedOrg,
                image: orgFromClubs?.image || updatedOrg.image
              }
              setLoggedInOrganization(mergedOrg)
            }}
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

// CalendarView removed - now using Calendar component from Events page

// Organization Modal Component
function OrganizationModal({ organization, onClose, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Get initial data from organization or clubs data
  // Always prioritize clubs.js image over database image
  const orgData = clubs.find(c => c.name === organization?.name)
  const getInitialData = () => ({
    description: organization?.description || orgData?.description || '',
    category: organization?.category || orgData?.category || [],
    website: organization?.website || orgData?.website || '',
    email: organization?.email || orgData?.email || '',
    image: orgData?.image || organization?.image || '' // Prioritize clubs.js image
  })
  
  const [editedData, setEditedData] = useState(getInitialData)
  
  // Update editedData when organization changes
  useEffect(() => {
    const currentOrgData = clubs.find(c => c.name === organization?.name)
    setEditedData({
      description: organization?.description || currentOrgData?.description || '',
      category: organization?.category || currentOrgData?.category || [],
      website: organization?.website || currentOrgData?.website || '',
      email: organization?.email || currentOrgData?.email || '',
      image: currentOrgData?.image || organization?.image || '' // Prioritize clubs.js image
    })
    setSaveError(null) // Clear any previous errors
    setSaveSuccess(false) // Clear success message
  }, [organization])

  // Get available categories from clubs data
  const allCategories = [
    'Investment Funds', 'Finance', 'General Business', 'Diversity',
    'Marketing', 'Professional Development', 'Honor Society', 'Accounting',
    'Fraternity', 'Entrepreneurship', 'Technology', 'Program',
    'Consulting', 'Real Estate', 'Supply Chain', 'Healthcare',
    'Sustainability', 'Non-Profit', 'Other'
  ]

  if (!organization) {
    return null
  }

  // Use edited data if available, otherwise fall back to organization data or clubs data
  // Always prioritize clubs.js image over database image
  const displayData = {
    description: editedData.description || orgData?.description || organization.description || '',
    category: editedData.category.length > 0 ? editedData.category : (orgData?.category || organization.category || []),
    website: editedData.website || orgData?.website || organization.website || '',
    email: editedData.email || orgData?.email || organization.email || '',
    image: orgData?.image || editedData.image || organization.image || '' // Prioritize clubs.js image
  }

  const handleSave = async () => {
    if (!organization?.id) {
      setSaveError('Organization ID not found')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      // Prepare data for update - ensure category is an array
      // Note: image field is not editable, so it's not included in updateData
      const updateData = {
        description: editedData.description || null,
        category: Array.isArray(editedData.category) && editedData.category.length > 0 
          ? editedData.category 
          : null,
        website: editedData.website || null,
        email: editedData.email || null
      }

      // Call backend to update organization
      const updatedOrg = await updateOrganization(organization.id, updateData)
      
      // Update parent component with new data
      if (onUpdate) {
        onUpdate(updatedOrg)
      }
      
      setIsEditing(false)
      setSaveSuccess(true)
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error updating organization:', error)
      setSaveError(error.message || 'Failed to update organization. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    const currentOrgData = clubs.find(c => c.name === organization?.name)
    setEditedData({
      description: organization?.description || currentOrgData?.description || '',
      category: organization?.category || currentOrgData?.category || [],
      website: organization?.website || currentOrgData?.website || '',
      email: organization?.email || currentOrgData?.email || '',
      image: currentOrgData?.image || organization?.image || '' // Prioritize clubs.js image
    })
    setIsEditing(false)
  }

  const toggleCategory = (category) => {
    setEditedData(prev => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : []
      if (currentCategories.includes(category)) {
        return { ...prev, category: currentCategories.filter(c => c !== category) }
      } else {
        return { ...prev, category: [...currentCategories, category] }
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
          <h2 className="text-2xl font-bold text-gray-900">Organization Information</h2>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-uf-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-4 border-gray-200 flex-shrink-0">
              {displayData.image ? (
                <img 
                  src={displayData.image} 
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editedData.description}
                onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent resize-none"
                rows="6"
                placeholder="Enter organization description..."
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {displayData.description || 'No description available'}
              </p>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const isSelected = Array.isArray(editedData.category) && editedData.category.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                          isSelected
                            ? 'bg-uf-blue text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500">
                  Selected: {Array.isArray(editedData.category) ? editedData.category.length : 0} category(ies)
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.isArray(displayData.category) && displayData.category.length > 0 ? (
                  displayData.category.map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-uf-blue/10 text-uf-blue text-sm font-medium rounded-full">
                      {cat}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No categories</p>
                )}
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
              {isEditing ? (
                <input
                  type="url"
                  value={editedData.website}
                  onChange={(e) => setEditedData({ ...editedData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                  placeholder="https://example.com"
                />
              ) : (
                displayData.website ? (
                  <a 
                    href={displayData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-uf-blue hover:text-blue-700 flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Website
                  </a>
                ) : (
                  <p className="text-gray-500">No website</p>
                )
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedData.email}
                  onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                  placeholder="contact@example.com"
                />
              ) : (
                displayData.email ? (
                  <a 
                    href={`mailto:${displayData.email}`}
                    className="text-uf-blue hover:text-blue-700"
                  >
                    {displayData.email}
                  </a>
                ) : (
                  <p className="text-gray-500">No email</p>
                )
              )}
            </div>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {saveError}
              </p>
            </div>
          )}

          {/* Success Message */}
          {saveSuccess && !isEditing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Success:</strong> Organization information has been saved.
              </p>
            </div>
          )}
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


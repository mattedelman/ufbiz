import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Clock, MapPin, Users, Tag, CheckCircle, Filter, X, List, CalendarDays, Search, Building2, Loader2 } from 'lucide-react'
import { eventCategories } from '../data/events'
import { clubs } from '../data/clubs'
import { getPublishedEvents } from '../lib/events'
import { isSupabaseConfigured } from '../lib/supabase'
import Calendar from '../components/Calendar'
import SEO from '../components/SEO'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedOrganizations, setSelectedOrganizations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [orgSearchTerm, setOrgSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState([])
  const [showOrgFilter, setShowOrgFilter] = useState(false)

  // Helper function to format time from HH:MM to readable format
  const formatTime = (timeString) => {
    if (!timeString) return ''
    // If already formatted (contains AM/PM), return as is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString
    }
    // Convert HH:MM or HH:MM:SS to readable format
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Fetch published events from database
  useEffect(() => {
    const loadEvents = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        setEvents([])
        return
      }

      try {
        setLoading(true)
        const publishedEvents = await getPublishedEvents()
        // Transform database events to match component format
        const transformedEvents = publishedEvents.map(event => ({
          ...event,
          club: event.organizations?.name || 'Unknown Organization',
          linkUrl: event.link_url,
          linkText: event.link_text,
          // Format time to readable format
          time: formatTime(event.time),
          // Keep original fields for compatibility
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          category: event.category
        }))
        setEvents(transformedEvents)
      } catch (error) {
        console.error('Error loading events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  // Get all organizations from clubs data (not just those with events)
  const organizations = clubs.map(club => club.name).filter(Boolean).sort()

  // Filter organizations based on search term
  const filteredOrganizations = organizations.filter(org => 
    org.toLowerCase().includes(orgSearchTerm.toLowerCase())
  )

  // Toggle organization filter
  const toggleOrganization = (org) => {
    setSelectedOrganizations(prev => 
      prev.includes(org) 
        ? prev.filter(o => o !== org)
        : [...prev, org]
    )
  }

  // Clear all organization filters
  const clearOrgFilters = () => {
    setSelectedOrganizations([])
  }

  // Select all filtered organizations
  const selectAllFiltered = () => {
    const newSelections = [...new Set([...selectedOrganizations, ...filteredOrganizations])]
    setSelectedOrganizations(newSelections)
  }

  // Deselect all filtered organizations
  const deselectAllFiltered = () => {
    setSelectedOrganizations(prev => 
      prev.filter(org => !filteredOrganizations.includes(org))
    )
  }

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    const matchesOrganization = selectedOrganizations.length === 0 || 
                                (event.club && selectedOrganizations.includes(event.club))
    const matchesSearch = searchTerm === '' || 
                         event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (event.club && event.club.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesOrganization && matchesSearch
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isUpcoming = (dateString) => {
    return new Date(dateString) >= new Date()
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Workshop': 'bg-purple-100 text-purple-800',
      'Networking': 'bg-blue-100 text-blue-800',
      'Panel': 'bg-green-100 text-green-800',
      'Speaker': 'bg-yellow-100 text-yellow-800',
      'Competition': 'bg-red-100 text-red-800',
      'Applications': 'bg-amber-100 text-amber-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Conference': 'bg-indigo-100 text-indigo-800',
      'Site Visit': 'bg-teal-100 text-teal-800',
      'Info Session': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  // Group events by month for list view
  const eventsByMonth = filteredEvents.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(event)
    return acc
  }, {})

  const handleDayClick = (date, dayEvents) => {
    setSelectedDate(date)
    setSelectedDayEvents(dayEvents)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Business Events Calendar"
        description="Stay updated with upcoming business events, workshops, networking sessions, and competitions at the University of Florida. Find events from UF business organizations."
        keywords="UF business events, UF networking events, UF workshops, UF business calendar, UF career events, UF business competitions"
        canonical="/events"
      />
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-uf-orange to-orange-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">Calendar of Events</h1>
              <p className="text-orange-100 text-sm">
                From UF Business organizations and programs!
              </p>
            </div>
            
            {/* View Toggle - Moved to header */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-uf-orange'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-uf-orange'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Search and Organization Filter */}
        <div className="mb-4 space-y-3">
          {/* Search Bar */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events by name, description, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uf-orange focus:border-transparent shadow-sm"
            />
          </div>

          {/* Organization Filter Button & Selected Organizations */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowOrgFilter(!showOrgFilter)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showOrgFilter || selectedOrganizations.length > 0
                  ? 'bg-uf-blue text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Filter by Organization</span>
              {selectedOrganizations.length > 0 && (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
                  {selectedOrganizations.length}
                </span>
              )}
            </button>

            {/* Selected Organizations Tags */}
            {selectedOrganizations.length > 0 && (
              <>
                {selectedOrganizations.map(org => (
                  <button
                    key={org}
                    onClick={() => toggleOrganization(org)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-uf-orange text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    {org}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  onClick={clearOrgFilters}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"
                >
                  Clear all
                </button>
              </>
            )}
          </div>

          {/* Organization Filter Dropdown */}
          {showOrgFilter && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Select Organizations ({filteredOrganizations.length})
                </h3>
                <button
                  onClick={() => {
                    setShowOrgFilter(false)
                    setOrgSearchTerm('')
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search within organizations */}
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={orgSearchTerm}
                    onChange={(e) => setOrgSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                  />
                </div>
              </div>

              {/* Select/Deselect All */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={selectAllFiltered}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-uf-blue border border-uf-blue rounded-lg hover:bg-uf-blue hover:text-white transition-colors"
                >
                  Select All {orgSearchTerm && `(${filteredOrganizations.length})`}
                </button>
                <button
                  onClick={deselectAllFiltered}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Deselect All
                </button>
              </div>

              {/* Organization List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto border-t border-gray-200 pt-3">
                {filteredOrganizations.length > 0 ? (
                  filteredOrganizations.map(org => (
                    <label
                      key={org}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrganizations.includes(org)}
                        onChange={() => toggleOrganization(org)}
                        className="w-4 h-4 text-uf-orange focus:ring-uf-orange border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 leading-tight">{org}</span>
                    </label>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No organizations found</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Compact Category Filter - Hidden for cleaner look */}
        {viewMode === 'calendar' && false && (
          <div className="mb-4 bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="text-gray-600 h-4 w-4" />
              <span className="text-sm text-gray-700 font-medium">Filter:</span>
              {eventCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-uf-orange text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Calendar View with Side Panel */}
        {viewMode === 'calendar' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 min-h-0">
              <div className="h-full">
                <Calendar 
                  events={filteredEvents} 
                  onDayClick={handleDayClick}
                  selectedDate={selectedDate}
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
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <h3 className="text-2xl font-bold">
                        {new Date(selectedDate).getDate()}
                      </h3>
                      <p className="text-sm text-blue-100">
                        Events on {new Date(selectedDate).toLocaleDateString('en-US', { 
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="p-4 space-y-4">
                      {selectedDayEvents.map(event => (
                        <div key={event.id} className="border-l-4 border-uf-orange pl-4 py-2 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-bold text-gray-900 text-sm">{event.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ml-2 ${getCategoryColor(event.category)}`}>
                              {event.category}
                            </span>
                          </div>
                          <p className="text-xs text-uf-blue font-medium mb-2">{event.club}</p>
                          <p className="text-xs text-gray-600 mb-3">{event.description}</p>
                          <div className="space-y-1 text-xs text-gray-700">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-2 text-uf-orange" />
                              <span>{event.time}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-2 text-uf-orange" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.rsvp && (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-3 w-3 mr-2" />
                                <span className="font-medium">RSVP Required</span>
                              </div>
                            )}
                          </div>
                          {isUpcoming(event.date) && event.linkText && event.linkUrl && (
                            <a 
                              href={event.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 w-full bg-uf-orange text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-orange-600 transition-colors block text-center"
                            >
                              {event.linkText}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">Select a day to view events</p>
                    <p className="text-xs text-gray-400 mt-1">Days with dots have events</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div>
            {/* Category Filter for List View */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="text-gray-600 h-5 w-5" />
                <span className="text-gray-700 font-medium">Category:</span>
                {eventCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-uf-orange text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-uf-orange">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'event' : 'events'}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-uf-orange mx-auto mb-4" />
                <p className="text-gray-600">Loading events...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
                  <div key={month}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                      <CalendarIcon className="h-6 w-6 mr-2 text-uf-orange" />
                      {month}
                    </h2>
                    <div className="space-y-4">
                      {monthEvents.map(event => (
                        <div key={event.id} className="card p-6 hover:shadow-xl transition-shadow">
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 text-center">
                              <div className="bg-uf-orange text-white rounded-lg p-4 w-24">
                                <div className="text-3xl font-bold">
                                  {new Date(event.date).getDate()}
                                </div>
                                <div className="text-sm uppercase">
                                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                              </div>
                            </div>

                            {/* Event Details */}
                            <div className="flex-grow">
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                                  {event.category}
                                </span>
                              </div>
                              
                              <div className="text-gray-600 mb-3">
                                <span className="font-semibold text-uf-blue">{event.club}</span>
                              </div>

                              <p className="text-gray-700 mb-4">{event.description}</p>

                              <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-2 text-uf-orange flex-shrink-0" />
                                  <span>{formatDate(event.date)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-uf-orange flex-shrink-0" />
                                  <span>{event.time}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-uf-orange flex-shrink-0" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.rsvp && (
                                  <div className="flex items-center">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600 flex-shrink-0" />
                                    <span className="text-green-600 font-medium">RSVP Required</span>
                                  </div>
                                )}
                              </div>

                              {isUpcoming(event.date) && event.linkText && event.linkUrl && (
                                <div className="mt-4">
                                  <a 
                                    href={event.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary inline-block"
                                  >
                                    {event.linkText}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <CalendarIcon className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
                <p className="text-gray-600">Try selecting a different category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Events

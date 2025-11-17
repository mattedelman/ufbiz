import { useState, useEffect, useRef } from 'react'
import { Search, Users, Mail, ExternalLink, Filter, ArrowDownAZ, X, Calendar, MapPin, Clock } from 'lucide-react'
import { clubs, categories } from '../data/clubs'
import { getPublishedEvents, getEventsByOrganization } from '../lib/events'
import { getAllOrganizations } from '../lib/admin'
import { isSupabaseConfigured } from '../lib/supabase'
import SEO from '../components/SEO'

function ClubModal({ club, onClose, relatedEvents }) {
  const [imageError, setImageError] = useState(false)
  const modalRef = useRef(null)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
          <div className="flex items-start gap-4 flex-grow">
            {club.image && !imageError && (
              <img
                src={club.image}
                alt={club.name}
                className="flex-shrink-0 w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-md"
                onError={() => setImageError(true)}
              />
            )}
            <div className="flex-grow">
              <div className="mb-2 flex flex-wrap gap-1">
                {(Array.isArray(club.category) ? club.category : [club.category]).map((cat, idx) => (
                  cat && (
                    <span key={idx} className="inline-block px-2 py-0.5 bg-uf-orange/10 text-uf-orange text-xs font-semibold rounded-full">
                      {cat}
                    </span>
                  )
                ))}
              </div>
              <h3 className="text-2xl font-bold mb-2">{club.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          {/* Full Description */}
          {club.description && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">About</h4>
              <p className="text-gray-600 leading-relaxed">{club.description}</p>
            </div>
          )}

          {/* Contact & Links */}
          <div className="flex flex-wrap gap-3 mb-6">
            {club.email && (
              <a
                href={`mailto:${club.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-uf-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
            )}
            {club.website && (
              <a
                href={club.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            )}
          </div>

          {/* Related Events */}
          {relatedEvents && relatedEvents.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Upcoming Events</h4>
              <div className="space-y-4">
                {relatedEvents.map(event => (
                  <div key={event.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-900">{event.title}</h5>
                      {event.category && (
                        <span className="px-2 py-1 bg-uf-orange/10 text-uf-orange text-xs font-medium rounded">
                          {event.category}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {event.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                      {event.time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time}</span>
                        </div>
                      )}
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.linkUrl && (
                      <a
                        href={event.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block px-4 py-2 bg-uf-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        {event.linkText || 'Learn More'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(!relatedEvents || relatedEvents.length === 0) && (
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">Upcoming Events</h4>
              <p className="text-gray-500 text-sm">No upcoming events at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ClubCard({ club, onToggle }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div 
      className="group bg-white rounded-2xl p-6 flex flex-col cursor-pointer border-2 border-gray-100 hover:border-uf-orange/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={onToggle}
    >
      <div className={`flex items-start mb-4 ${club.image ? 'gap-4' : ''}`}>
        {/* Club Logo/Image - Only show if image exists */}
        {club.image && !imageError && (
          <img
            src={club.image}
            alt={club.name}
            className="flex-shrink-0 w-14 h-14 rounded-xl object-cover border-2 border-gray-200 shadow-sm group-hover:scale-110 transition-transform"
            onError={() => setImageError(true)}
          />
        )}
        <div className="flex-grow min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {(Array.isArray(club.category) ? club.category : [club.category]).map((cat, idx) => (
              cat && (
                <span key={idx} className="inline-block px-2.5 py-1 bg-uf-orange/10 text-uf-orange text-xs font-semibold rounded-lg">
                  {cat}
                </span>
              )
            ))}
          </div>
          <h3 className="text-xl font-bold leading-tight text-gray-900 group-hover:text-uf-blue transition-colors">{club.name}</h3>
        </div>
      </div>
      <p className="text-gray-600 mb-4 flex-grow leading-relaxed line-clamp-3">{club.description}</p>
      
      {club.members && (
        <div className="mb-4 text-sm text-gray-700">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Users className="h-4 w-4 text-uf-orange flex-shrink-0" />
            <span className="font-medium">{club.members} members</span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {club.email && (
          <a
            href={`mailto:${club.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-uf-blue text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium hover:scale-105"
          >
            <Mail className="h-4 w-4" />
            Contact
          </a>
        )}
        {club.website && (
          <a
            href={club.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-uf-orange hover:text-uf-orange transition-all text-sm font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Website
          </a>
        )}
      </div>
    </div>
  )
}

function Clubs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [expandedClubId, setExpandedClubId] = useState(null)
  const [events, setEvents] = useState([])
  const [organizations, setOrganizations] = useState([])

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

  // Fetch organizations and events from database
  useEffect(() => {
    const loadData = async () => {
      if (!isSupabaseConfigured()) {
        setEvents([])
        setOrganizations([])
        return
      }

      try {
        // Load organizations for matching
        const orgs = await getAllOrganizations()
        setOrganizations(orgs)

        // Load all published events
        const publishedEvents = await getPublishedEvents()
        // Transform database events to match component format
        const transformedEvents = publishedEvents.map(event => ({
          ...event,
          club: event.organizations?.name || 'Unknown Organization',
          organization_id: event.organization_id,
          linkUrl: event.link_url,
          linkText: event.link_text,
          // Format time to readable format
          time: formatTime(event.time)
        }))
        setEvents(transformedEvents)
      } catch (error) {
        console.error('Error loading data:', error)
        setEvents([])
        setOrganizations([])
      }
    }

    loadData()
  }, [])

  // Helper function to match events to clubs by name (fuzzy matching)
  const getRelatedEvents = (clubName) => {
    if (!clubName || !events || events.length === 0) return []
    
    // First, try to find matching organization in database
    const matchingOrg = organizations.find(org => 
      org.name.toLowerCase() === clubName.toLowerCase() ||
      org.name.toLowerCase().includes(clubName.toLowerCase()) ||
      clubName.toLowerCase().includes(org.name.toLowerCase())
    )
    
    const now = new Date()
    return events
      .filter(event => {
        // If we found a matching org, use organization_id for exact match
        if (matchingOrg && event.organization_id === matchingOrg.id) {
          return true
        }
        
        // Fallback to name matching
        if (!event.club) return false
        
        // Exact match
        if (event.club.toLowerCase() === clubName.toLowerCase()) return true
        
        // Partial match (club name contains event club name or vice versa)
        const clubLower = clubName.toLowerCase()
        const eventClubLower = event.club.toLowerCase()
        return clubLower.includes(eventClubLower) || eventClubLower.includes(clubLower)
      })
      .filter(event => {
        // Only show upcoming events (published events only)
        const eventDate = new Date(event.date)
        return eventDate >= now && event.status === 'published'
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort by date ascending
  }

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (club.description && club.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || 
                           (Array.isArray(club.category) ? club.category.includes(selectedCategory) : club.category === selectedCategory)
    return matchesSearch && matchesCategory
  })

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'category') {
      const aCategory = Array.isArray(a.category) ? a.category[0] || '' : a.category || ''
      const bCategory = Array.isArray(b.category) ? b.category[0] || '' : b.category || ''
      const categoryComparison = aCategory.localeCompare(bCategory)
      if (categoryComparison !== 0) return categoryComparison
    }
    return a.name.localeCompare(b.name)
  })

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "UF Business Organizations & Programs",
    "description": "Browse 50+ business organizations and programs at the University of Florida. Find clubs, societies, and programs that match your interests and career goals.",
    "url": "https://ufbiz.com/clubs",
    "isPartOf": {
      "@type": "WebSite",
      "name": "UFbiz",
      "url": "https://ufbiz.com"
    },
    "about": {
      "@type": "ItemList",
      "name": "Business Organizations",
      "numberOfItems": clubs.length,
      "itemListElement": clubs.slice(0, 10).map((club, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Organization",
          "name": club.name,
          "description": club.description,
          "url": club.instagram || club.linkedin || club.website
        }
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Business Organizations & Programs"
        description="Browse 50+ business organizations and programs at the University of Florida. Find clubs, societies, and programs that match your interests and career goals."
        keywords="UF business organizations, UF business clubs, UF business programs, UF student organizations, UF business societies"
        canonical="/clubs"
        structuredData={structuredData}
      />
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
            <span className="text-sm font-semibold text-white">50+ Organizations & Programs</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Organizations & programs</h1>
          <p className="text-xl text-blue-100">
            Find the perfect fit for your interests and goals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-uf-orange focus:border-transparent"
            />
          </div>
        </div>

        {/* Compact Filter & Sort Row */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="text-gray-600 h-4 w-4" />
            <span className="text-sm text-gray-700 font-medium">Category:</span>
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-uf-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <ArrowDownAZ className="h-4 w-4 text-gray-600" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg py-1.5 pl-2 pr-6 text-xs focus:ring-2 focus:ring-uf-orange focus:border-transparent bg-white"
            >
              <option value="name">A-Z</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>

        {/* Clubs Grid */}
        {sortedClubs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedClubs.map(club => (
                <ClubCard 
                  key={club.id} 
                  club={club}
                  onToggle={() => setExpandedClubId(club.id)}
                />
              ))}
            </div>
            
            {/* Modal Overlay */}
            {expandedClubId && (() => {
              const expandedClub = sortedClubs.find(c => c.id === expandedClubId)
              if (!expandedClub) return null
              const relatedEvents = getRelatedEvents(expandedClub.name)
              return (
                <ClubModal
                  club={expandedClub}
                  onClose={() => setExpandedClubId(null)}
                  relatedEvents={relatedEvents}
                />
              )
            })()}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No clubs found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Clubs


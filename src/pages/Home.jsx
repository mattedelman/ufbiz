import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { clubs } from '../data/clubs'
import SEO from '../components/SEO'

function RotatingMajor() {
  const majors = [
    "Business Administration",
    "Accounting",
    "Finance",
    "Information Systems",
    "Marketing",
    "Advertising",
    "Business Management",
    "Non-Business"
  ]
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % majors.length)
        setFade(true)
      }, 300)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={`font-bold text-uf-orange transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
      style={{ display: 'inline-block' }}
    >
      {majors[currentIndex]}
    </span>
  )
}

function Home() {
  const navigate = useNavigate()

  // Check for invite token in URL hash and redirect to signup
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    const errorCode = hashParams.get('error_code')
    
    // If there's an invite token or error, redirect to signup page
    if (accessToken || errorCode || type === 'invite') {
      const currentSearch = window.location.search
      const hash = window.location.hash
      // Preserve query params and hash, redirect to signup
      navigate(`/signup${currentSearch}${hash}`, { replace: true })
    }
  }, [navigate])

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UFbiz",
    "alternateName": "UF Business Resources",
    "url": "https://ufbiz.com",
    "description": "Discover 50+ business organizations, programs, and events at the University of Florida. Connect with the UF business community, find networking opportunities, and grow your career.",
    "publisher": {
      "@type": "Person",
      "name": "Matthew Edelman",
      "jobTitle": "Creator & Developer",
      "url": "https://www.linkedin.com/in/matthewedelman1/"
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "UFbiz",
      "description": "A comprehensive platform connecting University of Florida business students with organizations, programs, and events.",
      "foundingDate": "2025-11",
      "founder": {
        "@type": "Person",
        "name": "Matthew Edelman"
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://ufbiz.com/clubs?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <div>
      <SEO 
        title="Business Resources at UF"
        description="Discover 50+ business organizations, programs, and events at the University of Florida. Connect with the UF business community, find networking opportunities, and grow your career."
        keywords="UF business, University of Florida business organizations, UF business clubs, UF business events, UF networking, UF career resources"
        canonical="/"
        structuredData={structuredData}
      />
      {/* Hero Section - Redesigned */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8 animate-fade-in">
              <div className="w-2 h-2 bg-uf-orange rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white">50+ Organizations & Programs</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 animate-slide-up">
              <span className="text-white">Find your place in</span>
              <br />
              <span className="text-uf-orange">UF business</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '200ms'}}>
              Discover clubs, track events, and connect with the business community
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <Link to="/clubs" className="inline-flex items-center justify-center px-8 py-4 bg-white text-uf-blue font-semibold rounded-xl hover:scale-105 transition-all hover:shadow-xl">
                Browse Organizations & Programs
              </Link>
              <Link to="/events" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-uf-blue transition-all">
                View Events
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Organizations Section */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Featured Organizations</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Explore organizations & programs
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-white py-10 px-4 border border-gray-200">
            <div className="flex gap-8 animate-scroll">
              {(() => {
                const clubsWithImages = clubs.filter(club => club.image && club.image.trim() !== '')
                const duplicatedClubs = [...clubsWithImages, ...clubsWithImages]
                return duplicatedClubs.map((club, index) => (
                  <div
                    key={`${club.id}-${index}`}
                    className="flex-shrink-0 w-28 h-28 rounded-xl hover:scale-110 transition-transform duration-300 cursor-pointer"
                    title={club.name}
                  >
                    <img
                      src={club.image}
                      alt={club.name}
                      className="w-full h-full rounded-xl object-cover border-2 border-gray-200 shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need in one place
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A student-built platform connecting you with the UF business community
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all animate-slide-up" style={{animationDelay: '100ms'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-uf-blue to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">50+ Organizations</h3>
              <p className="text-gray-600">Student-run orgs and official Warrington programs</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all animate-slide-up" style={{animationDelay: '200ms'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-uf-orange to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Events Calendar</h3>
              <p className="text-gray-600">Workshops, networking sessions, and competitions</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-gray-50 transition-all animate-slide-up" style={{animationDelay: '300ms'}}>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy to Search</h3>
              <p className="text-gray-600">Filter by category and find what you need</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Simplified */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of UF students exploring business opportunities on campus
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/clubs" className="inline-flex items-center justify-center px-8 py-4 bg-uf-blue text-white font-semibold rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg">
              Browse Organizations & Programs
            </Link>
            <Link to="/events" className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-uf-orange hover:text-uf-orange transition-all">
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home


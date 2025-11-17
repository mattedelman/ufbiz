import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { onAuthStateChange, getCurrentUser } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'
import { Helmet } from 'react-helmet-async'

function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()

  // Check authentication status on mount and when location changes
  useEffect(() => {
    // Only check auth if Supabase is configured
    if (!isSupabaseConfigured()) {
      setIsAuthenticated(false)
      return
    }

    // Check initial auth state
    getCurrentUser().then((result) => {
      setIsAuthenticated(!!result?.user)
    }).catch(() => {
      setIsAuthenticated(false)
    })

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [location])

  // Build navigation based on auth status
  const baseNavigation = [
    { name: 'Home', path: '/' },
    { name: 'Organizations & Programs', path: '/clubs' },
    { name: 'Events', path: '/events' },
    { name: 'About', path: '/about' },
  ]

  const navigation = isAuthenticated
    ? [...baseNavigation, { name: 'Dashboard', path: '/dashboard' }]
    : [...baseNavigation, { name: 'Sign In', path: '/signin' }]

  const isActive = (path) => location.pathname === path

  const siteUrl = 'https://ufbiz.com'
  
  // Structured Data (JSON-LD) for Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "UFbiz",
    "description": "A comprehensive resource platform for business-related organizations, programs, and events at the University of Florida",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "sameAs": [],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Gainesville",
      "addressRegion": "FL",
      "addressCountry": "US"
    },
    "memberOf": {
      "@type": "CollegeOrUniversity",
      "name": "University of Florida"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UFbiz",
    "url": siteUrl,
    "description": "Business Resources at the University of Florida",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/clubs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      </Helmet>
      {/* Navigation - Redesigned */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-3xl font-bold">
                  <span className="text-uf-blue">UF</span>
                  <span className="text-uf-orange">biz</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-uf-orange text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-uf-blue'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-uf-orange"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-uf-orange bg-orange-50'
                      : 'text-gray-700 hover:text-uf-orange hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer - Redesigned */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-10 right-20 w-64 h-64 border border-white rounded-full"></div>
          <div className="absolute bottom-10 left-20 w-96 h-96 border border-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="mb-6">
                <span className="text-3xl font-bold">
                  <span className="text-uf-blue">UF</span>
                  <span className="text-uf-orange">biz</span>
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Your comprehensive resource for business-related organizations, programs, and events at the University of Florida.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-gray-300 hover:text-uf-orange transition-colors inline-flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-uf-orange transition-colors"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-6 text-white">About</h3>
              <p className="text-gray-300 mb-4 leading-relaxed">
                Created by Matthew Edelman, a CS student passionate about business and tech at UF.
              </p>
              <a 
                href="mailto:edelmanm@ufl.edu"
                className="inline-flex items-center gap-2 px-4 py-2 bg-uf-orange text-white rounded-lg hover:bg-orange-600 transition-all font-medium text-sm"
              >
                Get in Touch
              </a>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 mb-2">&copy; 2025 UFbiz. Built with ❤️ for the UF business community.</p>
            <p className="text-gray-500 text-sm">UFbiz is not officially affiliated with the University of Florida</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout


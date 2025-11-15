import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { onAuthStateChange, getCurrentUser } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  <span className="text-uf-blue">UF</span>
                  <span className="text-uf-orange">biz</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-uf-orange'
                      : 'text-gray-700 hover:text-uf-orange'
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <span className="text-xl font-bold">
                  <span className="text-uf-blue">UF</span>
                  <span className="text-uf-orange">biz</span>
                </span>
              </div>
              <p className="text-gray-400">
                Your comprehensive resource for business-related organizations, programs, and events at the University of Florida.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-gray-400 hover:text-uf-orange transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-400">
                Created by Matthew Edelman, a CS student passionate about business and tech at UF.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 UFbiz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout


import { Link } from 'react-router-dom'
import { Home, Search, Calendar, Users, AlertCircle } from 'lucide-react'

function NotFound() {
  const quickLinks = [
    {
      icon: Home,
      title: "Home",
      description: "Back to the main page",
      link: "/"
    },
    {
      icon: Users,
      title: "Organizations",
      description: "Browse business clubs & programs",
      link: "/clubs"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Find upcoming events",
      link: "/events"
    },
    {
      icon: Search,
      title: "Dashboard",
      description: "Search everything",
      link: "/dashboard"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-uf-orange/10 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-uf-orange" />
          </div>
          
          {/* Large 404 Text */}
          <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4">
            404
          </h1>
          
          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted, 
            or you may have mistyped the URL.
          </p>
        </div>

        {/* Quick Links */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Where would you like to go?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <Link
                  key={index}
                  to={link.link}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-uf-blue/10 rounded-full mb-3 group-hover:bg-uf-orange/10 transition-colors">
                    <Icon className="h-6 w-6 text-uf-blue group-hover:text-uf-orange transition-colors" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{link.title}</h4>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-uf-blue to-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-uf-blue transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="h-5 w-5" />
            Return to Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
          <p className="text-gray-600">
            Need help? Contact us at{' '}
            <a 
              href="mailto:contact@ufbiz.com" 
              className="text-uf-blue hover:text-blue-700 font-semibold transition-colors"
            >
              contact@ufbiz.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound


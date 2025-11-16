import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Large 404 Text */}
        <h1 className="text-9xl font-bold text-gray-200 mb-4">
          404
        </h1>
        
        {/* Error Message */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>

        {/* CTA Button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 bg-uf-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Home className="h-5 w-5" />
          Return to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound


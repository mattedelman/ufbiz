import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { signIn } from '../lib/auth'
import { isSupabaseConfigured } from '../lib/supabase'

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!supabaseConfigured) {
      setError('Supabase is not configured. Please set up your .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
      setLoading(false)
      return
    }
    
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    try {
      const { user, profile } = await signIn(email, password)
      
      if (user && profile) {
        // Store organization info
        if (profile.organizations) {
          localStorage.setItem('organizationName', profile.organizations.name)
          localStorage.setItem('organizationId', profile.organizations.id)
        }
        
        navigate('/dashboard')
      } else if (user && !profile) {
        setError('Your account is not linked to any organization. Please contact an administrator.')
      }
    } catch (err) {
      console.error('Sign in error:', err)
      if (err.message?.includes('Invalid login credentials') || err.message?.includes('Email not confirmed')) {
        setError('Invalid email or password. Please try again.')
      } else if (err.message?.includes('not linked')) {
        setError(err.message)
      } else {
        setError(err.message || 'An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-uf-blue to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Sign In</h1>
            <p className="text-lg text-blue-100">
              For club administrators and event managers
            </p>
          </div>
        </div>
      </div>

      {/* Sign In Form */}
      <div className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sign In to Your Account
            </h2>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="h-4 w-4 text-uf-orange focus:ring-uf-orange border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-sm text-uf-blue hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                This portal is for club administrators only.
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Club Administrators Only</h3>
            <p className="text-sm text-blue-800">
              Accounts must be created and linked to your organization by a system administrator.
            </p>
            <p className="text-sm text-blue-800 mt-2">
              If you're a club officer and need access, please contact{' '}
              <a href="mailto:edelmanm@ufl.edu" className="font-medium underline">
                edelmanm@ufl.edu
              </a>
            </p>
          </div>

          {/* Supabase Configuration Warning */}
          {!supabaseConfigured && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Supabase Not Configured</h3>
              <p className="text-sm text-yellow-800 mb-2">
                To enable authentication, please:
              </p>
              <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                <li>Create a <code className="bg-yellow-100 px-1 rounded">.env</code> file in the project root</li>
                <li>Add your Supabase credentials:
                  <pre className="bg-yellow-100 p-2 rounded mt-1 text-xs">
VITE_SUPABASE_URL=your_project_url{'\n'}VITE_SUPABASE_ANON_KEY=your_anon_key
                  </pre>
                </li>
                <li>Restart the dev server</li>
              </ol>
              <p className="text-sm text-yellow-800 mt-2">
                See <code className="bg-yellow-100 px-1 rounded">SETUP_INSTRUCTIONS.md</code> for details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignIn


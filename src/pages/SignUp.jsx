import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Mail, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isSupabaseConfigured } from '../lib/supabase'
import { linkUserToOrganization } from '../lib/admin'

function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [inviteData, setInviteData] = useState(null)
  const [success, setSuccess] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(false)

  useEffect(() => {
    setSupabaseConfigured(isSupabaseConfigured())
    if (!isSupabaseConfigured()) {
      setVerifying(false)
      return
    }

    // Check for invite token in URL hash (Supabase redirects here with token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const type = hashParams.get('type')
    const orgName = searchParams.get('org')

    if (accessToken) {
      // Supabase automatically handles the token, just verify we have a user
      verifyInviteToken(accessToken, type, orgName)
    } else {
      // Check if user is already in session (might have been set by Supabase redirect)
      checkExistingSession(orgName)
    }
  }, [searchParams])

  const verifyInviteToken = async (token, type, orgName) => {
    try {
      // Set session with the token from URL hash
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: ''
      })

      if (error) throw error

      if (data.user) {
        setInviteData({
          email: data.user.email,
          userId: data.user.id,
          organizationName: orgName || 'your organization'
        })
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch (err) {
      console.error('Token verification error:', err)
      setError('Invalid or expired invite link. Please request a new invite.')
    } finally {
      setVerifying(false)
    }
  }

  const checkExistingSession = async (orgName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setInviteData({
          email: user.email,
          userId: user.id,
          organizationName: orgName || 'your organization'
        })
      } else {
        setError('Invalid or missing invite link. Please request a new invite.')
      }
    } catch (err) {
      setError('Invalid or missing invite link. Please request a new invite.')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Update password for the invited user
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) throw updateError

      // If we have organization info, try to link the user
      if (inviteData?.userId) {
        try {
          // Get organization ID from name (you might want to improve this)
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id')
            .ilike('name', `%${inviteData.organizationName}%`)
            .limit(1)
            .single()

          if (orgs) {
            await linkUserToOrganization(inviteData.userId, orgs.id, inviteData.email)
          }
        } catch (linkError) {
          console.log('Note: User will need to be linked manually via dashboard')
        }
      }

      setSuccess(true)
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Sign up error:', err)
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase Not Configured</h2>
          <p className="text-gray-600 mb-4">
            Please configure Supabase in your .env file to enable sign-up.
          </p>
        </div>
      </div>
    )
  }

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-uf-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Invite</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full card p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created successfully. Redirecting to dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-uf-blue to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Create Your Account</h1>
            <p className="text-lg text-blue-100">
              {inviteData 
                ? `You've been invited to join ${inviteData.organizationName} on UFbiz`
                : 'Complete your account setup'}
            </p>
          </div>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Set Your Password
            </h2>

            {inviteData && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Email:</strong> {inviteData.email}
                </p>
                {inviteData.organizationName && (
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Organization:</strong> {inviteData.organizationName}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-uf-orange focus:border-transparent"
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <a href="/signin" className="text-uf-blue hover:text-blue-700 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp


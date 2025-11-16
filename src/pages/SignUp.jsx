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
    const orgId = searchParams.get('orgId') // Get organization ID from URL
    
    // Check for errors first (expired links, etc.) - but only if there's NO access token
    const errorCode = hashParams.get('error_code')
    const errorDescription = hashParams.get('error_description')
    
    // Only show error immediately if there's an error AND no access token
    if (errorCode && !accessToken) {
      if (errorCode === 'otp_expired') {
        setError('This invite link has expired. Please request a new invite from your administrator.')
      } else {
        setError(errorDescription || 'Invalid invite link. Please request a new invite.')
      }
      setVerifying(false)
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      return
    }

    if (accessToken) {
      // Process the token immediately
      verifyInviteToken(accessToken, type, orgName, orgId)
    } else {
      // If no token in URL, wait a moment for Supabase to process, then check session
      // This handles cases where Supabase is still processing the redirect
      setTimeout(() => {
        checkExistingSession(orgName, orgId)
      }, 500)
    }
  }, [searchParams])

  const verifyInviteToken = async (token, type, orgName, orgId) => {
    try {
      // Extract refresh token from hash if available
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const refreshToken = hashParams.get('refresh_token') || ''
      
      // Set session with the token from URL hash
      const { data, error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken
      })

      if (error) {
        // If session setting fails, check if it's because user already has a session
        // Try to get the current user instead
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Extract organization_id from user metadata (stored when invite was sent)
          const userOrgId = user.app_metadata?.organization_id || user.user_metadata?.organization_id || orgId
          
          setInviteData({
            email: user.email,
            userId: user.id,
            organizationName: orgName || user.app_metadata?.organization_name || user.user_metadata?.organization_name || 'your organization',
            organizationId: userOrgId // Store organization ID for linking
          })
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          setVerifying(false)
          return
        }
        throw error
      }

      if (data.user) {
        // Extract organization_id from user metadata (stored when invite was sent)
        const userOrgId = data.user.app_metadata?.organization_id || data.user.user_metadata?.organization_id || orgId
        
        setInviteData({
          email: data.user.email,
          userId: data.user.id,
          organizationName: orgName || data.user.app_metadata?.organization_name || data.user.user_metadata?.organization_name || 'your organization',
          organizationId: userOrgId // Store organization ID for linking
        })
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch (err) {
      console.error('Token verification error:', err)
      // Check if it's an expired link error
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const errorCode = hashParams.get('error_code')
      
      if (errorCode === 'otp_expired' || err.message?.includes('expired')) {
        setError('This invite link has expired. Please request a new invite from your administrator.')
      } else {
        setError('Invalid or expired invite link. Please request a new invite.')
      }
    } finally {
      setVerifying(false)
    }
  }

  const checkExistingSession = async (orgName, orgId) => {
    try {
      // First check if there's a token in the hash that we might have missed
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const errorCode = hashParams.get('error_code')
      
      // If we find a token now, process it
      if (accessToken) {
        const urlOrgId = new URLSearchParams(window.location.search).get('orgId')
        verifyInviteToken(accessToken, hashParams.get('type'), orgName, urlOrgId)
        return
      }
      
      // Only show error if there's an error code and no token
      if (errorCode === 'otp_expired') {
        setError('This invite link has expired. Please request a new invite from your administrator.')
        setVerifying(false)
        return
      }
      
      // Check if user is already in session (Supabase might have set it)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (user) {
        // Extract organization_id from user metadata (stored when invite was sent)
        const userOrgId = user.app_metadata?.organization_id || user.user_metadata?.organization_id || orgId
        
        setInviteData({
          email: user.email,
          userId: user.id,
          organizationName: orgName || user.app_metadata?.organization_name || user.user_metadata?.organization_name || 'your organization',
          organizationId: userOrgId // Store organization ID for linking
        })
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      } else if (!errorCode) {
        // Only show error if there's no error code (might still be processing)
        // Wait a bit more before showing error
        setTimeout(() => {
          const finalHashParams = new URLSearchParams(window.location.hash.substring(1))
          const finalToken = finalHashParams.get('access_token')
          const finalError = finalHashParams.get('error_code')
          
          if (!finalToken && !finalError) {
            setError('Invalid or missing invite link. Please request a new invite.')
            setVerifying(false)
          }
        }, 1000)
        return
      }
    } catch (err) {
      // Don't show error immediately - might still be processing
      console.log('Session check:', err)
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

      // Automatically link user to organization if we have the organization ID
      if (inviteData?.userId && inviteData?.organizationId) {
        try {
          // Wait a moment for the profile to be created by the trigger (if it hasn't been created yet)
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Try to link the user, with retry logic in case profile doesn't exist yet
          let linked = false
          let attempts = 0
          const maxAttempts = 3
          
          while (!linked && attempts < maxAttempts) {
            try {
              await linkUserToOrganization(inviteData.userId, inviteData.organizationId, inviteData.email)
              linked = true
              console.log('User successfully linked to organization')
            } catch (linkError) {
              attempts++
              if (attempts < maxAttempts) {
                // Wait a bit longer and try again (profile might still be creating)
                await new Promise(resolve => setTimeout(resolve, 1000))
              } else {
                throw linkError
              }
            }
          }
        } catch (linkError) {
          console.error('Error linking user to organization:', linkError)
          // Don't fail the sign-up if linking fails - user can be linked manually
          setError('Account created, but there was an issue linking you to your organization. Please contact your administrator.')
        }
      } else if (inviteData?.userId) {
        // If we don't have organization ID, try to find it by name (fallback)
        try {
          const { data: orgs } = await supabase
            .from('organizations')
            .select('id')
            .ilike('name', `%${inviteData.organizationName}%`)
            .limit(1)
            .single()

          if (orgs) {
            await linkUserToOrganization(inviteData.userId, orgs.id, inviteData.email)
          } else {
            console.warn('Could not find organization to link user to')
          }
        } catch (linkError) {
          console.error('Error linking user to organization:', linkError)
          setError('Account created, but there was an issue linking you to your organization. Please contact your administrator.')
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

  // If there's an error (like expired link), show a nice error page
  if (error && !inviteData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ color: '#FA4616' }}>
              Invite Link Expired
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              {error}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Need a new invite?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Contact your administrator at{' '}
                <a href="mailto:edelmanm@ufl.edu" className="font-semibold underline">
                  edelmanm@ufl.edu
                </a>
              </p>
            </div>
            <a 
              href="/" 
              className="inline-block px-6 py-3 bg-uf-blue text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Matches Email Template */}
      <div className="bg-gradient-to-br from-uf-blue via-blue-700 to-uf-orange text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FA4616' }}>
            You've been invited to join UFbiz! 🐊
          </h1>
          {inviteData ? (
            <p className="text-xl text-blue-100 mb-2">
              You've been invited to manage events for <strong>{inviteData.organizationName}</strong> on <strong>UFbiz</strong>
            </p>
          ) : (
            <p className="text-xl text-blue-100 mb-2">
              The hub for business organizations and events at the University of Florida
            </p>
          )}
          <p className="text-lg text-blue-100">
            Click below to create your account and start managing your organization's events
          </p>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Create Your Account
            </h2>
            <p className="text-center text-gray-600 mb-6">
              Set your password to get started
            </p>

            {inviteData && (
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> <span className="text-gray-900">{inviteData.email}</span>
                </p>
                {inviteData.organizationName && inviteData.organizationName !== 'your organization' && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Organization:</strong> <span className="text-gray-900">{inviteData.organizationName}</span>
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
                className="w-full py-3 px-6 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0021A5' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#001a85'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0021A5'}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create My Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500 text-center">
              This link will expire in 24 hours. If you didn't request this invite, you can safely ignore it.
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Already have an account?{' '}
                <a href="/signin" className="text-uf-blue hover:text-blue-700 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </div>

          {/* Footer matching email template */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              Go Gators! 🐊<br />
              - The UFbiz Team
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp


'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Building, Store } from 'lucide-react'

interface SignInResult {
  error?: string
  user?: {
    role: string
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const router = useRouter()

  const redirectByRole = (role: string): boolean => {
    switch (role) {
      case 'job_seeker':
      case 'job-seeker':
        router.push('/user/dashboard')
        return true
      case 'employer':
      case 'company':
        router.push('/company/dashboard')
        return true
      case 'vendor':
        router.push('/vendor/dashboard')
        return true
      default:
        return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result: SignInResult = await signIn(email, password)
      console.log('signIn result:', result)
      if (result?.error) {
        setError(result.error)
      } else if (result?.user?.role) {
        const redirected = redirectByRole(result.user.role)
        if (!redirected) {
          setError(`Unknown user role: ${result.user.role}`)
        }
      } else {
        setError('Invalid credentials or missing user role.')
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const roleFeatures = [
    {
      role: 'Job Seeker',
      icon: User,
      features: [
        'Browse thousands of jobs',
        'Apply with one click',
        'Track applications',
        'Get job recommendations'
      ],
      color: 'text-blue-600'
    },
    {
      role: 'Company',
      icon: Building,
      features: [
        'Post unlimited jobs',
        'Access talent pool',
        'Manage applications',
        'Company branding'
      ],
      color: 'text-green-600'
    },
    {
      role: 'Vendor',
      icon: Store,
      features: [
        'Offer services',
        'Connect with companies',
        'Manage projects',
        'Build reputation'
      ],
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex">
        {/* Left Side - Login Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Link href="/" className="text-3xl font-bold text-blue-600">
                JobPortal
              </Link>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign up for free
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 text-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="appearance-none block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none text-black focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPassword(show => !show)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>

              {/* Social Login Options (optional placeholders) */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Sign in with Google</span>
                    Google
                  </button>
                  <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Sign in with LinkedIn</span>
                    LinkedIn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-white">
          <div className="max-w-md">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">
              Join thousands of professionals
            </h3>
            <div className="space-y-6">
              {roleFeatures.map((item, index) => {
                const IconComponent = item.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center ${item.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.role}
                      </h4>
                      <ul className="space-y-1">
                        {item.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>📈 Success Stories:</strong> Over 10,000 professionals have found their dream jobs through our platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

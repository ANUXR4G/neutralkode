'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, Building, Store, CheckCircle } from 'lucide-react'

interface SignUpData {
  fullName: string
  role: string
  phone: string
  companyName: string
  serviceType: string
}

// Updated to match the AuthContext SignUpResult
interface SignUpResult {
  success: boolean
  message?: string
  user?: {
    id: string
    email: string
    full_name: string
    role: string
    phone?: string
    location?: string
    bio?: string
    avatar_url?: string
    resume_url?: string
    company_name?: string
    service_type?: string
    created_at?: string
    updated_at?: string
  } | null
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'job_seeker',
    companyName: '',
    serviceType: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedRole, setSelectedRole] = useState('job_seeker')

  const { signUp } = useAuth()
  const router = useRouter()

  const roles = [
    {
      id: 'job_seeker',
      label: 'Job Seeker',
      description: 'Looking for job opportunities',
      icon: User,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      features: [
        'Browse unlimited jobs',
        'Apply to positions',
        'Track applications',
        'Build profile & upload resume',
        'Get job recommendations',
        'Save favorite jobs'
      ],
      dashboardAccess: '/profile',
      additionalFields: []
    },
    {
      id: 'employer',
      label: 'Company/Employer',
      description: 'Hiring talented professionals',
      icon: Building,
      color: 'bg-green-50 border-green-200 text-green-700',
      features: [
        'Post unlimited jobs',
        'Access talent database',
        'Manage applications',
        'Company branding',
        'Analytics & insights',
        'Team collaboration tools'
      ],
      dashboardAccess: '/profile',
      additionalFields: ['companyName']
    },
    {
      id: 'vendor',
      label: 'Service Vendor',
      description: 'Providing services to companies',
      icon: Store,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      features: [
        'Offer professional services',
        'Connect with companies',
        'Manage projects',
        'Build service portfolio',
        'Client relationship management',
        'Revenue tracking'
      ],
      dashboardAccess: '/profile',
      additionalFields: ['serviceType']
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }
    if (formData.role === 'employer' && !formData.companyName.trim()) {
      setError('Company name is required for employers')
      setLoading(false)
      return
    }
    if (formData.role === 'vendor' && !formData.serviceType.trim()) {
      setError('Service type is required for vendors')
      setLoading(false)
      return
    }

    try {
      // Remove the type annotation to let TypeScript infer the correct type from AuthContext
      const result = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        role: formData.role,
        phone: formData.phone,
        companyName: formData.companyName,
        serviceType: formData.serviceType
      })

      if (result.success) {
        if (result.message) {
          // Email confirmation required
          setSuccess(result.message)
        } else if (result.user) {
          // User created and logged in successfully
          setSuccess('Account created successfully! Redirecting to your profile...')
          setTimeout(() => {
            router.push('/profile')
          }, 1500)
        } else {
          // Account created but needs confirmation
          setSuccess('Account created successfully! Please check your email to confirm your account.')
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    setFormData(prev => ({
      ...prev,
      role: roleId
    }))
  }

  const selectedRoleData = roles.find(r => r.id === selectedRole)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-blue-600">
            JobPortal
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Role Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Role</h3>
              <div className="space-y-4">
                {roles.map((role) => {
                  const IconComponent = role.icon
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleChange(role.id)}
                      className={`relative cursor-pointer rounded-lg p-4 border-2 transition-all hover:shadow-md ${
                        selectedRole === role.id 
                          ? role.color + ' border-2' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{role.label}</p>
                              <p className="text-xs text-gray-500">{role.description}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              selectedRole === role.id 
                                ? 'bg-current border-current' 
                                : 'border-gray-300'
                            }`}>
                              {selectedRole === role.id && (
                                <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                              )}
                            </div>
                          </div>
                          {/* Features preview */}
                          <div className="mt-2 space-y-1">
                            {role.features.slice(0, 3).map((feature, idx) => (
                              <div key={idx} className="flex items-center text-xs text-gray-600">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                {feature}
                              </div>
                            ))}
                            {role.features.length > 3 && (
                              <p className="text-xs text-gray-500">+{role.features.length - 3} more features</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Role Benefits Preview */}
              {selectedRoleData && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">
                    What you&apos;ll get as a {selectedRoleData.label}:
                  </h4>
                  <div className="space-y-2">
                    {selectedRoleData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    Dashboard Access: <span className="font-medium">{selectedRoleData.dashboardAccess}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Registration Form */}
            <div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

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
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Conditional Fields */}
                {formData.role === 'employer' && (
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        required
                        className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your company name"
                        value={formData.companyName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {formData.role === 'vendor' && (
                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
                      Service Type *
                    </label>
                    <div className="mt-1">
                      <select
                        id="serviceType"
                        name="serviceType"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={formData.serviceType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select service type</option>
                        <option value="Recruitment">Recruitment Services</option>
                        <option value="Training">Training & Development</option>
                        <option value="Consulting">HR Consulting</option>
                        <option value="Payroll">Payroll Services</option>
                        <option value="Background Check">Background Verification</option>
                        <option value="IT Services">IT Services</option>
                        <option value="Marketing">Marketing Services</option>
                        <option value="Legal">Legal Services</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

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
                      autoComplete="new-password"
                      required
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    name="agree-terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                    I agree to the{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </Link>
                  </label>
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
                        Creating account...
                      </div>
                    ) : (
                      `Create ${selectedRoleData?.label} Account`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

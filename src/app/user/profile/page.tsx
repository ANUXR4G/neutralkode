'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, Mail, Phone, Compass, FileText, UploadCloud, ArrowLeft, Settings, CheckCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from "lucide-react"

interface FormData {
  full_name: string
  phone: string
  location: string
  bio: string
  avatar_url: string
  resume_url: string
}

interface ExtendedProfile {
  full_name: string
  email: string
  role: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  resume_url?: string
}

export default function ProfilePage() {
  const { user, profile, updateProfile, refreshProfile, loading: authLoading, initialised, signOut } = useAuth()
  const [edit, setEdit] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [bypassAuth, setBypassAuth] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [form, setForm] = useState<FormData>({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    avatar_url: '',
    resume_url: ''
  })

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false
    const extendedProfile = profile as ExtendedProfile
    return !!(extendedProfile.full_name && 
             extendedProfile.phone && 
             extendedProfile.location && 
             extendedProfile.bio)
  }

  useEffect(() => {
    if (profile) {
      const extendedProfile = profile as ExtendedProfile
      setForm({
        full_name: extendedProfile.full_name || '',
        phone: extendedProfile.phone || '',
        location: extendedProfile.location || '',
        bio: extendedProfile.bio || '',
        avatar_url: extendedProfile.avatar_url || '',
        resume_url: extendedProfile.resume_url || ''
      })
      
      if (!isProfileComplete()) {
        setEdit(true)
      }
    }
  }, [profile])

  // Modified: Only redirect if not bypassing auth
  useEffect(() => {
    if (!bypassAuth && initialised && !authLoading && !user) {
      console.log('Redirecting to login - no user found after initialization')
      router.push('/auth/login')
    }
  }, [initialised, authLoading, user, router, bypassAuth])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await updateProfile(form)
      setSuccess('Profile updated successfully!')
      setEdit(false)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(file: File) {
    if (!user) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }
    
    setLoading(true)
    setError('')
    
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })
    
    if (error) {
      setError('Avatar upload failed: ' + error.message)
      setLoading(false)
      return
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    setForm({ ...form, avatar_url: publicUrl })
    setSuccess('Avatar uploaded successfully!')
    setLoading(false)
  }

  async function handleResumeUpload(file: File) {
    if (!user) return
    
    if (file.size > 10 * 1024 * 1024) {
      setError('Resume size must be less than 10MB')
      return
    }
    
    setLoading(true)
    setError('')
    
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/resume_${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true })
    
    if (error) {
      setError('Resume upload failed: ' + error.message)
      setLoading(false)
      return
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath)
    
    setForm({ ...form, resume_url: publicUrl })
    setSuccess('Resume uploaded successfully!')
    setLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/auth/login')
  }

  async function handleRefresh() {
    try {
      setError('')
      setSuccess('')
      await refreshProfile()
      setSuccess('Profile refreshed successfully!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh profile'
      setError('Failed to refresh profile: ' + errorMessage)
    }
  }

  // Modified: Bypass auth check when user clicks reload
  const handleReload = () => {
    setBypassAuth(true)
    window.location.reload()
  }

  // Show loading only during initial authentication check (unless bypassing)


  // Modified: Show error with bypass option
  if (!bypassAuth && initialised && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-lg text-red-600 mb-4">Unable to load profile</div>
          <div className="space-y-2">
            <button
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg mr-2"
            >
              View Profile Anyway
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Modified: Handle case when bypassing auth but no profile data
  const completionPercentage = () => {
    if (!profile && !bypassAuth) return 0
    
    if (bypassAuth && !profile) {
      // Return a default percentage when bypassing auth
      return 0
    }
    
    const extendedProfile = profile as ExtendedProfile
    const fields = [
      extendedProfile.full_name,
      extendedProfile.phone,
      extendedProfile.location,
      extendedProfile.bio,
      extendedProfile.avatar_url
    ]
    const completedFields = fields.filter(field => field && field.length > 0).length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Modified: Handle case when profile might be null due to bypass
  const currentProfile = (profile as ExtendedProfile) || {
    full_name: 'Demo User',
    email: 'demo@example.com',
    role: 'job_seeker',
    phone: '',
    location: '',
    bio: '',
    avatar_url: '',
    resume_url: ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modified: Show bypass notice */}
      {bypassAuth && !profile && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-yellow-800 text-sm">
              <strong>Demo Mode:</strong> Viewing profile without authentication. Some features may be limited.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionPercentage()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{completionPercentage()}% complete</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!bypassAuth && (
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh Profile"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600" />
                </button>
              )}
              <div className="text-sm text-gray-600">
                Role: <span className="font-medium capitalize">{currentProfile.role}</span>
              </div>
              {!bypassAuth && (
                <button
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Profile Completion Banner */}
        {!isProfileComplete() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Complete Your Profile</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Add more details to improve your visibility and opportunities.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                {form.avatar_url ? (
                  <img 
                    src={form.avatar_url} 
                    alt="Profile Avatar" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-100">
                    <User className="h-10 w-10 text-white" />
                  </div>
                )}
                {edit && !bypassAuth && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
                    <UploadCloud className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleAvatarUpload(file)
                      }}
                    />
                  </label>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentProfile.full_name || 'Complete Your Name'}
                </h2>
                <p className="text-gray-600">{currentProfile.email}</p>
                <p className="text-sm text-gray-500 capitalize">{currentProfile.role}</p>
              </div>
            </div>
            {!edit && !bypassAuth && (
              <button
                type="button"
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                onClick={() => setEdit(true)}
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black ${
                    !edit || bypassAuth ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  value={form.full_name}
                  disabled={!edit || bypassAuth}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  className="pl-10 pr-4 py-3 w-full border rounded-lg bg-gray-50 cursor-not-allowed text-black"
                  value={currentProfile.email}
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !edit || bypassAuth ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  value={form.phone}
                  disabled={!edit || bypassAuth}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    !edit || bypassAuth ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                  }`}
                  value={form.location}
                  disabled={!edit || bypassAuth}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Enter your location"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                className={`w-full border rounded-lg py-3 px-4 focus:ring-2 text-black focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none ${
                  !edit || bypassAuth ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
                }`}
                rows={4}
                disabled={!edit || bypassAuth}
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Resume Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                {form.resume_url ? (
                  <div className="flex items-center justify-between">
                    <a 
                      href={form.resume_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      View Current Resume
                    </a>
                    {edit && !bypassAuth && (
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                        <span className="text-sm">Update Resume</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleResumeUpload(file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm mb-2">No resume uploaded</p>
                    {edit && !bypassAuth && (
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block">
                        <span className="text-sm">Upload Resume</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleResumeUpload(file)
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, DOC, DOCX (Max 10MB)
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 text-sm">{success}</div>
              </div>
            )}

            {/* Action Buttons */}
            {edit && !bypassAuth && (
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={() => {
                    const extendedProfile = currentProfile as ExtendedProfile
                    setForm({
                      full_name: extendedProfile.full_name || '',
                      phone: extendedProfile.phone || '',
                      location: extendedProfile.location || '',
                      bio: extendedProfile.bio || '',
                      avatar_url: extendedProfile.avatar_url || '',
                      resume_url: extendedProfile.resume_url || ''
                    })
                    if (isProfileComplete()) {
                      setEdit(false)
                    }
                    setSuccess('')
                    setError('')
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Show login prompt for bypassed users */}
            {bypassAuth && (
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/auth/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                >
                  Login to Edit Profile
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

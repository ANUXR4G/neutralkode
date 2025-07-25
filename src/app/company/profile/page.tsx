'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import {
  Building, Mail, Phone, Globe, MapPin, Users, Calendar, Edit,
  Save, X, Camera, ArrowLeft, ExternalLink, Briefcase,
  AlertCircle, CheckCircle, Loader
} from 'lucide-react'
import Link from 'next/link'

export default function CompanyProfile() {
  const {
    user,
    updateProfile,
    updateCompanyProfile,
    refreshProfile,
    uploadFile,
    loading: authLoading,
    initialised,
  } = useAuth()

  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    website: '',
    industry: '',
    companySize: '',
    location: '',
    headquarters: '',
    foundedYear: '',
    companyCulture: '',
    employeeCountRange: '',
    benefits: [] as string[],
    fullName: '',
    email: '',
    phone: '',
    userLocation: '',
    bio: '',
  })

  const [newBenefit, setNewBenefit] = useState('')

  // Populate form from user data
  useEffect(() => {
    if (user && initialised) {
      console.log('🔄 Populating form with user data:', user)
      setFormData({
        companyName: user.company?.name || '',
        description: user.company?.description || '',
        website: user.company?.website || '',
        industry: user.company?.industry || '',
        companySize: user.company?.company_size || '',
        location: user.company?.location || '',
        headquarters: user.company?.headquarters || '',
        foundedYear: user.company?.founded_year?.toString() || '',
        companyCulture: user.company?.company_culture || '',
        employeeCountRange: user.company?.employee_count_range || '',
        benefits: Array.isArray(user.company?.benefits) ? user.company.benefits : [],
        fullName: user.profile?.full_name || '',
        email: user.profile?.email || '',
        phone: user.profile?.phone || '',
        userLocation: user.profile?.location || '',
        bio: user.profile?.bio || '',
      })
    }
  }, [user, initialised])

  const showError = (message: string) => {
    console.error('❌ Error:', message)
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  const showSuccess = (message: string) => {
    console.log('✅ Success:', message)
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((b) => b !== benefit),
    }))
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    console.log('🔄 Starting logo upload:', file.name)
    
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingLogo(true)
      setError(null)
      
      // Ensure we have a company or create one first
      let companyId = user?.company?.id
      if (!companyId && formData.companyName.trim()) {
        console.log('🏢 No company exists, creating one first...')
        const newCompany = await updateCompanyProfile({
          name: formData.companyName.trim(),
          description: formData.description || undefined,
          industry: formData.industry || undefined,
          company_size: formData.companySize || undefined,
          location: formData.location || undefined,
        })
        companyId = newCompany.id
        console.log('✅ Company created with ID:', companyId)
      }
      
      if (!companyId) {
        showError('Please fill in company name first')
        return
      }

      const fileName = `company-${companyId}-${Date.now()}.${file.name.split('.').pop()}`
      console.log('📤 Uploading file:', fileName)
      
      const logoUrl = await uploadFile(file, 'company-logos', fileName)
      console.log('✅ Logo uploaded to:', logoUrl)
      
      await updateCompanyProfile({ logo_url: logoUrl })
      showSuccess('Logo updated successfully!')
      
    } catch (error: any) {
      console.error('❌ Logo upload error:', error)
      showError(error?.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user?.profile?.id) return
    
    console.log('🔄 Starting avatar upload:', file.name)
    
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB')
      return
    }

    try {
      setUploadingAvatar(true)
      setError(null)
      
      const fileName = `avatar-${user.profile.id}-${Date.now()}.${file.name.split('.').pop()}`
      console.log('📤 Uploading avatar:', fileName)
      
      const avatarUrl = await uploadFile(file, 'avatars', fileName)
      console.log('✅ Avatar uploaded to:', avatarUrl)
      
      await updateProfile({ avatar_url: avatarUrl })
      showSuccess('Avatar updated successfully!')
      
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error)
      showError(error?.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      showError('Company name is required')
      return false
    }
    if (!formData.fullName.trim()) {
      showError('Full name is required')
      return false
    }
    
    // Validate website URL if provided
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website)
      } catch {
        showError('Please enter a valid website URL (e.g., https://example.com)')
        return false
      }
    }
    
    // Validate founded year if provided
    if (formData.foundedYear && formData.foundedYear.trim()) {
      const year = parseInt(formData.foundedYear)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1800 || year > currentYear) {
        showError(`Please enter a valid year between 1800 and ${currentYear}`)
        return false
      }
    }
    
    return true
  }
  const handleSave = async () => {
    if (!user) {
      console.error('No user found')
      showError('No user found')
      return
    }
  
    try {
      setSaving(true)
      setError(null)
      
      console.log('🔄 Starting save with user:', user.profile.id)
      
      // Test 1: Update profile only
      console.log('📝 Updating profile...')
      await updateProfile({
        full_name: formData.fullName.trim() || 'Test User',
      })
      console.log('✅ Profile updated successfully')
      
      // Test 2: Update/create company
      console.log('🏢 Updating company...')
      const result = await updateCompanyProfile({
        name: formData.companyName.trim() || 'Test Company',
      })
      console.log('✅ Company updated successfully:', result)
      
      showSuccess('Profile saved successfully!')
      setEditing(false)
      
    } catch (error) {
      console.error('❌ Save failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      showError(`Save failed: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }
  

  const cancelEdit = () => {
    setEditing(false)
    setError(null)
    setSuccess(null)
    
    // Reset form to current user data
    if (user) {
      setFormData({
        companyName: user.company?.name || '',
        description: user.company?.description || '',
        website: user.company?.website || '',
        industry: user.company?.industry || '',
        companySize: user.company?.company_size || '',
        location: user.company?.location || '',
        headquarters: user.company?.headquarters || '',
        foundedYear: user.company?.founded_year?.toString() || '',
        companyCulture: user.company?.company_culture || '',
        employeeCountRange: user.company?.employee_count_range || '',
        benefits: Array.isArray(user.company?.benefits) ? user.company.benefits : [],
        fullName: user.profile?.full_name || '',
        email: user.profile?.email || '',
        phone: user.profile?.phone || '',
        userLocation: user.profile?.location || '',
        bio: user.profile?.bio || '',
      })
    }
  }

  if (authLoading || !initialised) {
    return (
      <ProtectedRoute allowedRoles={['company']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!user) {
    return (
      <ProtectedRoute allowedRoles={['company']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">Unable to load profile data.</p>
            <button
              onClick={refreshProfile}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['company']}>
      <div className="min-h-screen bg-gray-50">
        {/* Error Alert */}
        {error && (
          <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-3 text-red-400 hover:text-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-md">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="ml-3 text-green-400 hover:text-green-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href="/company/dashboard" 
                  className="text-gray-600 hover:text-gray-800 flex items-center transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
              </div>
              <div className="flex space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center disabled:opacity-50 transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50 transition-colors"
                    >
                      {saving ? (
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Profile Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Company Overview Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6 mb-6">
                {/* Company Logo */}
                <div className="relative group">
                  {user.company?.logo_url ? (
                    <img
                      src={user.company.logo_url}
                      alt="Company Logo"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo ? (
                          <Loader className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </label>
                    </div>
                  )}
                  {editing && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Click to upload
                      </span>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        placeholder="Company Name *"
                        className="w-full text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent pb-2"
                        required
                      />
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Company Description"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {user.company?.name || 'Company Name'}
                        </h2>
                        {user.company?.is_verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">
                        {user.company?.description || 'No description available'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {user.company?.industry && (
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {user.company.industry}
                          </div>
                        )}
                        {user.company?.company_size && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {user.company.company_size} employees
                          </div>
                        )}
                        {user.company?.founded_year && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Founded {user.company.founded_year}
                          </div>
                        )}
                        {user.company?.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            <a
                              href={user.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                            >
                              Visit Website
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Details</h3>
              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Technology, Healthcare, Finance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={formData.foundedYear}
                      onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2010"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Culture</label>
                    <textarea
                      value={formData.companyCulture}
                      onChange={(e) => handleInputChange('companyCulture', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe your company culture, values, and work environment..."
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Industry</h4>
                    <p className="text-gray-900">{user.company?.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Company Size</h4>
                    <p className="text-gray-900">{user.company?.company_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Founded</h4>
                    <p className="text-gray-900">{user.company?.founded_year || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                    <p className="text-gray-900">{user.company?.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Headquarters</h4>
                    <p className="text-gray-900">{user.company?.headquarters || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Company Culture</h4>
                    <p className="text-gray-900">{user.company?.company_culture || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Benefits</h3>
              {editing ? (
                <div>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Add a benefit (e.g., Health Insurance, Remote Work)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <button
                      onClick={addBenefit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {benefit}
                        <button
                          onClick={() => removeBenefit(benefit)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {formData.benefits.length === 0 && (
                    <p className="text-gray-500 text-sm">No benefits added yet. Add some to attract talent!</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.company?.benefits && user.company.benefits.length > 0 ? (
                    user.company.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {benefit}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No benefits listed</p>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Profile</h3>
              <div className="flex items-start space-x-6">
                {/* User Avatar */}
                <div className="relative group">
                  {user.profile?.avatar_url ? (
                    <img
                      src={user.profile.avatar_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600">
                        {user.profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={uploadingAvatar}
                        />
                        {uploadingAvatar ? (
                          <Loader className="h-5 w-5 text-white animate-spin" />
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </label>
                    </div>
                  )}
                  {editing && (
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Click to upload
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.userLocation}
                          onChange={(e) => handleInputChange('userLocation', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your location"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Tell us about yourself and your role at the company..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {user.profile?.full_name || 'Name not set'}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.profile?.email}
                        </div>
                        {user.profile?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.profile.phone}
                          </div>
                        )}
                        {user.profile?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {user.profile.location}
                          </div>
                        )}
                      </div>
                      {user.profile?.bio && (
                        <p className="text-gray-700 mt-3">{user.profile.bio}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

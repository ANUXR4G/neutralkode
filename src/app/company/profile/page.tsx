'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { supabase } from '../../../lib/supabase'
import {
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Calendar,
  Edit,
  Save,
  X,
  Upload,
  Camera,
  ArrowLeft,
  ExternalLink,
  Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface CompanyProfile {
  id: string
  name: string
  description?: string
  website?: string
  logo_url?: string
  industry?: string
  company_size?: string
  location?: string
  headquarters?: string
  founded_year?: number
  is_verified: boolean
  benefits?: string[]
  company_culture?: string
  social_media?: any
  employee_count_range?: string
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
}

export default function CompanyProfile() {
  const { user, updateProfile } = useAuth()
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    // Company fields
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
    // User fields
    fullName: '',
    email: '',
    phone: '',
    userLocation: '',
    bio: ''
  })

  const [newBenefit, setNewBenefit] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfiles()
    }
  }, [user])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      
      // Fetch company profile
      if (user?.company?.id) {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.company.id)
          .single()

        if (companyError && companyError.code !== 'PGRST116') {
          throw companyError
        }
        
        if (company) {
          setCompanyProfile(company)
        }
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.profile.id)
        .single()

      if (profileError) throw profileError
      
      setUserProfile(profile)

      // Initialize form data
      setFormData({
        companyName: companyProfile?.name || '',
        description: companyProfile?.description || '',
        website: companyProfile?.website || '',
        industry: companyProfile?.industry || '',
        companySize: companyProfile?.company_size || '',
        location: companyProfile?.location || '',
        headquarters: companyProfile?.headquarters || '',
        foundedYear: companyProfile?.founded_year?.toString() || '',
        companyCulture: companyProfile?.company_culture || '',
        employeeCountRange: companyProfile?.employee_count_range || '',
        benefits: companyProfile?.benefits || [],
        fullName: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        userLocation: profile?.location || '',
        bio: profile?.bio || ''
      })

    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }))
      setNewBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }))
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return publicUrl
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !companyProfile) return

    try {
      setUploadingLogo(true)
      const fileName = `${companyProfile.id}-${Date.now()}.${file.name.split('.').pop()}`
      const logoUrl = await uploadFile(file, 'company-logos', fileName)

      const { error } = await supabase
        .from('companies')
        .update({ logo_url: logoUrl })
        .eq('id', companyProfile.id)

      if (error) throw error

      setCompanyProfile(prev => prev ? { ...prev, logo_url: logoUrl } : null)
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !userProfile) return

    try {
      setUploadingAvatar(true)
      const fileName = `${userProfile.id}-${Date.now()}.${file.name.split('.').pop()}`
      const avatarUrl = await uploadFile(file, 'avatars', fileName)

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', userProfile.id)

      if (error) throw error

      setUserProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null)
      await updateProfile({ avatar_url: avatarUrl })
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          phone: formData.phone,
          location: formData.userLocation,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.profile.id)

      if (profileError) throw profileError

      // Update company profile if it exists
      if (user.company?.id) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: formData.companyName,
            description: formData.description,
            website: formData.website,
            industry: formData.industry,
            company_size: formData.companySize,
            location: formData.location,
            headquarters: formData.headquarters,
            founded_year: formData.foundedYear ? parseInt(formData.foundedYear) : null,
            company_culture: formData.companyCulture,
            employee_count_range: formData.employeeCountRange,
            benefits: formData.benefits,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.company.id)

        if (companyError) throw companyError
      }

      // Update local auth context
      await updateProfile({
        full_name: formData.fullName,
        phone: formData.phone,
        location: formData.userLocation,
        bio: formData.bio
      })

      // Refresh data
      await fetchProfiles()
      setEditing(false)

    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    // Reset form data
    if (companyProfile && userProfile) {
      setFormData({
        companyName: companyProfile.name,
        description: companyProfile.description || '',
        website: companyProfile.website || '',
        industry: companyProfile.industry || '',
        companySize: companyProfile.company_size || '',
        location: companyProfile.location || '',
        headquarters: companyProfile.headquarters || '',
        foundedYear: companyProfile.founded_year?.toString() || '',
        companyCulture: companyProfile.company_culture || '',
        employeeCountRange: companyProfile.employee_count_range || '',
        benefits: companyProfile.benefits || [],
        fullName: userProfile.full_name,
        email: userProfile.email,
        phone: userProfile.phone || '',
        userLocation: userProfile.location || '',
        bio: userProfile.bio || ''
      })
    }
  }

  if (loading) {
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

  return (
    <ProtectedRoute allowedRoles={['company']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/company/dashboard"
                  className="text-gray-600 hover:text-gray-800 flex items-center"
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Company Overview Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6 mb-6">
                {/* Company Logo */}
                <div className="relative">
                  {companyProfile?.logo_url ? (
                    <img
                      src={companyProfile.logo_url}
                      alt="Company Logo"
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-blue-600 flex items-center justify-center">
                      <Building className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {uploadingLogo ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </label>
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
                        placeholder="Company Name"
                        className="w-full text-2xl font-bold border-b-2 border-gray-300 focus:border-blue-500 outline-none bg-transparent"
                      />
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Company Description"
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {companyProfile?.name || 'Company Name'}
                        </h2>
                        {companyProfile?.is_verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4">
                        {companyProfile?.description || 'No description available'}
                      </p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        {companyProfile?.industry && (
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {companyProfile.industry}
                          </div>
                        )}
                        {companyProfile?.company_size && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {companyProfile.company_size} employees
                          </div>
                        )}
                        {companyProfile?.founded_year && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Founded {companyProfile.founded_year}
                          </div>
                        )}
                        {companyProfile?.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-1" />
                            <a
                              href={companyProfile.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center"
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

            {/* Company Details */}
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
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Headquarters</label>
                    <input
                      type="text"
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange('headquarters', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Culture</label>
                    <textarea
                      value={formData.companyCulture}
                      onChange={(e) => handleInputChange('companyCulture', e.target.value)}
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Industry</h4>
                    <p className="text-gray-900">{companyProfile?.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Company Size</h4>
                    <p className="text-gray-900">{companyProfile?.company_size || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Founded</h4>
                    <p className="text-gray-900">{companyProfile?.founded_year || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Location</h4>
                    <p className="text-gray-900">{companyProfile?.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Headquarters</h4>
                    <p className="text-gray-900">{companyProfile?.headquarters || 'Not specified'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Company Culture</h4>
                    <p className="text-gray-900">{companyProfile?.company_culture || 'Not specified'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Benefits Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Benefits</h3>
              
              {editing ? (
                <div>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={newBenefit}
                      onChange={(e) => setNewBenefit(e.target.value)}
                      placeholder="Add a benefit"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <button
                      onClick={addBenefit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {companyProfile?.benefits && companyProfile.benefits.length > 0 ? (
                    companyProfile.benefits.map((benefit, index) => (
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

            {/* User Profile Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Profile</h3>
              
              <div className="flex items-start space-x-6">
                {/* User Avatar */}
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile.avatar_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-2xl font-medium text-gray-600">
                        {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        {uploadingAvatar ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Camera className="h-5 w-5 text-white" />
                        )}
                      </label>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  {editing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          disabled
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.userLocation}
                          onChange={(e) => handleInputChange('userLocation', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {userProfile?.full_name}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          {userProfile?.email}
                        </div>
                        {userProfile?.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            {userProfile.phone}
                          </div>
                        )}
                        {userProfile?.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {userProfile.location}
                          </div>
                        )}
                      </div>
                      {userProfile?.bio && (
                        <p className="text-gray-700 mt-3">{userProfile.bio}</p>
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

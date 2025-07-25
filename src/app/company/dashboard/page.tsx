'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { supabase } from '../../../lib/supabase'
import {
  Plus,
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Search,
  Star,
  Globe,
  Mail,
  Phone,
  X,
  Filter,
  Camera
} from 'lucide-react'
import Link from 'next/link'

interface Job {
  id: number
  title: string
  applications: number
  status: 'active' | 'closed' | string
}

interface Stats {
  activeJobs: number
  totalApplications: number
  hiredCandidates: number
  companyViews: number
}

interface Vendor {
  id: string
  name: string
  service_type: string
  description?: string
  contact_email: string
  contact_phone?: string
  website?: string
  specializations?: string[]
  years_experience?: number
  portfolio_url?: string
  certifications?: string[]
  pricing_model?: string
  availability_hours?: string
  is_active: boolean
  created_at: string
}

export default function CompanyDashboard() {
  const { user, signOut } = useAuth()
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    totalApplications: 0,
    hiredCandidates: 0,
    companyViews: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showVendors, setShowVendors] = useState<boolean>(false)
  const [vendorsLoading, setVendorsLoading] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedServiceType, setSelectedServiceType] = useState<string>('')
  const [serviceTypes, setServiceTypes] = useState<string[]>([])

  useEffect(() => {
    if (user) {
      fetchCompanyData()
    }
  }, [user])

  useEffect(() => {
    filterVendors()
  }, [vendors, searchTerm, selectedServiceType])

  const fetchCompanyData = async () => {
    setLoading(true)
    try {
      // Get company ID from user data
      const companyId = user?.company?.id || user?.profile?.id

      if (!companyId) {
        console.log('No company ID found')
        setLoading(false)
        return
      }

      // 1. Fetch all jobs for this company
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, applications_count, is_active')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (jobsError && jobsError.code !== 'PGRST116') {
        console.error('Jobs fetch error:', jobsError)
      }

      const jobsData = jobs || []
      setRecentJobs(
        jobsData.map(j => ({
          id: j.id,
          title: j.title,
          applications: j.applications_count || 0,
          status: j.is_active ? 'active' : 'closed'
        }))
      )

      // 2. Aggregate stats for this company
      try {
        // Active jobs count
        const { count: activeJobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true)

        // Total applications count
        let totalAppsCount = 0
        if (jobsData.length > 0) {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobsData.map(j => j.id))
          totalAppsCount = count || 0
        }

        // Hired candidates count
        let hiredCount = 0
        if (jobsData.length > 0) {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .in('job_id', jobsData.map(j => j.id))
            .eq('status', 'accepted')
          hiredCount = count || 0
        }

        setStats({
          activeJobs: activeJobsCount || 0,
          totalApplications: totalAppsCount,
          hiredCandidates: hiredCount,
          companyViews: 234, // Placeholder
        })
      } catch (statsError) {
        console.error('Stats fetch error:', statsError)
        // Set default stats on error
        setStats({
          activeJobs: 0,
          totalApplications: 0,
          hiredCandidates: 0,
          companyViews: 234
        })
      }

    } catch (error) {
      console.error('Error fetching company data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVendors = async () => {
    setVendorsLoading(true)
    try {
      const { data: vendorsData, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Vendors fetch error:', error)
        setVendors([])
        setServiceTypes([])
      } else {
        setVendors(vendorsData || [])
        
        // Extract unique service types for filter
        const uniqueServiceTypes = [...new Set(vendorsData?.map(v => v.service_type) || [])]
        setServiceTypes(uniqueServiceTypes)
      }
      
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setVendors([])
      setServiceTypes([])
    } finally {
      setVendorsLoading(false)
    }
  }

  const filterVendors = () => {
    let filtered = vendors

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.specializations?.some(spec => 
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Filter by service type
    if (selectedServiceType) {
      filtered = filtered.filter(vendor => vendor.service_type === selectedServiceType)
    }

    setFilteredVendors(filtered)
  }

  const handleFindVendors = () => {
    setShowVendors(true)
    if (vendors.length === 0) {
      fetchVendors()
    }
  }

  const closeVendorsModal = () => {
    setShowVendors(false)
    setSearchTerm('')
    setSelectedServiceType('')
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['company']}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['company']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user?.company?.name || user?.profile?.full_name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFindVendors}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center transition-colors"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Find Vendors
                </button>
                <Link
                  href="/company/jobs/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Link>
                
                {/* Profile Icon */}
                <Link
                  href="/company/profile"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="relative">
                    {user?.profile?.avatar_url ? (
                      <img 
                        src={user.profile.avatar_url} 
                        alt="Profile" 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.profile?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">Profile</span>
                </Link>
                
                <button 
                  onClick={signOut} 
                  className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-semibold">{stats.activeJobs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-semibold">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Hired</p>
                  <p className="text-2xl font-semibold">{stats.hiredCandidates}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Company Views</p>
                  <p className="text-2xl font-semibold">{stats.companyViews}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Recent Job Postings</h2>
            </div>
            <div className="p-6">
              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No job postings yet.</p>
                  <Link
                    href="/company/jobs/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex justify-between items-center border-b pb-4 last:border-b-0"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">
                          {job.applications} applications
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium
                        ${job.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                        }`}>
                        {job.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vendors Modal */}
        {showVendors && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Find Vendors</h2>
                  <p className="text-sm text-gray-600">Discover professional service providers</p>
                </div>
                <button
                  onClick={closeVendorsModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search and Filters */}
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vendors by name, service, or skills..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <select
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      value={selectedServiceType}
                      onChange={(e) => setSelectedServiceType(e.target.value)}
                    >
                      <option value="">All Services</option>
                      {serviceTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Vendors List */}
              <div className="overflow-y-auto max-h-[60vh]">
                {vendorsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="anime-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading vendors...</span>
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || selectedServiceType 
                        ? 'No vendors found matching your criteria'
                        : 'No vendors registered yet'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {filteredVendors.map((vendor) => (
                      <div key={vendor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                            <p className="text-sm text-blue-600 font-medium">{vendor.service_type}</p>
                            {vendor.years_experience && (
                              <p className="text-sm text-gray-600">
                                {vendor.years_experience} years of experience
                              </p>
                            )}
                          </div>
                          <div className="flex items-center text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">4.8</span>
                          </div>
                        </div>

                        {vendor.description && (
                          <p className="text-gray-700 mb-4">{vendor.description}</p>
                        )}

                        {vendor.specializations && vendor.specializations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Specializations:</p>
                            <div className="flex flex-wrap gap-2">
                              {vendor.specializations.map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            <a 
                              href={`mailto:${vendor.contact_email}`}
                              className="hover:text-blue-600"
                            >
                              {vendor.contact_email}
                            </a>
                          </div>
                          {vendor.contact_phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              <a 
                                href={`tel:${vendor.contact_phone}`}
                                className="hover:text-blue-600"
                              >
                                {vendor.contact_phone}
                              </a>
                            </div>
                          )}
                          {vendor.website && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              <a 
                                href={vendor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {vendor.pricing_model && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                {vendor.pricing_model}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                              View Profile
                            </button>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Contact Vendor
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Showing {filteredVendors.length} vendors
                  </p>
                  <button
                    onClick={closeVendorsModal}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { supabase } from '../../../lib/supabase'
import { 
  Plus, Briefcase, Users, Eye, TrendingUp, Settings 
} from 'lucide-react'
import Link from 'next/link'

export default function CompanyDashboard() {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    hiredCandidates: 0,
    companyViews: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchCompanyData()
    }
  }, [user])

  const fetchCompanyData = async () => {
    try {
      // Mock data - replace with actual queries
      setStats({
        activeJobs: 5,
        totalApplications: 48,
        hiredCandidates: 12,
        companyViews: 234
      })

      setRecentJobs([
        { id: 1, title: 'Frontend Developer', applications: 12, status: 'active' },
        { id: 2, title: 'Backend Developer', applications: 8, status: 'active' },
      ])

    } catch (error) {
      console.error('Error fetching company data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['employer']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="text-gray-600">Manage your hiring process</p>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/company/jobs/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Link>
                <Settings className="h-6 w-6 text-gray-400" />
                <button onClick={signOut} className="text-gray-600 hover:text-gray-800">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-semibold">{stats.activeJobs}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-semibold">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Hired</p>
                  <p className="text-2xl font-semibold">{stats.hiredCandidates}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
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
              <div className="space-y-4">
                {recentJobs.map((job: any) => (
                  <div key={job.id} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.applications} applications</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

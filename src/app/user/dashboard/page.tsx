'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { supabase } from '../../../lib/supabase'
import { 
   MapPin, Briefcase, Clock, Eye, 
  Bookmark, Calendar, Bell
} from 'lucide-react'
import Link from 'next/link'

export default function UserDashboard() {
  const { user, profile, signOut } = useAuth()
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState({
    applications: 0,
    profileViews: 0,
    interviews: 0,
    savedJobs: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(name, logo_url, is_verified)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6)

      setJobs(jobsData || [])

      // Mock stats for now
      setStats({
        applications: 12,
        profileViews: 45,
        interviews: 3,
        savedJobs: 8
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['job_seeker']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Job Seeker Dashboard</h1>
                <p className="text-gray-600">Welcome back, {profile?.full_name}!</p>
              </div>
              <div className="flex items-center space-x-4">
                <Bell className="h-6 w-6 text-gray-400" />
                <Link href="/user/profile" className="text-blue-600 hover:text-blue-700">
                  Profile
                </Link>
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
                  <p className="text-sm text-gray-600">Applications</p>
                  <p className="text-2xl font-semibold">{stats.applications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Profile Views</p>
                  <p className="text-2xl font-semibold">{stats.profileViews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Interviews</p>
                  <p className="text-2xl font-semibold">{stats.interviews}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Bookmark className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Saved Jobs</p>
                  <p className="text-2xl font-semibold">{stats.savedJobs}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Recommended Jobs</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse border rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job: any) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-blue-600">{job.company?.name}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link 
                          href={`/jobs/${job.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Apply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

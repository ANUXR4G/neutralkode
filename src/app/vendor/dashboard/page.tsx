'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import { 
  Store, Users, DollarSign, Star, Calendar, Settings 
} from 'lucide-react'

export default function VendorDashboard() {
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({
    activeServices: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    rating: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchVendorData()
    }
  }, [user])

  const fetchVendorData = async () => {
    try {
      // Mock data - replace with actual queries
      setStats({
        activeServices: 3,
        totalClients: 15,
        monthlyRevenue: 25000,
        rating: 4.8
      })
    } catch (error) {
      console.error('Error fetching vendor data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="text-gray-600">Manage your services and clients</p>
              </div>
              <div className="flex items-center space-x-4">
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
                <Store className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Active Services</p>
                  <p className="text-2xl font-semibold">{stats.activeServices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-semibold">{stats.totalClients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-semibold">₹{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-2xl font-semibold">{stats.rating}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Overview */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">Service Overview</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Your service management tools will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

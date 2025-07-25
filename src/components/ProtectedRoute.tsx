'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, initialised } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log('🔍 ProtectedRoute check:', {
      loading,
      initialised,
      user: !!user,
      profile: !!profile,
      profileRole: profile?.role,
      allowedRoles
    })

    // Don't do anything until auth is fully initialized
    if (!initialised || loading) {
      console.log('⏳ Still loading/initializing...')
      return
    }

    setIsChecking(true)

    // No user - redirect to login
    if (!user || !profile) {
      console.log('❌ No user/profile, redirecting to login')
      router.replace('/auth/login')
      return
    }

    // Check role authorization if roles are specified
    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = profile.role
      
      // Role mapping for compatibility
      const roleMap: { [key: string]: string[] } = {
        'employer': ['company'],
        'company': ['company', 'employer'],
        'vendor': ['vendor'],
        'job_seeker': ['job_seeker', 'job-seeker'],
        'job-seeker': ['job_seeker', 'job-seeker']
      }

      const isRoleAuthorized = allowedRoles.some(allowedRole => {
        const mappedRoles = roleMap[allowedRole] || [allowedRole]
        return mappedRoles.includes(userRole)
      })

      if (!isRoleAuthorized) {
        console.log(`❌ Role unauthorized: '${userRole}' not in:`, allowedRoles)
        router.replace('/unauthorized')
        return
      }

      console.log(`✅ Role authorized: '${userRole}' matches allowed roles`)
    }

    // All checks passed
    console.log('✅ All authorization checks passed')
    setIsAuthorized(true)
    setIsChecking(false)

  }, [user, profile, loading, initialised, router, allowedRoles])

  // Show loading while auth is initializing
  if (!initialised || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Show loading while checking authorization
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  // Final checks before rendering
  if (!user || !profile) {
    return null
  }

  if (allowedRoles && allowedRoles.length > 0 && !isAuthorized) {
    return null
  }

  return <>{children}</>
}

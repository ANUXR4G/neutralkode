'use client'
import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, initialised } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && initialised) {
      if (!user) {
        router.push('/auth/signin')
        return
      }

      if (allowedRoles && allowedRoles.length > 0) {
        // FIXED: Handle both 'company' and 'employer' roles
        const userRole = user.profile.role
        const hasAccess = allowedRoles.some(role => {
          if (role === 'company') {
            return userRole === 'company' || userRole === 'employer'
          }
          return role === userRole
        })

        if (!hasAccess) {
          router.push('/unauthorized')
          return
        }
      }
    }
  }, [user, loading, initialised, allowedRoles, router])

  if (loading || !initialised) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.profile.role
    const hasAccess = allowedRoles.some(role => {
      if (role === 'company') {
        return userRole === 'company' || userRole === 'employer'
      }
      return role === userRole
    })

    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

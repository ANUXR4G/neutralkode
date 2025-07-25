'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/auth-helpers-nextjs'

// Profile structure
type Profile = {
  id: string
  email: string
  full_name: string
  role: 'job_seeker' | 'employer' | 'vendor' | string
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  resume_url?: string
  company_name?: string
  service_type?: string
  created_at?: string
  updated_at?: string
}

type SignUpData = {
  fullName: string
  role: string
  phone?: string
  companyName?: string
  serviceType?: string
}

interface SignInResult {
  error?: string
  user?: Profile
}

interface SignUpResult {
  success: boolean
  message?: string
  user?: Profile | null
}

type AuthContextType = {
  user: Profile | null
  profile: Profile | null
  loading: boolean
  initialised: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<SignUpResult>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialised, setInitialised] = useState(false)
  const supabase = createClientComponentClient()

  const createProfile = useCallback(async (authUser: User, userData: SignUpData): Promise<Profile> => {
    const profileData = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: userData.fullName,
      role: userData.role,
      phone: userData.phone || null,
      company_name: userData.companyName || null,
      service_type: userData.serviceType || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      throw error
    }

    return data as Profile
  }, [supabase])

  const fetchProfile = useCallback(async (authUser: User): Promise<Profile> => {
    console.log('🔍 Fetching profile for user:', authUser.id)
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create a basic one
      console.log('🆕 Profile not found, creating basic profile...')
      const userData: SignUpData = {
        fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
        role: authUser.user_metadata?.role || 'job_seeker',
        phone: authUser.user_metadata?.phone || '',
        companyName: authUser.user_metadata?.company_name || '',
        serviceType: authUser.user_metadata?.service_type || ''
      }
      return await createProfile(authUser, userData)
    } else if (error) {
      console.error('❌ Error fetching profile:', error)
      throw error
    }

    return profile as Profile
  }, [supabase, createProfile])

  // Initial authentication check
  const initializeAuth = useCallback(async () => {
    console.log('🚀 Initializing auth...')
    setLoading(true)
    
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('❌ Auth error:', error)
        setUser(null)
        return
      }

      if (!authUser) {
        console.log('❌ No authenticated user')
        setUser(null)
        return
      }

      console.log('👤 Auth user found:', authUser.id)
      const profile = await fetchProfile(authUser)
      console.log('✅ Profile loaded:', profile)
      setUser(profile)

    } catch (error) {
      console.error('❌ Error initializing auth:', error)
      setUser(null)
    } finally {
      console.log('🏁 Auth initialization complete')
      setLoading(false)
      setInitialised(true)
    }
  }, [supabase.auth, fetchProfile])

  useEffect(() => {
    // Initialize auth on mount
    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          setLoading(true)
          const profile = await fetchProfile(session.user)
          setUser(profile)
        } catch (error) {
          console.error('❌ Error on sign in:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [initializeAuth, fetchProfile, supabase.auth])

  // refreshProfile function - doesn't trigger loading states that cause redirects
  const refreshProfile = useCallback(async () => {
    try {
      console.log('🔄 Refreshing profile...')
      
      const { data: { user: authUser }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ Error getting user during refresh:', error)
        return
      }
      
      if (authUser && user) {
        const profile = await fetchProfile(authUser)
        setUser(profile)
        console.log('✅ Profile refreshed successfully')
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error)
    }
  }, [supabase.auth, user, fetchProfile])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user found')

    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id)

    if (error) {
      throw new Error(error.message)
    }

    setUser(prev => prev ? { ...prev, ...updatedData } : null)
  }, [user, supabase])

  const signUp = useCallback(async (email: string, password: string, userData: SignUpData): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            phone: userData.phone,
            company_name: userData.companyName,
            service_type: userData.serviceType
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          message: 'Please check your email to confirm your account.',
          user: null
        }
      }

      if (data.user && data.session) {
        const profile = await createProfile(data.user, userData)
        setUser(profile)
        return { 
          success: true,
          user: profile 
        }
      }

      return { success: true, user: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      throw new Error(errorMessage)
    }
  }, [supabase.auth, createProfile])

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { error: error.message }
    }

    if (!data.user) {
      return { error: 'No user ID found.' }
    }

    try {
      const profile = await fetchProfile(data.user)
      setUser(profile)
      return { user: profile }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Profile not found.'
      return { error: errorMessage }
    }
  }, [supabase.auth, fetchProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase.auth])

  return (
    <AuthContext.Provider value={{
      user,
      profile: user,
      loading,
      initialised,
      signIn,
      signUp,
      signOut,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

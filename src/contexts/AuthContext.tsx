'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Profile structure
type Profile = {
  id: string
  email: string
  full_name: string
  role: 'job_seeker' | 'employer' | 'vendor' | string
}

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user: authUser }
      } = await supabase.auth.getUser()

      if (!authUser) {
        setUser(null)
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        setUser(null)
      } else {
        setUser(profile)
      }
      setLoading(false)
    }

    getProfile()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      getProfile()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      return { error: error.message }
    }

    const userId = data.user?.id
    if (!userId) {
      setLoading(false)
      return { error: 'No user ID found.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setLoading(false)

    if (profileError || !profile) {
      return { error: profileError?.message || 'Profile not found.' }
    }

    setUser(profile)
    return { user: profile }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

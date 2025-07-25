'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { User } from '@supabase/auth-helpers-nextjs'

// Profile structure
type Profile = {
  id: string
  email: string
  full_name: string
  role: 'job_seeker' | 'company' | 'vendor'
  phone?: string
  location?: string
  bio?: string
  avatar_url?: string
  resume_url?: string
  created_at?: string
  updated_at?: string
}

// Job structure
type Job = {
  id?: string
  title: string
  description: string
  company_id: string
  location: string
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship'
  salary_min?: number
  salary_max?: number
  currency?: string
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  skills_required: string[]
  benefits?: string[]
  remote_work_available: boolean
  application_deadline?: string
  is_active: boolean
  applications_count?: number
  created_at?: string
  updated_at?: string
}

// Enhanced Company data structure
type CompanyData = {
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
  position?: string
  is_admin?: boolean
}

// Enhanced Vendor data structure  
type VendorData = {
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
  updated_at: string
  position?: string
}

// Enhanced JobSeeker data structure
type JobSeekerData = {
  id: string
  resume_url?: string
  skills?: string[]
  experience_years?: number
  current_salary?: number
  expected_salary?: number
  location?: string
  bio?: string
  linkedin_url?: string
  portfolio_url?: string
  is_active: boolean
  education?: any
  experience?: any
  certifications?: string[]
  languages?: string[]
  availability_status?: string
  preferred_job_types?: string[]
  work_authorization?: string
  created_at: string
  updated_at: string
}

// Extended user data for different roles
type UserData = {
  profile: Profile
  company?: CompanyData
  vendor?: VendorData
  job_seeker?: JobSeekerData
}

type SignUpData = {
  fullName: string
  role: 'job_seeker' | 'company' | 'vendor'
  phone?: string
  location?: string
  bio?: string
  companyName?: string
  companyWebsite?: string
  companyIndustry?: string
  companySize?: string
  companyDescription?: string
  position?: string
  vendorName?: string
  serviceType?: string
  vendorDescription?: string
  contactEmail?: string
  contactPhone?: string
  vendorWebsite?: string
  specializations?: string[]
  yearsExperience?: number
  portfolioUrl?: string
  certifications?: string[]
  pricingModel?: string
  availabilityHours?: string
}

interface SignInResult {
  error?: string
  user?: UserData
}

interface SignUpResult {
  success: boolean
  message?: string
  user?: UserData | null
}

interface JobPostResult {
  success: boolean
  message?: string
  job?: Job
}

// Enhanced AuthContextType with job management methods
type AuthContextType = {
  user: UserData | null
  profile: Profile | null
  loading: boolean
  initialised: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, userData: SignUpData) => Promise<SignUpResult>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateCompanyProfile: (updates: Partial<CompanyData>) => Promise<void>
  updateVendorProfile: (updates: Partial<VendorData>) => Promise<void>
  updateJobSeekerProfile: (updates: Partial<JobSeekerData>) => Promise<void>
  refreshProfile: () => Promise<void>
  uploadFile: (file: File, bucket: string, path: string) => Promise<string>
  createJob: (jobData: Omit<Job, 'id' | 'company_id' | 'created_at' | 'updated_at'>) => Promise<JobPostResult>
  updateJob: (jobId: string, updates: Partial<Job>) => Promise<void>
  deleteJob: (jobId: string) => Promise<void>
  getCompanyJobs: () => Promise<Job[]>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Local storage keys for caching
const CACHE_KEYS = {
  USER_DATA: 'jobportal_user_data',
  LAST_CHECK: 'jobportal_last_auth_check',
  SESSION_ID: 'jobportal_session_id'
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialised, setInitialised] = useState(false)
  const supabase = createClientComponentClient()

  // Cache management
  const getCachedUserData = useCallback((): UserData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEYS.USER_DATA)
      const lastCheck = localStorage.getItem(CACHE_KEYS.LAST_CHECK)
      
      if (cached && lastCheck) {
        const age = Date.now() - parseInt(lastCheck)
        if (age < CACHE_DURATION) {
          console.log('📦 Using cached user data')
          return JSON.parse(cached)
        }
      }
    } catch (error) {
      console.warn('⚠️ Cache read error:', error)
    }
    return null
  }, [])

  const setCachedUserData = useCallback((userData: UserData | null) => {
    try {
      if (userData) {
        localStorage.setItem(CACHE_KEYS.USER_DATA, JSON.stringify(userData))
        localStorage.setItem(CACHE_KEYS.LAST_CHECK, Date.now().toString())
      } else {
        localStorage.removeItem(CACHE_KEYS.USER_DATA)
        localStorage.removeItem(CACHE_KEYS.LAST_CHECK)
      }
    } catch (error) {
      console.warn('⚠️ Cache write error:', error)
    }
  }, [])

  // File upload utility
  const uploadFile = useCallback(async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return publicUrl
  }, [supabase])

  // Job management methods
  const createJob = useCallback(async (jobData: Omit<Job, 'id' | 'company_id' | 'created_at' | 'updated_at'>): Promise<JobPostResult> => {
    if (!user || !user.company) {
      throw new Error('No company profile found')
    }

    try {
      const jobPayload = {
        ...jobData,
        company_id: user.company.id,
        is_active: true,
        applications_count: 0
      }

      const { data: job, error } = await supabase
        .from('jobs')
        .insert(jobPayload)
        .select()
        .single()

      if (error) {
        console.error('Job creation error:', error)
        return { success: false, message: error.message }
      }

      return { 
        success: true, 
        message: 'Job posted successfully!',
        job: job as Job 
      }
    } catch (error) {
      console.error('Error creating job:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create job' 
      }
    }
  }, [user, supabase])

  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    if (!user || !user.company) throw new Error('No company profile found')

    const updatedData = { ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('jobs')
      .update(updatedData)
      .eq('id', jobId)
      .eq('company_id', user.company.id)

    if (error) throw new Error(error.message)
  }, [user, supabase])

  const deleteJob = useCallback(async (jobId: string) => {
    if (!user || !user.company) throw new Error('No company profile found')

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('company_id', user.company.id)

    if (error) throw new Error(error.message)
  }, [user, supabase])

  const getCompanyJobs = useCallback(async (): Promise<Job[]> => {
    if (!user || !user.company) return []

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('company_id', user.company.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching company jobs:', error)
      return []
    }

    return jobs as Job[]
  }, [user, supabase])

  // Enhanced profile creation with complete role-specific data
  const createProfile = useCallback(async (authUser: User, userData: SignUpData): Promise<UserData> => {
    console.log('🔄 Creating profile for user:', authUser.id)
    
    const profileData = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: userData.fullName,
      role: userData.role,
      phone: userData.phone || null,
      location: userData.location || null,
      bio: userData.bio || null,
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
      throw new Error(`Profile creation failed: ${profileError.message}`)
    }

    let roleSpecificData = null

    // Handle role-specific data creation
    if (userData.role === 'company' && userData.companyName) {
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('*')
        .eq('name', userData.companyName)
        .limit(1)

      let company = existingCompanies?.[0]
      
      if (!company) {
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: userData.companyName,
            description: userData.companyDescription,
            website: userData.companyWebsite,
            industry: userData.companyIndustry,
            company_size: userData.companySize,
            is_verified: false,
            benefits: [],
            social_media: {}
          })
          .select()
          .single()

        if (companyError) throw new Error(`Company creation failed: ${companyError.message}`)
        company = newCompany
      }

      await supabase
        .from('company_users')
        .insert({
          id: profile.id,
          company_id: company.id,
          position: userData.position || 'Admin',
          is_admin: true
        })

      roleSpecificData = { 
        ...company, 
        position: userData.position || 'Admin', 
        is_admin: true 
      } as CompanyData

    } else if (userData.role === 'vendor' && userData.vendorName && userData.serviceType) {
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .insert({
          name: userData.vendorName,
          service_type: userData.serviceType,
          description: userData.vendorDescription,
          contact_email: userData.contactEmail || authUser.email,
          contact_phone: userData.contactPhone,
          website: userData.vendorWebsite,
          specializations: userData.specializations || [],
          years_experience: userData.yearsExperience || 0,
          portfolio_url: userData.portfolioUrl,
          certifications: userData.certifications || [],
          pricing_model: userData.pricingModel,
          availability_hours: userData.availabilityHours,
          is_active: true
        })
        .select()
        .single()

      if (vendorError) throw new Error(`Vendor creation failed: ${vendorError.message}`)

      await supabase
        .from('vendor_users')
        .insert({
          id: profile.id,
          vendor_id: vendor.id,
          position: userData.position || 'Owner'
        })

      roleSpecificData = { 
        ...vendor, 
        position: userData.position || 'Owner' 
      } as VendorData

    } else if (userData.role === 'job_seeker') {
      const { data: jobSeeker, error: jobSeekerError } = await supabase
        .from('job_seekers')
        .insert({
          id: profile.id,
          location: userData.location,
          bio: userData.bio,
          is_active: true,
          skills: [],
          certifications: [],
          languages: [],
          preferred_job_types: [],
          experience_years: 0
        })
        .select()
        .single()

      if (jobSeekerError) throw new Error(`Job seeker creation failed: ${jobSeekerError.message}`)
      roleSpecificData = jobSeeker as JobSeekerData
    }

    const result: UserData = {
      profile: profile as Profile,
      ...(userData.role === 'company' && roleSpecificData && { company: roleSpecificData }),
      ...(userData.role === 'vendor' && roleSpecificData && { vendor: roleSpecificData }),
      ...(userData.role === 'job_seeker' && roleSpecificData && { job_seeker: roleSpecificData })
    }

    return result
  }, [supabase])

  // Enhanced profile fetching with complete role-specific data
  const fetchProfile = useCallback(async (authUser: User, useCache = true): Promise<UserData> => {
    console.log('🔍 Fetching profile for user:', authUser.id)
    
    // Try cache first for instant loading
    if (useCache) {
      const cached = getCachedUserData()
      if (cached && cached.profile.id === authUser.id) {
        console.log('⚡ Using cached profile')
        setUser(cached)
        return cached
      }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('🆕 Profile not found, creating basic profile...')
        const userData: SignUpData = {
          fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          role: (authUser.user_metadata?.role as 'job_seeker' | 'company' | 'vendor') || 'job_seeker',
          phone: authUser.user_metadata?.phone || '',
          companyName: authUser.user_metadata?.company_name || '',
          serviceType: authUser.user_metadata?.service_type || ''
        }
        return await createProfile(authUser, userData)
      }
      throw profileError
    }

    let roleSpecificData = null

    // Fetch complete role-specific data
    if (profile.role === 'company') {
      const { data: companyData, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_users!inner(position, is_admin)
        `)
        .eq('company_users.id', profile.id)
        .single()

      if (!error && companyData) {
        roleSpecificData = {
          ...companyData,
          position: companyData.company_users[0]?.position,
          is_admin: companyData.company_users[0]?.is_admin
        } as CompanyData
      }

    } else if (profile.role === 'vendor') {
      const { data: vendorData, error } = await supabase
        .from('vendors')
        .select(`
          *,
          vendor_users!inner(position)
        `)
        .eq('vendor_users.id', profile.id)
        .single()

      if (!error && vendorData) {
        roleSpecificData = {
          ...vendorData,
          position: vendorData.vendor_users[0]?.position
        } as VendorData
      }

    } else if (profile.role === 'job_seeker') {
      const { data: jobSeekerData, error } = await supabase
        .from('job_seekers')
        .select('*')
        .eq('id', profile.id)
        .single()

      if (!error && jobSeekerData) {
        roleSpecificData = jobSeekerData as JobSeekerData
      }
    }

    const result: UserData = {
      profile: profile as Profile,
      ...(profile.role === 'company' && roleSpecificData && { company: roleSpecificData }),
      ...(profile.role === 'vendor' && roleSpecificData && { vendor: roleSpecificData }),
      ...(profile.role === 'job_seeker' && roleSpecificData && { job_seeker: roleSpecificData })
    }

    // Cache the result
    setCachedUserData(result)
    return result
  }, [supabase, getCachedUserData, setCachedUserData, createProfile])

  // Ultra-fast initialization with cache-first approach
  const initializeAuth = useCallback(async () => {
    console.log('🚀 Initializing auth...')
    
    if (initialised) return

    const cachedUser = getCachedUserData()
    if (cachedUser) {
      console.log('⚡ Instant load from cache')
      setUser(cachedUser)
      setInitialised(true)
      
      setTimeout(async () => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (authUser && authUser.id === cachedUser.profile.id) {
            const fresh = await fetchProfile(authUser, false)
            setUser(fresh)
          } else if (!authUser) {
            setUser(null)
            setCachedUserData(null)
          }
        } catch (error) {
          console.warn('Background refresh failed:', error)
        }
      }, 100)
      return
    }

    setLoading(true)
    
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser()

      if (error || !authUser) {
        console.log('❌ No authenticated user')
        setUser(null)
        setCachedUserData(null)
        setInitialised(true)
        setLoading(false)
        return
      }

      const userData = await fetchProfile(authUser, false)
      setUser(userData)
      setCachedUserData(userData)

    } catch (error) {
      console.error('❌ Error initializing auth:', error)
      setUser(null)
      setCachedUserData(null)
    } finally {
      setLoading(false)
      setInitialised(true)
    }
  }, [supabase.auth, fetchProfile, getCachedUserData, setCachedUserData, initialised])

  // Auth state listener
  useEffect(() => {
    initializeAuth()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)

      switch (event) {
        case 'TOKEN_REFRESHED':
          console.log('🔄 Token refreshed - no action needed')
          break
          
        case 'SIGNED_IN':
          if (session?.user && (!user || user.profile.id !== session.user.id)) {
            try {
              const userData = await fetchProfile(session.user, false)
              setUser(userData)
              setCachedUserData(userData)
            } catch (error) {
              console.error('❌ Error on sign in:', error)
              setUser(null)
              setCachedUserData(null)
            }
          }
          break
          
        case 'SIGNED_OUT':
          setUser(null)
          setCachedUserData(null)
          setInitialised(false)
          break
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const userData = await fetchProfile(authUser, false)
        setUser(userData)
        setCachedUserData(userData)
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error)
    }
  }, [supabase.auth, user, fetchProfile, setCachedUserData])

  // Enhanced update methods for different profile types
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user found')

    const updatedData = { ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.profile.id)

    if (error) throw new Error(error.message)

    const newUser = { ...user, profile: { ...user.profile, ...updatedData } }
    setUser(newUser)
    setCachedUserData(newUser)
  }, [user, supabase, setCachedUserData])

  const updateCompanyProfile = useCallback(async (updates: Partial<CompanyData>) => {
    if (!user || !user.company) throw new Error('No company profile found')

    const updatedData = { ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('companies')
      .update(updatedData)
      .eq('id', user.company.id)

    if (error) throw new Error(error.message)

    const newUser = { 
      ...user, 
      company: { ...user.company, ...updatedData } as CompanyData 
    }
    setUser(newUser)
    setCachedUserData(newUser)
  }, [user, supabase, setCachedUserData])

  const updateVendorProfile = useCallback(async (updates: Partial<VendorData>) => {
    if (!user || !user.vendor) throw new Error('No vendor profile found')

    const updatedData = { ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('vendors')
      .update(updatedData)
      .eq('id', user.vendor.id)

    if (error) throw new Error(error.message)

    const newUser = { 
      ...user, 
      vendor: { ...user.vendor, ...updatedData } as VendorData 
    }
    setUser(newUser)
    setCachedUserData(newUser)
  }, [user, supabase, setCachedUserData])

  const updateJobSeekerProfile = useCallback(async (updates: Partial<JobSeekerData>) => {
    if (!user || !user.job_seeker) throw new Error('No job seeker profile found')

    const updatedData = { ...updates, updated_at: new Date().toISOString() }

    const { error } = await supabase
      .from('job_seekers')
      .update(updatedData)
      .eq('id', user.job_seeker.id)

    if (error) throw new Error(error.message)

    const newUser = { 
      ...user, 
      job_seeker: { ...user.job_seeker, ...updatedData } as JobSeekerData 
    }
    setUser(newUser)
    setCachedUserData(newUser)
  }, [user, supabase, setCachedUserData])

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

      if (error) throw new Error(error.message)

      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          message: 'Please check your email to confirm your account.',
          user: null
        }
      }

      if (data.user && data.session) {
        const userProfile = await createProfile(data.user, userData)
        setUser(userProfile)
        setCachedUserData(userProfile)
        return { success: true, user: userProfile }
      }

      return { success: true, user: null }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      throw new Error(errorMessage)
    }
  }, [supabase.auth, createProfile, setCachedUserData])

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) return { error: error.message }
      if (!data.user) return { error: 'No user ID found.' }

      const userData = await fetchProfile(data.user, false)
      setUser(userData)
      setCachedUserData(userData)
      return { user: userData }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Profile not found.'
      return { error: errorMessage }
    }
  }, [supabase.auth, fetchProfile, setCachedUserData])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCachedUserData(null)
    setInitialised(false)
  }, [supabase.auth, setCachedUserData])

  return (
    <AuthContext.Provider value={{
      user,
      profile: user?.profile || null,
      loading,
      initialised,
      signIn,
      signUp,
      signOut,
      updateProfile,
      updateCompanyProfile,
      updateVendorProfile,
      updateJobSeekerProfile,
      refreshProfile,
      uploadFile,
      createJob,
      updateJob,
      deleteJob,
      getCompanyJobs
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

// Export types for use in components
export type { Job, UserData, Profile, CompanyData, VendorData, JobSeekerData }

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { Search, MapPin, Briefcase, Users, TrendingUp, Building, ArrowRight, Menu, X } from 'lucide-react'

export default function HomePage() {
  const { user, profile, signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Function to get role-specific dashboard URL
  const getDashboardUrl = () => {
    if (!profile?.role) return '/dashboard' // fallback
    
    switch (profile.role) {
      case 'job_seeker':
        return '/user/dashboard'
      case 'employer':
        return '/company/dashboard'
      case 'vendor':
        return '/vendor/dashboard'
      default:
        return '/dashboard' // fallback for unknown roles
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim() || location.trim()) {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.set('q', searchTerm)
      if (location.trim()) params.set('location', location)
      window.location.href = `/jobs?${params.toString()}`
    } else {
      window.location.href = '/jobs'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '10,000+', color: 'text-blue-600' },
    { icon: Users, label: 'Companies', value: '500+', color: 'text-green-600' },
    { icon: TrendingUp, label: 'Success Rate', value: '85%', color: 'text-purple-600' },
  ]

  const featuredJobs = [
    {
      id: 1,
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      location: 'Bangalore, India',
      salary: '₹15-25 LPA',
      type: 'Full Time',
      skills: ['React', 'Node.js', 'TypeScript'],
      logo: '/api/placeholder/40/40',
      isRemote: true,
      postedDays: 2
    },
    {
      id: 2,
      title: 'Product Manager',
      company: 'InnovateTech',
      location: 'Mumbai, India',
      salary: '₹20-30 LPA',
      type: 'Full Time',
      skills: ['Strategy', 'Analytics', 'Leadership'],
      logo: '/api/placeholder/40/40',
      isRemote: false,
      postedDays: 5
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      company: 'DesignHub',
      location: 'Delhi, India',
      salary: '₹8-15 LPA',
      type: 'Full Time',
      skills: ['Figma', 'Prototyping', 'User Research'],
      logo: '/api/placeholder/40/40',
      isRemote: true,
      postedDays: 1
    },
  ]

  const topCompanies = [
    { name: 'Google', jobs: 45, logo: '/api/placeholder/60/60' },
    { name: 'Microsoft', jobs: 38, logo: '/api/placeholder/60/60' },
    { name: 'Amazon', jobs: 52, logo: '/api/placeholder/60/60' },
    { name: 'Meta', jobs: 29, logo: '/api/placeholder/60/60' },
    { name: 'Apple', jobs: 31, logo: '/api/placeholder/60/60' },
    { name: 'Netflix', jobs: 18, logo: '/api/placeholder/60/60' },
  ]

  const jobCategories = [
    { name: 'Technology', count: '2,450 jobs', icon: '💻' },
    { name: 'Marketing', count: '1,230 jobs', icon: '📈' },
    { name: 'Design', count: '890 jobs', icon: '🎨' },
    { name: 'Sales', count: '1,560 jobs', icon: '💼' },
    { name: 'Finance', count: '670 jobs', icon: '💰' },
    { name: 'Healthcare', count: '980 jobs', icon: '🏥' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                JobPortal
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/jobs" className="text-gray-700 hover:text-blue-600 transition-colors">
                Find Jobs
              </Link>
              <Link href="/companies" className="text-gray-700 hover:text-blue-600 transition-colors">
                Companies
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user && profile ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {profile.full_name}</span>
                  <Link
                    href={getDashboardUrl()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/jobs" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Find Jobs</Link>
                <Link href="/companies" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Companies</Link>
                <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-blue-600">About</Link>
                <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Contact</Link>
                {user && profile ? (
                  <>
                    <Link href={getDashboardUrl()} className="block px-3 py-2 text-gray-700 hover:text-blue-600">Dashboard</Link>
                    <button onClick={signOut} className="block px-3 py-2 text-gray-700 hover:text-blue-600 w-full text-left">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Login</Link>
                    <Link href="/auth/signup" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Dream Job
              <span className="block text-yellow-300">Today</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with top companies and discover opportunities that match your skills and aspirations. 
              Join thousands of professionals who found their perfect career match.
            </p>
            
            {/* Search Bar */}
            <div className="bg-white rounded-xl p-3 max-w-4xl mx-auto shadow-2xl">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-3">
                  <Search className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Job title, keywords, or company"
                    className="w-full bg-transparent text-gray-700 outline-none placeholder-gray-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-4 py-3">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full bg-transparent text-gray-700 outline-none placeholder-gray-500"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold whitespace-nowrap"
                >
                  Search Jobs
                </button>
              </div>
            </div>

            {/* Quick filters */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {['Remote', 'Full-time', 'Part-time', 'Contract', 'Internship'].map((filter) => (
                <button
                  key={filter}
                  className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/20"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-10 w-10 ${stat.color}`} />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore opportunities across different industries and find the perfect role for your expertise
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {jobCategories.map((category, index) => (
              <Link
                key={index}
                href={`/jobs?category=${category.name.toLowerCase()}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all group cursor-pointer border hover:border-blue-200"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Jobs
              </h2>
              <p className="text-gray-600">
                Hand-picked opportunities from top companies
              </p>
            </div>
            <Link
              href="/jobs"
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border hover:border-blue-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-blue-600 font-medium">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      {job.type}
                    </span>
                    {job.isRemote && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mt-1">
                        Remote
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {job.salary}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {job.postedDays} day{job.postedDays > 1 ? 's' : ''} ago
                  </span>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Companies */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top Companies Hiring
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of professionals working at these amazing companies
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {topCompanies.map((company, index) => (
              <Link
                key={index}
                href={`/companies/${company.name.toLowerCase()}`}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all text-center group border hover:border-blue-200"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building className="h-8 w-8 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                <p className="text-sm text-gray-500">{company.jobs} open jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have found their dream jobs through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  href="/auth/signup"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                >
                  Get Started Today
                </Link>
                <Link
                  href="/jobs"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold"
                >
                  Browse Jobs
                </Link>
              </>
            ) : (
              <Link
                href={getDashboardUrl()}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4 text-blue-400">JobPortal</div>
              <p className="text-gray-400 mb-4">
                Your gateway to exciting career opportunities and professional growth.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">For Job Seekers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
                <li><Link href="/companies" className="hover:text-white transition-colors">Companies</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors">Career Resources</Link></li>
                <li><Link href="/resume-builder" className="hover:text-white transition-colors">Resume Builder</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">For Employers</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/employer/signup" className="hover:text-white transition-colors">Post Jobs</Link></li>
                <li><Link href="/employer/plans" className="hover:text-white transition-colors">Pricing Plans</Link></li>
                <li><Link href="/employer/resources" className="hover:text-white transition-colors">Hiring Resources</Link></li>
                <li><Link href="/employer/dashboard" className="hover:text-white transition-colors">Employer Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 JobPortal. All rights reserved. Built with ❤️ for job seekers everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { supabase } from '../../../lib/supabase'
import { User, Mail, Phone, Compass, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react'

export default function UserProfile() {
  const { user, profile, updateProfile, refreshProfile } = useAuth()
  const [edit, setEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state mirrors profile
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    resume_url: profile?.resume_url || ''
  })

  // When profile loads/changes, update form
  // (if profile might update after mount)
  React.useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: (profile as any).location || '',
        bio: (profile as any).bio || '',
        avatar_url: profile.avatar_url || '',
        resume_url: (profile as any).resume_url || ''
      })
    }
  }, [profile])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await updateProfile(form)
      setSuccess('Profile updated!')
      setEdit(false)
      refreshProfile()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAvatarUpload(file: File) {
    setLoading(true)
    setError('')
    setSuccess('')
    const filePath = `${user?.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (error) {
      setError('Avatar upload error')
      setLoading(false)
      return
    }
    // get public URL
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    setForm({ ...form, avatar_url: publicUrl })
    setLoading(false)
  }

  async function handleResumeUpload(file: File) {
    setLoading(true)
    setError('')
    setSuccess('')
    const filePath = `${user?.id}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true })
    if (error) {
      setError('Resume upload error')
      setLoading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(filePath)
    setForm({ ...form, resume_url: publicUrl })
    setLoading(false)
  }

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center">Loading profile...</div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Your Profile</h1>

      {/* Profile Avatar */}
      <div className="flex items-center space-x-6 mb-6">
        <div>
          {form.avatar_url
            ? <img src={form.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            : <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-3xl">
                <User />
              </div>
          }
        </div>
        {edit && (
          <div>
            <label className="cursor-pointer flex items-center space-x-2 text-blue-600">
              <UploadCloud className="h-5 w-5" /> 
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleAvatarUpload(file)
                }}
              />
              <span>Update Avatar</span>
            </label>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <div className="relative flex items-center">
            <User className="absolute left-2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="pl-8 py-2 border rounded w-full"
              value={form.full_name}
              disabled={!edit}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              className="pl-8 py-2 border rounded w-full bg-gray-100"
              value={profile.email}
              disabled
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <div className="relative flex items-center">
            <Phone className="absolute left-2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              className="pl-8 py-2 border rounded w-full"
              value={form.phone}
              disabled={!edit}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="relative flex items-center">
            <Compass className="absolute left-2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="pl-8 py-2 border rounded w-full"
              value={form.location}
              disabled={!edit}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            className="w-full border rounded py-2 px-3"
            rows={3}
            disabled={!edit}
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
          />
        </div>
        {/* Resume Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Resume</label>
          {form.resume_url ? (
            <a href={form.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 underline">
              <FileText className="h-5 w-5 mr-2" />
              View Uploaded Resume
            </a>
          ) : (
            <span className="text-gray-500 text-sm">No resume uploaded</span>
          )}
          {edit && (
            <label className="cursor-pointer flex items-center space-x-2 text-blue-600 mt-2">
              <UploadCloud className="h-5 w-5" />
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleResumeUpload(file)
                }}
              />
              <span>Upload Resume</span>
            </label>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          {edit ? (
            <>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
                disabled={loading}
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-2 rounded"
                disabled={loading}
                onClick={() => {
                  // reset form and cancel editing
                  setForm({
                    full_name: profile.full_name || '',
                    phone: profile.phone || '',
                    location: (profile as any).location || '',
                    bio: (profile as any).bio || '',
                    avatar_url: profile.avatar_url || '',
                    resume_url: (profile as any).resume_url || ''
                  })
                  setEdit(false)
                  setSuccess('')
                  setError('')
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2 rounded"
              onClick={() => setEdit(true)}
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

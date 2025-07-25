import { supabase } from '../lib/supabase'

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string,
  userId: string
): Promise<{ url?: string; path?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${userId}/${fileName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    if (['company-logos', 'profile-avatars'].includes(bucket)) {
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)
      
      return { url: publicUrl, path: filePath }
    }

    return { path: filePath }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return { error: errorMessage }
  }
}

export const deleteFile = async (bucket: string, path: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path])
    return !error
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

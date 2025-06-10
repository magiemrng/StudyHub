import React, { useState, useEffect, useRef } from 'react'
import { Upload, Download, Trash2, FileText, Eye, Plus, Search, Filter, Calendar, User, Crown, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Resume {
  id: string
  user_id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  description?: string
  tags: string[]
  is_primary: boolean
  created_at: string
  updated_at: string
}

interface ResumeStorageProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const ResumeStorage: React.FC<ResumeStorageProps> = ({ isGuest = false, onSignUp }) => {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'primary' | 'recent'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadDescription, setUploadDescription] = useState('')
  const [uploadTags, setUploadTags] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadResumes()
    }
  }, [user])

  const loadResumes = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResumes(data || [])
    } catch (error) {
      console.error('Error loading resumes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or Word document')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setUploading(true)
    
    try {
      // Upload file to Supabase Storage with simpler path structure
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = fileName // Simplified path without folders

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath)

      // If this is set as primary, update other resumes
      if (isPrimary) {
        await supabase
          .from('resumes')
          .update({ is_primary: false })
          .eq('user_id', user.id)
      }

      // Save resume metadata to database
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          file_type: file.type,
          description: uploadDescription.trim() || null,
          tags: uploadTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
          is_primary: isPrimary
        })
        .select()
        .single()

      if (error) throw error

      // Reset form and reload resumes
      setUploadDescription('')
      setUploadTags('')
      setIsPrimary(false)
      setShowUploadModal(false)
      loadResumes()
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error uploading resume:', error)
      alert('Failed to upload resume. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const deleteResume = async (resumeId: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('resumes')
        .remove([fileName])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId)
        .eq('user_id', user?.id)

      if (dbError) throw dbError

      loadResumes()
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume. Please try again.')
    }
  }

  const setPrimaryResume = async (resumeId: string) => {
    try {
      // First, set all resumes as non-primary
      await supabase
        .from('resumes')
        .update({ is_primary: false })
        .eq('user_id', user?.id)

      // Then set the selected resume as primary
      const { error } = await supabase
        .from('resumes')
        .update({ is_primary: true })
        .eq('id', resumeId)
        .eq('user_id', user?.id)

      if (error) throw error

      loadResumes()
    } catch (error) {
      console.error('Error setting primary resume:', error)
      alert('Failed to set primary resume. Please try again.')
    }
  }

  const downloadResume = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resume.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resume.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'primary' && resume.is_primary) ||
                         (selectedFilter === 'recent' && new Date(resume.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    return matchesSearch && matchesFilter
  })

  const primaryResume = resumes.find(resume => resume.is_primary)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Resume Storage</h1>
          <p className="text-white/70 text-sm">Manage and organize your professional resumes</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Resume</span>
        </button>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-3 md:col-span-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Guest Mode - Files Not Saved</h3>
                <p className="text-white/70 text-xs">Sign up to store your resumes permanently</p>
              </div>
            </div>
            <button
              onClick={onSignUp}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {/* Primary Resume Card */}
      {primaryResume && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Primary Resume</h3>
                <p className="text-emerald-400 text-sm">Your main resume for applications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.open(primaryResume.file_url, '_blank')}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                <Eye className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => downloadResume(primaryResume.file_url, primaryResume.file_name)}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">{primaryResume.file_name}</p>
            {primaryResume.description && (
              <p className="text-white/70 text-sm">{primaryResume.description}</p>
            )}
            <div className="flex items-center space-x-4 text-xs text-white/60">
              <span>{formatFileSize(primaryResume.file_size)}</span>
              <span>•</span>
              <span>{formatDate(primaryResume.created_at)}</span>
            </div>
            {primaryResume.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {primaryResume.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes..."
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-white/60" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="bg-white/10 border border-white/20 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-emerald-400 text-sm"
          >
            <option value="all" className="bg-gray-800">All Resumes</option>
            <option value="primary" className="bg-gray-800">Primary Only</option>
            <option value="recent" className="bg-gray-800">Recent (7 days)</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Total Resumes</h3>
          <p className="text-xl font-bold text-white">{resumes.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <User className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Primary Resume</h3>
          <p className="text-xl font-bold text-white">{primaryResume ? '1' : '0'}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">This Month</h3>
          <p className="text-xl font-bold text-white">
            {resumes.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <Download className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Total Size</h3>
          <p className="text-xl font-bold text-white">
            {formatFileSize(resumes.reduce((total, resume) => total + resume.file_size, 0))}
          </p>
        </div>
      </div>

      {/* Resume List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">All Resumes</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading resumes...</div>
          </div>
        ) : filteredResumes.length > 0 ? (
          <div className="space-y-3">
            {filteredResumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-medium text-sm truncate">{resume.file_name}</h3>
                        {resume.is_primary && (
                          <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                      {resume.description && (
                        <p className="text-white/60 text-xs mb-1 truncate">{resume.description}</p>
                      )}
                      <div className="flex items-center space-x-3 text-xs text-white/50">
                        <span>{formatFileSize(resume.file_size)}</span>
                        <span>•</span>
                        <span>{formatDate(resume.created_at)}</span>
                      </div>
                      {resume.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resume.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {resume.tags.length > 3 && (
                            <span className="text-white/50 text-xs">+{resume.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!resume.is_primary && (
                      <button
                        onClick={() => setPrimaryResume(resume.id)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-xs px-2 py-1 bg-emerald-500/10 rounded-lg"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => window.open(resume.file_url, '_blank')}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => downloadResume(resume.file_url, resume.file_name)}
                      className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <Download className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => deleteResume(resume.id, resume.file_url)}
                      className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-sm">
              {searchQuery || selectedFilter !== 'all' ? 'No resumes match your search' : 'No resumes uploaded yet'}
            </p>
            <p className="text-white/50 text-xs mt-1">
              {!searchQuery && selectedFilter === 'all' && 'Upload your first resume to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upload Resume</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="e.g., Software Engineer Resume 2024"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Tags (Optional)</label>
                <input
                  type="text"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  placeholder="e.g., software, engineer, react, node"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                />
                <p className="text-white/50 text-xs mt-1">Separate tags with commas</p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 bg-white/10 border-white/20 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isPrimary" className="text-white/70 text-sm">
                  Set as primary resume
                </label>
              </div>

              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm mb-2">Click to upload or drag and drop</p>
                <p className="text-white/50 text-xs">PDF, DOC, DOCX (Max 10MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {uploading ? 'Uploading...' : 'Choose File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeStorage
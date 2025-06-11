import React, { useState, useEffect } from 'react'
import { Plus, Calendar, TrendingUp, Crown, Users, BookOpen, Target } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Subject {
  id: string
  name: string
  totalClasses: number
  attendedClasses: number
  requiredPercentage: number
}

interface AttendanceTrackerProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ isGuest = false, onSignUp }) => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  useEffect(() => {
    if (user) {
      loadSubjects()
    }
  }, [user])

  const loadSubjects = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        totalClasses: item.total_classes,
        attendedClasses: item.attended_classes,
        requiredPercentage: item.required_percentage
      }))
      
      setSubjects(formattedData)
    } catch (error) {
      console.error('Error loading subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSubject = async (subject: Subject) => {
    if (!user) return

    try {
      if (isValidUUID(subject.id)) {
        const { error } = await supabase
          .from('subjects')
          .upsert({
            id: subject.id,
            user_id: user.id,
            name: subject.name,
            total_classes: subject.totalClasses,
            attended_classes: subject.attendedClasses,
            required_percentage: subject.requiredPercentage
          })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('subjects')
          .insert({
            user_id: user.id,
            name: subject.name,
            total_classes: subject.totalClasses,
            attended_classes: subject.attendedClasses,
            required_percentage: subject.requiredPercentage
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setSubjects(prev => (prev || []).map(s => 
            s.id === subject.id 
              ? { ...s, id: data.id }
              : s
          ))
        }
      }
    } catch (error) {
      console.error('Error saving subject:', error)
    }
  }

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      totalClasses: 0,
      attendedClasses: 0,
      requiredPercentage: 75
    }
    setSubjects(prev => [...(prev || []), newSubject])
  }

  const updateSubject = async (id: string, field: keyof Subject, value: string | number) => {
    const currentSubjects = subjects || []
    const updatedSubjects = currentSubjects.map(subject => {
      if (subject.id === id) {
        const updatedSubject = { ...subject, [field]: value }
        
        // Ensure attended classes never exceed total classes
        if (field === 'totalClasses') {
          const newTotal = Number(value)
          updatedSubject.totalClasses = newTotal
          // If attended classes exceed new total, adjust them
          if (updatedSubject.attendedClasses > newTotal) {
            updatedSubject.attendedClasses = newTotal
          }
        } else if (field === 'attendedClasses') {
          const newAttended = Number(value)
          // Ensure attended doesn't exceed total
          updatedSubject.attendedClasses = Math.min(newAttended, updatedSubject.totalClasses)
        } else {
          updatedSubject[field] = value as any
        }
        
        return updatedSubject
      }
      return subject
    })
    
    setSubjects(updatedSubjects)
    
    if (user) {
      const updatedSubject = updatedSubjects.find(s => s.id === id)
      if (updatedSubject) {
        await saveSubject(updatedSubject)
      }
    }
  }

  const calculatePercentage = (attended: number, total: number) => {
    return total > 0 ? ((attended / total) * 100).toFixed(1) : '0.0'
  }

  const getAttendanceStatus = (attended: number, total: number, required: number) => {
    const percentage = parseFloat(calculatePercentage(attended, total))
    return percentage >= required ? 'good' : 'warning'
  }

  const calculateClassesNeeded = (attended: number, total: number, required: number) => {
    const currentPercentage = total > 0 ? (attended / total) * 100 : 0
    if (currentPercentage >= required) return 0
    
    let classesNeeded = 0
    let tempAttended = attended
    let tempTotal = total
    
    while ((tempAttended / tempTotal) * 100 < required && classesNeeded < 100) {
      tempAttended += 1
      tempTotal += 1
      classesNeeded += 1
    }
    
    return classesNeeded
  }

  const safeSubjects = subjects || []
  const overallStats = {
    totalClasses: safeSubjects.reduce((sum, subject) => sum + subject.totalClasses, 0),
    attendedClasses: safeSubjects.reduce((sum, subject) => sum + subject.attendedClasses, 0),
    averagePercentage: safeSubjects.length > 0 
      ? (safeSubjects.reduce((sum, subject) => 
          sum + parseFloat(calculatePercentage(subject.attendedClasses, subject.totalClasses))
        , 0) / safeSubjects.length).toFixed(1)
      : '0.0'
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Attendance Tracker</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Monitor your class attendance across all subjects. Track your progress and ensure you meet 
            the minimum attendance requirements for each course.
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Classes</h3>
            <p className="text-3xl font-bold text-gray-900">{overallStats.totalClasses}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Classes Attended</h3>
            <p className="text-3xl font-bold text-gray-900">{overallStats.attendedClasses}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Attendance</h3>
            <p className="text-3xl font-bold text-gray-900">{overallStats.averagePercentage}%</p>
          </div>
        </div>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8">
          <div className="flex items-start space-x-4">
            <Crown className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guest Mode - Data Not Saved</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                You're using the attendance tracker in guest mode. Your attendance data won't be saved permanently. 
                Sign up to keep track of your attendance records and monitor your progress over time.
              </p>
              <button
                onClick={onSignUp}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Sign Up to Save Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Management */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Your Subjects</h2>
          <button
            onClick={addSubject}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Subject</span>
          </button>
        </div>

        {/* Subjects List */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          {safeSubjects.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {safeSubjects.map((subject, index) => {
                const percentage = calculatePercentage(subject.attendedClasses, subject.totalClasses)
                const status = getAttendanceStatus(subject.attendedClasses, subject.totalClasses, subject.requiredPercentage)
                const classesNeeded = calculateClassesNeeded(subject.attendedClasses, subject.totalClasses, subject.requiredPercentage)
                
                return (
                  <div key={subject.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-1 flex items-center justify-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">{index + 1}</span>
                        </div>
                      </div>
                      
                      <div className="md:col-span-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Subject Name</label>
                        <input
                          type="text"
                          value={subject.name}
                          onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                          placeholder="Enter subject name"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Total Classes</label>
                        <input
                          type="number"
                          value={subject.totalClasses}
                          onChange={(e) => updateSubject(subject.id, 'totalClasses', parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                          min="0"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Attended</label>
                        <input
                          type="number"
                          value={subject.attendedClasses}
                          onChange={(e) => updateSubject(subject.id, 'attendedClasses', parseInt(e.target.value) || 0)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                          min="0"
                          max={subject.totalClasses}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Required %</label>
                        <input
                          type="number"
                          value={subject.requiredPercentage}
                          onChange={(e) => updateSubject(subject.id, 'requiredPercentage', parseInt(e.target.value) || 75)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                          min="0"
                          max="100"
                        />
                      </div>
                      
                      <div className="md:col-span-1 text-center">
                        <div className={`text-2xl font-bold mb-1 ${status === 'good' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {percentage}%
                        </div>
                        {status === 'warning' && classesNeeded > 0 && (
                          <p className="text-xs text-red-600">
                            Need {classesNeeded} more
                          </p>
                        )}
                        {status === 'good' && (
                          <p className="text-xs text-emerald-600">
                            On track!
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            status === 'good' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects added yet</h3>
              <p className="text-gray-600 mb-6">Add your first subject to start tracking attendance</p>
              <button
                onClick={addSubject}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Add Your First Subject
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      {safeSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Subjects</h3>
            <p className="text-3xl font-bold text-gray-900">{safeSubjects.length}</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Good Attendance</h3>
            <p className="text-3xl font-bold text-gray-900">
              {safeSubjects.filter(s => 
                parseFloat(calculatePercentage(s.attendedClasses, s.totalClasses)) >= s.requiredPercentage
              ).length}
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Classes This Week</h3>
            <p className="text-3xl font-bold text-gray-900">
              {Math.floor(overallStats.totalClasses / 15) || 0}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceTracker
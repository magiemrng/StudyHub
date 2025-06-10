import React, { useState, useEffect } from 'react'
import { Plus, Calendar, TrendingUp, Crown } from 'lucide-react'
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
      
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        totalClasses: item.total_classes,
        attendedClasses: item.attended_classes,
        requiredPercentage: item.required_percentage
      })) || []
      
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
          setSubjects(prev => prev.map(s => 
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
    setSubjects([...subjects, newSubject])
  }

  const updateSubject = async (id: string, field: keyof Subject, value: string | number) => {
    const updatedSubjects = subjects.map(subject => {
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

  const overallStats = {
    totalClasses: subjects.reduce((sum, subject) => sum + subject.totalClasses, 0),
    attendedClasses: subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0),
    averagePercentage: subjects.length > 0 
      ? (subjects.reduce((sum, subject) => 
          sum + parseFloat(calculatePercentage(subject.attendedClasses, subject.totalClasses))
        , 0) / subjects.length).toFixed(1)
      : '0.0'
  }

  return (
    <div className="space-y-4">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Attendance Tracker</h1>
          <p className="text-white/70 text-sm">Monitor your class attendance and performance</p>
        </div>
        <button
          onClick={addSubject}
          className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-3 md:col-span-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Guest Mode - Data Not Saved</h3>
                <p className="text-white/70 text-xs">Sign up to save your attendance data permanently</p>
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

      {/* Overall Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Total Classes</h3>
          <p className="text-xl font-bold text-white">{overallStats.totalClasses}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Classes Attended</h3>
          <p className="text-xl font-bold text-white">{overallStats.attendedClasses}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Average Attendance</h3>
          <p className="text-xl font-bold text-white">{overallStats.averagePercentage}%</p>
        </div>
      </div>

      {/* Subject List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">Subjects</h2>
        
        <div className="space-y-3">
          {subjects.map((subject) => {
            const percentage = calculatePercentage(subject.attendedClasses, subject.totalClasses)
            const status = getAttendanceStatus(subject.attendedClasses, subject.totalClasses, subject.requiredPercentage)
            const classesNeeded = calculateClassesNeeded(subject.attendedClasses, subject.totalClasses, subject.requiredPercentage)
            
            return (
              <div key={subject.id} className="p-3 bg-white/5 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 text-sm"
                      placeholder="Subject name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Total</label>
                    <input
                      type="number"
                      value={subject.totalClasses}
                      onChange={(e) => updateSubject(subject.id, 'totalClasses', parseInt(e.target.value) || 0)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 text-sm"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Attended</label>
                    <input
                      type="number"
                      value={subject.attendedClasses}
                      onChange={(e) => updateSubject(subject.id, 'attendedClasses', parseInt(e.target.value) || 0)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 text-sm"
                      min="0"
                      max={subject.totalClasses}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white/70 text-xs mb-1">Required %</label>
                    <input
                      type="number"
                      value={subject.requiredPercentage}
                      onChange={(e) => updateSubject(subject.id, 'requiredPercentage', parseInt(e.target.value) || 75)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-400 text-sm"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${status === 'good' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {percentage}%
                    </div>
                    {status === 'warning' && classesNeeded > 0 && (
                      <p className="text-xs text-red-400 mt-1">
                        Need {classesNeeded} classes
                      </p>
                    )}
                    {status === 'good' && (
                      <p className="text-xs text-emerald-400 mt-1">
                        On track!
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'good' ? 'bg-emerald-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {subjects.length === 0 && (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-sm">No subjects added yet. Add your first subject to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceTracker
import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, Trophy, TrendingUp, Crown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Assignment {
  id: string
  name: string
  subject: string
  grade: number
  maxGrade: number
  weight: number
  date: string
}

interface GradeManagerProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const GradeManager: React.FC<GradeManagerProps> = ({ isGuest = false, onSignUp }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    name: '',
    subject: '',
    grade: 0,
    maxGrade: 100,
    weight: 20,
    date: new Date().toISOString().split('T')[0]
  })
  const { user } = useAuth()

  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  useEffect(() => {
    if (user) {
      loadAssignments()
    }
  }, [user])

  const loadAssignments = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const formattedData = data?.map(item => ({
        id: item.id,
        name: item.name,
        subject: item.subject,
        grade: item.grade,
        maxGrade: item.max_grade,
        weight: item.weight,
        date: item.date
      })) || []
      
      setAssignments(formattedData)
    } catch (error) {
      console.error('Error loading assignments:', error)
    }
  }

  const saveAssignment = async (assignment: Assignment) => {
    if (!user) return

    try {
      if (isValidUUID(assignment.id)) {
        const { error } = await supabase
          .from('assignments')
          .upsert({
            id: assignment.id,
            user_id: user.id,
            name: assignment.name,
            subject: assignment.subject,
            grade: assignment.grade,
            max_grade: assignment.maxGrade,
            weight: assignment.weight,
            date: assignment.date
          })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('assignments')
          .insert({
            user_id: user.id,
            name: assignment.name,
            subject: assignment.subject,
            grade: assignment.grade,
            max_grade: assignment.maxGrade,
            weight: assignment.weight,
            date: assignment.date
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setAssignments(prev => prev.map(a => 
            a.id === assignment.id 
              ? { ...a, id: data.id }
              : a
          ))
        }
      }
    } catch (error) {
      console.error('Error saving assignment:', error)
    }
  }

  const subjects = [...new Set(assignments.map(a => a.subject))]

  const addAssignment = async () => {
    if (newAssignment.name && newAssignment.subject) {
      const assignment: Assignment = {
        id: Date.now().toString(),
        name: newAssignment.name,
        subject: newAssignment.subject,
        grade: newAssignment.grade || 0,
        maxGrade: newAssignment.maxGrade || 100,
        weight: newAssignment.weight || 20,
        date: newAssignment.date || new Date().toISOString().split('T')[0]
      }
      setAssignments([...assignments, assignment])
      
      if (user) {
        await saveAssignment(assignment)
      }
      
      setNewAssignment({
        name: '',
        subject: '',
        grade: 0,
        maxGrade: 100,
        weight: 20,
        date: new Date().toISOString().split('T')[0]
      })
    }
  }

  const deleteAssignment = async (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id))
    
    if (user && isValidUUID(id)) {
      try {
        const { error } = await supabase
          .from('assignments')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
      } catch (error) {
        console.error('Error deleting assignment:', error)
      }
    }
  }

  const calculateSubjectAverage = (subject: string) => {
    const subjectAssignments = assignments.filter(a => a.subject === subject)
    if (subjectAssignments.length === 0) return 0
    
    const totalWeightedGrade = subjectAssignments.reduce((sum, a) => 
      sum + (a.grade / a.maxGrade * 100) * a.weight, 0)
    const totalWeight = subjectAssignments.reduce((sum, a) => sum + a.weight, 0)
    
    return totalWeight > 0 ? (totalWeightedGrade / totalWeight).toFixed(1) : '0.0'
  }

  const calculateOverallAverage = () => {
    if (assignments.length === 0) return '0.0'
    
    const totalWeightedGrade = assignments.reduce((sum, a) => 
      sum + (a.grade / a.maxGrade * 100) * a.weight, 0)
    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0)
    
    return totalWeight > 0 ? (totalWeightedGrade / totalWeight).toFixed(1) : '0.0'
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400'
    if (percentage >= 80) return 'text-blue-400'
    if (percentage >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Grade Manager</h1>
          <p className="text-white/70 text-sm">Track your assignments and academic performance</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <p className="text-white/70 text-sm mb-1">Overall Average</p>
          <p className={`text-2xl font-bold ${getGradeColor(parseFloat(calculateOverallAverage()))}`}>
            {calculateOverallAverage()}%
          </p>
        </div>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-3 md:col-span-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Guest Mode - Data Not Saved</h3>
                <p className="text-white/70 text-xs">Sign up to save your grades permanently</p>
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

      {/* Subject Averages Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subjects.map((subject) => (
          <div key={subject} className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
            <BookOpen className="w-5 h-5 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-medium text-xs mb-1 truncate">{subject}</h3>
            <p className={`text-lg font-bold ${getGradeColor(parseFloat(calculateSubjectAverage(subject)))}`}>
              {calculateSubjectAverage(subject)}%
            </p>
          </div>
        ))}
      </div>

      {/* Add Assignment */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Assignment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newAssignment.name || ''}
              onChange={(e) => setNewAssignment({...newAssignment, name: e.target.value})}
              placeholder="Assignment name"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="text"
              value={newAssignment.subject || ''}
              onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
              placeholder="Subject"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="number"
              value={newAssignment.grade || ''}
              onChange={(e) => setNewAssignment({...newAssignment, grade: parseFloat(e.target.value) || 0})}
              placeholder="Grade"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="number"
              value={newAssignment.weight || ''}
              onChange={(e) => setNewAssignment({...newAssignment, weight: parseFloat(e.target.value) || 0})}
              placeholder="Weight %"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <button
              onClick={addAssignment}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">Assignments</h2>
        
        {assignments.length > 0 ? (
          <div className="space-y-2">
            {assignments.map((assignment) => {
              const percentage = (assignment.grade / assignment.maxGrade) * 100
              return (
                <div key={assignment.id} className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <h3 className="text-white font-medium text-sm">{assignment.name}</h3>
                        <span className="text-white/60 text-sm">{assignment.subject}</span>
                        <span className="text-white/60 text-sm">{assignment.date}</span>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold text-sm ${getGradeColor(percentage)}`}>
                            {assignment.grade}/{assignment.maxGrade} ({percentage.toFixed(1)}%)
                          </span>
                          <button
                            onClick={() => deleteAssignment(assignment.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 text-lg"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <span className="text-white/60 text-xs">Weight: {assignment.weight}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-sm">No assignments yet. Add your first assignment above!</p>
          </div>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <TrendingUp className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Total Assignments</h3>
          <p className="text-xl font-bold text-white">{assignments.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">Subjects</h3>
          <p className="text-xl font-bold text-white">{subjects.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-white/70 text-xs mb-1">High Grades (90%+)</h3>
          <p className="text-xl font-bold text-white">
            {assignments.filter(a => (a.grade / a.maxGrade) * 100 >= 90).length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default GradeManager
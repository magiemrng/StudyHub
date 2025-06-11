import React, { useState, useEffect } from 'react'
import { Plus, BookOpen, Trophy, TrendingUp, Crown, Target, BarChart3, Award } from 'lucide-react'
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
    if (percentage >= 90) return 'text-emerald-600'
    if (percentage >= 80) return 'text-blue-600'
    if (percentage >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const overallAverage = parseFloat(calculateOverallAverage())
  const highGrades = assignments.filter(a => (a.grade / a.maxGrade) * 100 >= 90).length
  const recentAssignments = assignments.filter(a => {
    const assignmentDate = new Date(a.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return assignmentDate >= weekAgo
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Grade Manager</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Track your assignments, projects, and academic performance across all subjects. 
            Monitor your progress and identify areas for improvement.
          </p>
        </div>

        {/* Overall Performance */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Average</h2>
              <p className={`text-5xl font-bold mb-2 ${getGradeColor(overallAverage)}`}>{calculateOverallAverage()}%</p>
              <p className="text-gray-600">Weighted average across all assignments</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Assignments</h3>
              <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High Grades</h3>
              <p className="text-3xl font-bold text-gray-900">{highGrades}</p>
            </div>
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
                You're using the grade manager in guest mode. Your assignment data won't be saved permanently. 
                Sign up to keep track of your grades and monitor your academic progress over time.
              </p>
              <button
                onClick={onSignUp}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Sign Up to Save Grades
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Averages */}
      {subjects.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Subject Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{subject}</h3>
                </div>
                <p className={`text-3xl font-bold ${getGradeColor(parseFloat(calculateSubjectAverage(subject)))}`}>
                  {calculateSubjectAverage(subject)}%
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {assignments.filter(a => a.subject === subject).length} assignments
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Assignment */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Assignment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="lg:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">Assignment Name</label>
            <input
              type="text"
              value={newAssignment.name || ''}
              onChange={(e) => setNewAssignment({...newAssignment, name: e.target.value})}
              placeholder="Enter assignment name"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={newAssignment.subject || ''}
              onChange={(e) => setNewAssignment({...newAssignment, subject: e.target.value})}
              placeholder="Subject"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Grade</label>
            <input
              type="number"
              value={newAssignment.grade || ''}
              onChange={(e) => setNewAssignment({...newAssignment, grade: parseFloat(e.target.value) || 0})}
              placeholder="Grade"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Max Grade</label>
            <input
              type="number"
              value={newAssignment.maxGrade || ''}
              onChange={(e) => setNewAssignment({...newAssignment, maxGrade: parseFloat(e.target.value) || 100})}
              placeholder="Max"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Weight %</label>
            <input
              type="number"
              value={newAssignment.weight || ''}
              onChange={(e) => setNewAssignment({...newAssignment, weight: parseFloat(e.target.value) || 0})}
              placeholder="Weight"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
        
        <button
          onClick={addAssignment}
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Assignments</h2>
        </div>
        
        {assignments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {assignments.map((assignment) => {
              const percentage = (assignment.grade / assignment.maxGrade) * 100
              return (
                <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{assignment.name}</h3>
                        <p className="text-gray-600 text-sm">{assignment.subject}</p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Date</p>
                        <p className="text-gray-600 text-sm">{new Date(assignment.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Grade</p>
                        <p className="text-gray-900 font-semibold">{assignment.grade}/{assignment.maxGrade}</p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Percentage</p>
                        <p className={`font-bold ${getGradeColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-700 font-medium">Weight</p>
                        <p className="text-gray-600">{assignment.weight}%</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="ml-4 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors duration-200"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-6">Add your first assignment to start tracking grades</p>
            <button
              onClick={() => document.querySelector('input[placeholder="Enter assignment name"]')?.focus()}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
            >
              Add Your First Assignment
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      {assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Assignments</h3>
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Subjects</h3>
            <p className="text-3xl font-bold text-gray-900">{subjects.length}</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <Award className="w-8 h-8 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">High Grades (90%+)</h3>
            <p className="text-3xl font-bold text-gray-900">{highGrades}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GradeManager
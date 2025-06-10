import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator, Crown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Course {
  id: string
  name: string
  credits: number
  grade: string
}

interface GPACalculatorProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const GPACalculator: React.FC<GPACalculatorProps> = ({ isGuest = false, onSignUp }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // 10-point GPA scale
  const gradePoints: { [key: string]: number } = {
    'A+': 10.0, 'A': 9.0, 'A-': 8.5,
    'B+': 8.0, 'B': 7.0, 'B-': 6.5,
    'C+': 6.0, 'C': 5.0, 'C-': 4.5,
    'D+': 4.0, 'D': 3.0, 'F': 0.0
  }

  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCourses(data || [])
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const isValidUUID = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  }

  const saveCourse = async (course: Course) => {
    if (!user) return

    try {
      if (isValidUUID(course.id)) {
        const { error } = await supabase
          .from('courses')
          .upsert({
            id: course.id,
            user_id: user.id,
            name: course.name,
            credits: course.credits,
            grade: course.grade
          })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert({
            user_id: user.id,
            name: course.name,
            credits: course.credits,
            grade: course.grade
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setCourses(prevCourses => 
            (prevCourses || []).map(c => 
              c.id === course.id ? { ...c, id: data.id } : c
            )
          )
        }
      }
    } catch (error) {
      console.error('Error saving course:', error)
    }
  }

  const deleteCourseFromDB = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: '',
      credits: 3,
      grade: 'A'
    }
    setCourses(prev => [...(prev || []), newCourse])
  }

  const deleteCourse = async (id: string) => {
    setCourses(prev => (prev || []).filter(course => course.id !== id))
    if (user && isValidUUID(id)) {
      await deleteCourseFromDB(id)
    }
  }

  const updateCourse = async (id: string, field: keyof Course, value: string | number) => {
    const currentCourses = courses || []
    const updatedCourses = currentCourses.map(course => 
      course.id === id ? { ...course, [field]: value } : course
    )
    setCourses(updatedCourses)
    
    if (user) {
      const updatedCourse = updatedCourses.find(c => c.id === id)
      if (updatedCourse) {
        await saveCourse(updatedCourse)
      }
    }
  }

  const calculateGPA = () => {
    const safeCourses = courses || []
    if (safeCourses.length === 0) return '0.00'
    
    const totalPoints = safeCourses.reduce((sum, course) => {
      return sum + (course.credits * gradePoints[course.grade])
    }, 0)
    
    const totalCredits = safeCourses.reduce((sum, course) => sum + course.credits, 0)
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
  }

  const getGradeColor = (gpa: string) => {
    const numGpa = parseFloat(gpa)
    if (numGpa >= 9.0) return 'text-emerald-400'
    if (numGpa >= 8.0) return 'text-blue-400'
    if (numGpa >= 7.0) return 'text-yellow-400'
    if (numGpa >= 6.0) return 'text-orange-400'
    return 'text-red-400'
  }

  const safeCourses = courses || []

  return (
    <div className="space-y-4">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">GPA Calculator</h1>
          <p className="text-white/70 text-sm">Calculate your Grade Point Average (10-point scale)</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <p className="text-white/70 text-sm mb-1">Current GPA</p>
          <p className={`text-2xl md:text-3xl font-bold ${getGradeColor(calculateGPA())}`}>{calculateGPA()}</p>
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
                <p className="text-white/70 text-xs">Sign up to save your courses permanently</p>
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

      {/* Course List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Courses</h2>
          <button
            onClick={addCourse}
            className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl transition-colors duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {safeCourses.map((course) => (
            <div key={course.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-white/5 rounded-xl">
              <div className="md:col-span-2">
                <label className="block text-white/70 text-xs mb-1">Course Name</label>
                <input
                  type="text"
                  value={course.name}
                  onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-xs mb-1">Credits</label>
                <input
                  type="number"
                  value={course.credits}
                  onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value) || 0)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  min="1"
                  max="6"
                />
              </div>
              
              <div>
                <label className="block text-white/70 text-xs mb-1">Grade</label>
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                >
                  {Object.keys(gradePoints).map(grade => (
                    <option key={grade} value={grade} className="bg-gray-800">
                      {grade} ({gradePoints[grade]})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => deleteCourse(course.id)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {safeCourses.length === 0 && (
          <div className="text-center py-8">
            <Calculator className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-sm">No courses added yet. Add your first course to get started!</p>
          </div>
        )}
      </div>

      {/* GPA Breakdown Grid */}
      {safeCourses.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
            <h3 className="text-white/70 text-xs mb-2">Total Credits</h3>
            <p className="text-xl font-bold text-white">
              {safeCourses.reduce((sum, course) => sum + course.credits, 0)}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
            <h3 className="text-white/70 text-xs mb-2">Grade Points</h3>
            <p className="text-xl font-bold text-white">
              {safeCourses.reduce((sum, course) => sum + (course.credits * gradePoints[course.grade]), 0).toFixed(1)}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
            <h3 className="text-white/70 text-xs mb-2">Current GPA</h3>
            <p className={`text-xl font-bold ${getGradeColor(calculateGPA())}`}>{calculateGPA()}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
            <h3 className="text-white/70 text-xs mb-2">Grade Scale</h3>
            <p className="text-xl font-bold text-white">10-Point</p>
          </div>
        </div>
      )}

      {/* Grade Scale Reference */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">10-Point Grade Scale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(gradePoints).map(([grade, points]) => (
            <div key={grade} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
              <span className="text-white font-medium text-sm">{grade}</span>
              <span className={`font-bold text-sm ${getGradeColor(points.toString())}`}>{points}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GPACalculator
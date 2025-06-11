import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Calculator, Crown, BookOpen, TrendingUp, Target } from 'lucide-react'
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
    if (numGpa >= 9.0) return 'text-emerald-600'
    if (numGpa >= 8.0) return 'text-blue-600'
    if (numGpa >= 7.0) return 'text-yellow-600'
    if (numGpa >= 6.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const safeCourses = courses || []
  const currentGPA = calculateGPA()
  const totalCredits = safeCourses.reduce((sum, course) => sum + course.credits, 0)
  const totalPoints = safeCourses.reduce((sum, course) => sum + (course.credits * gradePoints[course.grade]), 0)

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">GPA Calculator</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Calculate your Grade Point Average with precision using the 10-point scale system. 
            Track your academic performance across all courses.
          </p>
        </div>

        {/* Current GPA Display */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current GPA</h2>
              <p className={`text-5xl font-bold mb-2 ${getGradeColor(currentGPA)}`}>{currentGPA}</p>
              <p className="text-gray-600">10-point scale</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Credits</h3>
              <p className="text-3xl font-bold text-gray-900">{totalCredits}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grade Points</h3>
              <p className="text-3xl font-bold text-gray-900">{totalPoints.toFixed(1)}</p>
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
                You're currently using the GPA calculator in guest mode. Your course data won't be saved permanently. 
                Sign up to keep your academic records and track your progress over time.
              </p>
              <button
                onClick={onSignUp}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Sign Up to Save Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Management */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Your Courses</h2>
          <button
            onClick={addCourse}
            className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Course</span>
          </button>
        </div>

        {/* Courses List */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          {safeCourses.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {safeCourses.map((course, index) => (
                <div key={course.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-1 flex items-center justify-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">{index + 1}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-5">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Course Name</label>
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                        placeholder="Enter course name"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Credits</label>
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value) || 0)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                        min="1"
                        max="6"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-gray-700 text-sm font-medium mb-2">Grade</label>
                      <select
                        value={course.grade}
                        onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                      >
                        {Object.keys(gradePoints).map(grade => (
                          <option key={grade} value={grade}>
                            {grade} ({gradePoints[grade]})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-1 flex justify-center">
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses added yet</h3>
              <p className="text-gray-600 mb-6">Add your first course to start calculating your GPA</p>
              <button
                onClick={addCourse}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Add Your First Course
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grade Scale Reference */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">10-Point Grade Scale Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Object.entries(gradePoints).map(([grade, points]) => (
            <div key={grade} className="bg-gray-50 rounded-2xl p-4 text-center">
              <div className="text-lg font-bold text-gray-900 mb-1">{grade}</div>
              <div className={`text-2xl font-bold ${getGradeColor(points.toString())}`}>{points}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      {safeCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Courses</h3>
            <p className="text-3xl font-bold text-gray-900">{safeCourses.length}</p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <TrendingUp className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Grade</h3>
            <p className="text-3xl font-bold text-gray-900">
              {safeCourses.length > 0 
                ? (safeCourses.reduce((sum, course) => sum + gradePoints[course.grade], 0) / safeCourses.length).toFixed(1)
                : '0.0'
              }
            </p>
          </div>
          
          <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">High Grades</h3>
            <p className="text-3xl font-bold text-gray-900">
              {safeCourses.filter(course => gradePoints[course.grade] >= 8.0).length}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default GPACalculator
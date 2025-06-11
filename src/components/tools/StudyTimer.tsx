import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw, Clock, Crown, Timer, BarChart3, Target } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface StudySession {
  id: string
  subject: string
  duration: number
  date: string
}

interface StudyTimerProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const StudyTimer: React.FC<StudyTimerProps> = ({ isGuest = false, onSignUp }) => {
  const [time, setTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [currentSubject, setCurrentSubject] = useState('')
  const { user } = useAuth()

  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  useEffect(() => {
    if (user) {
      loadSessions()
    }
  }, [user])

  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
      if (!isBreak) {
        if (currentSubject) {
          const newSession: StudySession = {
            id: Date.now().toString(),
            subject: currentSubject,
            duration: 25,
            date: new Date().toLocaleDateString()
          }
          setSessions(prev => [newSession, ...prev].slice(0, 10))
          if (user) {
            saveSession(newSession)
          }
        }
        setIsBreak(true)
        setTime(5 * 60) // 5 minute break
      } else {
        setIsBreak(false)
        setTime(25 * 60) // Back to 25 minutes
      }
    }
    
    return () => clearInterval(interval)
  }, [isRunning, time, isBreak, currentSubject, user])

  const loadSessions = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const saveSession = async (session: StudySession) => {
    if (!user) return

    try {
      if (isValidUUID(session.id)) {
        const { error } = await supabase
          .from('study_sessions')
          .upsert({
            id: session.id,
            user_id: user.id,
            subject: session.subject,
            duration: session.duration,
            date: session.date
          })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            subject: session.subject,
            duration: session.duration,
            date: session.date
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setSessions(prev => prev.map(s => 
            s.id === session.id 
              ? { ...s, id: data.id }
              : s
          ))
        }
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!currentSubject && !isBreak) {
      alert('Please enter a subject name before starting!')
      return
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setTime(isBreak ? 5 * 60 : 25 * 60)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsBreak(false)
    setTime(25 * 60)
  }

  const totalStudyTime = sessions.reduce((total, session) => total + session.duration, 0)
  const todaySessions = sessions.filter(s => s.date === new Date().toLocaleDateString()).length
  const weekSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sessionDate >= weekAgo
  }).length

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Study Timer</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Boost your productivity with the Pomodoro technique. Focus for 25 minutes, then take a 5-minute break. 
            Track your study sessions and build consistent habits.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
              <span className="text-gray-600 font-medium">Total Time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalStudyTime}m</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Timer className="w-6 h-6 text-blue-600" />
              <span className="text-gray-600 font-medium">Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{todaySessions}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <span className="text-gray-600 font-medium">This Week</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{weekSessions}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6 text-orange-600" />
              <span className="text-gray-600 font-medium">Sessions</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
          </div>
        </div>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8">
          <div className="flex items-start space-x-4">
            <Crown className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guest Mode - Sessions Not Saved</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                You're using the study timer in guest mode. Your study sessions won't be saved permanently. 
                Sign up to track your progress, build study streaks, and analyze your productivity patterns.
              </p>
              <button
                onClick={onSignUp}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Sign Up to Track Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Section */}
      <div className="bg-white rounded-3xl p-12 border border-gray-200 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isBreak ? 'Break Time' : 'Study Session'}
            </h2>
            <div className={`text-8xl lg:text-9xl font-bold mb-8 ${
              isBreak ? 'text-emerald-600' : 'text-purple-600'
            }`}>
              {formatTime(time)}
            </div>
            
            {!isBreak && (
              <div className="mb-8">
                <input
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  placeholder="What are you studying?"
                  className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200 text-lg text-center"
                  disabled={isRunning}
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-3"
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-3"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            
            <button
              onClick={handleStop}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-3"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-3"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sessions and Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sessions */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Sessions</h3>
          
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.subject}</p>
                      <p className="text-gray-600 text-sm">{session.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{session.duration}m</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No sessions yet. Start your first study session!</p>
            </div>
          )}
        </div>

        {/* Pomodoro Tips */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Pomodoro Tips</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm font-bold">25</span>
                </div>
                <span>Study Session</span>
              </h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Focus on one task completely</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Eliminate all distractions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Take notes if needed</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-600 text-sm font-bold">5</span>
                </div>
                <span>Break Time</span>
              </h4>
              <ul className="text-gray-600 space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Step away from your workspace</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Stretch or walk around</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Hydrate and breathe deeply</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyTimer
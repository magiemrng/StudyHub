import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, RotateCcw, Clock, Crown } from 'lucide-react'
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

  return (
    <div className="space-y-4">
      {/* Header Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Study Timer</h1>
          <p className="text-white/70 text-sm">Use the Pomodoro technique to boost productivity</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
          <p className="text-white/70 text-sm mb-1">Total Study Time</p>
          <p className="text-2xl font-bold text-white">{totalStudyTime} min</p>
        </div>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-3 md:col-span-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Guest Mode - Sessions Not Saved</h3>
                <p className="text-white/70 text-xs">Sign up to track your study sessions permanently</p>
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

      {/* Timer */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-2">
            {isBreak ? 'Break Time' : 'Study Session'}
          </h2>
          <div className={`text-4xl md:text-6xl font-bold mb-4 ${isBreak ? 'text-emerald-400' : 'text-blue-400'}`}>
            {formatTime(time)}
          </div>
          
          {!isBreak && (
            <input
              type="text"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              placeholder="What are you studying?"
              className="w-full max-w-md bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-blue-400 mb-4 text-sm"
              disabled={isRunning}
            />
          )}
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
            >
              <Play className="w-4 h-4" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center justify-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}
          
          <button
            onClick={handleStop}
            className="flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
          >
            <Square className="w-4 h-4" />
            <span>Stop</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center justify-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Recent Sessions and Tips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Sessions */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
          
          {sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium text-sm">{session.subject}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm">{session.duration} min</p>
                    <p className="text-white/60 text-xs">{session.date}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Clock className="w-8 h-8 text-white/30 mx-auto mb-2" />
              <p className="text-white/70 text-sm">No sessions yet. Start your first session!</p>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Pomodoro Tips</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Study Session (25 min)</h4>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Focus on one task</li>
                <li>• Avoid distractions</li>
                <li>• Take notes if needed</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium text-sm">Break Time (5 min)</h4>
              <ul className="text-white/70 text-xs space-y-1">
                <li>• Step away from your desk</li>
                <li>• Stretch or walk around</li>
                <li>• Hydrate and breathe</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyTimer
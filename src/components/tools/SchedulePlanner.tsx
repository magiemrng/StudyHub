import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, Bell, Crown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface Event {
  id: string
  title: string
  subject: string
  date: string
  startTime: string
  endTime: string
  location: string
  type: 'class' | 'exam' | 'assignment' | 'study'
  priority: 'low' | 'medium' | 'high'
}

interface SchedulePlannerProps {
  isGuest?: boolean
  onSignUp?: () => void
}

const SchedulePlanner: React.FC<SchedulePlannerProps> = ({ isGuest = false, onSignUp }) => {
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'class',
    priority: 'medium'
  })
  const { user } = useAuth()

  const isValidUUID = (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      
      const formattedData = data?.map(item => ({
        id: item.id,
        title: item.title,
        subject: item.subject,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        location: item.location,
        type: item.type as Event['type'],
        priority: item.priority as Event['priority']
      })) || []
      
      setEvents(formattedData)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const saveEvent = async (event: Event) => {
    if (!user) return

    try {
      if (isValidUUID(event.id)) {
        const { error } = await supabase
          .from('events')
          .upsert({
            id: event.id,
            user_id: user.id,
            title: event.title,
            subject: event.subject,
            date: event.date,
            start_time: event.startTime,
            end_time: event.endTime,
            location: event.location,
            type: event.type,
            priority: event.priority
          })

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({
            user_id: user.id,
            title: event.title,
            subject: event.subject,
            date: event.date,
            start_time: event.startTime,
            end_time: event.endTime,
            location: event.location,
            type: event.type,
            priority: event.priority
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setEvents(prev => prev.map(e => 
            e.id === event.id 
              ? { ...e, id: data.id }
              : e
          ))
        }
      }
    } catch (error) {
      console.error('Error saving event:', error)
    }
  }

  const addEvent = async () => {
    if (newEvent.title && newEvent.subject && newEvent.date) {
      const event: Event = {
        id: Date.now().toString(),
        title: newEvent.title,
        subject: newEvent.subject,
        date: newEvent.date,
        startTime: newEvent.startTime || '09:00',
        endTime: newEvent.endTime || '10:00',
        location: newEvent.location || '',
        type: newEvent.type as Event['type'] || 'class',
        priority: newEvent.priority as Event['priority'] || 'medium'
      }
      
      const updatedEvents = [...events, event].sort((a, b) => 
        new Date(a.date + ' ' + a.startTime).getTime() - new Date(b.date + ' ' + b.startTime).getTime()
      )
      setEvents(updatedEvents)
      
      if (user) {
        await saveEvent(event)
      }
      
      setNewEvent({
        title: '',
        subject: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        location: '',
        type: 'class',
        priority: 'medium'
      })
    }
  }

  const deleteEvent = async (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    
    if (user && isValidUUID(id)) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }
  }

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'class': return 'bg-blue-500'
      case 'exam': return 'bg-red-500'
      case 'assignment': return 'bg-yellow-500'
      case 'study': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: Event['priority']) => {
    switch (priority) {
      case 'high': return 'border-red-400'
      case 'medium': return 'border-yellow-400'
      case 'low': return 'border-emerald-400'
      default: return 'border-gray-400'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0]
    return dateString === today
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Schedule Planner</h1>
        <p className="text-white/70 text-sm">Organize your academic schedule and deadlines</p>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <div className="flex items-center space-x-3 md:col-span-3">
              <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div>
                <h3 className="text-white font-semibold text-sm">Guest Mode - Data Not Saved</h3>
                <p className="text-white/70 text-xs">Sign up to save your schedule permanently</p>
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

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
          <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-white/70 text-xs mb-1">Total Events</p>
          <p className="text-lg font-bold text-white">{events.length}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
          <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <p className="text-white/70 text-xs mb-1">Today's Events</p>
          <p className="text-lg font-bold text-white">
            {events.filter(e => isToday(e.date)).length}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
          <Bell className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <p className="text-white/70 text-xs mb-1">High Priority</p>
          <p className="text-lg font-bold text-white">
            {events.filter(e => e.priority === 'high').length}
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center">
          <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <p className="text-white/70 text-xs mb-1">Assignments Due</p>
          <p className="text-lg font-bold text-white">
            {events.filter(e => e.type === 'assignment' && new Date(e.date) >= new Date()).length}
          </p>
        </div>
      </div>

      {/* Add Event */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Event</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newEvent.title || ''}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="Event title"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="text"
              value={newEvent.subject || ''}
              onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
              placeholder="Subject"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="date"
              value={newEvent.date || ''}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="time"
              value={newEvent.startTime || ''}
              onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <input
              type="time"
              value={newEvent.endTime || ''}
              onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <input
              type="text"
              value={newEvent.location || ''}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              placeholder="Location"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
            />
          </div>
          
          <div>
            <select
              value={newEvent.type || 'class'}
              onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            >
              <option value="class" className="bg-gray-800">Class</option>
              <option value="exam" className="bg-gray-800">Exam</option>
              <option value="assignment" className="bg-gray-800">Assignment</option>
              <option value="study" className="bg-gray-800">Study Session</option>
            </select>
          </div>
          
          <div>
            <select
              value={newEvent.priority || 'medium'}
              onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as Event['priority']})}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
            >
              <option value="low" className="bg-gray-800">Low Priority</option>
              <option value="medium" className="bg-gray-800">Medium Priority</option>
              <option value="high" className="bg-gray-800">High Priority</option>
            </select>
          </div>
          
          <div>
            <button
              onClick={addEvent}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
        <h2 className="text-lg font-semibold text-white mb-4">All Events</h2>
        
        {events.length > 0 ? (
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className={`p-3 bg-white/5 rounded-xl border-l-4 ${getPriorityColor(event.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(event.type)}`}></div>
                        <h3 className="text-white font-medium text-sm">{event.title}</h3>
                        {isToday(event.date) && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Today</span>
                        )}
                      </div>
                      <span className="text-white/60 text-sm">{event.subject}</span>
                      <span className="text-white/60 text-sm">{formatDate(event.date)}</span>
                      <span className="text-white/60 text-sm">{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-1 text-white/60 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200 ml-4 text-lg"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70 text-sm">No events scheduled yet. Add your first event above!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchedulePlanner
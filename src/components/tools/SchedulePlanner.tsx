import React, { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, MapPin, Bell, Crown, Target, CheckCircle, AlertCircle } from 'lucide-react'
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

  const todayEvents = events.filter(e => isToday(e.date))
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).slice(0, 5)
  const highPriorityEvents = events.filter(e => e.priority === 'high').length
  const assignmentsDue = events.filter(e => e.type === 'assignment' && new Date(e.date) >= new Date()).length

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Schedule Planner</h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed">
            Organize your academic schedule, manage deadlines, and stay on top of your commitments. 
            Plan your time effectively and never miss important events.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Total Events</h3>
            <p className="text-2xl font-bold text-gray-900">{events.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Clock className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Today's Events</h3>
            <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Bell className="w-6 h-6 text-red-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">High Priority</h3>
            <p className="text-2xl font-bold text-gray-900">{highPriorityEvents}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Target className="w-6 h-6 text-purple-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Assignments Due</h3>
            <p className="text-2xl font-bold text-gray-900">{assignmentsDue}</p>
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
                You're using the schedule planner in guest mode. Your events and schedule won't be saved permanently. 
                Sign up to keep your academic calendar and never miss important deadlines.
              </p>
              <button
                onClick={onSignUp}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Sign Up to Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event */}
      <div className="bg-white rounded-3xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Event</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">Event Title</label>
            <input
              type="text"
              value={newEvent.title || ''}
              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              placeholder="Enter event title"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={newEvent.subject || ''}
              onChange={(e) => setNewEvent({...newEvent, subject: e.target.value})}
              placeholder="Subject"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
            <input
              type="date"
              value={newEvent.date || ''}
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Start Time</label>
            <input
              type="time"
              value={newEvent.startTime || ''}
              onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">End Time</label>
            <input
              type="time"
              value={newEvent.endTime || ''}
              onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={newEvent.location || ''}
              onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              placeholder="Location"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Type</label>
            <select
              value={newEvent.type || 'class'}
              onChange={(e) => setNewEvent({...newEvent, type: e.target.value as Event['type']})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            >
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="assignment">Assignment</option>
              <option value="study">Study Session</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Priority</label>
            <select
              value={newEvent.priority || 'medium'}
              onChange={(e) => setNewEvent({...newEvent, priority: e.target.value as Event['priority']})}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={addEvent}
          className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Today's Schedule</h2>
          <div className="space-y-4">
            {todayEvents.map((event) => (
              <div key={event.id} className={`p-4 bg-blue-50 rounded-2xl border-l-4 ${getPriorityColor(event.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(event.type)}`}></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-gray-600 text-sm">{event.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{event.startTime} - {event.endTime}</p>
                    {event.location && (
                      <p className="text-gray-600 text-sm flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Events */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
        </div>
        
        {events.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className={`p-6 hover:bg-gray-50 transition-colors duration-200 border-l-4 ${getPriorityColor(event.priority)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getTypeColor(event.type)}`}></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        {isToday(event.date) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">{event.subject}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">{formatDate(event.date)}</p>
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium">{event.startTime} - {event.endTime}</p>
                    </div>
                    <div>
                      {event.location && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="ml-4 w-10 h-10 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl flex items-center justify-center transition-colors duration-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events scheduled yet</h3>
            <p className="text-gray-600 mb-6">Add your first event to start organizing your schedule</p>
            <button
              onClick={() => document.querySelector('input[placeholder="Enter event title"]')?.focus()}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
            >
              Add Your First Event
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SchedulePlanner
import React from 'react'
import { Calculator, TrendingUp, Clock, BookOpen, Calendar, Target, Sparkles, Crown } from 'lucide-react'

interface DashboardHomeProps {
  setActiveTool: (tool: string) => void
  isGuest?: boolean
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ setActiveTool, isGuest = false }) => {
  const quickActions = [
    { id: 'gpa', label: 'GPA Calculator', icon: Calculator, color: 'from-emerald-500 to-teal-500' },
    { id: 'attendance', label: 'Attendance', icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
    { id: 'timer', label: 'Study Timer', icon: Clock, color: 'from-purple-500 to-pink-500' },
    { id: 'grades', label: 'Grades', icon: BookOpen, color: 'from-orange-500 to-red-500' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Welcome{isGuest ? ', Guest' : ''}!
        </h1>
        <p className="text-white/70 text-sm md:text-base">
          {isGuest 
            ? 'Try our tools and see how they help'
            : 'Your academic overview for today'
          }
        </p>
      </div>

      {/* Guest Welcome Card */}
      {isGuest && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex items-start space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Try StudyHub Free</h2>
              <p className="text-white/70 text-sm">Experience our academic tools</p>
            </div>
          </div>
          <p className="text-white/80 text-sm mb-4">
            You're in guest mode. Sign up to save your progress!
          </p>
          <div className="flex items-center space-x-2 text-emerald-400 text-sm">
            <Crown className="w-4 h-4" />
            <span>Upgrade to save data permanently</span>
          </div>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveTool(action.id)}
              className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 text-center"
            >
              <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium text-sm">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Tools */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Academic Tools</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <Calculator className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">GPA Calculator</p>
                <p className="text-white/60 text-xs">10-point scale support</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">Attendance Tracker</p>
                <p className="text-white/60 text-xs">Monitor class attendance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <Clock className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">Study Timer</p>
                <p className="text-white/60 text-xs">Pomodoro technique</p>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Tools */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Organization</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <BookOpen className="w-6 h-6 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">Grade Manager</p>
                <p className="text-white/60 text-xs">Track assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <Calendar className="w-6 h-6 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">Schedule Planner</p>
                <p className="text-white/60 text-xs">Manage deadlines</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
              <Target className="w-6 h-6 text-rose-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium text-sm">Goal Tracking</p>
                <p className="text-white/60 text-xs">Monitor progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
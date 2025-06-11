import React from 'react'
import { Calculator, TrendingUp, Clock, BookOpen, Calendar, Target, Sparkles, Crown, ArrowRight, BarChart3, Users, FileText } from 'lucide-react'

interface DashboardHomeProps {
  setActiveTool: (tool: string) => void
  isGuest?: boolean
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ setActiveTool, isGuest = false }) => {
  const quickActions = [
    { id: 'gpa', label: 'GPA Calculator', icon: Calculator, description: '10-point scale precision', color: 'bg-emerald-500' },
    { id: 'attendance', label: 'Attendance', icon: TrendingUp, description: 'Track class attendance', color: 'bg-blue-500' },
    { id: 'timer', label: 'Study Timer', icon: Clock, description: 'Pomodoro technique', color: 'bg-purple-500' },
    { id: 'grades', label: 'Grades', icon: BookOpen, description: 'Assignment tracking', color: 'bg-orange-500' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, description: 'Plan deadlines', color: 'bg-indigo-500' },
    { id: 'resumes', label: 'Resumes', icon: FileText, description: 'Store documents', color: 'bg-rose-500' },
  ]

  const stats = [
    { label: 'Tools Available', value: '6', icon: Target, color: 'text-emerald-600' },
    { label: 'Active Sessions', value: '2', icon: BarChart3, color: 'text-blue-600' },
    { label: 'Study Hours', value: '24', icon: Clock, color: 'text-purple-600' },
    { label: 'Achievements', value: '8', icon: Crown, color: 'text-yellow-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Welcome{isGuest ? ', Guest' : ''}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            {isGuest 
              ? 'Experience our comprehensive academic tools and see how they can transform your studies.'
              : 'Your academic command center. Track progress, manage tasks, and achieve your goals.'
            }
          </p>
        </div>

        {/* Guest Welcome Card */}
        {isGuest && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Try StudyHub Free</h2>
                <p className="text-gray-700 text-lg">Experience our academic tools without any commitment</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              You're currently in guest mode. All features are available to try, but your data won't be saved permanently. 
              Sign up to keep your progress and unlock the full potential of StudyHub.
            </p>
            <div className="flex items-center space-x-3 text-emerald-700">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Upgrade to save data permanently and access premium features</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
              <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Academic Tools</h2>
          <p className="text-gray-600">Choose a tool to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveTool(action.id)}
              className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{action.label}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                <span className="text-sm font-medium">Open tool</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Academic Excellence */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Academic Excellence</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Precise GPA Calculation</p>
                <p className="text-gray-600 text-sm">10-point scale support with accurate grade tracking</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Attendance Monitoring</p>
                <p className="text-gray-600 text-sm">Track class attendance and meet requirements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Grade Management</p>
                <p className="text-gray-600 text-sm">Comprehensive assignment and project tracking</p>
              </div>
            </div>
          </div>
        </div>

        {/* Productivity Tools */}
        <div className="bg-white rounded-3xl p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Productivity & Organization</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Study Timer</p>
                <p className="text-gray-600 text-sm">Pomodoro technique for focused study sessions</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Schedule Planning</p>
                <p className="text-gray-600 text-sm">Organize deadlines and academic calendar</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-gray-900 mb-1">Document Storage</p>
                <p className="text-gray-600 text-sm">Secure resume and document management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 lg:p-12 text-white">
        <div className="max-w-3xl">
          <h3 className="text-3xl font-bold mb-4">Ready to Excel?</h3>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Start with any tool that matches your current needs. Each tool is designed to work independently 
            while contributing to your overall academic success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setActiveTool('gpa')}
              className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Calculator className="w-5 h-5" />
              <span>Calculate GPA</span>
            </button>
            <button
              onClick={() => setActiveTool('timer')}
              className="border border-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:border-gray-500 hover:bg-gray-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Clock className="w-5 h-5" />
              <span>Start Study Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
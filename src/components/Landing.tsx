import React, { useState } from 'react'
import { Calculator, Calendar, Clock, TrendingUp, BookOpen, Target, ArrowRight, Sparkles, Menu, X } from 'lucide-react'

interface LandingProps {
  onEnterApp: () => void
  onTryFree: () => void
  onSignIn: () => void
  onSignUp: () => void
  onViewOffers: () => void
}

const Landing: React.FC<LandingProps> = ({ onEnterApp, onTryFree, onSignIn, onSignUp, onViewOffers }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: Calculator,
      title: 'GPA Calculator',
      description: 'Calculate your GPA with 10-point scale precision.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: TrendingUp,
      title: 'Attendance Tracker',
      description: 'Monitor attendance percentage easily.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Study Timer',
      description: 'Boost productivity with Pomodoro technique.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Grade Manager',
      description: 'Track assignments and performance.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Calendar,
      title: 'Schedule Planner',
      description: 'Plan academic schedule effectively.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Target,
      title: 'Goal Tracker',
      description: 'Set and monitor academic goals.',
      color: 'from-rose-500 to-pink-500'
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">StudyHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onViewOffers}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Offers
            </button>
            <button
              onClick={onTryFree}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Try Free
            </button>
            <button
              onClick={onSignIn}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Sign In
            </button>
            <button
              onClick={onSignUp}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onViewOffers()
                  setMobileMenuOpen(false)
                }}
                className="text-white/80 hover:text-white transition-colors text-left py-2 text-sm"
              >
                Offers
              </button>
              <button
                onClick={() => {
                  onTryFree()
                  setMobileMenuOpen(false)
                }}
                className="text-white/80 hover:text-white transition-colors text-left py-2 text-sm"
              >
                Try Free
              </button>
              <button
                onClick={() => {
                  onSignIn()
                  setMobileMenuOpen(false)
                }}
                className="text-white/80 hover:text-white transition-colors text-left py-2 text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onSignUp()
                  setMobileMenuOpen(false)
                }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2 rounded-lg text-sm col-span-2"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span className="text-white/90 text-xs">10-point GPA scale support</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Your Academic
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Success Hub
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-white/80 mb-6 max-w-3xl mx-auto leading-relaxed">
            Comprehensive tools for modern students. Calculate grades, track attendance, 
            manage schedules, and excel in your academic journey.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-8">
            <button
              onClick={onEnterApp}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300"
            >
              Start Journey
            </button>
            <button
              onClick={onTryFree}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 border border-white/20"
            >
              Try Free
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mt-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
            Tools for Students
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-3`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center mt-8">
        <p className="text-white/60 text-sm">Built for students.</p>
      </footer>
    </div>
  )
}

export default Landing
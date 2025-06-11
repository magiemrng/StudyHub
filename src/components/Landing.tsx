import React, { useState } from 'react'
import { Calculator, Calendar, Clock, TrendingUp, BookOpen, Target, ArrowRight, Sparkles, Menu, X, CheckCircle, Users, Star } from 'lucide-react'

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
      description: 'Calculate your GPA with 10-point scale precision and track academic performance.',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      icon: TrendingUp,
      title: 'Attendance Tracker',
      description: 'Monitor attendance percentage and ensure you meet requirements.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Study Timer',
      description: 'Boost productivity with Pomodoro technique and focused study sessions.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Grade Manager',
      description: 'Track assignments, projects, and performance across all subjects.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Calendar,
      title: 'Schedule Planner',
      description: 'Plan academic schedule and manage deadlines effectively.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Target,
      title: 'Goal Tracker',
      description: 'Set and monitor academic goals with progress tracking.',
      color: 'from-rose-500 to-pink-500'
    }
  ]

  const benefits = [
    'Comprehensive academic tracking',
    'Real-time progress monitoring',
    'Intuitive user interface',
    'Cross-platform compatibility',
    'Secure data storage',
    'Export capabilities'
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      content: 'StudyHub transformed how I manage my academics. The GPA calculator is incredibly accurate.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Engineering Student',
      content: 'The study timer helped me improve my focus. I\'ve increased my productivity by 40%.',
      rating: 5
    },
    {
      name: 'Emma Thompson',
      role: 'Business Student',
      content: 'Perfect for tracking attendance and grades. Clean interface, powerful features.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-black font-semibold text-lg tracking-tight">StudyHub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={onViewOffers}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
              >
                Offers
              </button>
              <button
                onClick={onTryFree}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
              >
                Try Free
              </button>
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={onSignUp}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="space-y-4">
                <button
                  onClick={() => {
                    onViewOffers()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left text-gray-600 hover:text-black transition-colors py-2 text-sm font-medium"
                >
                  Offers
                </button>
                <button
                  onClick={() => {
                    onTryFree()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left text-gray-600 hover:text-black transition-colors py-2 text-sm font-medium"
                >
                  Try Free
                </button>
                <button
                  onClick={() => {
                    onSignIn()
                    setMobileMenuOpen(false)
                  }}
                  className="block w-full text-left text-gray-600 hover:text-black transition-colors py-2 text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onSignUp()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full bg-black text-white px-6 py-3 rounded-lg text-sm font-medium"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-gray-700 text-sm font-medium">10-point GPA scale support</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight tracking-tight">
              Your Academic
              <br />
              Success Hub
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools for modern students. Calculate grades, track attendance, 
              manage schedules, and excel in your academic journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <button
                onClick={onEnterApp}
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onTryFree}
                className="border border-gray-300 hover:border-gray-400 text-black px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200"
              >
                Try Free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Tools for Students
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed academically, designed with simplicity and effectiveness in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Why Choose StudyHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Built specifically for students who want to take control of their academic journey 
                with professional-grade tools and intuitive design.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Precise Calculations</h4>
                    <p className="text-gray-600 text-sm">10-point GPA scale with accurate results</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Progress Tracking</h4>
                    <p className="text-gray-600 text-sm">Monitor your academic performance over time</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">Student Community</h4>
                    <p className="text-gray-600 text-sm">Connect and collaborate with fellow students</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Trusted by Students
            </h2>
            <p className="text-lg text-gray-600">
              See what students are saying about StudyHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-black">{testimonial.name}</p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who've improved their academic performance with StudyHub's 
            comprehensive suite of tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={onSignUp}
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onTryFree}
              className="border border-gray-300 hover:border-gray-400 text-black px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200"
            >
              Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-black font-semibold text-lg">StudyHub</span>
            </div>
            <p className="text-gray-600 text-sm">Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
import React, { useState, useEffect, useRef } from 'react'
import { Calculator, Calendar, Clock, TrendingUp, BookOpen, Target, ArrowRight, Sparkles, Menu, X, CheckCircle, Users, Star, MousePointer, Zap, Shield, Award } from 'lucide-react'

interface LandingProps {
  onEnterApp: () => void
  onTryFree: () => void
  onSignIn: () => void
  onSignUp: () => void
  onViewOffers: () => void
}

const Landing: React.FC<LandingProps> = ({ onEnterApp, onTryFree, onSignIn, onSignUp, onViewOffers }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  // Mouse tracking for custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Parallax effect for hero section only
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.pageYOffset
        const rate = scrolled * -0.3 // Reduced parallax effect
        heroRef.current.style.transform = `translateY(${rate}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: Calculator,
      title: 'GPA Calculator',
      description: 'Calculate your GPA with 10-point scale precision and track academic performance.',
      color: 'from-emerald-500 to-teal-500',
      delay: '0ms'
    },
    {
      icon: TrendingUp,
      title: 'Attendance Tracker',
      description: 'Monitor attendance percentage and ensure you meet requirements.',
      color: 'from-blue-500 to-cyan-500',
      delay: '100ms'
    },
    {
      icon: Clock,
      title: 'Study Timer',
      description: 'Boost productivity with Pomodoro technique and focused study sessions.',
      color: 'from-purple-500 to-pink-500',
      delay: '200ms'
    },
    {
      icon: BookOpen,
      title: 'Grade Manager',
      description: 'Track assignments, projects, and performance across all subjects.',
      color: 'from-orange-500 to-red-500',
      delay: '300ms'
    },
    {
      icon: Calendar,
      title: 'Schedule Planner',
      description: 'Plan academic schedule and manage deadlines effectively.',
      color: 'from-indigo-500 to-purple-500',
      delay: '400ms'
    },
    {
      icon: Target,
      title: 'Goal Tracker',
      description: 'Set and monitor academic goals with progress tracking.',
      color: 'from-rose-500 to-pink-500',
      delay: '500ms'
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
      rating: 5,
      avatar: 'SC'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Engineering Student',
      content: 'The study timer helped me improve my focus. I\'ve increased my productivity by 40%.',
      rating: 5,
      avatar: 'MR'
    },
    {
      name: 'Emma Thompson',
      role: 'Business Student',
      content: 'Perfect for tracking attendance and grades. Clean interface, powerful features.',
      rating: 5,
      avatar: 'ET'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Active Students', icon: Users },
    { number: '50K+', label: 'Study Sessions', icon: Clock },
    { number: '98%', label: 'Satisfaction Rate', icon: Star },
    { number: '24/7', label: 'Support', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-white relative">
      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 transition-all duration-200 ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{
          transform: `translate(${mousePosition.x - 16}px, ${mousePosition.y - 16}px)`,
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          <defs>
            <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M4 4L28 16L16 18L14 28L4 4Z"
            fill="url(#cursorGradient)"
            className="animate-pulse"
          />
          <path
            d="M4 4L28 16L16 18L14 28L4 4Z"
            stroke="white"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-black font-semibold text-lg tracking-tight">StudyHub</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={onViewOffers}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Offers
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={onTryFree}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Try Free
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={onSignIn}
                className="text-gray-600 hover:text-black transition-colors text-sm font-medium relative group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Sign In
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={onSignUp}
                className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-6 py-2 rounded-lg transition-all duration-300 text-sm font-medium transform hover:scale-105 hover:shadow-lg"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-black transition-colors"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 animate-slideDown">
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
                  className="w-full bg-black text-white px-6 py-3 rounded-lg text-sm font-medium transform hover:scale-105 transition-transform duration-300"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/5 to-yellow-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30"></div>
            </div>
          ))}
        </div>

        <div ref={heroRef} className="relative z-10 pt-20 pb-32 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-6 py-3 mb-8 animate-fadeInUp">
                <Sparkles className="w-4 h-4 text-gray-600" />
                <span className="text-gray-700 text-sm font-medium">10-point GPA scale support</span>
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-black mb-8 leading-tight tracking-tight animate-fadeInUp" style={{ animationDelay: '200ms' }}>
                Your Academic
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Success Hub
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '400ms' }}>
                Comprehensive tools for modern students. Calculate grades, track attendance, 
                manage schedules, and excel in your academic journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: '600ms' }}>
                <button
                  onClick={onEnterApp}
                  className="group bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105 hover:shadow-2xl"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <span>Start Journey</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button
                  onClick={onTryFree}
                  className="border-2 border-gray-300 hover:border-gray-400 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  Try Free
                </button>
              </div>
            </div>
          </div>

          {/* Floating 3D Cards */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-10 transform rotate-12 animate-float3d">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute top-1/3 right-10 transform -rotate-12 animate-float3d" style={{ animationDelay: '1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/4 transform rotate-6 animate-float3d" style={{ animationDelay: '2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 py-20 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-20 py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 animate-fadeInUp">
              Tools for Students
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              Everything you need to succeed academically, designed with simplicity and effectiveness in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl animate-fadeInUp"
                style={{ animationDelay: feature.delay }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-black mb-4 group-hover:text-gray-800 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-20 py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-fadeInUp">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
                Why Choose StudyHub?
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Built specifically for students who want to take control of their academic journey 
                with professional-grade tools and intuitive design.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 group animate-fadeInUp" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium group-hover:text-black transition-colors duration-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative animate-fadeInUp" style={{ animationDelay: '400ms' }}>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-200 shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="space-y-8">
                  <div className="flex items-center space-x-4 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black text-lg">Precise Calculations</h4>
                      <p className="text-gray-600">10-point GPA scale with accurate results</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black text-lg">Progress Tracking</h4>
                      <p className="text-gray-600">Monitor your academic performance over time</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black text-lg">Student Community</h4>
                      <p className="text-gray-600">Connect and collaborate with fellow students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-20 py-24 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 animate-fadeInUp">
              Trusted by Students
            </h2>
            <p className="text-xl text-gray-600 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
              See what students are saying about StudyHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-500 animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed text-lg">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-black">{testimonial.name}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 py-24 px-6 lg:px-8 bg-gradient-to-br from-black to-gray-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/30 to-cyan-600/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-fadeInUp">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Join thousands of students who've improved their academic performance with StudyHub's 
            comprehensive suite of tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-md mx-auto animate-fadeInUp" style={{ animationDelay: '400ms' }}>
            <button
              onClick={onSignUp}
              className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-105 hover:shadow-2xl"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              onClick={onTryFree}
              className="border-2 border-white/30 hover:border-white/50 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              Try Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 border-t border-gray-200 py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-black to-gray-800 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-black font-semibold text-xl">StudyHub</span>
            </div>
            <p className="text-gray-600">Built for students, by students.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float3d {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          33% {
            transform: translateY(-10px) rotateX(10deg) rotateY(5deg);
          }
          66% {
            transform: translateY(-5px) rotateX(-5deg) rotateY(-10deg);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float3d {
          animation: float3d 4s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .cursor-none {
          cursor: none;
        }
      `}</style>
    </div>
  )
}

export default Landing
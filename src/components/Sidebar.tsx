import React, { useState } from 'react'
import { 
  Home, 
  Calculator, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Calendar,
  ArrowLeft,
  Sparkles,
  Crown,
  MessageCircle,
  Tag,
  Menu,
  X,
  FileText,
  Settings
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  activeTool: string
  setActiveTool: (tool: any) => void
  onBackToLanding: () => void
  onOpenChat: () => void
  onViewOffers: () => void
  onViewAdminOffers?: () => void
  isGuest?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  setActiveTool, 
  onBackToLanding, 
  onOpenChat,
  onViewOffers,
  onViewAdminOffers,
  isGuest = false 
}) => {
  const { signOut, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'gpa', label: 'GPA Calculator', icon: Calculator },
    { id: 'attendance', label: 'Attendance', icon: TrendingUp },
    { id: 'timer', label: 'Study Timer', icon: Clock },
    { id: 'grades', label: 'Grade Manager', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'resumes', label: 'Resume Storage', icon: FileText },
  ]

  const handleSignOut = async () => {
    await signOut()
    onBackToLanding()
  }

  const handleMenuItemClick = (toolId: string) => {
    setActiveTool(toolId)
    setMobileMenuOpen(false)
  }

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-black font-semibold text-xl tracking-tight">StudyHub</span>
        </div>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="mx-6 mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Crown className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800 font-semibold text-sm">Guest Mode</span>
          </div>
          <p className="text-amber-700 text-xs leading-relaxed">
            Sign up to save your data permanently and unlock all features.
          </p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 text-left group ${
              activeTool === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`w-5 h-5 ${
              activeTool === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
            }`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}

        {/* Chat Button - Only for authenticated users */}
        {user && (
          <button
            onClick={() => {
              onOpenChat()
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-left group"
          >
            <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Chat</span>
          </button>
        )}

        {/* Offers Button */}
        <button
          onClick={() => {
            onViewOffers()
            setMobileMenuOpen(false)
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-left group"
        >
          <Tag className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="font-medium">Offers</span>
        </button>

        {/* Admin Offers Button - Only for authenticated users */}
        {user && onViewAdminOffers && (
          <button
            onClick={() => {
              onViewAdminOffers()
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-left group"
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Admin Offers</span>
          </button>
        )}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 border-t border-gray-200 space-y-4">
        {user && (
          <div className="px-4 py-3 bg-gray-50 rounded-2xl">
            <p className="text-gray-900 font-medium text-sm truncate">{user.email}</p>
            <p className="text-gray-500 text-xs">Authenticated User</p>
          </div>
        )}
        
        {user ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-left group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onBackToLanding}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 text-left group"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Back to Home</span>
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 bg-white border border-gray-200 rounded-2xl p-3 text-gray-600 shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 h-screen sticky top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar
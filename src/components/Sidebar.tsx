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
  FileText
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  activeTool: string
  setActiveTool: (tool: any) => void
  onBackToLanding: () => void
  onOpenChat: () => void
  onViewOffers: () => void
  isGuest?: boolean
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTool, 
  setActiveTool, 
  onBackToLanding, 
  onOpenChat,
  onViewOffers,
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
    <>
      {/* Logo */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-white font-bold text-lg">StudyHub</span>
      </div>

      {/* Guest Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-medium text-xs">Guest Mode</span>
          </div>
          <p className="text-white/80 text-xs">
            Sign up to save your data!
          </p>
        </div>
      )}

      {/* Navigation Grid */}
      <nav className="grid grid-cols-1 gap-2 flex-1 mb-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`flex items-center space-x-3 px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
              activeTool === item.id
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-white'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
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
            className="flex items-center space-x-3 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
          >
            <MessageCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Chat</span>
          </button>
        )}

        {/* Offers Button */}
        <button
          onClick={() => {
            onViewOffers()
            setMobileMenuOpen(false)
          }}
          className="flex items-center space-x-3 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
        >
          <Tag className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Offers</span>
        </button>
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-white/10">
        {user && (
          <div className="px-3 py-2">
            <p className="text-white/60 text-xs truncate">{user.email}</p>
          </div>
        )}
        
        {user ? (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Sign Out</span>
          </button>
        ) : (
          <button
            onClick={onBackToLanding}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Back to Home</span>
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2 text-white"
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
      <div className="hidden lg:flex w-64 bg-white/5 backdrop-blur-md border-r border-white/10 p-4 flex-col">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20 p-4 flex flex-col z-50 transform transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  )
}

export default Sidebar
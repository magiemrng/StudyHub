import React, { useState } from 'react'
import Sidebar from './Sidebar'
import DashboardHome from './DashboardHome'
import GPACalculator from './tools/GPACalculator'
import AttendanceTracker from './tools/AttendanceTracker'
import StudyTimer from './tools/StudyTimer'
import GradeManager from './tools/GradeManager'
import SchedulePlanner from './tools/SchedulePlanner'
import ResumeStorage from './ResumeStorage'
import UserChatModal from './Chat/UserChatModal'

interface DashboardProps {
  onBackToLanding: () => void
  onViewOffers: () => void
  onViewAdminOffers?: () => void
  isGuest?: boolean
  onGuestToolUse?: () => void
  onSignUp?: () => void
}

type ActiveTool = 'home' | 'gpa' | 'attendance' | 'timer' | 'grades' | 'schedule' | 'resumes'

const Dashboard: React.FC<DashboardProps> = ({ 
  onBackToLanding, 
  onViewOffers,
  onViewAdminOffers,
  isGuest = false, 
  onGuestToolUse,
  onSignUp 
}) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('home')
  const [chatModalOpen, setChatModalOpen] = useState(false)

  const handleToolChange = (tool: ActiveTool) => {
    setActiveTool(tool)
    if (isGuest && onGuestToolUse) {
      onGuestToolUse()
    }
  }

  const renderActiveTool = () => {
    const commonProps = { isGuest, onSignUp }
    
    switch (activeTool) {
      case 'home':
        return <DashboardHome setActiveTool={handleToolChange} isGuest={isGuest} />
      case 'gpa':
        return <GPACalculator {...commonProps} />
      case 'attendance':
        return <AttendanceTracker {...commonProps} />
      case 'timer':
        return <StudyTimer {...commonProps} />
      case 'grades':
        return <GradeManager {...commonProps} />
      case 'schedule':
        return <SchedulePlanner {...commonProps} />
      case 'resumes':
        return <ResumeStorage {...commonProps} />
      default:
        return <DashboardHome setActiveTool={handleToolChange} isGuest={isGuest} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTool={activeTool} 
        setActiveTool={handleToolChange}
        onBackToLanding={onBackToLanding}
        onOpenChat={() => setChatModalOpen(true)}
        onViewOffers={onViewOffers}
        onViewAdminOffers={onViewAdminOffers}
        isGuest={isGuest}
      />
      <main className="flex-1 lg:ml-0 ml-0">
        <div className="lg:hidden h-16"></div> {/* Spacer for mobile menu button */}
        <div className="p-8 lg:p-12">
          {renderActiveTool()}
        </div>
      </main>

      <UserChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  )
}

export default Dashboard
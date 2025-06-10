import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import OffersPage from './components/OffersPage'
import AuthModal from './components/Auth/AuthModal'
import NewsletterModal from './components/NewsletterModal'

function AppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'guest' | 'offers'>('landing')
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  })
  const [newsletterModal, setNewsletterModal] = useState(false)
  const [guestUsageCount, setGuestUsageCount] = useState(0)

  const { user, loading } = useAuth()

  useEffect(() => {
    if (user) {
      setCurrentView('dashboard')
    }
  }, [user])

  useEffect(() => {
    // Show newsletter modal after 3 guest tool uses
    if (guestUsageCount >= 3 && !user) {
      setNewsletterModal(true)
      setGuestUsageCount(0) // Reset counter
    }
  }, [guestUsageCount, user])

  const handleGuestToolUse = () => {
    setGuestUsageCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <Landing 
            onEnterApp={() => setCurrentView('dashboard')}
            onTryFree={() => setCurrentView('guest')}
            onSignIn={() => setAuthModal({ isOpen: true, mode: 'signin' })}
            onSignUp={() => setAuthModal({ isOpen: true, mode: 'signup' })}
            onViewOffers={() => setCurrentView('offers')}
          />
        )
      case 'offers':
        return (
          <OffersPage
            onSignUp={() => setAuthModal({ isOpen: true, mode: 'signup' })}
            onBackToLanding={() => setCurrentView('landing')}
          />
        )
      case 'dashboard':
      case 'guest':
        return (
          <Dashboard 
            onBackToLanding={() => setCurrentView('landing')}
            onViewOffers={() => setCurrentView('offers')}
            isGuest={!user}
            onGuestToolUse={handleGuestToolUse}
            onSignUp={() => setAuthModal({ isOpen: true, mode: 'signup' })}
          />
        )
      default:
        return (
          <Landing 
            onEnterApp={() => setCurrentView('dashboard')}
            onTryFree={() => setCurrentView('guest')}
            onSignIn={() => setAuthModal({ isOpen: true, mode: 'signin' })}
            onSignUp={() => setAuthModal({ isOpen: true, mode: 'signup' })}
            onViewOffers={() => setCurrentView('offers')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {renderCurrentView()}

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
        onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
      />

      <NewsletterModal
        isOpen={newsletterModal}
        onClose={() => setNewsletterModal(false)}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
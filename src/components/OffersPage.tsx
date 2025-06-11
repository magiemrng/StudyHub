import React, { useState, useEffect } from 'react'
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Shield, 
  Users, 
  BookOpen, 
  TrendingUp,
  Clock,
  Calendar,
  Calculator,
  Target,
  ArrowRight,
  Sparkles,
  X,
  ExternalLink,
  Tag,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Settings,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface StudentOffer {
  id: string
  title: string
  description: string
  image_url: string
  offer_link: string
  price?: string
  discount_percentage: number
  category: string
  is_active: boolean
  expires_at?: string
  created_by: string
  created_at: string
}

interface OffersPageProps {
  onSignUp: () => void
  onBackToLanding: () => void
  onViewAdminOffers?: () => void
}

const OffersPage: React.FC<OffersPageProps> = ({ onSignUp, onBackToLanding, onViewAdminOffers }) => {
  const [offers, setOffers] = useState<StudentOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { user, signOut } = useAuth()

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'software', name: 'Software' },
    { id: 'books', name: 'Books' },
    { id: 'courses', name: 'Courses' },
    { id: 'hardware', name: 'Hardware' },
    { id: 'subscriptions', name: 'Subscriptions' },
    { id: 'general', name: 'General' }
  ]

  useEffect(() => {
    loadOffers()
  }, [])

  const loadOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('student_offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOffers(data || [])
    } catch (error) {
      console.error('Error loading offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    onBackToLanding()
  }

  const safeOffers = offers || []
  const filteredOffers = selectedCategory === 'all' 
    ? safeOffers 
    : safeOffers.filter(offer => offer.category === selectedCategory)

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBackToLanding}
              className="flex items-center space-x-3 text-black hover:text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">StudyHub</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Admin Offers Button - Only for authenticated users */}
                  {onViewAdminOffers && (
                    <button
                      onClick={onViewAdminOffers}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </button>
                  )}
                  
                  {/* User Menu */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-xl">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700 text-sm font-medium truncate max-w-32">
                        {user.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={onSignUp}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                >
                  Sign Up Free
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
            <Crown className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 text-sm font-medium">Exclusive Student Discounts</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight tracking-tight">
            Student Offers
            <br />
            & Discounts
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing discounts on software, books, courses, and tools that help you succeed academically. 
            All offers are curated specifically for students.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Student Offers */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-12">
            Current Student Offers
          </h2>
          
          {loading ? (
            <div className="text-center py-16">
              <div className="text-gray-500 text-lg">Loading offers...</div>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                  {/* Offer Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={offer.image_url}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400'
                      }}
                    />
                    {offer.discount_percentage > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{offer.discount_percentage}%
                      </div>
                    )}
                    {isExpired(offer.expires_at) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-bold">EXPIRED</span>
                      </div>
                    )}
                  </div>

                  {/* Offer Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-sm font-medium capitalize bg-gray-100 px-3 py-1 rounded-full">
                        {offer.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-black mb-3">{offer.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3">{offer.description}</p>
                    
                    {offer.price && (
                      <div className="mb-4">
                        <span className="text-2xl font-bold text-black">{offer.price}</span>
                      </div>
                    )}

                    {offer.expires_at && !isExpired(offer.expires_at) && (
                      <div className="mb-4 text-orange-600 text-sm flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Expires: {new Date(offer.expires_at).toLocaleDateString()}
                      </div>
                    )}

                    <a
                      href={offer.offer_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${
                        isExpired(offer.expires_at)
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800 text-white'
                      }`}
                      onClick={(e) => isExpired(offer.expires_at) && e.preventDefault()}
                    >
                      <span>{isExpired(offer.expires_at) ? 'Expired' : 'Get Offer'}</span>
                      {!isExpired(offer.expires_at) && <ExternalLink className="w-4 h-4" />}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-black mb-2">No offers available</h3>
              <p className="text-gray-600 text-sm">Check back later for new deals!</p>
            </div>
          )}
        </div>

        {/* About StudyHub */}
        <div className="mb-20">
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
                Why StudyHub?
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                StudyHub is completely free for all students. We believe in making academic tools accessible to everyone, 
                without any subscription fees or hidden costs.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Academic Tools</h3>
                  <p className="text-gray-600 text-sm">GPA calculator, attendance tracker, study timer, and more</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Student Community</h3>
                  <p className="text-gray-600 text-sm">Connect with fellow students and share study resources</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-2">Exclusive Offers</h3>
                  <p className="text-gray-600 text-sm">Curated discounts and deals specifically for students</p>
                </div>
              </div>
              
              {!user && (
                <button
                  onClick={onSignUp}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who use StudyHub's free academic tools and discover exclusive offers 
            to help you succeed in your educational journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            {!user ? (
              <>
                <button
                  onClick={onSignUp}
                  className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onBackToLanding}
                  className="border border-gray-300 hover:border-gray-400 text-black px-8 py-4 rounded-xl font-semibold transition-all duration-200"
                >
                  Learn More
                </button>
              </>
            ) : (
              <button
                onClick={onBackToLanding}
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OffersPage
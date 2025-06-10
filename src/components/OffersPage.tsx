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
  Image as ImageIcon
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
}

const OffersPage: React.FC<OffersPageProps> = ({ onSignUp, onBackToLanding }) => {
  const [offers, setOffers] = useState<StudentOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState<StudentOffer | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { user } = useAuth()

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    image_url: '',
    offer_link: '',
    price: '',
    discount_percentage: 0,
    category: 'general',
    expires_at: ''
  })

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

  const saveOffer = async () => {
    if (!user || !newOffer.title || !newOffer.description || !newOffer.image_url || !newOffer.offer_link) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const offerData = {
        ...newOffer,
        created_by: user.id,
        discount_percentage: Number(newOffer.discount_percentage),
        expires_at: newOffer.expires_at || null
      }

      if (editingOffer) {
        const { error } = await supabase
          .from('student_offers')
          .update(offerData)
          .eq('id', editingOffer.id)
          .eq('created_by', user.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('student_offers')
          .insert(offerData)

        if (error) throw error
      }

      setNewOffer({
        title: '',
        description: '',
        image_url: '',
        offer_link: '',
        price: '',
        discount_percentage: 0,
        category: 'general',
        expires_at: ''
      })
      setShowAddForm(false)
      setEditingOffer(null)
      loadOffers()
    } catch (error) {
      console.error('Error saving offer:', error)
      alert('Error saving offer. Please try again.')
    }
  }

  const deleteOffer = async (offerId: string) => {
    if (!user || !confirm('Are you sure you want to delete this offer?')) return

    try {
      const { error } = await supabase
        .from('student_offers')
        .delete()
        .eq('id', offerId)
        .eq('created_by', user.id)

      if (error) throw error
      loadOffers()
    } catch (error) {
      console.error('Error deleting offer:', error)
    }
  }

  const startEdit = (offer: StudentOffer) => {
    setEditingOffer(offer)
    setNewOffer({
      title: offer.title,
      description: offer.description,
      image_url: offer.image_url,
      offer_link: offer.offer_link,
      price: offer.price || '',
      discount_percentage: offer.discount_percentage,
      category: offer.category,
      expires_at: offer.expires_at ? offer.expires_at.split('T')[0] : ''
    })
    setShowAddForm(true)
  }

  const safeOffers = offers || []
  const filteredOffers = selectedCategory === 'all' 
    ? safeOffers 
    : safeOffers.filter(offer => offer.category === selectedCategory)

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying StudyHub',
      features: [
        'Basic GPA Calculator',
        'Simple Attendance Tracker',
        'Study Timer (25min sessions)',
        'Limited data storage',
        'Community support'
      ],
      limitations: [
        'Data not saved permanently',
        'Limited to 5 courses',
        'Basic features only'
      ],
      buttonText: 'Try Free',
      buttonAction: 'free',
      popular: false,
      color: 'from-gray-500 to-gray-600'
    },
    {
      name: 'Student Pro',
      price: '$4.99',
      period: 'per month',
      description: 'Everything you need for academic success',
      features: [
        'Advanced GPA Calculator',
        'Comprehensive Attendance Tracking',
        'Unlimited Study Timer sessions',
        'Grade Manager with calculations',
        'Schedule Planner with calendar',
        'User Chat & Study Groups',
        'Unlimited data storage',
        'Export reports (PDF/Excel)',
        'Priority email support',
        'Mobile app access'
      ],
      limitations: [],
      buttonText: 'Start Pro Trial',
      buttonAction: 'pro',
      popular: true,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Student Premium',
      price: '$9.99',
      period: 'per month',
      description: 'For serious students who want it all',
      features: [
        'Everything in Student Pro',
        'Advanced Analytics & Insights',
        'Goal Setting & Achievement Tracking',
        'Study Group Collaboration',
        'Custom Study Plans',
        'Integration with LMS platforms',
        'Offline mode',
        'Advanced study networking',
        '24/7 priority support',
        'Early access to new features'
      ],
      limitations: [],
      buttonText: 'Go Premium',
      buttonAction: 'premium',
      popular: false,
      color: 'from-purple-500 to-pink-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="p-4">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <button
            onClick={onBackToLanding}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">StudyHub</span>
          </button>
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Offer</span>
              </button>
            )}
            <button
              onClick={onSignUp}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 text-sm"
            >
              Sign Up
            </button>
          </div>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-white/90 text-xs">Special Student Offers</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Exclusive Deals
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              For Students
            </span>
          </h1>
          
          <p className="text-base text-white/80 mb-6 max-w-2xl mx-auto">
            Discover amazing discounts on software, books, courses, and tools.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Student Offers */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
            Current Student Offers
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-lg">Loading offers...</div>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                  {/* Offer Image */}
                  <div className="relative h-32 overflow-hidden">
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
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
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
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-emerald-400 text-xs font-medium capitalize">
                        {offer.category}
                      </span>
                      {user && user.id === offer.created_by && (
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => startEdit(offer)}
                            className="p-1 text-white/60 hover:text-white transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteOffer(offer.id)}
                            className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-base font-semibold text-white mb-2">{offer.title}</h3>
                    <p className="text-white/70 text-xs mb-3 line-clamp-2">{offer.description}</p>
                    
                    {offer.price && (
                      <div className="mb-3">
                        <span className="text-emerald-400 font-bold">{offer.price}</span>
                      </div>
                    )}

                    {offer.expires_at && !isExpired(offer.expires_at) && (
                      <div className="mb-3 text-yellow-400 text-xs">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Expires: {new Date(offer.expires_at).toLocaleDateString()}
                      </div>
                    )}

                    <a
                      href={offer.offer_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                        isExpired(offer.expires_at)
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                      }`}
                      onClick={(e) => isExpired(offer.expires_at) && e.preventDefault()}
                    >
                      <span>{isExpired(offer.expires_at) ? 'Expired' : 'Get Offer'}</span>
                      {!isExpired(offer.expires_at) && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Tag className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-white/70 text-lg mb-2">No offers available</h3>
              <p className="text-white/50 text-sm">Check back later for new deals!</p>
            </div>
          )}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <h2 className="lg:col-span-3 text-2xl md:text-3xl font-bold text-white text-center mb-6">
            StudyHub Pricing Plans
          </h2>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 ${
                plan.popular ? 'ring-2 ring-emerald-400 scale-105' : ''
              } hover:bg-white/15 transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-white/70 mb-3 text-xs">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/70 ml-1 text-xs">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.features.slice(0, 5).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-2">
                    <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="text-white/90 text-xs">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, limitIndex) => (
                  <div key={limitIndex} className="flex items-center space-x-2 opacity-60">
                    <X className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="text-white/70 text-xs">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onSignUp}
                className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm`}
              >
                <span>{plan.buttonText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-base text-white/80 mb-6 max-w-xl mx-auto">
            Join thousands of students who've improved their academic performance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={onSignUp}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            >
              Start Free Trial
            </button>
            <button
              onClick={onBackToLanding}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 border border-white/20"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Offer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {editingOffer ? 'Edit Offer' : 'Add New Offer'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setEditingOffer(null)
                  setNewOffer({
                    title: '',
                    description: '',
                    image_url: '',
                    offer_link: '',
                    price: '',
                    discount_percentage: 0,
                    category: 'general',
                    expires_at: ''
                  })
                }}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/70 text-sm mb-1">Title *</label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                  placeholder="Enter offer title"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Description *</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                  placeholder="Describe the offer"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Image URL *</label>
                <input
                  type="url"
                  value={newOffer.image_url}
                  onChange={(e) => setNewOffer({...newOffer, image_url: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-1">Offer Link *</label>
                <input
                  type="url"
                  value={newOffer.offer_link}
                  onChange={(e) => setNewOffer({...newOffer, offer_link: e.target.value})}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                  placeholder="https://example.com/offer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Price</label>
                  <input
                    type="text"
                    value={newOffer.price}
                    onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                    placeholder="$19.99"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Discount %</label>
                  <input
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({...newOffer, discount_percentage: parseInt(e.target.value) || 0})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-400 text-sm"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Category</label>
                  <select
                    value={newOffer.category}
                    onChange={(e) => setNewOffer({...newOffer, category: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.id} value={category.id} className="bg-gray-800">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1">Expires At</label>
                  <input
                    type="date"
                    value={newOffer.expires_at}
                    onChange={(e) => setNewOffer({...newOffer, expires_at: e.target.value})}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-400 text-sm"
                  />
                </div>
              </div>

              <button
                onClick={saveOffer}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
              >
                {editingOffer ? 'Update Offer' : 'Create Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OffersPage
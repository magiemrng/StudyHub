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
              {user && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Offer</span>
                </button>
              )}
              <button
                onClick={onSignUp}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2 mb-8">
            <Crown className="w-4 h-4 text-gray-600" />
            <span className="text-gray-700 text-sm font-medium">Special Student Offers</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight tracking-tight">
            Exclusive Deals
            <br />
            For Students
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing discounts on software, books, courses, and tools that help you succeed academically.
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
                      {user && user.id === offer.created_by && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEdit(offer)}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteOffer(offer.id)}
                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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

        {/* Pricing Plans */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              StudyHub Pricing Plans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your academic needs and budget
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular ? 'border-black scale-105' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-black">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.slice(0, 6).map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start space-x-3 opacity-60">
                      <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onSignUp}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    plan.popular
                      ? 'bg-black hover:bg-gray-800 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-black'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-50 rounded-3xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Ready to Transform Your Studies?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of students who've improved their academic performance with StudyHub's 
            comprehensive suite of tools and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={onSignUp}
              className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToLanding}
              className="border border-gray-300 hover:border-gray-400 text-black px-8 py-4 rounded-xl font-semibold transition-all duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Offer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">
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
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Enter offer title"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Describe the offer"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Image URL *</label>
                <input
                  type="url"
                  value={newOffer.image_url}
                  onChange={(e) => setNewOffer({...newOffer, image_url: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Offer Link *</label>
                <input
                  type="url"
                  value={newOffer.offer_link}
                  onChange={(e) => setNewOffer({...newOffer, offer_link: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="https://example.com/offer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Price</label>
                  <input
                    type="text"
                    value={newOffer.price}
                    onChange={(e) => setNewOffer({...newOffer, price: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                    placeholder="$19.99"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Discount %</label>
                  <input
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({...newOffer, discount_percentage: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                  <select
                    value={newOffer.category}
                    onChange={(e) => setNewOffer({...newOffer, category: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  >
                    {categories.slice(1).map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Expires At</label>
                  <input
                    type="date"
                    value={newOffer.expires_at}
                    onChange={(e) => setNewOffer({...newOffer, expires_at: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={saveOffer}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-all duration-200"
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
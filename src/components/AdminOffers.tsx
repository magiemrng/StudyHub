import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Tag, 
  ExternalLink,
  Clock,
  Crown,
  ArrowLeft,
  Sparkles
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

interface AdminOffersProps {
  onBackToOffers: () => void
}

const AdminOffers: React.FC<AdminOffersProps> = ({ onBackToOffers }) => {
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

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('student_offers')
        .update({ is_active: !currentStatus })
        .eq('id', offerId)
        .eq('created_by', user.id)

      if (error) throw error
      loadOffers()
    } catch (error) {
      console.error('Error updating offer status:', error)
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={onBackToOffers}
              className="flex items-center space-x-3 text-black hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">Admin Panel</span>
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Offer</span>
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
            <span className="text-gray-700 text-sm font-medium">Admin Dashboard</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-8 leading-tight tracking-tight">
            Manage Student
            <br />
            Offers
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create, edit, and manage student offers and discounts. Keep the community updated with the latest deals.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Tag className="w-6 h-6 text-blue-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Total Offers</h3>
            <p className="text-2xl font-bold text-black">{safeOffers.length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Crown className="w-6 h-6 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Active Offers</h3>
            <p className="text-2xl font-bold text-black">{safeOffers.filter(o => o.is_active).length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <Clock className="w-6 h-6 text-orange-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Expired</h3>
            <p className="text-2xl font-bold text-black">{safeOffers.filter(o => isExpired(o.expires_at)).length}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <ExternalLink className="w-6 h-6 text-purple-600 mx-auto mb-3" />
            <h3 className="text-gray-700 font-medium text-sm mb-1">Categories</h3>
            <p className="text-2xl font-bold text-black">{categories.length - 1}</p>
          </div>
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

        {/* Offers Management */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-black">All Offers</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 text-lg">Loading offers...</div>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={offer.image_url}
                        alt={offer.title}
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-black truncate">{offer.title}</h3>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            offer.is_active 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {offer.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {isExpired(offer.expires_at) && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{offer.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="capitalize bg-gray-100 px-2 py-1 rounded">{offer.category}</span>
                          {offer.price && <span>Price: {offer.price}</span>}
                          {offer.discount_percentage > 0 && <span>Discount: {offer.discount_percentage}%</span>}
                          {offer.expires_at && (
                            <span>Expires: {new Date(offer.expires_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          offer.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {offer.is_active ? 'Deactivate' : 'Activate'}
                      </button>
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-black mb-2">No offers found</h3>
              <p className="text-gray-600 text-sm mb-6">Create your first offer to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-200"
              >
                Create First Offer
              </button>
            </div>
          )}
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="Enter offer title"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Description *</label>
                <textarea
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Offer Link *</label>
                <input
                  type="url"
                  value={newOffer.offer_link}
                  onChange={(e) => setNewOffer({...newOffer, offer_link: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
                    placeholder="$19.99"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Discount %</label>
                  <input
                    type="number"
                    value={newOffer.discount_percentage}
                    onChange={(e) => setNewOffer({...newOffer, discount_percentage: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-gray-400 focus:bg-white transition-all duration-200"
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

export default AdminOffers
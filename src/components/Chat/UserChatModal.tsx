import React, { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Users, Plus, Search, User, Hash, ArrowLeft, Menu, Info, Paperclip, File, Image } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface UserProfile {
  id: string
  user_id: string
  display_name: string
  status: 'online' | 'offline' | 'away'
  avatar_url?: string
}

interface ChatRoom {
  id: string
  name?: string
  is_group: boolean
  created_at: string
  updated_at: string
  participants: UserProfile[]
  last_message?: {
    content: string
    created_at: string
    sender_name: string
  }
}

interface Message {
  id: string
  content: string
  sender_id: string
  sender_name: string
  created_at: string
  message_type?: 'text' | 'file' | 'image'
  file_url?: string
  file_name?: string
}

interface UserChatModalProps {
  isOpen: boolean
  onClose: () => void
}

const UserChatModal: React.FC<UserChatModalProps> = ({ isOpen, onClose }) => {
  const [activeRoom, setActiveRoom] = useState<string | null>(null)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showUserList, setShowUserList] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [groupName, setGroupName] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user && isOpen) {
      loadRooms()
      loadUsers()
    }
  }, [user, isOpen])

  useEffect(() => {
    if (activeRoom) {
      setLoading(true)
      loadMessages(activeRoom).finally(() => setLoading(false))
      
      // Set up real-time subscription for messages
      const subscription = supabase
        .channel(`room-${activeRoom}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'user_messages',
          filter: `room_id=eq.${activeRoom}`
        }, (payload) => {
          // Add the new message to the current messages
          const newMsg = payload.new as any
          loadMessages(activeRoom) // Reload all messages to get sender name
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [activeRoom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadRooms = async () => {
    if (!user) return

    try {
      const { data: roomsData, error } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          chat_rooms (
            id,
            name,
            is_group,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const roomsWithParticipants = await Promise.all(
        (roomsData || []).map(async (item: any) => {
          const room = item.chat_rooms
          
          // Get participants using a simpler query
          const { data: participantData } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('room_id', room.id)

          // Get user profiles for participants
          const participantIds = (participantData || []).map(p => p.user_id)
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')
            .in('user_id', participantIds)

          // Get last message using a simpler query
          const { data: lastMessageData } = await supabase
            .from('user_messages')
            .select('content, created_at, sender_id')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)

          let lastMessage = undefined
          if (lastMessageData && lastMessageData.length > 0) {
            const msg = lastMessageData[0]
            // Get sender name
            const { data: senderProfile } = await supabase
              .from('user_profiles')
              .select('display_name')
              .eq('user_id', msg.sender_id)
              .single()

            lastMessage = {
              content: msg.content,
              created_at: msg.created_at,
              sender_name: senderProfile?.display_name || 'Unknown'
            }
          }

          return {
            ...room,
            participants: profiles || [],
            last_message: lastMessage
          }
        })
      )

      setRooms(roomsWithParticipants)
    } catch (error) {
      console.error('Error loading rooms:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('user_id', user?.id)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_messages')
        .select('id, content, sender_id, created_at, message_type')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Get sender names for all messages
      const senderIds = [...new Set((data || []).map(msg => msg.sender_id))]
      const { data: senderProfiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name')
        .in('user_id', senderIds)

      const senderMap = new Map((senderProfiles || []).map(p => [p.user_id, p.display_name]))

      const formattedMessages = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        sender_name: senderMap.get(msg.sender_id) || 'Unknown',
        created_at: msg.created_at,
        message_type: msg.message_type || 'text'
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([]) // Set empty array on error to prevent blank screen
    }
  }

  const createDirectMessage = async (targetUserId: string) => {
    if (!user) return

    try {
      // Check if room already exists
      const { data: existingRoom } = await supabase
        .from('chat_participants')
        .select(`
          room_id,
          chat_rooms!inner (
            id,
            is_group
          )
        `)
        .eq('user_id', user.id)

      const directRooms = (existingRoom || []).filter(item => !item.chat_rooms.is_group)
      
      for (const roomData of directRooms) {
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('room_id', roomData.room_id)

        if ((participants || []).length === 2 && 
            (participants || []).some(p => p.user_id === targetUserId)) {
          setActiveRoom(roomData.room_id)
          setShowUserList(false)
          setShowSidebar(false)
          return
        }
      }

      // Create new room
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          is_group: false,
          created_by: user.id
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Add participants
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([
          { room_id: newRoom.id, user_id: user.id },
          { room_id: newRoom.id, user_id: targetUserId }
        ])

      if (participantError) throw participantError

      setActiveRoom(newRoom.id)
      setShowUserList(false)
      setShowSidebar(false)
      await loadRooms() // Reload rooms to show the new one
    } catch (error) {
      console.error('Error creating direct message:', error)
    }
  }

  const createGroup = async () => {
    if (!user || !groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one user')
      return
    }

    try {
      // Create new group room
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: groupName.trim(),
          is_group: true,
          created_by: user.id
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Add participants (creator + selected users)
      const participantInserts = [
        { room_id: newRoom.id, user_id: user.id },
        ...selectedUsers.map(userId => ({ room_id: newRoom.id, user_id: userId }))
      ]

      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert(participantInserts)

      if (participantError) throw participantError

      setActiveRoom(newRoom.id)
      setShowCreateGroup(false)
      setShowUserList(false)
      setShowSidebar(false)
      setGroupName('')
      setSelectedUsers([])
      await loadRooms()
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !activeRoom || !user) return

    setUploading(true)
    
    try {
      // Upload file to Supabase Storage with simplified path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}_${Date.now()}.${fileExt}`
      const filePath = fileName // Simplified path without folders

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath)

      // Determine message type
      const messageType = file.type.startsWith('image/') ? 'image' : 'file'
      
      // Send message with file
      const { data, error } = await supabase
        .from('user_messages')
        .insert({
          room_id: activeRoom,
          sender_id: user.id,
          content: messageType === 'image' ? `📷 ${file.name}` : `📎 ${file.name}`,
          message_type: messageType
        })
        .select()
        .single()

      if (error) throw error

      // Add to local state
      if (data) {
        const newMsg: Message = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          sender_name: 'You',
          created_at: data.created_at,
          message_type: messageType,
          file_url: publicUrl,
          file_name: file.name
        }
        
        setMessages(prev => [...(prev || []), newMsg])
        loadRooms()
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeRoom || !user || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('') // Clear input immediately for better UX

    try {
      const { data, error } = await supabase
        .from('user_messages')
        .insert({
          room_id: activeRoom,
          sender_id: user.id,
          content: messageContent,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error

      // Immediately add the message to the local state for instant feedback
      if (data) {
        const newMsg: Message = {
          id: data.id,
          content: data.content,
          sender_id: data.sender_id,
          sender_name: 'You', // Show as "You" for the sender
          created_at: data.created_at,
          message_type: 'text'
        }
        
        setMessages(prev => [...(prev || []), newMsg])
        
        // Also reload rooms to update last message
        loadRooms()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Restore the message in input if there was an error
      setNewMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.name) return room.name
    if (room.is_group) return 'Group Chat'
    
    const otherParticipant = (room.participants || []).find(p => p.user_id !== user?.id)
    return otherParticipant?.display_name || 'Unknown User'
  }

  const filteredUsers = (users || []).filter(u => 
    u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const renderMessage = (message: Message) => {
    if (message.message_type === 'image') {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.content}</p>
          {message.file_url && (
            <img 
              src={message.file_url} 
              alt={message.file_name}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file_url, '_blank')}
            />
          )}
        </div>
      )
    } else if (message.message_type === 'file') {
      return (
        <div className="flex items-center space-x-2">
          <File className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm">{message.content}</p>
            {message.file_url && (
              <a 
                href={message.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-300 hover:text-blue-200 underline"
              >
                Download
              </a>
            )}
          </div>
        </div>
      )
    } else {
      return <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
    }
  }

  if (!isOpen) return null

  const safeRooms = rooms || []
  const safeMessages = messages || []

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-6">
      <div className="bg-white rounded-none md:rounded-3xl w-full h-full md:w-full md:max-w-7xl md:h-[90vh] flex overflow-hidden shadow-2xl border border-gray-200">
        
        {/* Sidebar */}
        <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-gray-200 flex-col bg-gray-50`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Messages</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowUserList(!showUserList)}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <Plus className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* New Chat Actions */}
          {showUserList && (
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-medium text-sm">Start New Chat</h3>
                <button
                  onClick={() => setShowUserList(false)}
                  className="w-6 h-6 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setShowCreateGroup(false)
                    setShowUserList(true)
                  }}
                  className="flex items-center justify-center space-x-2 bg-blue-100 hover:bg-blue-200 border border-blue-200 text-blue-700 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                >
                  <User className="w-3 h-3" />
                  <span>Direct</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateGroup(true)
                    setShowUserList(false)
                  }}
                  className="flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 border border-purple-200 text-purple-700 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                >
                  <Users className="w-3 h-3" />
                  <span>Group</span>
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => createDirectMessage(user.user_id)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {getInitials(user.display_name || 'U')}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 text-xs font-medium">{user.display_name}</p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          user.status === 'online' ? 'bg-green-400' : 
                          user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}></div>
                        <span className="text-gray-500 text-xs capitalize">{user.status}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create Group */}
          {showCreateGroup && (
            <div className="p-4 border-b border-gray-200 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-900 font-medium text-sm">Create Group</h3>
                <button
                  onClick={() => {
                    setShowCreateGroup(false)
                    setSelectedUsers([])
                    setGroupName('')
                  }}
                  className="w-6 h-6 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
              
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 text-xs mb-3"
              />
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Add members..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {selectedUsers.length > 0 && (
                <div className="mb-3 text-purple-600 text-xs">
                  {selectedUsers.length} member(s) selected
                </div>
              )}
              
              <div className="max-h-24 overflow-y-auto space-y-1 mb-3">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleUserSelection(user.user_id)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                      selectedUsers.includes(user.user_id) 
                        ? 'bg-purple-100 border border-purple-200' 
                        : 'hover:bg-white'
                    }`}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {getInitials(user.display_name || 'U')}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-gray-900 text-xs">{user.display_name}</p>
                    </div>
                    {selectedUsers.includes(user.user_id) && (
                      <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-xs font-medium transition-all duration-200"
              >
                Create Group
              </button>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {safeRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setActiveRoom(room.id)
                  setShowSidebar(false)
                }}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 text-left ${
                  activeRoom === room.id ? 'bg-blue-50 border-r-2 border-r-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-medium">
                      {room.is_group ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        getInitials(getRoomDisplayName(room))
                      )}
                    </div>
                    {!room.is_group && (room.participants || []).find(p => p.user_id !== user?.id)?.status === 'online' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-gray-900 font-medium truncate text-sm">
                        {getRoomDisplayName(room)}
                      </h3>
                      {room.last_message && (
                        <span className="text-gray-400 text-xs">
                          {formatTime(room.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    {room.last_message && (
                      <p className="text-gray-500 text-xs truncate">
                        {room.last_message.sender_name}: {room.last_message.content}
                      </p>
                    )}
                    {!room.last_message && (
                      <p className="text-gray-400 text-xs">No messages yet</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {safeRooms.length === 0 && (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-2">No conversations yet</p>
                <p className="text-gray-400 text-xs">Start a new chat to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${showSidebar ? 'hidden' : 'flex'} md:flex flex-1 flex-col bg-white`}>
          {activeRoom ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-medium">
                    {safeRooms.find(r => r.id === activeRoom)?.is_group ? (
                      <Users className="w-5 h-5" />
                    ) : (
                      getInitials(getRoomDisplayName(safeRooms.find(r => r.id === activeRoom) || {} as ChatRoom))
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium text-sm">
                      {getRoomDisplayName(safeRooms.find(r => r.id === activeRoom) || {} as ChatRoom)}
                    </h3>
                    <p className="text-gray-500 text-xs">
                      {(safeRooms.find(r => r.id === activeRoom)?.participants || []).length} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-all duration-200">
                    <Info className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={onClose}
                    className="hidden md:flex w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl items-center justify-center transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading messages...</div>
                  </div>
                ) : safeMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-400 text-xs">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  safeMessages.map((message, index) => {
                    const isOwn = message.sender_id === user?.id
                    const showAvatar = index === 0 || safeMessages[index - 1].sender_id !== message.sender_id
                    const showTime = index === safeMessages.length - 1 || 
                      safeMessages[index + 1].sender_id !== message.sender_id ||
                      new Date(safeMessages[index + 1].created_at).getTime() - new Date(message.created_at).getTime() > 300000 // 5 minutes

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-6' : 'mt-1'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-[80%] ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!isOwn && showAvatar && (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                              {getInitials(message.sender_name)}
                            </div>
                          )}
                          {!isOwn && !showAvatar && (
                            <div className="w-8 h-8 flex-shrink-0"></div>
                          )}
                          
                          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                            {!isOwn && showAvatar && (
                              <span className="text-gray-500 text-xs mb-1 px-3">{message.sender_name}</span>
                            )}
                            <div className={`px-4 py-3 rounded-2xl max-w-full break-words ${
                              isOwn
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                            }`}>
                              {renderMessage(message)}
                            </div>
                            {showTime && (
                              <span className="text-gray-400 text-xs mt-1 px-3">
                                {formatTime(message.created_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-11 h-11 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-2xl flex items-center justify-center transition-all duration-200"
                  >
                    <Paperclip className="w-4 h-4 text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white resize-none transition-all duration-200 text-sm leading-relaxed"
                      rows={1}
                      disabled={sending || uploading}
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                      }}
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending || uploading}
                    className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {uploading && (
                  <div className="mt-2 text-gray-500 text-xs">Uploading file...</div>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-gray-700 text-xl font-medium mb-2">Select a conversation</h3>
                <p className="text-gray-500 text-sm">Choose from your existing conversations or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserChatModal
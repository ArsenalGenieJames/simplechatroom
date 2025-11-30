import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import SearchBar from '../components/SearchBar'
import ConversationsList from '../components/ConversationsList'
import UserProfile from '../components/UserProfile'
import ChatHeader from '../components/ChatHeader'
import MessagesList from '../components/MessagesList'
import MessageInput from '../components/MessageInput'
import SettingsPage from './SettingsPage'
import './ChatPage.css'

export default function ChatPage({ user }) {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageBody, setMessageBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [userProfile, setUserProfile] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [typingTimeout, setTypingTimeout] = useState(null)
  const [replies, setReplies] = useState({})
  const [replyingTo, setReplyingTo] = useState(null)
  const [repliesLoading, setRepliesLoading] = useState({})
  const [showSettings, setShowSettings] = useState(false)

  // Request notification permission and send notifications
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          console.log('Notification permission granted')
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error)
      }
    }
  }

  const sendNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options,
        })
      } catch (error) {
        console.error('Error sending notification:', error)
      }
    }
  }

  // Fetch user's conversations
  useEffect(() => {
    if (!user) return

    // Request notification permission on mount
    requestNotificationPermission()

    const fetchUserProfile = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) throw profileError
        setUserProfile(profile)
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }

    fetchUserProfile()
  }, [user])

  // Fetch all users for search
  useEffect(() => {
    if (!user) return

    const fetchAllUsers = async () => {
      try {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url')
          .neq('id', user.id) // Exclude current user

        if (usersError) throw usersError
        setAllUsers(users || [])
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchAllUsers()
  }, [user])

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query.trim().length === 0) {
      setShowSearchResults(false)
      return
    }

    const results = allUsers.filter((u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      (u.display_name && u.display_name.toLowerCase().includes(query.toLowerCase()))
    )
    setSearchResults(results)
    setShowSearchResults(true)
  }

  // Create or get conversation with user
  const handleStartConversation = async (targetUserId) => {
    try {
      // Check if conversation already exists between these two users
      const { data: existingConversation } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)

      if (existingConversation && existingConversation.length > 0) {
        const conversationIds = existingConversation.map((p) => p.conversation_id)
        const { data: directChat } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', targetUserId)
          .in('conversation_id', conversationIds)
          .single()

        if (directChat) {
          setSelectedConversation(directChat.conversation_id)
          setShowSearchResults(false)
          setSearchQuery('')
          return
        }
      }

      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert([
          {
            title: null,
            is_group: false,
            created_by: user.id,
          },
        ])
        .select()

      if (convError) throw convError

      const conversationId = newConversation[0].id

      // Add both users as participants
      const { error: participantError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: targetUserId },
        ])

      if (participantError) throw participantError

      // Get target user's info for display
      const { data: targetUser } = await supabase
        .from('users')
        .select('username, display_name')
        .eq('id', targetUserId)
        .single()

      setSelectedConversation(conversationId)
      setShowSearchResults(false)
      setSearchQuery('')

      // Refresh conversations
      setConversations((prev) => [
        ...prev,
        {
          id: conversationId,
          title: null,
          is_group: false,
          created_by: user.id,
          created_at: new Date().toISOString(),
          otherUserUsername: targetUser?.display_name || targetUser?.username || 'User',
        },
      ])
    } catch (error) {
      console.error('Error starting conversation:', error)
      setError(error.message)
    }
  }

  // Fetch user's conversations
  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      try {
        setLoading(true)
        // Get conversations where user is a participant
        const { data: participantData, error: participantError } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', user.id)

        if (participantError) throw participantError

        const conversationIds = participantData.map((p) => p.conversation_id)

        if (conversationIds.length === 0) {
          setConversations([])
          setLoading(false)
          return
        }

        // Fetch conversation details
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .in('id', conversationIds)
          .order('created_at', { ascending: false })

        if (convError) throw convError

        // For each conversation, get the other user's info if it's a direct message
        const conversationsWithUserInfo = await Promise.all(
          conversationData.map(async (conversation) => {
            if (!conversation.is_group && !conversation.title) {
              // Get all participants in this conversation
              const { data: participants } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', conversation.id)

              // Find the other user (not the current user)
              const otherUserId = participants?.find((p) => p.user_id !== user.id)?.user_id

              if (otherUserId) {
                // Get the other user's info
                const { data: otherUser } = await supabase
                  .from('users')
                  .select('username, display_name')
                  .eq('id', otherUserId)
                  .single()

                return {
                  ...conversation,
                  otherUserUsername: otherUser?.display_name || otherUser?.username || 'User',
                }
              }
            }
            return conversation
          })
        )

        // Get unread message counts for each conversation
        const { data: unreadData } = await supabase
          .from('messages')
          .select('conversation_id, id')
          .in('conversation_id', conversationIds)

        // Count unread messages
        const unreadByConversation = {}
        for (const conversation of conversationsWithUserInfo) {
          const { data: lastRead } = await supabase
            .from('conversation_reads')
            .select('last_read_at')
            .eq('conversation_id', conversation.id)
            .eq('user_id', user.id)
            .single()

          const { count } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .gt('created_at', lastRead?.last_read_at || conversation.created_at)
            .neq('sender_id', user.id)

          unreadByConversation[conversation.id] = count || 0
        }

        setUnreadCounts(unreadByConversation)
        setConversations(conversationsWithUserInfo)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()

    // Subscribe to new conversations
    const subscription = supabase
      .channel('public:conversation_participants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_participants',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return

    const fetchMessages = async () => {
      try {
        // Get all messages in conversation
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('*, users:sender_id(username, display_name, avatar_url)')
          .eq('conversation_id', selectedConversation)
          .order('created_at', { ascending: true })

        if (messageError) throw messageError
        setMessages(messageData)

        // Update conversation_reads to mark as read
        await supabase.from('conversation_reads').upsert(
          {
            conversation_id: selectedConversation,
            user_id: user.id,
            last_read_at: new Date().toISOString(),
          },
          { onConflict: 'conversation_id,user_id' }
        )

        // Reset unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedConversation]: 0,
        }))
      } catch (error) {
        setError(error.message)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`public:messages:conversation_id=eq.${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`,
        },
        async (payload) => {
          // Fetch the complete message with user info
          const { data: messageWithUser } = await supabase
            .from('messages')
            .select('*, users:sender_id(username, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()

          if (messageWithUser) {
            setMessages((prev) => [...prev, messageWithUser])

            // Send notification if message is from another user
            if (messageWithUser.sender_id !== user.id) {
              const senderName =
                messageWithUser.users?.display_name ||
                messageWithUser.users?.username ||
                'Unknown User'

              sendNotification(`New message from ${senderName}`, {
                body: messageWithUser.body,
                tag: `message-${messageWithUser.conversation_id}`,
              })
            }
          }
        }
      )
      .subscribe()

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel(`typing:${selectedConversation}`)
      .on('broadcast', { event: 'user_typing' }, (payload) => {
        // Add user to typing list if not current user
        if (payload.payload.user_id !== user.id) {
          setTypingUsers((prev) => {
            const filtered = prev.filter((u) => u.user_id !== payload.payload.user_id)
            return [...filtered, payload.payload]
          })
        }
      })
      .on('broadcast', { event: 'user_stopped_typing' }, (payload) => {
        // Remove user from typing list
        if (payload.payload.user_id !== user.id) {
          setTypingUsers((prev) =>
            prev.filter((u) => u.user_id !== payload.payload.user_id)
          )
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
      typingChannel.unsubscribe()
    }
  }, [selectedConversation, user])

  // Fetch replies for a specific message
  const fetchRepliesForMessage = async (messageId) => {
    try {
      setRepliesLoading((prev) => ({ ...prev, [messageId]: true }))
      
      const { data: repliesData, error: repliesError } = await supabase
        .from('message_replies')
        .select('*, users:sender_id(username, display_name, avatar_url)')
        .eq('parent_message_id', messageId)
        .order('created_at', { ascending: true })

      if (repliesError) throw repliesError
      
      setReplies((prev) => ({
        ...prev,
        [messageId]: repliesData || [],
      }))

      // Subscribe to new replies for this message
      const repliesChannel = supabase
        .channel(`replies:${messageId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'message_replies',
            filter: `parent_message_id=eq.${messageId}`,
          },
          async (payload) => {
            // Fetch the complete reply with user info
            const { data: replyWithUser } = await supabase
              .from('message_replies')
              .select('*, users:sender_id(username, display_name, avatar_url)')
              .eq('id', payload.new.id)
              .single()

            if (replyWithUser) {
              setReplies((prev) => ({
                ...prev,
                [messageId]: [...(prev[messageId] || []), replyWithUser],
              }))

              // Send notification for replies
              if (replyWithUser.sender_id !== user.id) {
                const senderName =
                  replyWithUser.users?.display_name ||
                  replyWithUser.users?.username ||
                  'Unknown User'

                sendNotification(`${senderName} replied`, {
                  body: replyWithUser.body,
                  tag: `reply-${messageId}`,
                })
              }
            }
          }
        )
        .subscribe()

      return () => {
        repliesChannel.unsubscribe()
      }
    } catch (error) {
      console.error('Error fetching replies:', error)
    } finally {
      setRepliesLoading((prev) => ({ ...prev, [messageId]: false }))
    }
  }

  // Handle sending a reply
  const handleSendReply = async (parentMessageId, replyBody) => {
    if (!replyBody.trim() || !user) return

    const trimmedReply = replyBody.trim()
    
    try {
      // Optimistic update
      const optimisticReply = {
        id: `temp-${Date.now()}`,
        parent_message_id: parentMessageId,
        sender_id: user.id,
        body: trimmedReply,
        created_at: new Date().toISOString(),
        users: {
          username: userProfile?.username,
          display_name: userProfile?.display_name,
          avatar_url: userProfile?.avatar_url,
        },
      }

      setReplies((prev) => ({
        ...prev,
        [parentMessageId]: [...(prev[parentMessageId] || []), optimisticReply],
      }))

      // Send to database
      const { data, error } = await supabase
        .from('message_replies')
        .insert([
          {
            parent_message_id: parentMessageId,
            sender_id: user.id,
            body: trimmedReply,
          },
        ])
        .select()

      if (error) throw error
      
      // Replace temporary reply with real one
      if (data && data[0]) {
        setReplies((prev) => ({
          ...prev,
          [parentMessageId]: prev[parentMessageId].map((reply) =>
            reply.id === optimisticReply.id
              ? { ...reply, id: data[0].id }
              : reply
          ),
        }))
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      setError(error.message)
      // Remove optimistic reply on error
      setReplies((prev) => ({
        ...prev,
        [parentMessageId]: prev[parentMessageId].filter(
          (r) => r.id !== `temp-${Date.now()}`
        ),
      }))
    }
  }

  // Handle typing indicator
  const handleMessageChange = (e) => {
    const value = e.target.value
    setMessageBody(value)

    // Send typing status to Supabase
    if (selectedConversation && user && value.trim().length > 0) {
      // Publish typing event
      supabase
        .channel(`typing:${selectedConversation}`)
        .send({
          type: 'broadcast',
          event: 'user_typing',
          payload: {
            user_id: user.id,
            username: userProfile?.display_name || userProfile?.username,
            conversation_id: selectedConversation,
          },
        })
        .catch((error) => console.error('Error sending typing indicator:', error))

      // Clear previous timeout
      if (typingTimeout) clearTimeout(typingTimeout)

      // Set new timeout to stop typing indicator after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        supabase
          .channel(`typing:${selectedConversation}`)
          .send({
            type: 'broadcast',
            event: 'user_stopped_typing',
            payload: {
              user_id: user.id,
              conversation_id: selectedConversation,
            },
          })
          .catch((error) =>
            console.error('Error sending stop typing indicator:', error)
          )
      }, 3000)

      setTypingTimeout(timeout)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageBody.trim() || !selectedConversation || !user) return

    const trimmedMessage = messageBody.trim()
    
    try {
      setSending(true)
      
      // Add message optimistically (show immediately)
      const optimisticMessage = {
        id: `temp-${Date.now()}`, // Temporary ID
        conversation_id: selectedConversation,
        sender_id: user.id,
        body: trimmedMessage,
        created_at: new Date().toISOString(),
        users: {
          username: userProfile?.username,
          display_name: userProfile?.display_name,
          avatar_url: userProfile?.avatar_url,
        },
      }
      
      // Show message immediately
      setMessages((prev) => [...prev, optimisticMessage])
      setMessageBody('')
      
      // Clear typing indicator
      if (typingTimeout) clearTimeout(typingTimeout)
      setTypingUsers([])
      supabase
        .channel(`typing:${selectedConversation}`)
        .send({
          type: 'broadcast',
          event: 'user_stopped_typing',
          payload: {
            user_id: user.id,
            conversation_id: selectedConversation,
          },
        })
        .catch((err) => console.error('Failed to send typing stop event:', err))
      
      // Send to database
      const { data, error } = await supabase.from('messages').insert([
        {
          conversation_id: selectedConversation,
          sender_id: user.id,
          body: trimmedMessage,
        },
      ]).select()

      if (error) throw error
      
      // Replace temporary message with real one if needed
      if (data && data[0]) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? { ...msg, id: data[0].id } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      // Remove optimistic message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== `temp-${Date.now()}`)
      )
    } finally {
      setSending(false)
    }
  }

  const getConversationTitle = (conversation) => {
    if (conversation.title) return conversation.title
    if (conversation.is_group) return 'Group Chat'
    
    // For direct messages, try to get the other user's username
    // This will be fetched when we load conversation details
    return conversation.otherUserUsername || 'Direct Message'
  }

  if (loading) {
    return (
      <div className="chat-loading">
        <p>Loading conversations...</p>
      </div>
    )
  }

  // Show settings page if requested
  if (showSettings) {
    return <SettingsPage user={user} onBack={() => setShowSettings(false)} />
  }

  return (
    <div className="chat-container">
      {/* Sidebar - Conversations List */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <div className="sidebar-header-buttons">
            <button className="btn-new-chat" title="New conversation">
              +
            </button>
            <button
              className="btn-settings"
              title="Settings"
              onClick={() => setShowSettings(true)}
            >
              ⚙
            </button>
          </div>
        </div>

        {/* Search Bar Component */}
        <SearchBar
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          handleStartConversation={handleStartConversation}
        />

        {error && <div className="chat-error">{error}</div>}

        {/* Conversations List or Search Results */}
        {!showSearchResults && (
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            unreadCounts={unreadCounts}
            onSelectConversation={setSelectedConversation}
            getConversationTitle={getConversationTitle}
          />
        )}

        {/* User Profile Component */}
        <UserProfile userProfile={userProfile} user={user} />
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            {/* Chat Header Component */}
            <ChatHeader
              selectedConversation={selectedConversation}
              conversations={conversations}
              getConversationTitle={getConversationTitle}
            />

            {/* Messages List Component */}
            <MessagesList
              messages={messages}
              user={user}
              selectedConversation={selectedConversation}
            />

            {/* Message Input Component */}
            <MessageInput
              messageBody={messageBody}
              setMessageBody={setMessageBody}
              handleSendMessage={handleSendMessage}
              handleMessageChange={handleMessageChange}
              sending={sending}
              typingUsers={typingUsers}
            />
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage, markMessagesRead, getCurrentUserId } from '@/app/actions/messages'
import { useMessageStream } from '@/hooks/useMessageStream'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { MessageCircle, Send, ArrowLeft, Lock, Compass, Check, CheckCheck, Loader2, Wifi, WifiOff, Smile, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

export default function MessagesPage() {
  const queryClient = useQueryClient()
  const [activeChat, setActiveChat] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)

  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId).catch(() => {})
  }, [])

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 30000,
  })

  const onStreamMessage = useCallback((event) => {
    if (event.type === 'new_message') {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', event.conversationId] })
    }
  }, [queryClient])

  const { connected } = useMessageStream(onStreamMessage)

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <TopNav />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6 text-pink-400" />
          </motion.div>
          <p className="text-sm text-[var(--hana-muted)]">Loading conversations...</p>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen relative">
        <TopNav />
        <div className="flex flex-col items-center justify-center h-[70vh] px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center mb-5 border border-pink-100"
          >
            <Lock className="w-10 h-10 text-pink-300" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-xl font-bold text-[var(--hana-charcoal)] mb-2"
          >
            No Conversations Yet
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[var(--hana-muted)] max-w-xs mb-6"
          >
            Chat unlocks after a booking is confirmed. Book a companion to start chatting!
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/discover" className="inline-flex items-center gap-2 px-6 py-3 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-pink-500/20 btn-press">
              <Compass className="w-4 h-4" /> Discover Companions
            </Link>
          </motion.div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <TopNav />

      {/* Desktop */}
      <div className="hidden md:flex max-w-7xl mx-auto h-[calc(100vh-64px)] border-x border-[var(--hana-subtle)]/20">
        <ConversationList
          conversations={conversations}
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          currentUserId={currentUserId}
          connected={connected}
        />
        <div className="flex-1 flex flex-col bg-[var(--hana-cream)]/30">
          <AnimatePresence mode="wait">
            {activeChat ? (
              <ChatArea
                key={activeChat.id}
                conversation={activeChat}
                currentUserId={currentUserId}
                onBack={() => setActiveChat(null)}
                showBackButton={false}
              />
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-4xl mb-5 border border-pink-100/50 shadow-sm"
                >
                  💬
                </motion.div>
                <h3 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-1">Select a conversation</h3>
                <p className="text-sm text-[var(--hana-muted)] max-w-[200px]">Choose a chat from the left to start messaging</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          {activeChat ? (
            <ChatArea
              key={activeChat.id}
              conversation={activeChat}
              currentUserId={currentUserId}
              onBack={() => setActiveChat(null)}
              showBackButton
            />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-24">
              <header className="px-5 pt-4 pb-3 flex items-center justify-between">
                <div>
                  <h1 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">Messages</h1>
                  <div className="flex items-center gap-1.5 mt-1">
                    {connected ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[11px] text-emerald-600 font-medium">Connected</span></>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[11px] text-amber-600 font-medium">Reconnecting...</span></>
                    )}
                  </div>
                </div>
              </header>

              <div className="px-4 space-y-1.5">
                {conversations.map((conv, i) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    currentUserId={currentUserId}
                    index={i}
                    onClick={() => setActiveChat(conv)}
                    isActive={false}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!activeChat && <BottomNav />}
    </div>
  )
}

function ConversationList({ conversations, activeChat, setActiveChat, currentUserId, connected }) {
  return (
    <div className="w-[360px] border-r border-[var(--hana-subtle)]/30 bg-white flex flex-col">
      <div className="p-5 border-b border-[var(--hana-subtle)]/20">
        <div className="flex items-center justify-between mb-1">
          <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Messages</h1>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50">
            {connected ? (
              <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] text-emerald-600 font-medium">Live</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-amber-600 font-medium">Offline</span></>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--hana-muted)]">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.map((conv, i) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            currentUserId={currentUserId}
            index={i}
            onClick={() => setActiveChat(conv)}
            isActive={activeChat?.id === conv.id}
          />
        ))}
      </div>
    </div>
  )
}

function ConversationItem({ conversation, currentUserId, index, onClick, isActive }) {
  const other = conversation.participants?.find(p => p.userId !== currentUserId)
  const lastMsg = conversation.messages?.[0]
  const displayName = other?.user?.name || 'Companion'
  const avatar = other?.user?.image
  const timeStr = conversation.lastMessageAt ? formatTime(conversation.lastMessageAt) : ''
  const unread = conversation.unreadCount || 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(236, 72, 153, 0.04)' }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 rounded-xl mx-2 ${
        isActive ? 'bg-pink-50/80 border border-pink-100' : 'border border-transparent'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-base font-semibold text-pink-600">{displayName[0]}</span>
          )}
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`text-sm truncate ${unread > 0 ? 'font-bold text-[var(--hana-charcoal)]' : 'font-semibold text-[var(--hana-charcoal)]'}`}>{displayName}</h3>
          <span className={`text-[10px] shrink-0 ${unread > 0 ? 'text-[var(--hana-blush-dark)] font-semibold' : 'text-[var(--hana-muted)]'}`}>{timeStr}</span>
        </div>
        <p className={`text-xs truncate mt-0.5 ${unread > 0 ? 'text-[var(--hana-charcoal)] font-medium' : 'text-[var(--hana-muted)]'}`}>
          {lastMsg?.senderId === currentUserId ? 'You: ' : ''}{lastMsg?.content || 'No messages yet'}
        </p>
      </div>
      {unread > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="min-w-[20px] h-[20px] px-1 flex items-center justify-center bg-[var(--hana-blush-dark)] text-white text-[10px] font-bold rounded-full shrink-0 shadow-sm"
        >
          {unread > 99 ? '99+' : unread}
        </motion.span>
      )}
    </motion.div>
  )
}

function ChatArea({ conversation, currentUserId, onBack, showBackButton }) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const other = conversation.participants?.find(p => p.userId !== currentUserId)
  const displayName = other?.user?.name || 'Companion'
  const avatar = other?.user?.image
  const isChatDisabled = conversation.bookingStatus === 'COMPLETED'

  const { data, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => getMessages({ conversationId: conversation.id }),
    refetchInterval: 5000,
  })

  const messageList = (data?.messages || []).slice().reverse()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messageList.length])

  useEffect(() => {
    if (conversation.id) {
      markMessagesRead(conversation.id)
    }
  }, [conversation.id, messageList.length])

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  const handleSend = () => {
    const content = input.trim()
    if (!content || sendMutation.isPending) return
    setInput('')
    sendMutation.mutate({ conversationId: conversation.id, content, type: 'TEXT' })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`flex flex-col bg-gradient-to-b from-white to-gray-50/50 ${showBackButton ? 'fixed inset-0 z-50' : 'flex-1 h-full'}`}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 md:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-[var(--hana-subtle)]/20 flex items-center gap-3 shrink-0 shadow-sm"
      >
        {showBackButton && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--hana-ash)]" />
          </motion.button>
        )}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-pink-600">{displayName[0]}</span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[var(--hana-charcoal)] truncate">{displayName}</h2>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Online
          </p>
        </div>
      </motion.div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 px-4 md:px-6 py-4 overflow-y-auto min-h-0">
        {loadingMessages && (
          <div className="flex justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 className="w-5 h-5 text-pink-400" />
            </motion.div>
          </div>
        )}

        {!loadingMessages && messageList.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center border border-pink-100">
              <MessageCircle className="w-7 h-7 text-pink-300" />
            </div>
            <p className="text-sm font-medium text-[var(--hana-charcoal)]">Start a conversation</p>
            <p className="text-xs text-[var(--hana-muted)] mt-1">Say hi to {displayName}!</p>
          </motion.div>
        )}

        <div className="space-y-0.5">
          {messageList.map((msg, i) => {
            const isMe = msg.senderId === currentUserId
            const showAvatar = !isMe && (i === 0 || messageList[i - 1]?.senderId !== msg.senderId)
            const isLast = i === messageList.length - 1 || messageList[i + 1]?.senderId !== msg.senderId
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isLast ? 'mb-3' : 'mb-0.5'}`}
              >
                {!isMe && (
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shrink-0 ${showAvatar ? 'visible' : 'invisible'}`}>
                    {avatar ? (
                      <img src={avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-semibold text-pink-600">{displayName[0]}</span>
                    )}
                  </div>
                )}
                <div className={`max-w-[75%] md:max-w-[65%] group ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                      isMe
                        ? `bg-gradient-to-br from-[var(--hana-charcoal)] to-gray-800 text-white shadow-md ${isLast ? 'rounded-2xl rounded-br-md' : 'rounded-2xl'}`
                        : `bg-white text-[var(--hana-charcoal)] border border-gray-100 shadow-sm ${isLast ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl'}`
                    }`}
                  >
                    {msg.content}
                  </div>
                  {isLast && (
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-[var(--hana-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        {formatMessageTime(msg.createdAt)}
                      </span>
                      {isMe && (
                        msg.isRead
                          ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                          : <Check className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-4 md:px-6 py-3 bg-white/95 backdrop-blur-md border-t border-[var(--hana-subtle)]/20 shrink-0"
      >
        {isChatDisabled ? (
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 rounded-2xl border border-gray-100">
            <Lock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">This chat has ended as the date is completed</span>
          </div>
        ) : (
        <div className="flex items-center gap-2.5">
          <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-2.5 border border-gray-100 focus-within:border-pink-200 focus-within:ring-2 focus-within:ring-pink-100/50 focus-within:bg-white transition-all">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 text-[var(--hana-charcoal)]"
            />
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-1">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="w-11 h-11 rounded-full bg-hana-gradient flex items-center justify-center shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white translate-x-[1px]" />
            )}
          </motion.button>
        </div>
        )}
      </motion.div>
    </motion.div>
  )
}

function formatTime(date) {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' })
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

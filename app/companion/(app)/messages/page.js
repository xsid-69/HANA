'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, getMessages, sendMessage, markMessagesRead, getCurrentUserId } from '@/app/actions/messages'
import { useMessageStream } from '@/hooks/useMessageStream'
import { MessageCircle, Send, ArrowLeft, Check, CheckCheck, Loader2, Wifi, WifiOff, Smile } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompanionMessagesPage() {
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

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-5 shrink-0">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--hana-charcoal)]">Messages</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-[var(--hana-muted)]">
              {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
            </p>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-50">
              {connected ? (
                <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[10px] text-emerald-600 font-medium">Live</span></>
              ) : (
                <><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] text-amber-600 font-medium">Offline</span></>
              )}
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-pink-400" />
          </motion.div>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center mx-auto mb-4 border border-pink-100">
              <MessageCircle className="w-8 h-8 text-pink-300" />
            </div>
            <p className="text-base font-semibold text-[var(--hana-charcoal)]">No conversations yet</p>
            <p className="text-xs text-[var(--hana-muted)] mt-1.5 max-w-[240px] mx-auto">Chats appear when a client completes payment on a booking</p>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-0 shadow-sm">
          {/* Conversations list */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto py-2">
              {conversations.map((conv, i) => {
                const other = conv.participants?.find(p => p.userId !== currentUserId)
                const lastMsg = conv.messages?.[0]
                const displayName = other?.user?.name || 'Client'
                const avatar = other?.user?.image
                const timeStr = conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''
                const unread = conv.unreadCount || 0

                return (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setActiveChat(conv)}
                    whileHover={{ backgroundColor: 'rgba(236, 72, 153, 0.04)' }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all rounded-xl mx-2 my-0.5 ${
                      activeChat?.id === conv.id ? 'bg-pink-50/70 border border-pink-100' : 'border border-transparent'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm">
                        {avatar ? (
                          <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-sm font-semibold text-pink-600">
                            {displayName.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-[var(--hana-charcoal)]' : 'font-semibold text-[var(--hana-charcoal)]'}`}>{displayName}</span>
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
                        className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[var(--hana-blush-dark)] text-white text-[9px] font-bold rounded-full shrink-0 shadow-sm"
                      >
                        {unread > 99 ? '99+' : unread}
                      </motion.span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-h-0 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
              <CompanionChatArea
                conversation={activeChat}
                currentUserId={currentUserId}
                onBack={() => setActiveChat(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-center">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center text-3xl mx-auto mb-4 border border-pink-100/50">
                    💬
                  </div>
                  <p className="text-sm font-medium text-[var(--hana-charcoal)]">Select a conversation</p>
                  <p className="text-xs text-[var(--hana-muted)] mt-1">Choose a client to chat with</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CompanionChatArea({ conversation, currentUserId, onBack }) {
  const queryClient = useQueryClient()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  const other = conversation.participants?.find(p => p.userId !== currentUserId)
  const displayName = other?.user?.name || 'Client'
  const avatar = other?.user?.image
  const isChatDisabled = conversation.bookingStatus === 'COMPLETED'

  const { data, isLoading } = useQuery({
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
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-white to-gray-50/30">
      {/* Header */}
      <motion.div
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 px-4 md:px-6 py-3.5 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm shrink-0"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[var(--hana-ash)]" />
        </motion.button>
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-semibold text-pink-600">
                {displayName.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-[var(--hana-charcoal)] truncate">{displayName}</h3>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Online
          </p>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 min-h-0">
        {isLoading && (
          <div className="flex justify-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader2 className="w-5 h-5 text-pink-400" />
            </motion.div>
          </div>
        )}

        {!isLoading && messageList.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center border border-pink-100">
              <MessageCircle className="w-7 h-7 text-pink-300" />
            </div>
            <p className="text-sm font-medium text-[var(--hana-charcoal)]">Start the conversation</p>
            <p className="text-xs text-[var(--hana-muted)] mt-1">Say hello to {displayName}</p>
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
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
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
                <div className={`max-w-[75%] md:max-w-[65%] group`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                      isMe
                        ? `bg-gradient-to-br from-[var(--hana-charcoal)] to-gray-800 text-white shadow-md ${isLast ? 'rounded-br-md' : ''}`
                        : `bg-white text-[var(--hana-charcoal)] border border-gray-100 shadow-sm ${isLast ? 'rounded-bl-md' : ''}`
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
        className="px-4 md:px-6 py-3 border-t border-gray-100 bg-white/95 backdrop-blur-md shrink-0"
      >
        {isChatDisabled ? (
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 rounded-2xl border border-gray-100">
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
            className="w-10 h-10 rounded-full bg-hana-gradient flex items-center justify-center shadow-lg shadow-pink-500/25 hover:shadow-xl transition-all disabled:opacity-40 disabled:shadow-none shrink-0"
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
    </div>
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

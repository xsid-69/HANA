'use client'

import { trpc } from '@/lib/trpc-client'
import { useSession } from 'next-auth/react'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { MessageCircle, Video, MoreVertical, Mic, Smile, Send, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const DEMO_MESSAGES = [
  { id: 1, sender: 'other', content: 'Hi! I had such a lovely time chatting yesterday 🌷', time: '2:14 PM' },
  { id: 2, sender: 'me', content: 'Me too! Would you like to meet for coffee this week? ☕', time: '2:15 PM' },
  { id: 3, sender: 'other', content: "I'd love that! There's a cozy little spot near the park I've been wanting to try.", time: '2:16 PM' },
  { id: 4, sender: 'me', content: 'Perfect. How about Saturday morning around 10? 😊', time: '2:17 PM' },
  { id: 5, sender: 'other', content: "Saturday sounds wonderful. I'll be counting the days! 🥰", time: '2:18 PM' },
]

const DEMO_CONVERSATIONS = [
  { id: 1, name: 'Isabelle', lastMsg: "Saturday sounds wonderful! 🥰", time: '2:18 PM', unread: 1, emoji: '🌸' },
  { id: 2, name: 'Yuki', lastMsg: "See you at the café!", time: '1:05 PM', unread: 0, emoji: '☕' },
  { id: 3, name: 'Kenji', lastMsg: "That ramen place was amazing", time: 'Yesterday', unread: 0, emoji: '🍜' },
  { id: 4, name: 'Mika', lastMsg: "Thank you for the tea ceremony!", time: 'Yesterday', unread: 2, emoji: '🍵' },
]

export default function MessagesPage() {
  const { data: session } = useSession()
  const [activeChat, setActiveChat] = useState(null)

  return (
    <div className="min-h-screen relative">
      <TopNav />

      {/* Desktop layout */}
      <div className="hidden md:flex max-w-7xl mx-auto h-[calc(100vh-64px)]">
        {/* Conversations list */}
        <div className="w-96 border-r border-[var(--hana-subtle)]/30 bg-[var(--hana-warm-white)] flex flex-col">
          <div className="p-5 border-b border-[var(--hana-subtle)]/30">
            <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Messages</h1>
            <div className="mt-3 flex items-center bg-[var(--hana-ivory)] rounded-xl px-3 py-2.5 border border-[var(--hana-subtle)]/30 focus-within:border-[var(--hana-blush-dark)] focus-within:ring-2 focus-within:ring-[var(--hana-blush)]/15 transition-all">
              <input type="text" placeholder="Search conversations..." className="bg-transparent text-sm w-full outline-none placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] font-body" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {DEMO_CONVERSATIONS.map((conv, i) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveChat(conv)}
                className={`flex items-center gap-3 px-5 py-4 cursor-pointer transition-all duration-200 ${
                  activeChat?.id === conv.id ? 'bg-[var(--hana-blush)]/8 border-r-2 border-[var(--hana-blush-dark)]' : 'hover:bg-[var(--hana-ivory)]'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--hana-blush)]/25 to-[var(--hana-lavender)]/25 flex items-center justify-center text-xl">
                    {conv.emoji}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--hana-online)] rounded-full border-2 border-[var(--hana-warm-white)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[var(--hana-charcoal)] font-body">{conv.name}</h3>
                    <span className="text-[11px] text-[var(--hana-muted)] font-body">{conv.time}</span>
                  </div>
                  <p className="text-xs text-[var(--hana-muted)] truncate mt-0.5 font-body">{conv.lastMsg}</p>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[var(--hana-blush-dark)] flex items-center justify-center">
                    <span className="text-[10px] text-white font-semibold">{conv.unread}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {activeChat ? (
              <motion.div
                key={activeChat.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="px-6 py-4 bg-[var(--hana-warm-white)] border-b border-[var(--hana-subtle)]/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--hana-blush)]/25 to-[var(--hana-lavender)]/25 flex items-center justify-center text-lg">
                    {activeChat.emoji}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-[var(--hana-charcoal)] font-body">{activeChat.name}</h2>
                    <p className="text-[11px] text-[var(--hana-online)] font-medium flex items-center gap-1 font-body">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--hana-online)] inline-block" />
                      Online now
                    </p>
                  </div>
                  <button className="p-2 rounded-lg text-[var(--hana-muted)] hover:bg-[var(--hana-ivory)] transition-colors btn-press"><Video className="w-5 h-5" /></button>
                  <button className="p-2 rounded-lg text-[var(--hana-muted)] hover:bg-[var(--hana-ivory)] transition-colors btn-press"><MoreVertical className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 px-6 py-4 space-y-3 overflow-y-auto">
                  <div className="text-center">
                    <span className="text-[11px] text-[var(--hana-muted)] bg-[var(--hana-warm-white)] px-3 py-1 rounded-full font-body">Today, 2:14 PM</span>
                  </div>
                  {DEMO_MESSAGES.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[60%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-body ${
                        msg.sender === 'me'
                          ? 'bg-[var(--hana-charcoal)] text-white msg-sent'
                          : 'bg-[var(--hana-warm-white)] text-[var(--hana-charcoal)] msg-received shadow-sm border border-[var(--hana-subtle)]/20'
                      }`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {/* Typing indicator */}
                  <div className="flex justify-start">
                    <div className="bg-[var(--hana-warm-white)] px-4 py-3 rounded-2xl msg-received shadow-sm border border-[var(--hana-subtle)]/20">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-[var(--hana-blush)]" style={{ animation: 'typing-bounce 1.2s infinite 0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-[var(--hana-blush)]" style={{ animation: 'typing-bounce 1.2s infinite 150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-[var(--hana-blush)]" style={{ animation: 'typing-bounce 1.2s infinite 300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[var(--hana-warm-white)] border-t border-[var(--hana-subtle)]/30">
                  <div className="flex items-center gap-3">
                    <button className="p-2 text-[var(--hana-blush-dark)] hover:bg-[var(--hana-blush)]/10 rounded-lg btn-press"><Mic className="w-5 h-5" /></button>
                    <div className="flex-1 flex items-center bg-[var(--hana-ivory)] rounded-full px-4 py-3 border border-[var(--hana-subtle)]/30 focus-within:border-[var(--hana-blush-dark)] focus-within:ring-2 focus-within:ring-[var(--hana-blush)]/15 transition-all">
                      <input type="text" placeholder="Say something warm..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] font-body" />
                      <button className="p-1 text-[var(--hana-muted)] hover:text-[var(--hana-ash)] transition-colors"><Smile className="w-5 h-5" /></button>
                    </div>
                    <button className="w-11 h-11 rounded-full bg-hana-gradient flex items-center justify-center shadow-md shadow-[var(--hana-blush)]/20 hover:shadow-lg transition-shadow btn-press">
                      <Send className="w-4.5 h-4.5 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[var(--hana-blush)]/10 flex items-center justify-center text-3xl mb-4 animate-float-gentle">💬</div>
                <h3 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-1">Select a conversation</h3>
                <p className="text-sm text-[var(--hana-muted)] font-body">Choose a chat from the left to start messaging</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden pb-24">
        <header className="bg-hana-gradient-animated px-5 pt-12 pb-6 rounded-b-[2rem] shadow-lg shadow-[var(--hana-blush)]/10">
          <h1 className="font-heading text-xl font-bold text-white">Messages</h1>
        </header>

        <div className="px-5 py-4 space-y-2">
          {DEMO_CONVERSATIONS.map((conv, i) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/20 shadow-sm cursor-pointer btn-press"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--hana-blush)]/25 to-[var(--hana-lavender)]/25 flex items-center justify-center text-2xl">
                  {conv.emoji}
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[var(--hana-online)] rounded-full border-2 border-[var(--hana-warm-white)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--hana-charcoal)] font-body">{conv.name}</h3>
                  <span className="text-[10px] text-[var(--hana-muted)] font-body">{conv.time}</span>
                </div>
                <p className="text-xs text-[var(--hana-muted)] truncate mt-0.5 font-body">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-[var(--hana-blush-dark)] flex items-center justify-center">
                  <span className="text-[10px] text-white font-semibold">{conv.unread}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

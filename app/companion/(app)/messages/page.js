'use client'

import { useState } from 'react'
import { MessageCircle, Send, Search, Phone, MoreVertical, Clock, CheckCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CONVERSATIONS = [
  { id: 1, name: 'Aarav Mehta', avatar: null, lastMsg: 'Looking forward to our coffee session!', time: '2:30 PM', unread: 2, activity: 'Tech & Coffee Talk' },
  { id: 2, name: 'Kabir Singh', avatar: null, lastMsg: 'Can we reschedule to 5 PM?', time: '1:15 PM', unread: 1, activity: 'Dharampeth Cafe Hop' },
  { id: 3, name: 'Vikram Thakur', avatar: null, lastMsg: 'That was an amazing session, thank you!', time: 'Yesterday', unread: 0, activity: 'Park Jog & Chat' },
  { id: 4, name: 'Devansh Roy', avatar: null, lastMsg: "I'll bring the board games!", time: 'Yesterday', unread: 0, activity: 'Board Game Cafe Date' },
  { id: 5, name: 'Nitin Rao', avatar: null, lastMsg: 'Thanks for the investment tips!', time: 'Mon', unread: 0, activity: 'Finance & Investment' },
]

const MESSAGES = [
  { id: 1, sender: 'client', content: 'Hi! I booked the Tech & Coffee session for Saturday.', time: '2:10 PM' },
  { id: 2, sender: 'me', content: 'Hey Aarav! Great choice. Do you have a preferred cafe or shall I pick one?', time: '2:12 PM' },
  { id: 3, sender: 'client', content: 'You pick! I trust your recommendations. Somewhere quiet for a good conversation.', time: '2:15 PM' },
  { id: 4, sender: 'me', content: "Perfect. I know just the place - great filter coffee and cozy vibes. I'll share the location on Friday.", time: '2:20 PM' },
  { id: 5, sender: 'client', content: 'Looking forward to our coffee session!', time: '2:30 PM' },
]

export default function CompanionMessagesPage() {
  const [activeChat, setActiveChat] = useState(CONVERSATIONS[0])
  const [message, setMessage] = useState('')

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--hana-charcoal)]">Messages</h1>
          <p className="text-sm text-[var(--hana-muted)]">{CONVERSATIONS.filter(c => c.unread > 0).length} unread conversations</p>
        </div>
      </div>

      <div className="flex flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-0">
        {/* Conversations list */}
        <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="bg-transparent text-sm w-full outline-none placeholder:text-gray-400 text-[var(--hana-charcoal)]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CONVERSATIONS.map(conv => (
              <div
                key={conv.id}
                onClick={() => setActiveChat(conv)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer border-b border-gray-50 transition-colors ${
                  activeChat?.id === conv.id ? 'bg-pink-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                  {conv.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--hana-charcoal)]">{conv.name}</span>
                    <span className="text-[10px] text-[var(--hana-muted)]">{conv.time}</span>
                  </div>
                  <p className="text-xs text-[var(--hana-muted)] truncate mt-0.5">{conv.lastMsg}</p>
                  <span className="text-[10px] text-[var(--hana-blush-dark)] font-medium mt-0.5 block">{conv.activity}</span>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--hana-blush-dark)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                    {conv.unread}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area - hidden on mobile unless active */}
        <div className="hidden md:flex flex-1 flex-col">
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                    {activeChat.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--hana-charcoal)]">{activeChat.name}</h3>
                    <span className="text-[11px] text-[var(--hana-blush-dark)]">{activeChat.activity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4 text-gray-500" />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {MESSAGES.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.sender === 'me'
                        ? 'bg-[var(--hana-charcoal)] text-white'
                        : 'bg-gray-100 text-[var(--hana-charcoal)]'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                        <span className={`text-[10px] ${msg.sender === 'me' ? 'text-gray-400' : 'text-[var(--hana-muted)]'}`}>{msg.time}</span>
                        {msg.sender === 'me' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-100 focus:border-[var(--hana-blush-dark)] focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-400"
                  />
                  <button className="w-10 h-10 rounded-xl bg-[var(--hana-charcoal)] hover:bg-[var(--hana-ash)] flex items-center justify-center transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-[var(--hana-muted)]">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

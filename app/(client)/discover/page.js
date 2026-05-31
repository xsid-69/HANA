'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc-client'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { Star, Heart, Bell, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const FILTERS = [
  { label: 'All', emoji: '🔥' },
  { label: 'Nearby', emoji: '📍' },
  { label: 'Top Rated', emoji: '⭐' },
  { label: 'Coffee', emoji: '☕' },
  { label: 'Creative', emoji: '🎨' },
  { label: 'Outdoors', emoji: '🌳' },
]

export default function DiscoverPage() {
  const { data: companions, isLoading } = trpc.companion.getAll.useQuery()
  const [activeFilter, setActiveFilter] = useState('All')

  const featured = companions?.[0]

  return (
    <div className="min-h-screen relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-8%] w-[500px] h-[500px] bg-pink-400/15 rounded-full blur-[100px] animate-pulse-glow animate-blob" />
        <div className="absolute bottom-[15%] left-[-8%] w-[450px] h-[450px] bg-[var(--hana-lavender)]/12 rounded-full blur-[100px] animate-float-slow" />
        <div className="absolute top-[50%] left-[40%] w-[300px] h-[300px] bg-[var(--hana-fuchsia)]/6 rounded-full blur-[80px] animate-pulse-soft" />
      </div>

      <TopNav />

      <div className="max-w-7xl mx-auto md:px-6 md:py-8 relative z-10">
        {/* Mobile Header */}
        <header className="px-5 pt-12 pb-4 md:hidden">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-heading text-2xl font-bold gradient-text-blush">
              Discover People ✨
            </h1>
            <button className="p-2 rounded-full bg-[var(--hana-warm-white)] border border-[var(--hana-subtle)]/40 shadow-sm btn-press">
              <Bell className="w-5 h-5 text-[var(--hana-ash)]" />
            </button>
          </div>
          <p className="text-sm text-[var(--hana-muted)] font-body">Find your perfect companion</p>
        </header>

        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <h1 className="font-heading text-3xl font-bold gradient-text-blush">
            Discover People ✨
          </h1>
          <p className="text-[var(--hana-muted)] mt-1 font-body">Find your perfect companion</p>
        </div>

        {/* Filter Chips */}
        <div className="px-5 md:px-0 flex gap-2 mb-5 md:mb-8 overflow-x-auto no-scrollbar">
          {FILTERS.map(filter => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 md:px-5 md:py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 btn-press ${
                activeFilter === filter.label
                  ? 'bg-hana-gradient text-white shadow-lg shadow-pink-500/25 scale-105'
                  : 'bg-white/80 text-[var(--hana-ash)] border border-[var(--hana-subtle)]/40 hover:border-pink-300 hover:bg-pink-50/50'
              }`}
            >
              <span>{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Mobile Featured Card */}
        <div className="md:hidden px-5 mb-6">
          {featured && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="relative p-[2px] rounded-[28px] bg-gradient-to-br from-[var(--hana-blush-dark)] via-[var(--hana-blush)] to-[var(--hana-gold)] shadow-xl shadow-pink-500/15 animate-gradient-shift"
              style={{ backgroundSize: '200% 200%' }}
            >
              <div className="bg-white rounded-[26px] overflow-hidden">
                <div className="relative h-56">
                  {featured.photos?.[0] ? (
                    <img src={featured.photos[0]} alt={featured.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-6xl">
                      {featured.experiences?.[0]?.emoji || '🌸'}
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 glass rounded-full text-[11px] text-[var(--hana-ash)] font-medium">
                    <MapPin className="w-3 h-3" />
                    1.2 km away
                  </div>
                  <div className="absolute top-3 right-3">
                    <button className="w-8 h-8 rounded-full glass flex items-center justify-center btn-press">
                      <Heart className="w-4 h-4 text-[var(--hana-blush-dark)]" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">{featured.displayName}, {featured.age}</h2>
                    <div className="flex items-center gap-1 px-2 py-0.5 chip-sage rounded-lg">
                      <Star className="w-3.5 h-3.5 text-[var(--hana-sage)] fill-[var(--hana-sage)]" />
                      <span className="text-xs font-semibold">{featured.averageRating?.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 mt-2.5 flex-wrap">
                    {featured.tags?.slice(0, 3).map((tag, i) => (
                      <span key={tag} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        i === 0 ? 'chip-blush' : i === 1 ? 'chip-sage' : 'chip-lavender'
                      }`}>
                        {i === 0 ? '🎨' : i === 1 ? '☕' : '🏙️'} {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/companion/${featured.id}`}
                      className="flex-1 py-2.5 border border-[var(--hana-subtle)]/60 text-[var(--hana-ash)] rounded-full text-sm font-medium text-center hover:bg-[var(--hana-ivory)] transition-colors btn-press"
                    >
                      View Profile
                    </Link>
                    <button className="flex-1 py-2.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-md shadow-[var(--hana-blush)]/20 btn-press">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Desktop content grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-8">
          <div className="md:col-span-2">
            {featured && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-[1.75rem] overflow-hidden h-96 shadow-lg shadow-pink-500/10 hover-lift card-img-zoom border border-white/50"
              >
                {featured.photos?.[0] ? (
                  <img src={featured.photos[0]} alt={featured.displayName} className="w-full h-full object-cover card-img" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-9xl card-img">
                    {featured.experiences?.[0]?.emoji || '🌸'}
                  </div>
                )}

                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 glass rounded-full text-xs text-[var(--hana-ash)]">
                  <MapPin className="w-3 h-3" />
                  1.2 km away
                </div>

                <div className="absolute top-4 right-4">
                  <button className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white transition-colors btn-press">
                    <Heart className="w-4 h-4 text-[var(--hana-blush-dark)]" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--hana-charcoal)]/70 via-[var(--hana-charcoal)]/30 to-transparent p-8 pt-16">
                  <div className="flex items-end justify-between">
                    <div>
                      <h2 className="font-heading text-3xl font-bold text-white">{featured.displayName}, {featured.age}</h2>
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {featured.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs text-white font-medium border border-white/10">
                            🎨 {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2.5 py-1 glass rounded-lg">
                      <Star className="w-3.5 h-3.5 text-[var(--hana-gold)] fill-[var(--hana-gold)]" />
                      <span className="text-xs font-bold text-[var(--hana-charcoal)]">{featured.averageRating?.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Link href={`/companion/${featured.id}`} className="px-8 py-2.5 bg-white text-[var(--hana-charcoal)] rounded-full text-sm font-medium hover:bg-[var(--hana-warm-white)] transition-colors btn-press">
                      View Profile
                    </Link>
                    <button className="px-8 py-2.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-md shadow-[var(--hana-blush)]/20 hover:shadow-lg transition-shadow btn-press">
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-[var(--hana-warm-white)] rounded-[1.75rem] p-5 shadow-sm border border-[var(--hana-subtle)]/30 hover-lift">
              <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-1">Upcoming Event</h3>
              <p className="text-xs text-[var(--hana-muted)] mb-3 font-body">This weekend near you</p>
              <div className="rounded-xl overflow-hidden h-32 bg-gradient-to-br from-[var(--hana-gold)]/15 to-[var(--hana-blush)]/10 mb-3 flex items-center justify-center text-4xl animate-float-gentle">
                ☕
              </div>
              <p className="text-xs text-[var(--hana-muted)] mb-1 font-body">📅 Sat, Jun 14 · 4:00 PM</p>
              <h4 className="text-sm font-semibold text-[var(--hana-charcoal)] mb-3 font-body">Cozy Coffee & Conversation Meetup</h4>
              <button className="w-full py-2.5 border border-[var(--hana-subtle)]/50 rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-[var(--hana-blush-dark)] hover:text-white hover:border-transparent transition-all btn-press">
                Join Event
              </button>
            </div>
          </div>
        </div>

        {/* New Faces Grid */}
        <section className="px-5 md:px-0 mt-2 md:mt-10 pb-24 md:pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg md:text-xl font-bold text-[var(--hana-charcoal)]">New Faces 🌸</h2>
            <button className="text-sm text-[var(--hana-blush-dark)] font-semibold hover:text-[var(--hana-coral)] transition-colors font-body">See all</button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-[3/4] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {companions?.slice(1).map((companion, i) => (
                <motion.div
                  key={companion.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <Link href={`/companion/${companion.id}`} className="block group">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 hover-lift shadow-sm border border-white/50">
                      {companion.photos?.[0] ? (
                        <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl">
                          {companion.experiences?.[0]?.emoji || '🌸'}
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--hana-charcoal)]/80 to-transparent p-2.5 md:p-3 pt-10">
                        <p className="text-white text-xs md:text-sm font-semibold font-body">{companion.displayName}, {companion.age}</p>
                        <p className="text-white/70 text-[10px] md:text-xs font-body">{companion.tags?.[0]}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

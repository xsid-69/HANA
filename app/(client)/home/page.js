'use client'

import { useSession } from 'next-auth/react'
import { trpc } from '@/lib/trpc-client'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import { Star, Heart, Bell, Calendar, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const MOOD_CHIPS = [
  { label: 'Coffee', emoji: '☕' },
  { label: 'Creative', emoji: '🎨' },
  { label: 'City Walk', emoji: '🏙️' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Foodie', emoji: '🍲' },
  { label: 'Bookworm', emoji: '📚' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function HomePage() {
  const { data: session } = useSession()
  const { data: featured } = trpc.companion.getFeatured.useQuery()
  const { data: all, isLoading } = trpc.companion.getAll.useQuery()
  const [activeMood, setActiveMood] = useState('Coffee')

  useOnlineStatus(session?.user?.id)

  const mainCompanion = all?.[0]
  const secondaryCompanions = all?.slice(1, 3)
  const trendingCompanions = all?.slice(3, 7)

  return (
    <div className="min-h-screen relative">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-8%] w-[550px] h-[550px] bg-pink-300/25 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute top-[25%] right-[-12%] w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px] animate-float-gentle" />
        <div className="absolute bottom-[-5%] left-[25%] w-[500px] h-[500px] bg-fuchsia-200/15 rounded-full blur-[110px]" />
      </div>

      <TopNav />

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block relative z-10">
        <motion.main variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1440px] mx-auto px-12 pt-8 pb-16">

          {/* Hero Section */}
          <motion.section variants={itemVariants} className="relative bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-[2rem] flex p-12 justify-between items-center gap-8 overflow-hidden group hover-glow transition-all duration-500 shadow-2xl shadow-pink-500/15">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute top-10 right-40 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float-gentle" />

            <div className="max-w-lg flex flex-col gap-5 relative z-10">
              <span className="font-medium rounded-full bg-white/15 text-white/90 text-xs px-3.5 py-1.5 w-fit flex items-center gap-1.5 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Welcome back, {session?.user?.name?.split(' ')[0] || 'Guest'}
              </span>
              <h1 className="font-heading font-bold text-white text-[2.75rem] leading-[1.15] tracking-tight">
                Discover people<br />worth knowing.
              </h1>
              <p className="text-white/80 text-base leading-relaxed max-w-md">
                Find warm, curious companions for coffee, city walks, creative afternoons and unforgettable conversations.
              </p>
              <div className="flex mt-3 items-center gap-4">
                <Link href="/discover" className="font-semibold rounded-full bg-white text-pink-600 px-8 h-12 flex items-center justify-center hover:bg-pink-50 hover:scale-[1.03] shadow-lg shadow-white/20 transition-all duration-300 btn-press">
                  Start Exploring
                </Link>
                <button className="rounded-full text-white border-2 border-white/30 px-8 h-12 font-semibold hover:bg-white/15 hover:border-white/50 transition-all duration-300 btn-press">
                  How it works
                </button>
              </div>
            </div>

            <div className="relative shrink-0 rounded-3xl w-96 h-60 overflow-hidden bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center group-hover:rotate-1 transition-transform duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-600/20 to-purple-500/20" />
              <span className="text-8xl drop-shadow-lg animate-float-gentle block">🌸</span>
              <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-pink-200/50 blur-sm animate-pulse-soft" />
              <div className="absolute bottom-6 right-10 w-3 h-3 rounded-full bg-amber-300/50 blur-[2px] animate-float-gentle" />
            </div>
          </motion.section>

          {/* Mood Chips */}
          <motion.div variants={itemVariants} className="flex mt-10 flex-wrap items-center gap-3">
            {MOOD_CHIPS.map(chip => (
              <button
                key={chip.label}
                onClick={() => setActiveMood(chip.label)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 flex items-center gap-2 btn-press ${
                  activeMood === chip.label
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 scale-105'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <span className="text-base">{chip.emoji}</span>
                {chip.label}
              </button>
            ))}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 mt-10 gap-8">
            <div className="col-span-2 flex flex-col gap-8">
              <motion.div variants={itemVariants} className="flex justify-between items-center">
                <h2 className="font-heading font-bold text-2xl text-gray-900 flex items-center gap-2">
                  Recommended For You <span className="text-pink-500">✨</span>
                </h2>
                <Link href="/discover" className="font-semibold text-pink-500 hover:text-pink-600 transition-colors text-sm">See all</Link>
              </motion.div>

              {/* Featured Card */}
              {mainCompanion && (
                <motion.div variants={itemVariants}>
                  <Link href={`/companion/${mainCompanion.id}`} className="relative rounded-[1.75rem] h-[360px] overflow-hidden group block hover-lift card-img-zoom shadow-lg">
                    {mainCompanion.photos?.[0] ? (
                      <img src={mainCompanion.photos[0]} alt={mainCompanion.displayName} className="w-full h-full object-cover card-img" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-100 flex items-center justify-center text-9xl card-img">🌸</div>
                    )}
                    <div className="bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-0" />

                    <div className="absolute right-6 top-6 bg-white/95 backdrop-blur-sm rounded-2xl flex px-3.5 py-2 items-center gap-1.5 shadow-md">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
                      <span className="font-bold text-sm text-gray-900">{mainCompanion.averageRating?.toFixed(2)}</span>
                    </div>

                    <div className="flex absolute inset-x-8 bottom-8 justify-between items-end">
                      <div className="flex flex-col gap-3 max-w-lg">
                        <span className="backdrop-blur-md font-medium rounded-full bg-white/15 text-white text-xs px-3.5 py-1.5 w-fit border border-white/10">
                          ✨ {mainCompanion.tags?.[0]}
                        </span>
                        <h3 className="font-heading font-bold text-white text-4xl tracking-tight">{mainCompanion.displayName}, {mainCompanion.age}</h3>
                        <p className="text-white/80 text-sm leading-relaxed line-clamp-2">{mainCompanion.bio}</p>
                      </div>
                      <span className="bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/25 rounded-full text-white px-7 h-12 flex items-center gap-2 text-sm font-semibold group-hover:scale-105 transition-transform duration-300 btn-press">
                        <Heart className="w-4 h-4 fill-white text-transparent" /> Book a Moment
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Secondary Cards */}
              {secondaryCompanions && (
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-6">
                  {secondaryCompanions.map(companion => (
                    <Link key={companion.id} href={`/companion/${companion.id}`} className="relative rounded-[1.75rem] h-64 overflow-hidden group block hover-lift card-img-zoom shadow-md">
                      {companion.photos?.[0] ? (
                        <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover card-img" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-6xl card-img">🌸</div>
                      )}
                      <div className="bg-gradient-to-t from-black/80 via-black/20 to-transparent absolute inset-0" />
                      <div className="flex absolute left-6 bottom-6 flex-col gap-2.5">
                        <span className="backdrop-blur-md font-medium rounded-full bg-white/15 text-white text-xs px-3 py-1 w-fit border border-white/10">
                          {companion.tags?.[0] ? `🎨 ${companion.tags[0]}` : '✨'}
                        </span>
                        <h3 className="font-heading font-bold text-white text-2xl tracking-tight">{companion.displayName}, {companion.age}</h3>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <motion.div variants={itemVariants} className="flex flex-col gap-8">
              <div className="rounded-[1.75rem] bg-white border border-gray-100 p-6 space-y-5 hover-lift shadow-sm">
                <div>
                  <h3 className="font-heading font-bold text-lg text-gray-900">Upcoming Event</h3>
                  <p className="text-sm text-gray-500">This weekend near you</p>
                </div>
                <div className="relative rounded-2xl w-full h-36 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center text-5xl animate-float-gentle">☕</div>
                <div className="text-gray-600 text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Sat, Jun 14 · 4:00 PM</span>
                </div>
                <h4 className="font-semibold text-gray-900 leading-snug">Cozy Coffee &amp; Conversation Meetup</h4>
                <button className="rounded-xl bg-gray-50 hover:bg-pink-500 hover:text-white w-full py-3.5 text-sm font-semibold text-gray-700 transition-all duration-300 btn-press border border-gray-100 hover:border-transparent">
                  Join Event
                </button>
              </div>

              <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 shadow-2xl shadow-pink-500/20 rounded-[1.75rem] text-white p-6 space-y-5 hover-glow transition-all duration-300 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2 relative z-10">
                  Popular This Week <span className="animate-wiggle inline-block">🔥</span>
                </h3>
                {all?.[4] && (
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-white/15 ring-3 ring-white/25 flex items-center justify-center text-2xl overflow-hidden">
                      {all[4].photos?.[0] ? (
                        <img src={all[4].photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : '🌸'}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white text-lg">{all[4].displayName}, {all[4].age}</span>
                      <span className="text-white/80 text-sm flex items-center gap-1">
                        🎨 {all[4].tags?.[0]} · <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300 stroke-0" /> {all[4].averageRating?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-white/85 text-sm leading-relaxed relative z-10">Booked 42 times this week. Spots filling fast!</p>
                <button className="rounded-xl bg-white text-pink-600 w-full py-3.5 text-sm font-semibold hover:bg-pink-50 shadow-md transition-all duration-300 btn-press relative z-10">View Profile</button>
              </div>
            </motion.div>
          </div>

          {/* Trending */}
          {trendingCompanions && trendingCompanions.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex mt-16 justify-between items-center">
                <h2 className="font-heading font-bold text-2xl text-gray-900 flex items-center gap-2">
                  Trending This Week <span className="animate-wiggle inline-block">🔥</span>
                </h2>
                <Link href="/discover" className="font-semibold text-pink-500 hover:text-pink-600 transition-colors text-sm">See all</Link>
              </div>
              <div className="grid grid-cols-4 mt-6 gap-6">
                {trendingCompanions.map((companion, i) => (
                  <motion.div key={companion.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <Link href={`/companion/${companion.id}`} className="relative rounded-[1.75rem] h-60 overflow-hidden group block hover-lift card-img-zoom shadow-md">
                      {companion.photos?.[0] ? (
                        <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover card-img" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-5xl card-img">🌸</div>
                      )}
                      <div className="bg-gradient-to-t from-black/80 via-black/10 to-transparent absolute inset-0" />
                      <div className="flex absolute left-5 bottom-5 flex-col gap-2">
                        <h3 className="font-heading font-bold text-white text-lg tracking-tight">{companion.displayName}, {companion.age}</h3>
                        <span className="backdrop-blur-md font-medium rounded-full bg-white/15 text-white text-[10px] px-2.5 py-1 w-fit border border-white/10">
                          {companion.tags?.[0] ? `${companion.experiences?.[0]?.emoji || '☕'} ${companion.tags[0]}` : '✨'}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <footer className="mt-20 border-t border-gray-200 pt-10 pb-6">
            <div className="flex justify-between items-start gap-8">
              <div className="max-w-xs flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex justify-center items-center shadow-md">
                    <Heart className="w-5 h-5 text-white fill-white/10" />
                  </div>
                  <span className="font-heading font-bold text-2xl text-gray-900">Hana</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Discover warm, curious companions for the moments that matter most.</p>
              </div>
              <div className="flex gap-16">
                <div className="flex flex-col gap-2.5">
                  <span className="font-semibold text-sm text-gray-800">Explore</span>
                  <Link href="/home" className="text-gray-500 text-sm hover:text-pink-500 transition-colors">Home</Link>
                  <Link href="/discover" className="text-gray-500 text-sm hover:text-pink-500 transition-colors">Discover</Link>
                  <span className="text-gray-500 text-sm">Events</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="font-semibold text-sm text-gray-800">Company</span>
                  <span className="text-gray-500 text-sm">About</span>
                  <span className="text-gray-500 text-sm">Careers</span>
                  <span className="text-gray-500 text-sm">Safety</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span className="font-semibold text-sm text-gray-800">Support</span>
                  <span className="text-gray-500 text-sm">Help Center</span>
                  <span className="text-gray-500 text-sm">Contact</span>
                  <span className="text-gray-500 text-sm">Privacy</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 flex mt-8 pt-6 justify-between items-center">
              <span className="text-gray-400 text-xs">© 2025 Hana. All rights reserved.</span>
            </div>
          </footer>
        </motion.main>
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden pb-24 relative z-10">
        <header className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 px-6 pt-14 pb-8 rounded-b-[2.5rem] shadow-2xl shadow-pink-500/20 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <h1 className="font-heading text-[1.7rem] font-bold tracking-tight">Discover People ✨</h1>
            <button className="p-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition-all btn-press">
              <Bell className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/80 text-sm relative z-10">Welcome back, {session?.user?.name?.split(' ')[0] || 'Guest'}</p>
        </header>

        <div className="px-5 flex gap-2.5 my-6 overflow-x-auto no-scrollbar">
          {MOOD_CHIPS.map(chip => (
            <button
              key={chip.label}
              onClick={() => setActiveMood(chip.label)}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 btn-press ${
                activeMood === chip.label
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 scale-105'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <span className="text-base">{chip.emoji}</span>
              {chip.label}
            </button>
          ))}
        </div>

        <section className="px-5 space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-52 rounded-[1.75rem] skeleton" />)
          ) : (
            all?.map((companion, i) => (
              <motion.div key={companion.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Link href={`/companion/${companion.id}`} className="block relative rounded-[1.75rem] overflow-hidden h-52 hover-lift shadow-md">
                  {companion.photos?.[0] ? (
                    <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-6xl">🌸</div>
                  )}
                  <div className="bg-gradient-to-t from-black/85 via-black/20 to-transparent absolute inset-0" />
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 stroke-0" />
                    <span className="text-xs font-semibold text-gray-900">{companion.averageRating?.toFixed(1)}</span>
                  </div>
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="font-heading font-bold text-white text-xl tracking-tight">{companion.displayName}, {companion.age}</h3>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-white/75 text-xs">{companion.tags?.[0]}</span>
                      <span className="text-white text-xs font-semibold bg-white/15 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">¥{companion.hourlyRate?.toLocaleString()}/hr</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </section>
        <BottomNav />
      </div>
    </div>
  )
}

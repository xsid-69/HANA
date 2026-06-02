'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc-client'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import {
  Star, Heart, MapPin, Search, SlidersHorizontal, X,
  ChevronDown, Check, Sparkles, TrendingUp, Users,
  Coffee, TreePine, Compass, ArrowRight, Filter
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'
import { useSession } from 'next-auth/react'

const CITIES = ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Jaipur','Pune','Kochi','Varanasi','Nagpur','Amritsar','Lucknow','Ahmedabad','Coimbatore','Thiruvananthapuram']
const INTERESTS = ['food','cafes','music','art','fitness','yoga','heritage','culture','wildlife','photography','shopping','spirituality','trekking','cricket','textiles','coffee','nightlife','books']
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A-Z' },
]

const PLACES = [
  { name: 'Irani Cafe', type: 'Cafe', emoji: '☕', city: 'Pune', desc: 'Colonial-era cafe with bun maska and chai', gradient: 'from-amber-50 to-orange-50', accent: 'text-amber-600' },
  { name: 'Toit Brewpub', type: 'Cafe', emoji: '🍺', city: 'Bangalore', desc: 'Craft beer and great food in Indiranagar', gradient: 'from-emerald-50 to-teal-50', accent: 'text-emerald-600' },
  { name: 'Lodhi Garden', type: 'Park', emoji: '🌿', city: 'Delhi', desc: 'Historic Mughal tombs amid lush greenery', gradient: 'from-green-50 to-lime-50', accent: 'text-green-600' },
  { name: 'Cubbon Park', type: 'Park', emoji: '🌳', city: 'Bangalore', desc: 'Green lung of the city, perfect for walks', gradient: 'from-teal-50 to-cyan-50', accent: 'text-teal-600' },
  { name: 'Versova Beach', type: 'Beach', emoji: '🌊', city: 'Mumbai', desc: 'Quiet fishing village beach at sunset', gradient: 'from-blue-50 to-sky-50', accent: 'text-blue-600' },
  { name: 'Cha Bar', type: 'Cafe', emoji: '🍵', city: 'Delhi', desc: 'Over 100 teas in a bookstore setting', gradient: 'from-rose-50 to-pink-50', accent: 'text-rose-600' },
  { name: 'Sanjay Gandhi NP', type: 'Park', emoji: '🦋', city: 'Mumbai', desc: 'Leopards, caves, and forest trails', gradient: 'from-violet-50 to-purple-50', accent: 'text-violet-600' },
  { name: 'Bylanes Cafe', type: 'Cafe', emoji: '☕', city: 'Nagpur', desc: 'Cozy cafe in the heart of the orange city', gradient: 'from-orange-50 to-amber-50', accent: 'text-orange-600' },
  { name: 'Ambazari Lake', type: 'Park', emoji: '🦢', city: 'Nagpur', desc: 'Serene lake garden perfect for evening walks', gradient: 'from-sky-50 to-blue-50', accent: 'text-sky-600' },
  { name: 'Marine Drive', type: 'Beach', emoji: '🌅', city: 'Mumbai', desc: 'The Queen\'s Necklace at golden hour', gradient: 'from-pink-50 to-rose-50', accent: 'text-pink-600' },
  { name: 'Hauz Khas Village', type: 'Cafe', emoji: '🎨', city: 'Delhi', desc: 'Indie cafes, art galleries, and a medieval lake', gradient: 'from-purple-50 to-fuchsia-50', accent: 'text-purple-600' },
  { name: 'Koramangala Social', type: 'Cafe', emoji: '🎵', city: 'Bangalore', desc: 'Live music, great food, vibrant crowd', gradient: 'from-indigo-50 to-blue-50', accent: 'text-indigo-600' },
]

const EXPERIENCE_TAGS = [
  { label: 'Coffee Dates', emoji: '☕', tag: 'coffee' },
  { label: 'Food Trails', emoji: '🍛', tag: 'food' },
  { label: 'Heritage Walks', emoji: '🏛️', tag: 'heritage' },
  { label: 'Art & Culture', emoji: '🎨', tag: 'art' },
  { label: 'Nature & Treks', emoji: '🌿', tag: 'trekking' },
  { label: 'Music & Nightlife', emoji: '🎵', tag: 'music' },
  { label: 'Yoga & Wellness', emoji: '🧘', tag: 'yoga' },
  { label: 'Shopping', emoji: '🛍️', tag: 'shopping' },
]

function useDebounce(value, delay) {
  const [d, setD] = useState(value)
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t) }, [value, delay])
  return d
}

function CompanionCard({ companion, index, featured = false }) {
  const [liked, setLiked] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.4), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={featured ? 'col-span-2 row-span-2' : ''}
    >
      <Link href={`/companion/${companion.id}`} className="block group relative">
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-100 to-purple-100 shadow-md border border-white/60 card-img-zoom ${featured ? 'aspect-[4/5]' : 'aspect-[3/4]'}`}>
          {companion.photos?.[0] ? (
            <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover card-img transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100">🌸</div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full shadow-sm">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 stroke-0" />
              <span className="text-[11px] font-bold text-gray-900">{companion.averageRating?.toFixed(1)}</span>
            </div>
            <button
              onClick={e => { e.preventDefault(); setLiked(v => !v) }}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm transition-all duration-200 active:scale-90"
            >
              <Heart className={`w-4 h-4 transition-colors duration-200 ${liked ? 'fill-pink-500 text-pink-500' : 'text-gray-500'}`} />
            </button>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3.5">
            <p className="text-white font-heading font-bold text-base leading-tight">{companion.displayName}, {companion.age}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-pink-300 shrink-0" />
              <p className="text-white/70 text-[11px] truncate">{companion.district ? `${companion.district}, ` : ''}{companion.city}</p>
            </div>
            {companion.tags?.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {companion.tags.slice(0, featured ? 3 : 2).map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-[10px] text-white border border-white/15 capitalize">{tag}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <p className="text-white/85 text-xs font-semibold">₹{companion.hourlyRate?.toLocaleString('en-IN')}/hr</p>
              {featured && (
                <span className="px-2.5 py-1 bg-hana-gradient rounded-full text-[10px] text-white font-semibold shadow-md">Book Now →</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function DiscoverInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [district, setDistrict] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('rating')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [activeSection, setActiveSection] = useState('all')

  const debouncedSearch = useDebounce(search, 300)
  const userCity = user?.city || ''

  const isSearching = !!(debouncedSearch || city || district || selectedTags.length)

  const { data: allCompanions, isLoading } = trpc.companion.getAll.useQuery({
    search: debouncedSearch || undefined,
    city: city || undefined,
    district: district || undefined,
    tags: selectedTags.length ? selectedTags : undefined,
    sortBy,
  })

  const { data: cityCompanions } = trpc.companion.getAll.useQuery(
    { city: userCity, sortBy: 'rating' },
    { enabled: !!userCity && !isSearching }
  )

  const { data: interestCompanions } = trpc.companion.getAll.useQuery(
    { tags: user?.tags || [], sortBy: 'rating' },
    { enabled: !!(user?.tags?.length) && !isSearching }
  )

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  const clearAll = () => { setSearch(''); setCity(''); setDistrict(''); setSelectedTags([]); setSortBy('rating') }
  const hasActiveFilters = city || district || selectedTags.length > 0 || search
  const activeSort = SORT_OPTIONS.find(o => o.value === sortBy)

  const SECTIONS = [
    { id: 'all', label: 'All' },
    { id: 'city', label: userCity ? `In ${userCity}` : 'In Your City' },
    { id: 'interests', label: 'Your Interests' },
    { id: 'places', label: 'Places' },
  ]

  const displayCompanions = isSearching ? allCompanions :
    activeSection === 'city' ? cityCompanions :
    activeSection === 'interests' ? interestCompanions :
    allCompanions

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[5%] right-[-8%] w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-[15%] left-[-8%] w-[450px] h-[450px] bg-purple-200/10 rounded-full blur-[100px] animate-float-slow" />
      </div>

      <TopNav />

      <div className="max-w-7xl mx-auto md:px-6 md:py-8 relative z-10">

        {/* Header */}
        <header className="px-5 pt-14 pb-3 md:pt-0 md:px-0 md:pb-0 md:mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold gradient-text-blush">Discover People</h1>
              <p className="text-xs md:text-sm text-[var(--hana-muted)] mt-0.5">
                {isLoading ? 'Searching...' : `${displayCompanions?.length ?? 0} companions found`}
              </p>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <div className="px-5 md:px-0 mt-4 md:mt-0 mb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--hana-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, city, area, or interest..."
              className="w-full pl-11 pr-11 py-3.5 bg-white border border-[var(--hana-subtle)]/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] shadow-sm transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--hana-muted)] hover:text-[var(--hana-ash)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Section tabs — only when not searching */}
        {!isSearching && (
          <div className="px-5 md:px-0 flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-250 btn-press ${
                  activeSection === s.id
                    ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20'
                    : 'bg-white border border-[var(--hana-subtle)]/50 text-[var(--hana-ash)] hover:border-pink-300'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Filter + Sort bar */}
        <div className="px-5 md:px-0 flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setShowFilters(v => !v)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-250 btn-press shrink-0 ${
              showFilters || hasActiveFilters
                ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20'
                : 'bg-white border border-[var(--hana-subtle)]/50 text-[var(--hana-ash)] hover:border-pink-300'
            }`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {(selectedTags.length > 0 || city || district) && (
              <span className="bg-white/30 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {[city ? 1 : 0, district ? 1 : 0, selectedTags.length].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          <div className="relative shrink-0">
            <button onClick={() => setShowSort(v => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-white border border-[var(--hana-subtle)]/50 text-[var(--hana-ash)] hover:border-pink-300 transition-all btn-press">
              <span>{activeSort?.label}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-xl border border-[var(--hana-subtle)]/30 overflow-hidden z-50 min-w-[180px]">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSort(false) }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-[var(--hana-ivory)] ${sortBy === opt.value ? 'text-pink-600 font-semibold bg-pink-50/50' : 'text-[var(--hana-ash)]'}`}>
                      {opt.label}
                      {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-pink-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {city && (
            <button onClick={() => setCity('')} className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-pink-100 text-pink-700 border border-pink-200 whitespace-nowrap shrink-0 btn-press">
              {city} <X className="w-3 h-3" />
            </button>
          )}
          {selectedTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 whitespace-nowrap shrink-0 btn-press">
              {tag} <X className="w-3 h-3" />
            </button>
          ))}
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-[var(--hana-muted)] hover:text-red-500 whitespace-nowrap shrink-0 transition-colors px-2">
              Clear all
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden px-5 md:px-0 mb-4">
              <div className="bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm p-5 space-y-5">
                <div>
                  <p className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-2.5">City</p>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map(c => (
                      <button key={c} onClick={() => setCity(city === c ? '' : c)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press ${
                          city === c ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20' : 'bg-[var(--hana-ivory)] text-[var(--hana-ash)] border border-[var(--hana-subtle)]/40 hover:border-pink-300'
                        }`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-2.5">Area / District</p>
                  <input type="text" value={district} onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Bandra, Koramangala, Civil Lines..."
                    className="w-full px-4 py-2.5 bg-[var(--hana-ivory)] border border-[var(--hana-subtle)]/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-2.5">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(tag => (
                      <button key={tag} onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200 btn-press ${
                          selectedTags.includes(tag) ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20' : 'bg-[var(--hana-ivory)] text-[var(--hana-ash)] border border-[var(--hana-subtle)]/40 hover:border-pink-300'
                        }`}>{tag}</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button onClick={clearAll} className="px-4 py-2 text-sm text-[var(--hana-muted)] hover:text-red-500 transition-colors">Clear all</button>
                  <button onClick={() => setShowFilters(false)} className="px-5 py-2 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-md shadow-pink-500/20 btn-press">Apply</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Places section */}
        {!isSearching && activeSection === 'places' && (
          <div className="px-5 md:px-0 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLACES.map(place => (
                <div key={place.name} className="bg-white rounded-2xl p-4 border border-[var(--hana-subtle)]/30 shadow-sm hover-card">
                  <div className="text-2xl mb-2">{place.emoji}</div>
                  <div className="text-[10px] font-bold text-[var(--hana-blush-dark)] uppercase tracking-wider mb-1">{place.type} · {place.city}</div>
                  <h3 className="font-semibold text-[var(--hana-charcoal)] text-sm leading-tight">{place.name}</h3>
                  <p className="text-[var(--hana-muted)] text-xs mt-1 leading-relaxed">{place.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Companion grid */}
        {activeSection !== 'places' && (
          <div className="px-5 md:px-0 pb-28 md:pb-8">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-2xl" />)}
              </div>
            ) : displayCompanions?.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-2">No companions found</h3>
                <p className="text-[var(--hana-muted)] text-sm max-w-xs">Try adjusting your search or filters.</p>
                <button onClick={clearAll} className="mt-5 px-6 py-2.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-md shadow-pink-500/20 btn-press">Clear Filters</button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {displayCompanions?.map((companion, i) => (
                  <CompanionCard key={companion.id} companion={companion} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showSort && <div className="fixed inset-0 z-40" onClick={() => setShowSort(false)} />}
      <BottomNav />
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" /></div>}>
      <DiscoverInner />
    </Suspense>
  )
}

'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  Beer,
  Bird,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Heart,
  Leaf,
  MapPin,
  Music2,
  Palette,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  Star,
  Sun,
  Trees,
  Waves,
  X,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getCompanions } from '@/app/actions/companions'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { useAuthStore } from '@/lib/auth-store'
import { formatINR } from '@/lib/format-currency'
import { getImageUrl } from '@/lib/image-url'
import PersonalizedCompanionsSection from '@/components/recommendations/PersonalizedCompanionsSection'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Pune', 'Kochi', 'Varanasi', 'Nagpur', 'Amritsar', 'Lucknow', 'Ahmedabad', 'Coimbatore', 'Thiruvananthapuram']
const INTERESTS = ['food', 'cafes', 'music', 'art', 'fitness', 'yoga', 'heritage', 'culture', 'wildlife', 'photography', 'shopping', 'spirituality', 'trekking', 'cricket', 'textiles', 'coffee', 'nightlife', 'books']
const SORT_OPTIONS = [
  { value: 'random', label: 'Fresh mix' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]
const PLACES = [
  { name: 'Irani Cafe', type: 'Cafe', icon: Coffee, city: 'Pune', desc: 'Colonial-era cafe with bun maska and chai' },
  { name: 'Toit Brewpub', type: 'Cafe', icon: Beer, city: 'Bangalore', desc: 'Craft beer and great food in Indiranagar' },
  { name: 'Lodhi Garden', type: 'Park', icon: Trees, city: 'Delhi', desc: 'Historic Mughal tombs amid lush greenery' },
  { name: 'Cubbon Park', type: 'Park', icon: Leaf, city: 'Bangalore', desc: 'Green lung of the city, perfect for walks' },
  { name: 'Versova Beach', type: 'Beach', icon: Waves, city: 'Mumbai', desc: 'Quiet fishing village beach at sunset' },
  { name: 'Cha Bar', type: 'Cafe', icon: BookOpen, city: 'Delhi', desc: 'Over 100 teas in a bookstore setting' },
  { name: 'Sanjay Gandhi NP', type: 'Park', icon: Bird, city: 'Mumbai', desc: 'Leopards, caves, and forest trails' },
  { name: 'Bylanes Cafe', type: 'Cafe', icon: Coffee, city: 'Nagpur', desc: 'Cozy cafe in the heart of the orange city' },
  { name: 'Ambazari Lake', type: 'Park', icon: Waves, city: 'Nagpur', desc: 'Serene lake garden perfect for evening walks' },
  { name: 'Marine Drive', type: 'Beach', icon: Sun, city: 'Mumbai', desc: 'The Queen\'s Necklace at golden hour' },
  { name: 'Hauz Khas Village', type: 'Cafe', icon: Palette, city: 'Delhi', desc: 'Indie cafes, art galleries, and a medieval lake' },
  { name: 'Koramangala Social', type: 'Cafe', icon: Music2, city: 'Bangalore', desc: 'Live music, great food, vibrant crowd' },
]

const EASE = [0.16, 1, 0.3, 1]
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf6]'

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timeout)
  }, [value, delay])

  return debouncedValue
}

function CompanionCard({ companion, index, featured, compact = false }) {
  const [liked, setLiked] = useState(false)
  const rating = companion.averageRating?.toFixed(1) ?? 'New'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.985 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.035, 0.22), ease: EASE, layout: { duration: 0.3 } }}
      className="group relative h-full min-h-0 overflow-hidden rounded-[1.6rem] bg-[#f8dfe4] shadow-[0_18px_45px_-26px_rgba(115,48,66,0.65)] ring-1 ring-[#ead8d5]"
    >
      <Link
        href={`/companion/${companion.id}`}
        aria-label={`View ${companion.displayName}'s profile`}
        className={`relative block h-full w-full overflow-hidden ${focusRing}`}
      >
        {companion.photos?.[0] ? (
          <img
            src={getImageUrl(companion.photos[0])}
            alt={`${companion.displayName} in ${companion.city}`}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f9e2e6]" aria-hidden="true">
            <Heart className="h-12 w-12 fill-[#eaa5b5] text-[#d97891]" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#2c171d]/95 via-[#2c171d]/18 to-transparent" />
        <div className="absolute left-3 top-3 flex min-h-9 items-center gap-1.5 rounded-full bg-[#fffaf6]/95 px-3 text-xs font-bold text-[#38242a] shadow-[0_8px_24px_-12px_rgba(59,24,34,0.7)] backdrop-blur-md">
          <Star className="h-3.5 w-3.5 fill-[#d78c3d] text-[#d78c3d]" aria-hidden="true" />
          <span className="tabular-nums">{rating}</span>
        </div>

        <div className={`absolute inset-x-0 bottom-0 ${featured ? 'p-4 sm:p-6' : compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h2 className={`truncate font-heading font-bold tracking-[-0.02em] text-white ${featured ? 'text-lg sm:text-2xl' : compact ? 'text-sm sm:text-base' : 'text-base'}`}>
                {companion.displayName}{companion.age ? `, ${companion.age}` : ''}
              </h2>
              {!compact && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-white/75">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f4a9b8]" aria-hidden="true" />
                  <span className="truncate">{companion.district ? `${companion.district}, ` : ''}{companion.city}</span>
                </p>
              )}
            </div>
            <span className="shrink-0 text-right text-xs font-bold tabular-nums text-white sm:text-sm">
              {formatINR(companion.hourlyRate)}<span className="text-[9px] font-medium text-white/65 sm:text-[10px]">/hr</span>
            </span>
          </div>

          {!compact && companion.tags?.length > 0 && (
            <div className="mb-3 mt-2 hidden flex-wrap gap-1.5 sm:flex">
              {companion.tags.slice(0, featured ? 4 : 2).map((tag) => (
                <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-medium capitalize text-white/90 backdrop-blur-sm">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {!compact && (
            <div className="mt-2 flex min-h-10 items-center justify-between border-t border-white/15 pt-2.5 text-xs font-semibold text-white">
              <span>View profile</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8567f] transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          )}
        </div>
      </Link>

      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={() => setLiked((value) => !value)}
        aria-label={liked ? `Remove ${companion.displayName} from favourites` : `Add ${companion.displayName} to favourites`}
        aria-pressed={liked}
        className={`absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf6]/95 shadow-[0_8px_24px_-12px_rgba(59,24,34,0.7)] backdrop-blur-md transition-colors ${focusRing}`}
      >
        <Heart className={`h-5 w-5 transition-colors ${liked ? 'fill-[#df4f78] text-[#df4f78]' : 'text-[#765f66]'}`} aria-hidden="true" />
      </motion.button>
    </motion.article>
  )
}

function CompanionRailCard({ companion, index }) {
  const [liked, setLiked] = useState(false)
  const rating = companion.averageRating?.toFixed(1) ?? 'New'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.2), ease: EASE }}
      whileHover={{ y: -3 }}
      className="w-[54vw] max-w-[12rem] shrink-0 snap-start sm:w-44 lg:w-40 xl:w-44"
    >
      <div className="group relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-[#f4e4e5] ring-1 ring-[#ead8d5]">
        <Link href={`/companion/${companion.id}`} aria-label={`View ${companion.displayName}'s profile`} className={`block size-full ${focusRing}`}>
          {companion.photos?.[0] ? (
            <img src={getImageUrl(companion.photos[0])} alt={`${companion.displayName} in ${companion.city}`} className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          ) : (
            <span className="flex size-full items-center justify-center bg-[#f9e2e6]" aria-hidden="true"><Heart className="h-10 w-10 fill-[#eaa5b5] text-[#d97891]" /></span>
          )}
        </Link>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => setLiked((value) => !value)}
          aria-label={liked ? `Remove ${companion.displayName} from favourites` : `Add ${companion.displayName} to favourites`}
          aria-pressed={liked}
          className={`absolute right-2.5 top-2.5 flex size-11 items-center justify-center rounded-full bg-white/92 text-[#5f4d53] shadow-[0_8px_22px_-12px_rgba(49,26,33,0.7)] backdrop-blur-md ${focusRing}`}
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-[#df4f78] text-[#df4f78]' : 'text-[#5f4d53]'}`} aria-hidden="true" />
        </motion.button>
      </div>

      <Link href={`/companion/${companion.id}`} className={`mt-3 block rounded-lg text-[#352329] ${focusRing}`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold tracking-[-0.01em]">{companion.displayName}{companion.age ? `, ${companion.age}` : ''}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium tabular-nums"><Star className="h-3.5 w-3.5 fill-[#352329] text-[#352329]" aria-hidden="true" />{rating}</span>
        </div>
        <p className="mt-1 truncate text-xs text-[#806970]">{companion.district ? `${companion.district}, ` : ''}{companion.city}</p>
        <p className="mt-1.5 text-sm font-semibold tabular-nums text-[#352329]">{formatINR(companion.hourlyRate)} <span className="font-normal text-[#806970]">per hour</span></p>
      </Link>
    </motion.article>
  )
}

function FeaturedCompanionMosaic({ companions }) {
  const [lead, ...supporting] = companions.slice(0, 5)
  if (!lead) return null

  return (
    <section aria-labelledby="featured-companions-heading">
      <div className="mb-3 flex items-center gap-1.5">
        <h2 id="featured-companions-heading" className="font-heading text-lg font-bold tracking-[-0.025em] text-[#38232a] sm:text-xl">Featured companions</h2>
        <ChevronRight className="h-4 w-4 text-[#9e7a84]" aria-hidden="true" />
      </div>
      <div className={`grid gap-3 ${supporting.length ? 'md:grid-cols-2' : ''}`}>
        <div className="aspect-[3/4] min-w-0"><CompanionCard companion={lead} index={0} featured /></div>
        {supporting.length > 0 && (
          <div className="grid min-w-0 grid-cols-2 gap-3">
            {supporting.map((companion, index) => (
              <div key={companion.id} className="aspect-[3/4] min-w-0"><CompanionCard companion={companion} index={index + 1} compact /></div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CompanionCollection({ collection }) {
  const railRef = useRef(null)

  const moveRail = (direction) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: direction * Math.max(rail.clientWidth * 0.82, 320), behavior: 'smooth' })
  }

  return (
    <section aria-labelledby={`companions-${collection.id}`}>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 id={`companions-${collection.id}`} className="truncate font-heading text-lg font-bold tracking-[-0.025em] text-[#38232a] sm:text-xl">{collection.title}</h2>
          <ChevronRight className="h-4 w-4 shrink-0 text-[#9e7a84]" aria-hidden="true" />
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" onClick={() => moveRail(-1)} aria-label={`Show previous ${collection.title.toLowerCase()}`} className={`flex size-11 items-center justify-center rounded-full border border-[#e4d3d0] bg-[#fffdf9] text-[#5f4d53] shadow-sm transition-colors hover:border-[#d7a7b3] hover:bg-[#fff5f2] ${focusRing}`}>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => moveRail(1)} aria-label={`Show more ${collection.title.toLowerCase()}`} className={`flex size-11 items-center justify-center rounded-full border border-[#e4d3d0] bg-[#fffdf9] text-[#5f4d53] shadow-sm transition-colors hover:border-[#d7a7b3] hover:bg-[#fff5f2] ${focusRing}`}>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={railRef} className="-mx-4 flex snap-x snap-proximity gap-3.5 overflow-x-auto scroll-smooth px-4 pb-3 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collection.items.map((companion, index) => <CompanionRailCard key={companion.id} companion={companion} index={index} />)}
      </div>
    </section>
  )
}

function CompanionResults({ companions, featuredCompanions = [] }) {
  const featured = (featuredCompanions.length ? featuredCompanions : [...companions].sort((a, b) => Number(b.hourlyRate) - Number(a.hourlyRate))).slice(0, 5)
  const rankingPool = companions
  const ratingOf = (companion) => Number(companion.averageRating) || 0
  const bookingsOf = (companion) => Math.max(Number(companion.totalBookings) || 0, Number(companion.completedBookings) || 0, Number(companion._count?.bookings) || 0)
  const reviewsOf = (companion) => Math.max(Number(companion.totalReviews) || 0, Number(companion._count?.reviews) || 0)
  const nameOf = (companion) => companion.displayName || ''
  const byRatingThenName = (a, b) => ratingOf(b) - ratingOf(a) || nameOf(a).localeCompare(nameOf(b))
  const takeSeven = (compare) => [...rankingPool].sort(compare).slice(0, 7)

  const collections = [
    {
      id: 'top-rated',
      title: 'Top rated companions',
      items: takeSeven(byRatingThenName),
    },
    {
      id: 'most-booked',
      title: 'Most booked this season',
      items: takeSeven((a, b) => bookingsOf(b) - bookingsOf(a) || byRatingThenName(a, b)),
    },
    {
      id: 'best-value',
      title: 'Best value experiences',
      items: takeSeven((a, b) => Number(a.hourlyRate) - Number(b.hourlyRate) || byRatingThenName(a, b)),
    },
    {
      id: 'most-reviewed',
      title: 'Community favourites',
      items: takeSeven((a, b) => reviewsOf(b) - reviewsOf(a) || byRatingThenName(a, b)),
    },
    {
      id: 'new-on-hana',
      title: 'New on Hana',
      items: takeSeven((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || byRatingThenName(a, b)),
    },
  ]

  return (
    <div className="space-y-9">
      <FeaturedCompanionMosaic companions={featured} />
      {collections.map((collection) => <CompanionCollection key={collection.id} collection={collection} />)}
    </div>
  )
}

function LoadingMosaic() {
  return (
    <div className="space-y-9" aria-label="Loading companions">
      <div>
        <div className="mb-3 h-6 w-44 rounded-lg skeleton" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="aspect-[3/4] rounded-[1.6rem] skeleton" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="aspect-[3/4] rounded-[1.4rem] skeleton" />)}
          </div>
        </div>
      </div>
      <div>
        <div className="mb-3 h-6 w-52 rounded-lg skeleton" />
        <div className="flex gap-3.5 overflow-hidden">
          {Array.from({ length: 7 }).map((_, index) => <div key={index} className="aspect-[3/5] w-40 shrink-0 rounded-[1.25rem] skeleton sm:w-44 lg:w-40 xl:w-44" />)}
        </div>
      </div>
    </div>
  )
}

function PlaceIcon({ icon: Icon }) {
  return <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
}

function PlacesGrid() {
  return (
    <motion.section
      key="places"
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: EASE }}
      aria-label="Places to explore"
      className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.75rem] bg-[#e8d4d1] ring-1 ring-[#e8d4d1] sm:grid-cols-2 lg:grid-cols-3"
    >
      {PLACES.map((place, index) => (
        <motion.article
          layout
          key={place.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.025, ease: EASE }}
          className={`group relative min-h-48 overflow-hidden p-5 transition-colors duration-300 hover:bg-[#f9e7e8] sm:p-6 ${index % 3 === 1 ? 'bg-[#fff8f2]' : 'bg-[#fffdf9]'}`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5d9df] text-[#ad4563] transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105">
              <PlaceIcon icon={place.icon} />
            </span>
            <span className="rounded-full border border-[#ead8d5] bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9e3e5a]">{place.city}</span>
          </div>
          <div className="mt-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b44968]">{place.type} · {place.city}</p>
            <h2 className="mt-2 font-heading text-xl font-bold tracking-[-0.02em] text-[#352329]">{place.name}</h2>
            <p className="mt-2 max-w-[34ch] text-sm leading-6 text-[#806970]">{place.desc}</p>
          </div>
        </motion.article>
      ))}
    </motion.section>
  )
}

function DiscoverInner() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user

  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [district, setDistrict] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('random')
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  const [activeSection, setActiveSection] = useState('all')

  const debouncedSearch = useDebounce(search, 300)
  const userCity = user?.city || ''
  const userTags = user?.tags || []
  const isSearching = Boolean(debouncedSearch || city || district || selectedTags.length)

  const allQuery = useQuery({
    queryKey: ['companions', debouncedSearch, city, district, selectedTags, sortBy],
    queryFn: () => getCompanions({
      search: debouncedSearch || undefined,
      city: city || undefined,
      district: district || undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      sortBy,
    }),
  })

  const featuredQuery = useQuery({
    queryKey: ['companions', 'featured-highest-rate'],
    queryFn: () => getCompanions({ sortBy: 'price_desc', limit: 5 }),
    staleTime: 60_000,
  })

  const cityQuery = useQuery({
    queryKey: ['companions', 'city', userCity],
    queryFn: () => getCompanions({ city: userCity, sortBy: 'rating' }),
    enabled: Boolean(userCity) && !isSearching,
  })

  const interestQuery = useQuery({
    queryKey: ['companions', 'interests', userTags],
    queryFn: () => getCompanions({ tags: userTags, sortBy: 'rating' }),
    enabled: Boolean(userTags.length) && !isSearching,
  })

  const sections = [
    { id: 'all', label: 'All companions' },
    { id: 'city', label: userCity ? `In ${userCity}` : 'In your city' },
    { id: 'interests', label: 'Your interests' },
    { id: 'places', label: 'Places' },
  ]

  const selectedQuery = isSearching || activeSection === 'all'
    ? allQuery
    : activeSection === 'city'
      ? cityQuery
      : interestQuery
  const displayCompanions = selectedQuery.data ?? []
  const displayLoading = activeSection === 'places' && !isSearching ? false : selectedQuery.isLoading
  const displayError = activeSection === 'places' && !isSearching ? null : selectedQuery.error
  const resultCount = activeSection === 'places' && !isSearching
    ? PLACES.length
    : displayCompanions?.length ?? 0
  const activeSort = SORT_OPTIONS.find((option) => option.value === sortBy)
  const hasActiveFilters = Boolean(city || district || selectedTags.length || search)

  const toggleTag = (tag) => {
    setSelectedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
  }

  const handleSearch = (value) => {
    setSearch(value)
    if (value) setActiveSection('all')
  }

  const clearAll = () => {
    setSearch('')
    setCity('')
    setDistrict('')
    setSelectedTags([])
    setSortBy('random')
    setActiveSection('all')
  }

  return (
    <div className="min-h-screen bg-[#fffaf6] text-[#352329]">
      <TopNav />

      <main className="mx-auto max-w-7xl px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pt-8">
        <motion.header
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative overflow-hidden rounded-[1.8rem] border border-[#ead8d5] bg-[#f8e7e7] p-5 shadow-[0_24px_70px_-46px_rgba(126,54,73,0.65)] sm:p-7"
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[28px] border-[#f3cbd2]/70" aria-hidden="true" />
          <div className="relative grid items-end gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(24rem,1.15fr)]">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ad4563]">
                <Compass className="h-4 w-4" aria-hidden="true" />
                Find your kind of company
              </div>
              <h1 className="max-w-xl font-heading text-3xl font-bold leading-[1.05] tracking-[-0.04em] text-[#38232a] sm:text-4xl">
                Discover people, then make a plan.
              </h1>
              <p className="mt-3 text-sm text-[#806970]" aria-live="polite">
                {displayLoading ? 'Finding companions…' : `${resultCount} ${activeSection === 'places' && !isSearching ? 'places to explore' : 'companions found'}`}
              </p>
            </div>

            <div className="relative">
              <label htmlFor="discover-search" className="sr-only">Search companions</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b0526d]" aria-hidden="true" />
              <input
                id="discover-search"
                type="search"
                value={search}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search a name, city, area, or interest"
                className={`min-h-14 w-full rounded-2xl border border-[#dfc5c4] bg-[#fffdf9] pl-12 pr-14 text-sm text-[#352329] shadow-[0_12px_30px_-24px_rgba(105,40,58,0.7)] placeholder:text-[#9c858a] transition duration-200 hover:border-[#d99cad] ${focusRing}`}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => handleSearch('')}
                    aria-label="Clear search"
                    className={`absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-[#806970] transition-colors hover:bg-[#f8e7e7] hover:text-[#a73e5d] ${focusRing}`}
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>

        {!isSearching && activeSection === 'all' && (
          <PersonalizedCompanionsSection userId={user?.id} />
        )}

        <section className="relative z-30 mt-5" aria-label="Discovery controls">
          <nav className="flex gap-2 overflow-x-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Discovery sections">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                aria-pressed={activeSection === section.id}
                className={`relative min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${focusRing} ${activeSection === section.id ? 'text-white' : 'border border-[#e6d5d2] bg-[#fffdf9] text-[#755f65] hover:border-[#d99cad] hover:text-[#9e3e5a]'}`}
              >
                {activeSection === section.id && (
                  <motion.span layoutId="active-discovery-section" className="absolute inset-0 rounded-full bg-[#c94f72] shadow-[0_10px_24px_-14px_rgba(177,51,87,0.9)]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className="relative">{section.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
              className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${focusRing} ${showFilters || hasActiveFilters ? 'bg-[#3f2930] text-white' : 'border border-[#e6d5d2] bg-[#fffdf9] text-[#755f65] hover:border-[#d99cad]'}`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {(selectedTags.length > 0 || city || district) && (
                <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#f3b9c6] px-1.5 text-[10px] font-bold text-[#572c38]">
                  {(city ? 1 : 0) + (district ? 1 : 0) + selectedTags.length}
                </span>
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSort((value) => !value)}
                aria-expanded={showSort}
                className={`flex min-h-11 items-center gap-2 rounded-full border border-[#e6d5d2] bg-[#fffdf9] px-4 text-sm font-semibold text-[#755f65] transition-colors hover:border-[#d99cad] ${focusRing}`}
              >
                {activeSort?.label}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-56 overflow-hidden rounded-2xl border border-[#e8d5d3] bg-[#fffdf9] p-1.5 shadow-[0_22px_55px_-24px_rgba(83,34,48,0.65)] sm:left-auto sm:right-0"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => { setSortBy(option.value); setShowSort(false) }}
                        className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left text-sm transition-colors ${focusRing} ${sortBy === option.value ? 'bg-[#f8e3e7] font-semibold text-[#a53e5c]' : 'text-[#755f65] hover:bg-[#fff3ef]'}`}
                      >
                        {option.label}
                        {sortBy === option.value && <Check className="h-4 w-4 text-[#c94f72]" aria-hidden="true" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="popLayout">
              {city && (
                <motion.button layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} type="button" onClick={() => setCity('')} className={`flex min-h-11 items-center gap-1.5 rounded-full bg-[#f8e3e7] px-3 text-xs font-semibold text-[#9e3e5a] ${focusRing}`}>
                  {city}<X className="h-3.5 w-3.5" aria-hidden="true" />
                </motion.button>
              )}
              {selectedTags.map((tag) => (
                <motion.button layout key={tag} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} type="button" onClick={() => toggleTag(tag)} className={`flex min-h-11 items-center gap-1.5 rounded-full bg-[#f4eadb] px-3 text-xs font-semibold capitalize text-[#825f36] ${focusRing}`}>
                  {tag}<X className="h-3.5 w-3.5" aria-hidden="true" />
                </motion.button>
              ))}
            </AnimatePresence>

            {hasActiveFilters && (
              <button type="button" onClick={clearAll} className={`min-h-11 px-2 text-xs font-semibold text-[#8d7379] transition-colors hover:text-[#b13f60] ${focusRing}`}>
                Clear all
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showFilters && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-[1.6rem] border border-[#ead8d5] bg-[#fffdf9] p-5 shadow-[0_20px_50px_-38px_rgba(91,42,54,0.55)] sm:p-6">
                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <fieldset>
                      <legend className="mb-3 text-xs font-bold tracking-[0.08em] text-[#9e3e5a]">Choose a city</legend>
                      <div className="flex flex-wrap gap-2">
                        {CITIES.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setCity(city === option ? '' : option)}
                            aria-pressed={city === option}
                            className={`min-h-11 rounded-full px-3.5 text-xs font-semibold transition-colors ${focusRing} ${city === option ? 'bg-[#c94f72] text-white' : 'bg-[#fff5f0] text-[#755f65] ring-1 ring-[#ebdbd5] hover:ring-[#d99cad]'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div>
                      <label htmlFor="discover-district" className="mb-3 block text-xs font-bold tracking-[0.08em] text-[#9e3e5a]">Area or district</label>
                      <input
                        id="discover-district"
                        type="text"
                        value={district}
                        onChange={(event) => setDistrict(event.target.value)}
                        placeholder="Bandra, Koramangala, Civil Lines…"
                        className={`min-h-12 w-full rounded-xl border border-[#e7d5d1] bg-[#fff8f2] px-4 text-sm text-[#352329] placeholder:text-[#9c858a] transition-colors hover:border-[#d99cad] ${focusRing}`}
                      />
                    </div>
                  </div>

                  <fieldset className="mt-6 border-t border-[#eee0dc] pt-5">
                    <legend className="mb-3 text-xs font-bold tracking-[0.08em] text-[#9e3e5a]">Add interests</legend>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          aria-pressed={selectedTags.includes(tag)}
                          className={`min-h-11 rounded-full px-3.5 text-xs font-semibold capitalize transition-colors ${focusRing} ${selectedTags.includes(tag) ? 'bg-[#3f2930] text-white' : 'bg-[#fff5f0] text-[#755f65] ring-1 ring-[#ebdbd5] hover:ring-[#d99cad]'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="mt-6 flex justify-end gap-2 border-t border-[#eee0dc] pt-4">
                    <button type="button" onClick={clearAll} className={`min-h-11 rounded-xl px-4 text-sm font-semibold text-[#806970] transition-colors hover:bg-[#fff3ef] hover:text-[#ad4563] ${focusRing}`}>Clear all</button>
                    <button type="button" onClick={() => setShowFilters(false)} className={`min-h-11 rounded-xl bg-[#c94f72] px-5 text-sm font-semibold text-white shadow-[0_12px_28px_-16px_rgba(177,51,87,0.9)] transition-colors hover:bg-[#b94465] ${focusRing}`}>Show results</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="mt-6" aria-live="polite" aria-busy={displayLoading}>
          <AnimatePresence mode="wait" initial={false}>
            {activeSection === 'places' && !isSearching ? (
              <PlacesGrid />
            ) : displayLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingMosaic />
              </motion.div>
            ) : displayError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[1.75rem] border border-[#e8d4d1] bg-[#fff3ef] px-6 py-14 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f6d9df] text-[#ad4563]" aria-hidden="true"><RotateCcw className="h-5 w-5" /></div>
                <h2 className="mt-4 font-heading text-xl font-bold text-[#38232a]">We couldn’t load companions</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#806970]">{displayError.message || 'The connection failed. Try the search again.'}</p>
                <button type="button" onClick={() => selectedQuery.refetch()} className={`mt-5 min-h-11 rounded-full bg-[#c94f72] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#b94465] ${focusRing}`}>Try again</button>
              </motion.div>
            ) : displayCompanions?.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-[1.75rem] border border-[#ead8d5] bg-[#fffdf9] px-6 py-16 text-center"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f8e3e7] text-[#ad4563]" aria-hidden="true"><SearchX className="h-6 w-6" /></div>
                <h2 className="mt-4 font-heading text-xl font-bold text-[#38232a]">No companions match yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#806970]">Broaden the city, area, or interests and we’ll look again.</p>
                <button type="button" onClick={clearAll} className={`mt-5 min-h-11 rounded-full bg-[#3f2930] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#543940] ${focusRing}`}>Clear filters</button>
              </motion.div>
            ) : (
              <motion.div
                key={`companions-${isSearching ? 'search' : activeSection}-${sortBy}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.26, ease: EASE }}
              >
                <CompanionResults companions={displayCompanions} featuredCompanions={featuredQuery.data ?? []} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>
        {showSort && (
          <motion.button
            type="button"
            aria-label="Close sort menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSort(false)}
            className="fixed inset-0 z-20 cursor-default bg-transparent"
          />
        )}
      </AnimatePresence>
      <BottomNav />
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#fffaf6]"><div className="h-9 w-9 animate-spin rounded-full border-2 border-[#c94f72] border-t-transparent" /></div>}>
      <DiscoverInner />
    </Suspense>
  )
}

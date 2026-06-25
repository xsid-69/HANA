'use client'

import { Star, ArrowLeft, Heart, MapPin, Share2, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/layout/BottomNav'
import { saveLastCompanion } from '@/lib/session-companion'
import { getImageUrl } from '@/lib/image-url'

export default function CompanionProfileClient({ companion, isOwnProfile }) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)

  const handleBook = () => {
    saveLastCompanion(companion)
    router.push(`/bookings?companionId=${companion.id}`)
  }

  return (
    <div className="min-h-screen bg-[#F9F0F4] md:bg-transparent relative">

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden pb-28 relative z-10">

        {/* Hero Image */}
        <div className="relative h-[440px] w-full overflow-hidden">
          {companion.photos?.[0] ? (
            <img
              src={getImageUrl(companion.photos[0])}
              alt={companion.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-7xl">
              {companion.experiences?.[0]?.emoji || '🌸'}
            </div>
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/75" />

          {/* Top controls */}
          <div className="absolute top-12 left-4 right-4 flex justify-between">
            <motion.button
              onClick={() => router.back()}
              whileTap={{ scale: 0.88 }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.88 }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-lg"
              >
                <Share2 className="w-4.5 h-4.5 text-white" />
              </motion.button>
              <motion.button
                onClick={() => setLiked(!liked)}
                whileTap={{ scale: 0.88 }}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-lg"
              >
                <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Heart className={`w-5 h-5 transition-colors duration-300 ${liked ? 'text-pink-400 fill-pink-400' : 'text-white'}`} />
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Rating badge */}
          <div className="absolute bottom-[96px] left-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
            >
              <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-bold text-white">{companion.averageRating?.toFixed(2) || '0.00'}</span>
              <span className="text-[10px] text-white/80">· {companion.totalReviews || 0} reviews</span>
            </motion.div>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-5 left-5 right-5">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-[2rem] font-bold text-white drop-shadow-lg leading-tight"
            >
              {companion.displayName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm text-white/85 mt-1 flex items-center gap-1"
            >
              {companion.age}
              {companion.city && (
                <>
                  <span className="text-white/40 mx-1">·</span>
                  <MapPin className="w-3.5 h-3.5 text-pink-300" />
                  {companion.city}{companion.district ? `, ${companion.district}` : ''}
                </>
              )}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mt-2.5 flex-wrap"
            >
              {companion.tags?.slice(0, 4).map((tag, i) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-black/35 backdrop-blur-sm text-white border border-white/15"
                >
                  {companion.experiences?.[i]?.emoji || '✨'} {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Photo Gallery */}
        {companion.photos?.length > 1 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-5 pt-5 pb-2"
          >
            <div className="grid grid-cols-3 gap-2">
              {companion.photos.slice(1, 4).map((photo, i) => (
                <motion.div
                  key={i}
                  className="rounded-2xl overflow-hidden aspect-square shadow-md border border-white/50"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* About */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-5 mt-5"
        >
          <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-2">
            About {companion.displayName}
          </h2>
          <p className="text-sm text-[var(--hana-ash)] leading-relaxed">{companion.bio}</p>
        </motion.section>

        {/* Interests */}
        {companion.tags?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="px-5 mt-6"
          >
            <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">Interests</h2>
            <div className="flex gap-2 flex-wrap">
              {companion.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${
                    i % 5 === 0 ? 'bg-white text-[var(--hana-ash)] border-[var(--hana-subtle)]' :
                    i % 5 === 1 ? 'bg-pink-50 text-pink-600 border-pink-200' :
                    i % 5 === 2 ? 'bg-red-50 text-red-500 border-red-200' :
                    i % 5 === 3 ? 'bg-amber-50 text-amber-600 border-amber-200' :
                    'bg-purple-50 text-purple-600 border-purple-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Activities */}
        {companion.experiences?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-5 mt-6"
          >
            <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">Activities</h2>
            <div className="space-y-2.5">
              {companion.experiences.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${
                    i % 3 === 0 ? 'bg-pink-50/80 border-pink-100' :
                    i % 3 === 1 ? 'bg-orange-50/80 border-orange-100' :
                    'bg-purple-50/80 border-purple-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-sm ${
                      i % 3 === 0 ? 'bg-pink-100' :
                      i % 3 === 1 ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {exp.emoji}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--hana-charcoal)]">{exp.name}</h4>
                      <p className="text-xs text-[var(--hana-muted)] mt-0.5">{exp.description || 'Enjoy a memorable experience'}</p>
                    </div>
                  </div>
                  <span className={`text-base font-bold shrink-0 ${
                    i % 3 === 0 ? 'text-pink-500' :
                    i % 3 === 1 ? 'text-orange-500' :
                    'text-purple-500'
                  }`}>
                    ¥{companion.hourlyRate?.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews */}
        {companion.reviews?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-5 mt-6"
          >
            <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">Reviews</h2>
            <div className="space-y-3">
              {companion.reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/40 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-hana-gradient flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {review.author?.name?.[0] || '?'}
                    </div>
                    <span className="text-sm font-semibold text-[var(--hana-charcoal)]">{review.author?.name}</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[var(--hana-ash)] leading-relaxed">{review.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        <div className="h-8" />

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[var(--hana-subtle)]/40 px-5 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_24px_rgba(233,30,99,0.06)] transform-gpu will-change-transform">
          {isOwnProfile ? (
            <>
              <div>
                <p className="text-[10px] text-[var(--hana-muted)] uppercase tracking-wider font-medium">Your Profile</p>
                <p className="text-sm text-[var(--hana-ash)]">This is how clients see you</p>
              </div>
              <Link
                href="/profile"
                className="px-7 py-3.5 bg-[var(--hana-charcoal)] text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2 btn-ripple"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Link>
            </>
          ) : (
            <>
              <div>
                <p className="text-[10px] text-[var(--hana-muted)] uppercase tracking-wider font-medium">From</p>
                <p className="text-xl font-bold text-[var(--hana-charcoal)]">
                  ¥{companion.hourlyRate?.toLocaleString()}<span className="text-sm font-normal text-[var(--hana-muted)]">/hr</span>
                </p>
              </div>
              <button
                onClick={handleBook}
                className="px-7 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2 btn-ripple"
              >
                <Heart className="w-4 h-4 fill-white" />
                Book a Moment
              </button>
            </>
          )}
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-2 text-sm font-medium text-[var(--hana-ash)] hover:text-[var(--hana-blush-dark)] transition-colors mb-6 btn-press"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-8"
        >
          {/* Left: Images */}
          <div className="col-span-1 space-y-3">
            <div className="relative rounded-[1.75rem] overflow-hidden aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 shadow-xl shadow-pink-200/25 hover:shadow-2xl hover:shadow-pink-300/30 transition-all duration-500">
              {companion.photos?.[0] ? (
                <img
                  src={getImageUrl(companion.photos[0])}
                  alt={companion.displayName}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl animate-float-gentle">
                  {companion.experiences?.[0]?.emoji || '🌸'}
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md border border-white/50"
                >
                  <Share2 className="w-4 h-4 text-[var(--hana-ash)]" />
                </motion.button>
                <motion.button
                  onClick={() => setLiked(!liked)}
                  whileTap={{ scale: 0.85 }}
                  className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md border border-white/50"
                >
                  <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.3 }}>
                    <Heart className={`w-4.5 h-4.5 transition-colors duration-300 ${liked ? 'text-pink-500 fill-pink-500' : 'text-pink-400'}`} />
                  </motion.div>
                </motion.button>
              </div>
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold text-white">{companion.averageRating?.toFixed(2) || '0.00'}</span>
                  <span className="text-[10px] text-white/80">· {companion.totalReviews || 0} reviews</span>
                </div>
              </div>
            </div>

            {companion.photos?.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {companion.photos.slice(1, 4).map((photo, i) => (
                  <motion.div
                    key={i}
                    className="rounded-xl overflow-hidden aspect-square shadow-sm border border-white/50"
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="col-span-2 space-y-5">
            {/* Name card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-md hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-[var(--hana-charcoal)] tracking-tight">
                    {companion.displayName}
                  </h1>
                  <p className="text-[var(--hana-muted)] mt-1 flex items-center gap-1.5 text-sm">
                    <span>{companion.age}</span>
                    {companion.city && (
                      <>
                        <span className="text-[var(--hana-subtle)]">·</span>
                        <MapPin className="w-3.5 h-3.5 text-pink-400" />
                        {companion.city}{companion.district ? `, ${companion.district}` : ''}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {companion.tags?.map((tag, i) => (
                  <span
                    key={tag}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      i % 3 === 0 ? 'bg-pink-50 text-pink-600 border-pink-200' :
                      i % 3 === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      'bg-purple-50 text-purple-600 border-purple-200'
                    }`}
                  >
                    {companion.experiences?.[i]?.emoji || '✨'} {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-md hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
            >
              <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">
                About {companion.displayName}
              </h2>
              <p className="text-[var(--hana-ash)] leading-relaxed">{companion.bio}</p>
            </motion.div>

            {/* Activities */}
            {companion.experiences?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-md hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
              >
                <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-4">Activities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {companion.experiences.map((exp, i) => (
                    <motion.div
                      key={exp.id}
                      whileHover={{ scale: 1.02, x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`flex items-center justify-between p-4 rounded-xl border shadow-sm ${
                        i % 3 === 0 ? 'bg-pink-50/80 border-pink-100' :
                        i % 3 === 1 ? 'bg-orange-50/80 border-orange-100' :
                        'bg-purple-50/80 border-purple-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                          i % 3 === 0 ? 'bg-pink-100' :
                          i % 3 === 1 ? 'bg-orange-100' :
                          'bg-purple-100'
                        }`}>
                          {exp.emoji}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--hana-charcoal)]">{exp.name}</h4>
                          <p className="text-xs text-[var(--hana-muted)]">{exp.description || 'Enjoy a memorable experience'}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${
                        i % 3 === 0 ? 'text-pink-500' :
                        i % 3 === 1 ? 'text-orange-500' :
                        'text-purple-500'
                      }`}>
                        ¥{companion.hourlyRate?.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews */}
            {companion.reviews?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-md hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
              >
                <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-4">Reviews</h2>
                <div className="grid grid-cols-2 gap-3">
                  {companion.reviews.map(review => (
                    <div
                      key={review.id}
                      className="p-4 bg-[var(--hana-ivory)] rounded-xl border border-[var(--hana-subtle)]/30 shadow-sm hover:shadow-md hover:shadow-pink-100/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-hana-gradient flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {review.author?.name?.[0] || '?'}
                        </div>
                        <span className="text-sm font-semibold text-[var(--hana-charcoal)]">{review.author?.name}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--hana-ash)] leading-relaxed">{review.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-md flex items-center justify-between hover:shadow-lg hover:shadow-pink-100/30 transition-all duration-300"
            >
              {isOwnProfile ? (
                <>
                  <div>
                    <p className="text-xs text-[var(--hana-muted)] uppercase tracking-wider font-medium">Your Profile</p>
                    <p className="text-sm text-[var(--hana-ash)] mt-1">This is how clients see you</p>
                  </div>
                  <Link
                    href="/profile"
                    className="px-8 py-3.5 bg-[var(--hana-charcoal)] text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2 btn-ripple"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-[var(--hana-muted)] uppercase tracking-wider font-medium">From</p>
                    <p className="text-2xl font-bold text-[var(--hana-charcoal)]">
                      ¥{companion.hourlyRate?.toLocaleString()}<span className="text-base font-normal text-[var(--hana-muted)]">/hr</span>
                    </p>
                  </div>
                  <button
                    onClick={handleBook}
                    className="px-8 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-bold shadow-lg shadow-pink-500/25 flex items-center gap-2 btn-ripple"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    Book a Moment
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

'use client'

import { Star, ArrowLeft, Heart, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import BottomNav from '@/components/layout/BottomNav'

export default function CompanionProfileClient({ companion }) {
  const router = useRouter()
  const [liked, setLiked] = useState(false)

  return (
    <div className="min-h-screen bg-[#F9F0F4] relative">
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden pb-24 relative z-10">
        
        {/* Hero Image Section */}
        <div className="relative h-[420px] w-full overflow-hidden">
          {companion.photos?.[0] ? (
            <img 
              src={companion.photos[0]} 
              alt={companion.displayName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center text-7xl">
              {companion.experiences?.[0]?.emoji || '🌸'}
            </div>
          )}
          
          {/* Gradient overlay at bottom for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
          
          {/* Back & Heart buttons */}
          <div className="absolute top-12 left-4 right-4 flex justify-between">
            <motion.button 
              onClick={() => router.back()} 
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300 hover:bg-black/50 active:bg-black/60"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button 
              onClick={() => setLiked(!liked)}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300 hover:bg-black/50"
            >
              <motion.div
                animate={liked ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.35 }}
              >
                <Heart className={`w-5 h-5 transition-colors duration-300 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
              </motion.div>
            </motion.button>
          </div>

          {/* Rating badge - positioned above name */}
          <div className="absolute bottom-[90px] left-5">
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

          {/* Name & location overlay */}
          <div className="absolute bottom-4 left-5 right-5">
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
              className="text-sm text-white/90 mt-1"
            >
              {companion.age} · {companion.city}{companion.district ? `-inspired ${companion.district}` : ''}
            </motion.p>
            
            {/* Tags on hero */}
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-2 mt-2.5 flex-wrap"
            >
              {companion.tags?.slice(0, 4).map((tag, i) => (
                <span 
                  key={tag} 
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white border border-white/15"
                >
                  {companion.experiences?.[i]?.emoji || '✨'} {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Photo Gallery - 3 column grid */}
        {companion.photos?.length > 1 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="px-5 pt-5 pb-2"
          >
            <div className="grid grid-cols-3 gap-2.5">
              {companion.photos.slice(1, 4).map((photo, i) => (
                <motion.div 
                  key={i} 
                  className="rounded-2xl overflow-hidden aspect-square shadow-md shadow-black/8 border border-white/50"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* About Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-5 mt-5"
        >
          <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-2">
            About {companion.displayName}
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{companion.bio}</p>
        </motion.section>

        {/* Interests Section */}
        {companion.tags?.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="px-5 mt-6"
          >
            <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-3">Interests</h2>
            <div className="flex gap-2 flex-wrap">
              {companion.tags.map((tag, i) => (
                <motion.span 
                  key={tag}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium cursor-default border transition-shadow duration-300 hover:shadow-md ${
                    i % 5 === 0 ? 'bg-white text-gray-700 border-gray-200 hover:shadow-gray-200/60' :
                    i % 5 === 1 ? 'bg-pink-50 text-pink-600 border-pink-200 hover:shadow-pink-200/60' :
                    i % 5 === 2 ? 'bg-red-50 text-red-500 border-red-200 hover:shadow-red-200/60' :
                    i % 5 === 3 ? 'bg-amber-50 text-amber-600 border-amber-200 hover:shadow-amber-200/60' :
                    'bg-purple-50 text-purple-600 border-purple-200 hover:shadow-purple-200/60'
                  }`}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Activities Section */}
        {companion.experiences?.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="px-5 mt-6"
          >
            <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-3">Activities</h2>
            <div className="space-y-3">
              {companion.experiences.map((exp, i) => (
                <motion.div 
                  key={exp.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-between p-4 rounded-2xl shadow-md border transition-all duration-300 hover:shadow-lg ${
                    i % 3 === 0 ? 'bg-pink-50/80 border-pink-100 shadow-pink-100/40 hover:shadow-pink-200/50' :
                    i % 3 === 1 ? 'bg-orange-50/80 border-orange-100 shadow-orange-100/40 hover:shadow-orange-200/50' :
                    'bg-purple-50/80 border-purple-100 shadow-purple-100/40 hover:shadow-purple-200/50'
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
                      <h4 className="text-sm font-semibold text-gray-900">{exp.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{exp.description || 'Enjoy a memorable experience'}</p>
                    </div>
                  </div>
                  <span className={`text-base font-bold ${
                    i % 3 === 0 ? 'text-pink-500' :
                    i % 3 === 1 ? 'text-orange-500' :
                    'text-purple-500'
                  }`}>
                    ${companion.hourlyRate}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Reviews Section */}
        {companion.reviews?.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="px-5 mt-6"
          >
            <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-3">Reviews</h2>
            <div className="space-y-3">
              {companion.reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-100/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-100/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {review.author?.name?.[0] || '?'}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{review.author?.name}</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Spacer for fixed bottom bar */}
        <div className="h-10" />

        {/* Fixed bottom CTA */}
        <div className="fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-5 py-3.5 flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">From</p>
            <p className="text-xl font-bold text-gray-900">${companion.hourlyRate}<span className="text-sm font-normal text-gray-400">/hr</span></p>
          </div>
          <motion.button 
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="px-7 py-3.5 bg-gradient-to-r from-[#E91E63] via-[#FF4081] to-[#FF6B8A] text-white rounded-full text-sm font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/40 active:shadow-md btn-ripple"
          >
            <Heart className="w-4 h-4 fill-white" />
            Book a Moment
          </motion.button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block max-w-6xl mx-auto px-6 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-8"
        >
          {/* Left: Images */}
          <div className="col-span-1 space-y-4">
            <div className="relative rounded-[1.75rem] overflow-hidden aspect-[3/4] bg-gradient-to-br from-pink-100 to-purple-100 shadow-xl shadow-pink-200/30 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-300/40">
              {companion.photos?.[0] ? (
                <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl animate-float-gentle">
                  {companion.experiences?.[0]?.emoji || '🌸'}
                </div>
              )}
              <div className="absolute top-4 right-4">
                <motion.button 
                  onClick={() => setLiked(!liked)}
                  whileTap={{ scale: 0.85 }}
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/50 transition-all duration-300 hover:bg-white"
                >
                  <motion.div animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.35 }}>
                    <Heart className={`w-5 h-5 transition-colors duration-300 ${liked ? 'text-pink-500 fill-pink-500' : 'text-pink-500'}`} />
                  </motion.div>
                </motion.button>
              </div>
              {/* Rating badge */}
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30">
                  <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold text-white">{companion.averageRating?.toFixed(2) || '0.00'}</span>
                  <span className="text-[10px] text-white/80">· {companion.totalReviews || 0} reviews</span>
                </div>
              </div>
            </div>
            {companion.photos?.length > 1 && (
              <div className="grid grid-cols-3 gap-2.5">
                {companion.photos.slice(1, 4).map((photo, i) => (
                  <motion.div 
                    key={i} 
                    className="rounded-xl overflow-hidden aspect-square shadow-md shadow-gray-200/60 border border-white/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-200/50"
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="col-span-2 space-y-6">
            {/* Name & Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[1.75rem] p-6 border border-gray-100 shadow-lg shadow-gray-100/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-heading text-3xl font-bold text-gray-900">{companion.displayName}</h1>
                  <p className="text-gray-400 mt-1 flex items-center gap-1">
                    <span>{companion.age}</span> · <MapPin className="w-4 h-4" /> {companion.city}{companion.district ? `, ${companion.district}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {companion.tags?.map((tag, i) => (
                  <motion.span 
                    key={tag} 
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-default border transition-shadow duration-300 hover:shadow-md ${
                      i % 3 === 0 ? 'bg-pink-50 text-pink-600 border-pink-200 hover:shadow-pink-200/60' : 
                      i % 3 === 1 ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:shadow-emerald-200/60' : 
                      'bg-purple-50 text-purple-600 border-purple-200 hover:shadow-purple-200/60'
                    }`}
                  >
                    {companion.experiences?.[i]?.emoji || '✨'} {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* About Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-[1.75rem] p-6 border border-gray-100 shadow-lg shadow-gray-100/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/40"
            >
              <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-3">About {companion.displayName}</h2>
              <p className="text-gray-700 leading-relaxed">{companion.bio}</p>
            </motion.div>

            {/* Activities Card */}
            {companion.experiences?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[1.75rem] p-6 border border-gray-100 shadow-lg shadow-gray-100/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/40"
              >
                <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-4">Activities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {companion.experiences.map((exp, i) => (
                    <motion.div 
                      key={exp.id} 
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`flex items-center justify-between p-4 rounded-xl shadow-md border transition-all duration-300 hover:shadow-lg ${
                        i % 3 === 0 ? 'bg-pink-50/80 border-pink-100 shadow-pink-100/40 hover:shadow-pink-200/50' :
                        i % 3 === 1 ? 'bg-orange-50/80 border-orange-100 shadow-orange-100/40 hover:shadow-orange-200/50' :
                        'bg-purple-50/80 border-purple-100 shadow-purple-100/40 hover:shadow-purple-200/50'
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
                          <h4 className="text-sm font-semibold text-gray-900">{exp.name}</h4>
                          <p className="text-xs text-gray-400">{exp.description || 'Enjoy a memorable experience'}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${
                        i % 3 === 0 ? 'text-pink-500' :
                        i % 3 === 1 ? 'text-orange-500' :
                        'text-purple-500'
                      }`}>
                        ${companion.hourlyRate}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Card */}
            {companion.reviews?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-[1.75rem] p-6 border border-gray-100 shadow-lg shadow-gray-100/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/40"
              >
                <h2 className="text-sm font-bold text-[#E91E63] uppercase tracking-wider mb-4">Reviews</h2>
                <div className="grid grid-cols-2 gap-3">
                  {companion.reviews.map(review => (
                    <motion.div 
                      key={review.id} 
                      whileHover={{ scale: 1.01 }}
                      className="p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:shadow-pink-100/30"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {review.author?.name?.[0] || '?'}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{review.author?.name}</span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{review.content}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-[1.75rem] p-6 border border-gray-100 shadow-lg shadow-gray-100/60 flex items-center justify-between transition-all duration-300 hover:shadow-xl hover:shadow-pink-100/40"
            >
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">From</p>
                <p className="text-2xl font-bold text-gray-900">${companion.hourlyRate}<span className="text-base font-normal text-gray-400">/hr</span></p>
              </div>
              <motion.button 
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="px-8 py-3.5 bg-gradient-to-r from-[#E91E63] via-[#FF4081] to-[#FF6B8A] text-white rounded-full text-sm font-bold shadow-lg shadow-pink-500/25 flex items-center gap-2 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/40 btn-ripple"
              >
                <Heart className="w-4 h-4 fill-white" />
                Book a Moment
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

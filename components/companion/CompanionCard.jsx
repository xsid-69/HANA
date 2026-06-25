'use client'

import { Star, Heart } from 'lucide-react'
import { useUIStore } from '@/store/useUIStore'
import { motion } from 'framer-motion'
import { getImageUrl } from '@/lib/image-url'

export default function CompanionCard({ companion, compact }) {
  const openProfileModal = useUIStore(s => s.openProfileModal)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openProfileModal(companion.id)}
      className={`relative bg-white rounded-[1.25rem] overflow-hidden border border-pink-100/30 shadow-sm hover:shadow-md hover:shadow-pink-400/10 transition-shadow cursor-pointer ${
        compact ? '' : 'w-full'
      }`}
    >
      <div className={`relative ${compact ? 'h-32' : 'h-36'} bg-gradient-to-br from-pink-100 to-purple-100 card-img-zoom overflow-hidden`}>
        {companion.photos?.[0] ? (
          <img
            src={getImageUrl(companion.photos[0])}
            alt={companion.displayName}
            className="w-full h-full object-cover card-img"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl card-img">
            {companion.experiences?.[0]?.emoji || '🌸'}
          </div>
        )}
        <div className="absolute top-2 right-2 glass rounded-full p-1.5 btn-press">
          <Heart className="w-3.5 h-3.5 text-gray-400" />
        </div>
        {companion.isOnline && (
          <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white shadow-sm" />
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {companion.displayName}
          </h3>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-700 font-medium">{companion.averageRating?.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 truncate">
          {companion.city}{companion.district ? `, ${companion.district}` : ''}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 overflow-hidden">
            {companion.tags?.slice(0, 2).map((tag, i) => (
              <span key={tag} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                i === 0 ? 'chip-blush' : 'chip-sage'
              }`}>
                {tag}
              </span>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-900">
            ¥{companion.hourlyRate?.toLocaleString()}/hr
          </span>
        </div>
      </div>
    </motion.div>
  )
}

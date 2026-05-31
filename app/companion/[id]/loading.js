'use client'

import { motion } from 'framer-motion'

export default function CompanionProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F9F0F4] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white rounded-3xl px-8 py-7 shadow-2xl shadow-pink-200/40 border border-pink-100/50 flex flex-col items-center gap-4"
      >
        {/* Spinner */}
        <div className="relative w-12 h-12">
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-pink-100"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#E91E63] border-r-[#FF4081]"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-[6px] rounded-full border-[2px] border-transparent border-b-[#FF6B8A] border-l-[#E91E63]"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-800">Loading profile</p>
          <motion.p
            className="text-xs text-gray-400 mt-0.5"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            Just a moment...
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}

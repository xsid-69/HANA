'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateCompanionProfile } from '@/app/actions/users'
import { useAuthStore } from '@/lib/auth-store'
import { signOut } from 'next-auth/react'
import {
  User, Camera, Edit3, Star, MapPin, Clock, TrendingUp,
  Shield, Eye, Settings, LogOut, ChevronRight, Languages,
  Calendar, BarChart3, Bell, CreditCard, HelpCircle,
  X, Loader2, ImagePlus, Plus, Trash2, IndianRupee,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

const MENU_SECTIONS = [
  {
    title: 'Profile Management',
    items: [
      { label: 'Availability Settings', icon: Clock, href: '/companion/calendar', desc: 'Manage your schedule' },
      { label: 'Pricing & Services', icon: CreditCard, href: '#', desc: 'Hourly rate and minimum hours' },
      { label: 'Verification', icon: Shield, href: '#', desc: 'ID and background check status', badge: 'Verified' },
    ],
  },
  {
    title: 'Performance',
    items: [
      { label: 'Analytics', icon: BarChart3, href: '/companion/earnings', desc: 'Earnings and growth metrics' },
      { label: 'Reviews & Ratings', icon: Star, href: '#', desc: 'View and respond to feedback' },
      { label: 'Growth Tips', icon: TrendingUp, href: '#', desc: 'Improve your profile ranking' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Notifications', icon: Bell, href: '#', desc: 'Booking alerts and reminders' },
      { label: 'Account Settings', icon: Settings, href: '#', desc: 'Email, password, and privacy' },
      { label: 'Help & Support', icon: HelpCircle, href: '#', desc: 'FAQs and contact support' },
    ],
  },
]

function EditCompanionModal({ isOpen, onClose, profile, companion, onSaved }) {
  const [displayName, setDisplayName] = useState(companion?.displayName || profile?.name || '')
  const [bio, setBio] = useState(companion?.bio || '')
  const [city, setCity] = useState(companion?.city || '')
  const [languages, setLanguages] = useState(companion?.languages || ['English', 'Hindi'])
  const [hourlyRate, setHourlyRate] = useState(companion?.hourlyRate || 1000)
  const [photos, setPhotos] = useState(companion?.photos || [])
  const [newLang, setNewLang] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const photosInputRef = useRef(null)

  const mutation = useMutation({
    mutationFn: updateCompanionProfile,
    onSuccess: () => {
      onSaved()
      onClose()
    },
  })

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        const newPhotos = [data.url, ...photos.slice(1)]
        setPhotos(newPhotos)
      }
    } catch {} finally { setUploading(false) }
  }

  const handleAddPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setPhotos([...photos, data.url])
    } catch {} finally { setUploading(false) }
  }

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx))
  }

  const addLanguage = () => {
    if (newLang.trim() && !languages.includes(newLang.trim())) {
      setLanguages([...languages, newLang.trim()])
      setNewLang('')
    }
  }

  const handleSave = () => {
    mutation.mutate({
      displayName: displayName || undefined,
      bio: bio || undefined,
      city: city || undefined,
      languages,
      hourlyRate,
      photos,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Edit Profile</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-[var(--hana-ash)]" />
              </button>
            </div>

            {/* Profile photo */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-gray-100">
                  {photos[0] ? (
                    <img src={photos[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                      {displayName?.[0] || 'C'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[var(--hana-charcoal)] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-2 block">Gallery Photos</label>
              <div className="grid grid-cols-4 gap-2">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={() => photosInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-pink-300 hover:bg-pink-50/50 transition-colors"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Plus className="w-5 h-5 text-gray-400" />}
                  </button>
                )}
              </div>
              <input ref={photosInputRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  placeholder="Your display name" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">City</label>
                <input type="text" value={city} onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  placeholder="Your city" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                  placeholder="Tell clients about yourself..." />
                <p className="text-[10px] text-[var(--hana-muted)] mt-1 text-right">{bio.length}/1000</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">
                  Hourly Rate (₹)
                </label>
                <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} min={100}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">Languages</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {languages.map((lang, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-xs font-medium border border-pink-100">
                      {lang}
                      <button onClick={() => setLanguages(languages.filter((_, idx) => idx !== i))} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={newLang} onChange={e => setNewLang(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm outline-none focus:border-pink-300 transition-all"
                    placeholder="Add language" />
                  <button onClick={addLanguage} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-[var(--hana-ash)] hover:bg-gray-200 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-[var(--hana-ash)] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={mutation.isPending}
                className="flex-1 py-3 rounded-xl bg-hana-gradient text-white text-sm font-semibold shadow-md shadow-pink-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Save Changes
              </button>
            </div>

            {mutation.isError && (
              <p className="text-xs text-red-500 text-center mt-3">{mutation.error?.message}</p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function CompanionProfilePage() {
  const queryClient = useQueryClient()
  const { user: jwtUser } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => getProfile(),
  })

  const user = jwtUser || profile
  const companion = profile?.companion

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
      </div>
    )
  }

  return (
    <>
      <EditCompanionModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        companion={companion}
        onSaved={handleSaved}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl">
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-2 ring-gray-100 shadow-md">
                {companion?.photos?.[0] ? (
                  <img src={companion.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : user?.image ? (
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                    {(companion?.displayName || user?.name)?.[0] || 'C'}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowEdit(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[var(--hana-charcoal)] flex items-center justify-center shadow-md hover:scale-110 transition-transform"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--hana-charcoal)]">
                  {companion?.displayName || user?.name || 'Companion'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100">
                  <Shield className="w-3 h-3" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--hana-muted)] flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {companion?.city || profile?.city || 'Not set'}</span>
                {companion?.languages?.length > 0 && (
                  <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> {companion.languages.join(', ')}</span>
                )}
                {companion?.hourlyRate && (
                  <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" /> ₹{companion.hourlyRate}/hr</span>
                )}
              </div>
              <p className="text-sm text-[var(--hana-ash)] mt-2 max-w-xl leading-relaxed">
                {companion?.bio || 'No bio set. Edit your profile to add one.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEdit(true)}
                className="px-4 py-2 rounded-xl bg-[var(--hana-charcoal)] text-sm font-medium text-white hover:bg-[var(--hana-ash)] transition-colors flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </motion.button>
            </div>
          </div>

          {/* Photos gallery */}
          {companion?.photos?.length > 1 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider mb-3">Gallery</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {companion.photos.map((photo, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} className="w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-sm">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
            {[
              { label: 'Total Bookings', value: companion?.totalBookings ?? 0, icon: Calendar },
              { label: 'Avg Rating', value: (companion?.averageRating ?? 0).toFixed(1), icon: Star },
              { label: 'Trust Score', value: `${companion?.trustScore ?? 100}%`, icon: Shield },
              { label: 'Completed', value: companion?.completedBookings ?? 0, icon: TrendingUp },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} whileHover={{ y: -2 }} className="text-center p-3 rounded-xl bg-gray-50 transition-shadow hover:shadow-sm">
                  <Icon className="w-4 h-4 text-[var(--hana-muted)] mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-[var(--hana-charcoal)] font-heading">{stat.value}</div>
                  <div className="text-[11px] text-[var(--hana-muted)]">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <motion.div key={section.title} variants={itemVariants} className="mt-5">
            <h2 className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider mb-2 px-1">{section.title}</h2>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
              {section.items.map(item => {
                const Icon = item.icon
                return (
                  <Link key={item.label} href={item.href}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                      <Icon className="w-4 h-4 text-[var(--hana-ash)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--hana-charcoal)]">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full">{item.badge}</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--hana-muted)] mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                )
              })}
            </div>
          </motion.div>
        ))}

        {/* Logout */}
        <motion.div variants={itemVariants} className="mt-5 mb-8">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-colors group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-600">Sign Out</span>
          </button>
        </motion.div>
      </motion.div>
    </>
  )
}

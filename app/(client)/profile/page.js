'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/app/actions/users'
import { useAuthStore } from '@/lib/auth-store'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import {
  Heart, Calendar, Star, ChevronRight, LogOut, Bell,
  Shield, CreditCard, UserPlus, Settings, MapPin, Edit3,
  Camera, CheckCircle2, Clock, Bookmark, MessageCircle,
  X, Loader2, ImagePlus,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const MENU_SECTIONS = [
  {
    title: 'Activity',
    items: [
      { label: 'Saved Companions', icon: Bookmark, href: '/profile/saved', chip: 'chip-blush' },
      { label: 'Booking History', icon: Calendar, href: '/bookings', chip: 'chip-sage' },
      { label: 'My Reviews', icon: Star, href: '#', chip: 'chip-gold' },
      { label: 'Messages', icon: MessageCircle, href: '/messages', chip: 'chip-lavender' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Payment Methods', icon: CreditCard, href: '#', chip: 'chip-gold' },
      { label: 'Notifications', icon: Bell, href: '#', chip: 'chip-blush' },
      { label: 'Privacy & Safety', icon: Shield, href: '#', chip: 'chip-lavender' },
      { label: 'Settings', icon: Settings, href: '#', chip: 'chip-sage' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Become a Companion', icon: UserPlus, href: '#', chip: 'chip-fuchsia' },
    ],
  },
]

function StatCard({ value, label }) {
  return (
    <div className="text-center px-2">
      <div className="text-2xl font-bold text-[var(--hana-charcoal)] font-heading">{value}</div>
      <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5">{label}</div>
    </div>
  )
}

function EditProfileModal({ isOpen, onClose, profile, onSaved }) {
  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [city, setCity] = useState(profile?.city || '')
  const [image, setImage] = useState(profile?.image || '')
  const [banner, setBanner] = useState(profile?.banner || '')
  const [uploading, setUploading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const fileInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      onSaved(data)
      onClose()
    },
  })

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setImage(data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setBanner(data.url)
    } catch (err) {
      console.error('Banner upload failed:', err)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleSave = () => {
    mutation.mutate({ name: name || undefined, bio: bio || undefined, city: city || undefined, image: image || undefined, banner: banner || undefined })
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

            {/* Banner upload */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-2 block">Banner Image</label>
              <div
                className="relative w-full h-28 rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => bannerInputRef.current?.click()}
              >
                {banner ? (
                  <img src={banner} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-pink-200 via-purple-100 to-pink-200" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingBanner ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2 text-white text-sm font-medium">
                      <ImagePlus className="w-5 h-5" /> Change Banner
                    </div>
                  )}
                </div>
              </div>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
            </div>

            {/* Avatar upload */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                  {image ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">{name?.[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[var(--hana-charcoal)] flex items-center justify-center shadow-md border-2 border-white hover:scale-110 transition-transform"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </div>
              <p className="text-xs text-[var(--hana-muted)] mt-2">Tap to change photo</p>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all"
                  placeholder="Your city"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--hana-ash)] uppercase tracking-wider mb-1.5 block">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-[var(--hana-charcoal)] outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all resize-none"
                  placeholder="Tell others about yourself..."
                />
                <p className="text-[10px] text-[var(--hana-muted)] mt-1 text-right">{bio.length}/500</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-[var(--hana-ash)] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="flex-1 py-3 rounded-xl bg-hana-gradient text-white text-sm font-semibold shadow-md shadow-pink-500/20 hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
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

export default function ProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user: jwtUser, logout, fetchMe } = useAuthStore()
  const [showEdit, setShowEdit] = useState(false)
  const bannerInputRef = useRef(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => getProfile(),
    retry: false,
  })

  useEffect(() => { fetchMe() }, [fetchMe])

  useEffect(() => {
    if (!isLoading && !jwtUser && !profile) {
      router.replace('/login')
    }
  }, [isLoading, jwtUser, profile, router])

  const bannerMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      fetchMe()
    },
  })

  const user = jwtUser || profile
  const name = user?.name || 'User'
  const email = user?.email || ''
  const city = profile?.city
  const bio = profile?.bio
  const banner = profile?.banner
  const role = profile?.role || user?.role || 'CLIENT'
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  const handleLogout = async () => {
    await logout()
    try { await signOut({ redirect: false }) } catch {}
    router.push('/login')
  }

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    fetchMe()
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingBanner(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) {
        bannerMutation.mutate({ banner: data.url })
      }
    } catch (err) {
      console.error('Banner upload failed:', err)
    } finally {
      setUploadingBanner(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  }

  if (isLoading || (!jwtUser && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-8%] right-[-8%] w-[400px] h-[400px] bg-pink-300/15 rounded-full blur-[90px] animate-pulse-soft" />
        <div className="absolute bottom-[10%] left-[-8%] w-[350px] h-[350px] bg-purple-200/12 rounded-full blur-[80px] animate-float-slow" />
      </div>

      <TopNav />

      <EditProfileModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        profile={profile}
        onSaved={handleSaved}
      />

      <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />

      {/* MOBILE */}
      <div className="md:hidden relative z-10">
        {/* Banner */}
        <div className="relative h-44 w-full overflow-hidden">
          {banner ? (
            <img src={banner} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-hana-gradient-animated" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute top-12 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg"
          >
            {uploadingBanner ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Profile card overlapping banner */}
        <div className="px-5 -mt-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 pt-14 shadow-lg shadow-pink-200/20 border border-[var(--hana-subtle)]/30 relative"
          >
            {/* Avatar positioned at top center, overlapping the card */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center font-bold text-white shadow-lg ring-4 ring-white">
                  {user?.image ? (
                    <img src={user.image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{name[0]?.toUpperCase() || '?'}</span>
                  )}
                </div>
                <button
                  onClick={() => setShowEdit(true)}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-100 hover:scale-110 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5 text-pink-500" />
                </button>
              </div>
            </div>

            {/* Name + info */}
            <div className="text-center">
              <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">{name}</h1>
              <p className="text-[var(--hana-muted)] text-sm mt-0.5">{email}</p>
              {city && (
                <div className="flex items-center justify-center gap-1 mt-1 text-[var(--hana-muted)] text-xs">
                  <MapPin className="w-3 h-3" /> {city}
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 mt-2 px-3 py-1 bg-[var(--hana-ivory)] rounded-full border border-[var(--hana-subtle)]/40 w-fit mx-auto">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span className="text-[var(--hana-ash)] text-xs font-medium capitalize">{role.toLowerCase()} Account</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30 mt-5 pt-4 border-t border-[var(--hana-subtle)]/30">
              <StatCard value={profile?._count?.bookingsAsClient ?? 0} label="Bookings" />
              <StatCard value={profile?._count?.savedCompanions ?? 0} label="Saved" />
              <StatCard value={profile?._count?.reviewsWritten ?? 0} label="Reviews" />
            </div>
          </motion.div>
        </div>

        {bio && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mx-5 mt-4 p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm">
            <p className="text-sm text-[var(--hana-ash)] leading-relaxed">{bio}</p>
          </motion.div>
        )}

        {joinedDate && (
          <div className="flex items-center gap-1.5 px-5 mt-3 text-xs text-[var(--hana-muted)]">
            <Clock className="w-3.5 h-3.5" /> Member since {joinedDate}
          </div>
        )}

        <div className="px-5 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowEdit(true)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--hana-subtle)]/50 rounded-2xl text-sm font-medium text-[var(--hana-ash)] bg-white hover:bg-[var(--hana-ivory)] transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </motion.button>
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-5 mt-5 space-y-4 pb-28">
          {MENU_SECTIONS.map(section => (
            <motion.div key={section.title} variants={itemVariants}>
              <p className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-widest mb-2 px-1">{section.title}</p>
              <div className="bg-white rounded-2xl overflow-hidden border border-[var(--hana-subtle)]/25 shadow-sm">
                {section.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.label} href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--hana-ivory)] transition-colors ${i < section.items.length - 1 ? 'border-b border-[var(--hana-subtle)]/15' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.chip}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[var(--hana-ash)]">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--hana-subtle)]" />
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          ))}

          <motion.button variants={itemVariants} onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors btn-press">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500">Log Out</span>
          </motion.button>
        </motion.div>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-5xl mx-auto px-6 py-8">
          {/* Banner */}
          <motion.div variants={itemVariants} className="relative h-52 rounded-3xl overflow-hidden mb-6 shadow-md group">
            {banner ? (
              <img src={banner} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-hana-gradient-animated" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
            <button
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingBanner}
              className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm flex items-center gap-2 text-white text-sm font-medium border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              {uploadingBanner ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              Change Banner
            </button>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="col-span-1 space-y-4">
              <div className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-sm text-center sticky top-24 -mt-20 relative z-10">
                <div className="relative inline-block">
                  <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center font-bold text-white font-heading shadow-lg ring-4 ring-white">
                    {user?.image ? (
                      <img src={user.image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">{name[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowEdit(true)}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-100 hover:bg-pink-50 hover:scale-110 transition-all btn-press"
                  >
                    <Camera className="w-3.5 h-3.5 text-pink-500" />
                  </button>
                </div>

                <h1 className="mt-4 font-heading text-xl font-bold text-[var(--hana-charcoal)]">{name}</h1>
                <p className="text-[var(--hana-muted)] text-sm mt-0.5">{email}</p>

                {city && (
                  <div className="flex items-center justify-center gap-1 mt-1.5 text-[var(--hana-muted)] text-xs">
                    <MapPin className="w-3 h-3 text-pink-400" /> {city}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 bg-[var(--hana-ivory)] rounded-full border border-[var(--hana-subtle)]/40 w-fit mx-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[var(--hana-ash)] text-xs font-medium capitalize">{role.toLowerCase()} Account</span>
                </div>

                {joinedDate && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-[var(--hana-muted)]">
                    <Clock className="w-3 h-3" /> Since {joinedDate}
                  </div>
                )}

                <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30 mt-5 pt-5 border-t border-[var(--hana-subtle)]/30">
                  <StatCard value={profile?._count?.bookingsAsClient ?? 0} label="Bookings" />
                  <StatCard value={profile?._count?.savedCompanions ?? 0} label="Saved" />
                  <StatCard value={profile?._count?.reviewsWritten ?? 0} label="Reviews" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowEdit(true)}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--hana-subtle)]/50 rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)] transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </motion.button>
              </div>
            </motion.div>

            <div className="col-span-2 space-y-5">
              <motion.div variants={itemVariants} className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-sm">
                <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">About</h2>
                {bio ? (
                  <p className="text-[var(--hana-ash)] leading-relaxed text-sm">{bio}</p>
                ) : (
                  <p className="text-[var(--hana-muted)] text-sm italic">No bio yet. Edit your profile to add one.</p>
                )}
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Bookings', value: profile?._count?.bookingsAsClient ?? 0, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { label: 'Saved Companions', value: profile?._count?.savedCompanions ?? 0, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
                  { label: 'Reviews Written', value: profile?._count?.reviewsWritten ?? 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <motion.div key={stat.label} whileHover={{ y: -3 }} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm flex flex-col gap-3 transition-shadow hover:shadow-md`}>
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[var(--hana-charcoal)] font-heading">{stat.value}</div>
                        <div className="text-xs text-[var(--hana-muted)] mt-0.5">{stat.label}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>

              {MENU_SECTIONS.map(section => (
                <motion.div key={section.title} variants={itemVariants}>
                  <p className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-widest mb-2 px-1">{section.title}</p>
                  <div className="bg-white rounded-[1.75rem] overflow-hidden border border-[var(--hana-subtle)]/25 shadow-sm">
                    {section.items.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.label} href={item.href}
                          className={`flex items-center gap-3 px-5 py-4 hover:bg-[var(--hana-ivory)] transition-colors group ${i < section.items.length - 1 ? 'border-b border-[var(--hana-subtle)]/15' : ''}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.chip}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-medium text-[var(--hana-ash)]">{item.label}</span>
                          <ChevronRight className="w-4 h-4 text-[var(--hana-subtle)] group-hover:text-[var(--hana-ash)] transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              ))}

              <motion.button variants={itemVariants} onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors btn-press">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500">Log Out</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}

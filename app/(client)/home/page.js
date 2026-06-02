'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/auth-store'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useRouter } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import BottomNav from '@/components/layout/BottomNav'
import {
  Heart, Sparkles, ArrowRight, Shield, Star, MapPin,
  MessageCircle, Calendar, CheckCircle2, Users, Zap, Lock,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect } from 'react'

const FEATURES = [
  {
    icon: Shield,
    title: 'Verified Companions',
    desc: 'Every companion is ID-verified, background-checked, and personally reviewed before joining Hana.',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: Star,
    title: 'Rated Experiences',
    desc: 'Real reviews from real users. Browse ratings, read stories, and book with complete confidence.',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    iconBg: 'bg-amber-100',
  },
  {
    icon: MapPin,
    title: 'Across India',
    desc: 'From Mumbai\'s sea-facing cafés to Jaipur\'s palace rooftops — companions in every major city.',
    color: 'bg-pink-50 text-pink-600 border-pink-100',
    iconBg: 'bg-pink-100',
  },
  {
    icon: MessageCircle,
    title: 'In-App Messaging',
    desc: 'Chat with your companion before the booking. Plan the perfect outing together, safely.',
    color: 'bg-purple-50 text-purple-600 border-purple-100',
    iconBg: 'bg-purple-100',
  },
  {
    icon: Calendar,
    title: 'Flexible Booking',
    desc: 'Book by the hour, choose your experience, pick your date. Everything on your terms.',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: Lock,
    title: 'Safe & Private',
    desc: 'Your data stays yours. Encrypted payments, private profiles, and 24/7 safety support.',
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    iconBg: 'bg-rose-100',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse Companions',
    desc: 'Explore verified profiles, read reviews, and find someone who matches your interests and city.',
    emoji: '🔍',
  },
  {
    step: '02',
    title: 'Book a Moment',
    desc: 'Choose your experience — coffee, a walk, a cultural tour — pick a date and time that works.',
    emoji: '📅',
  },
  {
    step: '03',
    title: 'Meet & Enjoy',
    desc: 'Show up, be yourself, and enjoy a genuine, curated social experience with your companion.',
    emoji: '✨',
  },
]

const EXPERIENCES = [
  { emoji: '☕', label: 'Coffee Dates', desc: 'Cozy conversations over chai or filter coffee' },
  { emoji: '🏛️', label: 'Heritage Walks', desc: 'Explore forts, temples, and old city lanes' },
  { emoji: '🍛', label: 'Food Adventures', desc: 'Street food trails and local restaurant gems' },
  { emoji: '🎨', label: 'Art & Culture', desc: 'Galleries, sabhas, and creative afternoons' },
  { emoji: '🌄', label: 'Nature & Treks', desc: 'Sunrise hikes and backwater cruises' },
  { emoji: '🛍️', label: 'Shopping & Markets', desc: 'Textile bazaars, antique lanes, and more' },
]

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Pune', 'Kochi', 'Varanasi', 'Nagpur']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export default function HomePage() {
  const { data: session } = useSession()
  const { user: jwtUser, fetchMe } = useAuthStore()
  const router = useRouter()
  useEffect(() => { fetchMe() }, [fetchMe])
  useOnlineStatus(session?.user?.id || jwtUser?.id)

  const user = jwtUser || session?.user
  useEffect(() => {
    if (user?.role === 'COMPANION') {
      router.replace('/companion/dashboard')
    }
  }, [user?.role, router])

  const firstName = jwtUser?.name?.split(' ')[0] || session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-8%] w-[550px] h-[550px] bg-pink-300/18 rounded-full blur-[110px] animate-pulse-soft" />
        <div className="absolute top-[30%] right-[-12%] w-[500px] h-[500px] bg-purple-200/14 rounded-full blur-[120px] animate-float-gentle" />
        <div className="absolute bottom-[-5%] left-[25%] w-[450px] h-[450px] bg-fuchsia-200/10 rounded-full blur-[110px]" />
      </div>

      <TopNav />

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block relative z-10">
        <motion.main variants={containerVariants} initial="hidden" animate="visible"
          className="max-w-[1440px] mx-auto px-12 pt-8 pb-20">

          {/* Hero */}
          <motion.section variants={itemVariants}
            className="relative bg-hana-gradient-animated rounded-[2rem] p-14 overflow-hidden shadow-2xl shadow-pink-500/15 group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.14),transparent_55%)] pointer-events-none" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute top-10 right-48 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float-gentle" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/15 text-white/90 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Welcome back, {firstName} ✨
              </div>
              <h1 className="font-heading font-bold text-white text-[3rem] leading-[1.1] tracking-tight mb-5">
                Your next meaningful<br />experience starts here.
              </h1>
              <p className="text-white/80 text-lg leading-relaxed max-w-xl mb-8">
                Hana connects you with verified Indian companions for coffee dates, heritage walks, food adventures, and unforgettable social moments — all across India.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/discover"
                  className="font-semibold rounded-full bg-white text-pink-600 px-8 h-12 flex items-center gap-2 justify-center hover:bg-pink-50 shadow-lg shadow-white/20 transition-all duration-300 btn-press">
                  Explore Companions <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>20+ verified companions across India</span>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              {[
                { label: 'Verified Companions', value: '20+', icon: '✅' },
                { label: 'Cities Covered', value: '10+', icon: '🗺️' },
                { label: 'Avg. Rating', value: '4.8★', icon: '⭐' },
              ].map(stat => (
                <motion.div key={stat.label}
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-lg">
                  <span className="text-xl">{stat.icon}</span>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">{stat.value}</div>
                    <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* How it works */}
          <motion.section variants={itemVariants} className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">How Hana Works</h2>
                <p className="text-[var(--hana-muted)] text-sm mt-1">Three simple steps to your next great experience</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="relative bg-white rounded-[1.75rem] p-7 border border-[var(--hana-subtle)]/30 shadow-sm hover-card">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="absolute top-10 -right-3 w-6 h-0.5 bg-gradient-to-r from-pink-300 to-transparent z-10 hidden xl:block" />
                  )}
                  <div className="text-4xl mb-4">{step.emoji}</div>
                  <div className="text-xs font-bold text-[var(--hana-blush-dark)] tracking-widest uppercase mb-2">{step.step}</div>
                  <h3 className="font-heading font-bold text-lg text-[var(--hana-charcoal)] mb-2">{step.title}</h3>
                  <p className="text-[var(--hana-muted)] text-sm leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Experiences */}
          <motion.section variants={itemVariants} className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">What You Can Do</h2>
                <p className="text-[var(--hana-muted)] text-sm mt-1">Curated experiences for every mood</p>
              </div>
              <Link href="/discover" className="text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors flex items-center gap-1">
                Browse all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {EXPERIENCES.map(exp => (
                <Link key={exp.label} href="/discover"
                  className="bg-white rounded-2xl p-5 border border-[var(--hana-subtle)]/30 shadow-sm hover-card flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-[var(--hana-ivory)] rounded-2xl flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {exp.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--hana-charcoal)] text-sm">{exp.label}</h3>
                    <p className="text-[var(--hana-muted)] text-xs mt-0.5 leading-relaxed">{exp.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Features */}
          <motion.section variants={itemVariants} className="mt-16">
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Why Choose Hana</h2>
              <p className="text-[var(--hana-muted)] text-sm mt-1">Built for safety, designed for connection</p>
            </div>
            <div className="grid grid-cols-3 gap-5">
              {FEATURES.map(f => {
                const Icon = f.icon
                return (
                  <div key={f.title} className={`bg-white rounded-2xl p-6 border shadow-sm hover-card ${f.color}`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-[var(--hana-charcoal)] mb-1.5">{f.title}</h3>
                    <p className="text-[var(--hana-muted)] text-sm leading-relaxed">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* Cities */}
          <motion.section variants={itemVariants} className="mt-16">
            <div className="mb-6">
              <h2 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Available Cities</h2>
              <p className="text-[var(--hana-muted)] text-sm mt-1">Companions across India's most vibrant cities</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {CITIES.map(city => (
                <Link key={city} href={`/discover?city=${city}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--hana-subtle)]/40 rounded-full text-sm font-medium text-[var(--hana-ash)] hover:border-pink-300 hover:bg-[var(--hana-ivory)] hover:text-pink-600 transition-all duration-250 btn-press shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-pink-400" /> {city}
                </Link>
              ))}
            </div>
          </motion.section>

          {/* CTA Banner */}
          <motion.section variants={itemVariants} className="mt-16">
            <div className="bg-gradient-to-br from-[var(--hana-charcoal)] to-[var(--hana-ash)] rounded-[2rem] p-12 flex items-center justify-between overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-60 h-60 bg-pink-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-heading font-bold text-3xl text-white mb-3">Ready to meet someone new?</h2>
                <p className="text-white/65 text-base max-w-md">Browse 20+ verified companions across India and book your first experience today.</p>
              </div>
              <Link href="/discover"
                className="relative z-10 shrink-0 font-semibold rounded-full bg-hana-gradient text-white px-10 h-14 flex items-center gap-2 justify-center shadow-xl shadow-pink-500/30 hover:shadow-2xl transition-shadow btn-press">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.section>

          {/* Footer */}
          <footer className="mt-20 border-t border-[var(--hana-subtle)]/40 pt-10 pb-6">
            <div className="flex justify-between items-start gap-8">
              <div className="max-w-xs flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-hana-gradient rounded-2xl flex justify-center items-center shadow-md shadow-pink-500/20">
                    <Heart className="w-5 h-5 text-white fill-white/10" />
                  </div>
                  <span className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Hana</span>
                </div>
                <p className="text-[var(--hana-muted)] text-sm leading-relaxed">
                  India's social companionship platform. Verified, safe, and memorable.
                </p>
              </div>
              <div className="flex gap-16">
                {[
                  { title: 'Explore', links: [{ label: 'Home', href: '/home' }, { label: 'Discover', href: '/discover' }, { label: 'Bookings', href: '/bookings' }] },
                  { title: 'Company', links: [{ label: 'About' }, { label: 'Careers' }, { label: 'Safety' }] },
                  { title: 'Support', links: [{ label: 'Help Center' }, { label: 'Contact' }, { label: 'Privacy' }] },
                ].map(col => (
                  <div key={col.title} className="flex flex-col gap-2.5">
                    <span className="font-semibold text-sm text-[var(--hana-charcoal)]">{col.title}</span>
                    {col.links.map(link => (
                      link.href ? (
                        <Link key={link.label} href={link.href} className="text-[var(--hana-muted)] text-sm hover:text-pink-500 transition-colors">{link.label}</Link>
                      ) : (
                        <span key={link.label} className="text-[var(--hana-muted)] text-sm cursor-pointer hover:text-pink-500 transition-colors">{link.label}</span>
                      )
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[var(--hana-subtle)]/30 flex mt-8 pt-6 justify-between items-center">
              <span className="text-[var(--hana-muted)] text-xs">© 2025 Hana. Made with ❤️ in India.</span>
            </div>
          </footer>
        </motion.main>
      </div>

      {/* ===== MOBILE ===== */}
      <div className="md:hidden pb-24 relative z-10">
        {/* Hero */}
        <header className="bg-hana-gradient-animated px-6 pt-14 pb-10 rounded-b-[2.5rem] shadow-2xl shadow-pink-500/20 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full border border-white/15 text-white/90 text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3 text-amber-300" /> Welcome back, {firstName}
            </div>
            <h1 className="font-heading text-[1.85rem] font-bold tracking-tight leading-tight mb-3">
              Your next great<br />experience awaits.
            </h1>
            <p className="text-white/75 text-sm leading-relaxed mb-6">
              Verified companions across India for coffee, walks, food trails, and more.
            </p>
            <Link href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-pink-600 rounded-full text-sm font-semibold shadow-lg shadow-white/20 btn-press">
              Explore Companions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Stats row */}
        <div className="px-5 mt-5">
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '20+', label: 'Companions', emoji: '👩' },
              { value: '10+', label: 'Cities', emoji: '🗺️' },
              { value: '4.8★', label: 'Avg Rating', emoji: '⭐' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3.5 border border-[var(--hana-subtle)]/30 shadow-sm text-center">
                <div className="text-lg mb-0.5">{s.emoji}</div>
                <div className="font-bold text-[var(--hana-charcoal)] text-base">{s.value}</div>
                <div className="text-[var(--hana-muted)] text-[10px] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <section className="px-5 mt-8">
          <h2 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-4">How It Works</h2>
          <div className="space-y-3">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="bg-white rounded-2xl p-4 border border-[var(--hana-subtle)]/30 shadow-sm flex items-start gap-4">
                <div className="text-2xl shrink-0 mt-0.5">{step.emoji}</div>
                <div>
                  <div className="text-[10px] font-bold text-[var(--hana-blush-dark)] tracking-widest uppercase mb-0.5">{step.step}</div>
                  <h3 className="font-semibold text-[var(--hana-charcoal)] text-sm">{step.title}</h3>
                  <p className="text-[var(--hana-muted)] text-xs mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experiences */}
        <section className="px-5 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-lg font-bold text-[var(--hana-charcoal)]">What You Can Do</h2>
            <Link href="/discover" className="text-xs font-semibold text-pink-500">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {EXPERIENCES.map(exp => (
              <Link key={exp.label} href="/discover"
                className="bg-white rounded-2xl p-4 border border-[var(--hana-subtle)]/30 shadow-sm flex items-start gap-3">
                <span className="text-xl shrink-0">{exp.emoji}</span>
                <div>
                  <h3 className="font-semibold text-[var(--hana-charcoal)] text-xs">{exp.label}</h3>
                  <p className="text-[var(--hana-muted)] text-[10px] mt-0.5 leading-relaxed">{exp.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="px-5 mt-8">
          <h2 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-4">Why Hana</h2>
          <div className="space-y-3">
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start gap-4 ${f.color}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--hana-charcoal)] text-sm">{f.title}</h3>
                    <p className="text-[var(--hana-muted)] text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Cities */}
        <section className="px-5 mt-8">
          <h2 className="font-heading text-lg font-bold text-[var(--hana-charcoal)] mb-4">Available Cities</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map(city => (
              <Link key={city} href={`/discover?city=${city}`}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[var(--hana-subtle)]/40 rounded-full text-xs font-medium text-[var(--hana-ash)] hover:border-pink-300 hover:bg-[var(--hana-ivory)] transition-all btn-press shadow-sm">
                <MapPin className="w-3 h-3 text-pink-400" /> {city}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 mt-8">
          <div className="bg-hana-gradient rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <h2 className="font-heading font-bold text-xl mb-2 relative z-10">Ready to explore?</h2>
            <p className="text-white/75 text-sm mb-4 relative z-10">Find your perfect companion today.</p>
            <Link href="/discover"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-pink-600 rounded-full text-sm font-semibold shadow-md btn-press relative z-10">
              Browse Companions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

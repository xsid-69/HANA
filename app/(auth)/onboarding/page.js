'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { completeOnboarding as completeOnboardingAction } from '@/app/actions/users'
import { Heart, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const INTERESTS = [
  { label: 'Dining', emoji: '🍽️' },
  { label: 'Cafés', emoji: '☕' },
  { label: 'Museums', emoji: '🏛️' },
  { label: 'Shopping', emoji: '🛍️' },
  { label: 'Nightlife', emoji: '🌙' },
  { label: 'Outdoors', emoji: '🌿' },
  { label: 'Fitness', emoji: '💪' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Music', emoji: '🎵' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Culture', emoji: '🌏' },
  { label: 'Photography', emoji: '📸' },
  { label: 'Food Tours', emoji: '🍜' },
  { label: 'Events', emoji: '🎉' },
]

const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Gujarati', 'Malayalam', 'Punjabi', 'Urdu', 'Rajasthani']

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    role: '',
    name: session?.user?.name || '',
    city: '',
    tags: [],
    // Companion fields
    displayName: '',
    age: '',
    bio: '',
    hourlyRate: '',
    languages: [],
  })

  const isCompanion = formData.role === 'COMPANION'
  const totalSteps = isCompanion ? 4 : 3

  const STEPS = isCompanion
    ? [
        { title: 'Your Role', subtitle: 'How will you use Hana?' },
        { title: 'About You', subtitle: 'Tell us a bit about yourself' },
        { title: 'Your Interests', subtitle: 'Pick what you enjoy (at least 3)' },
        { title: 'Companion Profile', subtitle: 'Set up your companion details' },
      ]
    : [
        { title: 'Your Role', subtitle: 'How will you use Hana?' },
        { title: 'About You', subtitle: 'Tell us a bit about yourself' },
        { title: 'Your Interests', subtitle: 'Pick what you enjoy (at least 3)' },
      ]

  const completeOnboarding = useMutation({
    mutationFn: completeOnboardingAction,
    onSuccess: (data) => {
      if (data.role === 'COMPANION') {
        router.push('/companion/dashboard')
      } else {
        router.push('/discover')
      }
    },
  })

  const handleComplete = () => {
    const payload = {
      role: formData.role,
      name: formData.name,
      city: formData.city,
      tags: formData.tags,
    }
    if (isCompanion) {
      payload.displayName = formData.displayName || formData.name
      payload.age = parseInt(formData.age) || 25
      payload.bio = formData.bio
      payload.hourlyRate = parseInt(formData.hourlyRate) || 1000
      payload.languages = formData.languages.length ? formData.languages : ['English', 'Hindi']
    }
    completeOnboarding.mutate(payload)
  }

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F9F0F4]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-pink-300/30 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-purple-200/25 rounded-full blur-[90px] animate-float-gentle" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-fuchsia-200/15 rounded-full blur-[80px] animate-float-slow" />
      </div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <div className="w-10 h-10 bg-hana-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
            <Heart className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Hana</span>
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const idx = i + 1
              const done = idx < step
              const active = idx === step
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-400 ${
                    done ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20' :
                    active ? 'bg-hana-gradient text-white shadow-lg shadow-pink-500/30 scale-110' :
                    'bg-white border-2 border-[var(--hana-subtle)] text-[var(--hana-muted)]'
                  }`}>
                    {done ? <Check className="w-3.5 h-3.5" /> : idx}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`h-0.5 w-12 sm:w-16 rounded-full transition-all duration-500 ${
                      done ? 'bg-gradient-to-r from-pink-500 to-rose-400' : 'bg-[var(--hana-subtle)]'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-center text-xs text-[var(--hana-muted)] font-medium">
            Step {step} of {totalSteps} — {STEPS[step - 1].subtitle}
          </p>
        </motion.div>

        {/* Card */}
        <div className="glass rounded-[2rem] p-7 shadow-xl shadow-pink-200/20 border border-white/60">
          <AnimatePresence mode="wait">
            {/* Step 1: Role */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">Welcome to Hana</h2>
                  <p className="text-sm text-[var(--hana-muted)]">How would you like to use the platform?</p>
                </div>
                <div className="space-y-3">
                  {[
                    { role: 'CLIENT', title: "I'm looking for a companion", desc: 'Browse and book companions for social experiences', emoji: '🔍' },
                    { role: 'COMPANION', title: 'I want to be a companion', desc: 'Offer your time and expertise to others', emoji: '✨' },
                  ].map(opt => (
                    <button key={opt.role}
                      onClick={() => { setFormData(prev => ({ ...prev, role: opt.role })); setStep(2) }}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 btn-press group ${
                        formData.role === opt.role
                          ? 'border-pink-500 bg-pink-50/80 shadow-md shadow-pink-200/40'
                          : 'border-[var(--hana-subtle)] bg-white/60 hover:border-pink-300 hover:bg-pink-50/40'
                      }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{opt.emoji}</span>
                        <div>
                          <div className="font-semibold text-[var(--hana-charcoal)] text-sm">{opt.title}</div>
                          <div className="text-xs text-[var(--hana-muted)] mt-0.5">{opt.desc}</div>
                        </div>
                        <ArrowRight className={`w-4 h-4 ml-auto mt-1 transition-all duration-300 ${
                          formData.role === opt.role ? 'text-pink-500 translate-x-0' : 'text-[var(--hana-subtle)] -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                        }`} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: About */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">About You</h2>
                  <p className="text-sm text-[var(--hana-muted)]">Tell us a bit about yourself</p>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'name', label: 'Your name', placeholder: 'e.g. Yuki', type: 'text' },
                    { key: 'city', label: 'Your city', placeholder: 'e.g. Mumbai', type: 'text' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">{field.label}</label>
                      <input type={field.type} value={formData[field.key]}
                        onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 px-4 py-3 border border-[var(--hana-subtle)] rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-white/80 btn-press">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={() => setStep(3)} disabled={!formData.name || !formData.city}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-hana-gradient text-white rounded-xl text-sm font-semibold disabled:opacity-40 shadow-lg shadow-pink-500/20 btn-press">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Interests */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">Your Interests</h2>
                  <p className="text-sm text-[var(--hana-muted)]">Select what you enjoy — pick at least 3</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(({ label, emoji }) => {
                    const selected = formData.tags.includes(label)
                    return (
                      <button key={label} onClick={() => toggleTag(label)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-250 btn-press ${
                          selected
                            ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20 scale-105'
                            : 'bg-white/70 text-[var(--hana-ash)] border border-[var(--hana-subtle)] hover:border-pink-300 hover:bg-pink-50/50'
                        }`}>
                        <span>{emoji}</span> {label}
                      </button>
                    )
                  })}
                </div>
                {formData.tags.length > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[var(--hana-muted)] text-center">
                    {formData.tags.length} selected{formData.tags.length < 3 ? ` — pick ${3 - formData.tags.length} more` : ' ✓'}
                  </motion.p>
                )}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 px-4 py-3 border border-[var(--hana-subtle)] rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-white/80 btn-press">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  {isCompanion ? (
                    <button onClick={() => setStep(4)} disabled={formData.tags.length < 3}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-hana-gradient text-white rounded-xl text-sm font-semibold disabled:opacity-40 shadow-lg shadow-pink-500/20 btn-press">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={handleComplete} disabled={formData.tags.length < 3 || completeOnboarding.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-hana-gradient text-white rounded-xl text-sm font-semibold disabled:opacity-40 shadow-lg shadow-pink-500/20 btn-press">
                      <Sparkles className="w-4 h-4" />
                      {completeOnboarding.isPending ? 'Setting up...' : 'Get Started'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Companion Profile (only for COMPANION role) */}
            {step === 4 && isCompanion && (
              <motion.div key="step4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">Companion Profile</h2>
                  <p className="text-sm text-[var(--hana-muted)]">Set up your profile so clients can find you</p>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Display Name</label>
                    <input type="text" value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder={formData.name || 'e.g. Priya'}
                      className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Age</label>
                      <input type="number" value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="25" min="18" max="99"
                        className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Hourly Rate (₹)</label>
                      <input type="number" value={formData.hourlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                        placeholder="1000" min="100"
                        className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Bio</label>
                    <textarea value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell people what makes you a great companion..."
                      rows={3}
                      className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all resize-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--hana-ash)] mb-2">Languages you speak</label>
                    <div className="flex flex-wrap gap-1.5">
                      {LANGUAGES.map(lang => {
                        const selected = formData.languages.includes(lang)
                        return (
                          <button key={lang} onClick={() => toggleLanguage(lang)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press ${
                              selected
                                ? 'bg-hana-gradient text-white shadow-sm'
                                : 'bg-white/70 text-[var(--hana-ash)] border border-[var(--hana-subtle)] hover:border-pink-300'
                            }`}>
                            {lang}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-1.5 px-4 py-3 border border-[var(--hana-subtle)] rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-white/80 btn-press">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button onClick={handleComplete}
                    disabled={!formData.age || !formData.bio || formData.bio.length < 10 || completeOnboarding.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-hana-gradient text-white rounded-xl text-sm font-semibold disabled:opacity-40 shadow-lg shadow-pink-500/20 btn-press">
                    <Sparkles className="w-4 h-4" />
                    {completeOnboarding.isPending ? 'Creating profile...' : 'Launch Profile'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

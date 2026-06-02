'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'

export default function RegisterPage() {
  const router = useRouter()
  const { fetchMe } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        return
      }
      await fetchMe()
      router.push('/onboarding')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-hana-gradient-animated relative overflow-hidden flex-col justify-between p-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_35%,rgba(255,255,255,0.14),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(179,136,255,0.18),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[420px] h-[420px] bg-white/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-16 right-16 w-36 h-36 bg-white/8 rounded-full blur-2xl animate-float-gentle" />

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white/30" />
          </div>
          <span className="font-heading text-2xl font-bold text-white tracking-tight">Hana</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/15 text-white/90 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Join thousands of members
          </div>
          <h1 className="font-heading text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Start your<br />journey today.
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Create your account and discover warm, curious companions for the moments that matter most.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { emoji: '🔒', label: 'Verified companions' },
              { emoji: '⭐', label: 'Rated experiences' },
              { emoji: '💬', label: 'In-app messaging' },
              { emoji: '🌏', label: 'Cities worldwide' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-white/80 text-sm">
                <span>{item.emoji}</span> {item.label}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-white/40 text-xs relative z-10">
          © 2025 Hana · Safe, verified, memorable.
        </motion.p>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden bg-[#FEFCFD]">
        <div className="absolute top-[-12%] right-[-12%] w-[380px] h-[380px] bg-pink-100/60 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" />
        <div className="absolute bottom-[-12%] left-[-12%] w-[320px] h-[320px] bg-purple-100/35 rounded-full blur-[70px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] space-y-7 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 bg-hana-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Hana</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading text-[1.75rem] font-bold text-[var(--hana-charcoal)] tracking-tight">Create account</h2>
            <p className="text-[var(--hana-muted)] text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">Sign in</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Yuki Tanaka"
                required
                minLength={2}
                className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-3 pr-11 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--hana-muted)] hover:text-[var(--hana-ash)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength hint */}
              {form.password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      form.password.length >= i * 3
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                        : 'bg-[var(--hana-subtle)]'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-hana-gradient text-white rounded-2xl text-sm font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/20 btn-press mt-2"
            >
              {loading ? 'Creating account...' : <><span>Create Account</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--hana-muted)] leading-relaxed">
            By signing up, you agree to our{' '}
            <span className="text-[var(--hana-ash)] underline underline-offset-2 cursor-pointer hover:text-pink-500 transition-colors">Terms</span>{' '}
            and{' '}
            <span className="text-[var(--hana-ash)] underline underline-offset-2 cursor-pointer hover:text-pink-500 transition-colors">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/auth-store'

const SOCIAL_PROOF = [
  { emoji: '🧑' }, { emoji: '👩' }, { emoji: '🧑‍🦱' }, { emoji: '👨' },
]

export default function LoginPage() {
  const router = useRouter()
  const { fetchMe } = useAuthStore()
  const [tab, setTab] = useState('password') // 'password' | 'magic'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' })
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }
      await fetchMe()
      if (!data.user?.onboarded) {
        router.push('/onboarding')
      } else if (data.user?.role === 'COMPANION') {
        router.push('/companion/dashboard')
      } else {
        router.push('/home')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await signIn('resend', { email, callbackUrl: '/home', redirect: false })
      setEmailSent(true)
    } catch {
      setError('Failed to send magic link.')
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

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <Heart className="w-5 h-5 text-white fill-white/30" />
          </div>
          <span className="font-heading text-2xl font-bold text-white tracking-tight">Hana</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative z-10 space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/15 text-white/90 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Social companionship, reimagined
          </div>
          <h1 className="font-heading text-5xl font-bold text-white leading-[1.1] tracking-tight">
            Find people<br />worth knowing.
          </h1>
          <p className="text-white/75 text-lg leading-relaxed">
            Connect with verified companions for dining, city walks, creative afternoons, and unforgettable conversations.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2.5">
              {SOCIAL_PROOF.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                  className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/25 flex items-center justify-center text-lg shadow-md">
                  {p.emoji}
                </motion.div>
              ))}
            </div>
            <p className="text-white/75 text-sm"><span className="font-bold text-white">500+</span> companions available</p>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-white/40 text-xs relative z-10">
          © 2025 Hana · Safe, verified, memorable.
        </motion.p>
      </div>

      {/* Right: form */}
      <div className="w-full lg:w-[48%] flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden bg-[#FEFCFD]">
        <div className="absolute top-[-12%] right-[-12%] w-[380px] h-[380px] bg-pink-100/60 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" />
        <div className="absolute bottom-[-12%] left-[-12%] w-[320px] h-[320px] bg-purple-100/35 rounded-full blur-[70px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[400px] space-y-7 relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center">
            <div className="w-10 h-10 bg-hana-gradient rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
              <Heart className="w-5 h-5 text-white fill-white/20" />
            </div>
            <span className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Hana</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-heading text-[1.75rem] font-bold text-[var(--hana-charcoal)] tracking-tight">Welcome back</h2>
            <p className="text-[var(--hana-muted)] text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">Sign up</Link>
            </p>
          </div>

          {/* Google */}
          <button onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-[var(--hana-subtle)] rounded-2xl text-sm font-medium text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)] hover:border-pink-200 shadow-sm transition-all duration-300 btn-press">
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--hana-subtle)]/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#FEFCFD] px-3 text-[var(--hana-muted)] tracking-wider">or</span>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 bg-[var(--hana-ivory)] rounded-xl">
            {[{ key: 'password', label: 'Password' }, { key: 'magic', label: 'Magic Link' }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-250 ${
                  tab === t.key
                    ? 'bg-white text-[var(--hana-charcoal)] shadow-sm'
                    : 'text-[var(--hana-muted)] hover:text-[var(--hana-ash)]'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'password' ? (
              <motion.form key="password" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••" required
                      className="w-full px-4 py-3 pr-11 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--hana-muted)] hover:text-[var(--hana-ash)] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    {error}
                  </motion.p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-hana-gradient text-white rounded-2xl text-sm font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/20 btn-press">
                  {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : emailSent ? (
              <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4 p-7 bg-emerald-50 rounded-2xl border border-emerald-200/60">
                <div className="text-4xl">✉️</div>
                <p className="text-emerald-600 font-semibold text-base">Check your inbox!</p>
                <p className="text-[var(--hana-ash)] text-sm leading-relaxed">
                  We sent a magic link to <strong className="text-[var(--hana-charcoal)]">{email}</strong>
                </p>
              </motion.div>
            ) : (
              <motion.form key="magic" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }} onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--hana-ash)] mb-1.5">Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    className="w-full px-4 py-3 border border-[var(--hana-subtle)] bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    {error}
                  </motion.p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-hana-gradient text-white rounded-2xl text-sm font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/20 btn-press">
                  {loading ? 'Sending...' : <><span>Send Magic Link</span> <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-[var(--hana-muted)] leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[var(--hana-ash)] underline underline-offset-2 cursor-pointer hover:text-pink-500 transition-colors">Terms</span>{' '}
            and{' '}
            <span className="text-[var(--hana-ash)] underline underline-offset-2 cursor-pointer hover:text-pink-500 transition-colors">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/home' })
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await signIn('resend', { email, callbackUrl: '/home', redirect: false })
      setEmailSent(true)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-hana-gradient-animated relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.12),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/8 rounded-full blur-2xl animate-float-gentle" />
        <div className="absolute bottom-40 left-10 w-20 h-20 bg-violet-300/20 rounded-full blur-xl animate-float-slow" />
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <Heart className="w-6 h-6 text-white fill-white/20" />
              </div>
              <span className="font-heading text-2xl font-bold text-white">Hana</span>
            </div>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white leading-tight">
              Find your perfect companion for any occasion.
            </h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-md">
              Connect with verified companions for dining, events, city walks, and unforgettable social experiences.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {['🧑', '👩', '🧑‍🦱', '👨'].map((emoji, i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-lg">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-white/75 text-sm">
                <span className="font-semibold text-white">500+</span> companions available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden bg-[#FEFCFD]">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-pink-100/50 rounded-full blur-[80px] animate-pulse-soft pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-100/30 rounded-full blur-[60px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-4">
            <div className="w-9 h-9 bg-hana-gradient rounded-xl flex items-center justify-center shadow-md">
              <Heart className="w-4.5 h-4.5 text-white fill-white/20" />
            </div>
            <span className="font-heading text-xl font-bold text-gray-900">Hana</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-400 text-sm">Sign in to continue to your account</p>
          </div>

          {emailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 p-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
            >
              <div className="text-3xl">✉️</div>
              <p className="text-emerald-500 font-semibold">Check your email!</p>
              <p className="text-gray-700 text-sm">
                We sent a magic link to <strong>{email}</strong>
              </p>
            </motion.div>
          ) : (
            <div className="space-y-5">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-pink-100/50 rounded-xl text-sm font-medium text-gray-700 hover:bg-pink-50/50 hover:border-pink-300 shadow-sm btn-press"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-pink-100/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F9F0F4] px-3 text-gray-400">or continue with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-pink-100/60 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400/30 focus:border-pink-500 placeholder:text-gray-400 text-gray-900 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold disabled:opacity-50 shadow-lg shadow-pink-500/15 btn-press"
                >
                  {loading ? 'Sending link...' : 'Send Magic Link'}
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-gray-700 underline cursor-pointer">Terms of Service</span> and{' '}
            <span className="text-gray-700 underline cursor-pointer">Privacy Policy</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { trpc } from '@/lib/trpc-client'

const INTERESTS = [
  'Dining', 'Cafés', 'Museums', 'Shopping', 'Nightlife',
  'Outdoors', 'Fitness', 'Gaming', 'Music', 'Art',
  'Culture', 'Photography', 'Food Tours', 'Events',
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    role: '',
    name: session?.user?.name || '',
    city: '',
    tags: [],
  })

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => router.push('/home'),
  })

  const handleComplete = () => {
    completeOnboarding.mutate({
      role: formData.role,
      name: formData.name,
      city: formData.city,
      tags: formData.tags,
    })
  }

  const toggleTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex gap-1 justify-center">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                i <= step ? 'bg-pink-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Welcome to Hana</h2>
                <p className="text-gray-500 text-sm">How would you like to use the platform?</p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => { setFormData(prev => ({ ...prev, role: 'CLIENT' })); setStep(2) }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 btn-press ${
                    formData.role === 'CLIENT' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">I&apos;m looking for a companion</div>
                  <div className="text-sm text-gray-500 mt-1">Browse and book companions for social experiences</div>
                </button>
                <button
                  onClick={() => { setFormData(prev => ({ ...prev, role: 'COMPANION' })); setStep(2) }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 btn-press ${
                    formData.role === 'COMPANION' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">I want to be a companion</div>
                  <div className="text-sm text-gray-500 mt-1">Offer your time and expertise to others</div>
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">About You</h2>
                <p className="text-gray-500 text-sm">Tell us a bit about yourself</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                    placeholder="e.g. Tokyo"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 btn-press"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.name || !formData.city}
                  className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 disabled:opacity-50 shadow-lg shadow-pink-500/20 btn-press"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Your Interests</h2>
                <p className="text-gray-500 text-sm">Select what you enjoy (pick at least 3)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all duration-300 btn-press ${
                      formData.tags.includes(tag)
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 btn-press"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={formData.tags.length < 3 || completeOnboarding.isPending}
                  className="flex-1 px-4 py-3 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 disabled:opacity-50 shadow-lg shadow-pink-500/20 btn-press"
                >
                  {completeOnboarding.isPending ? 'Setting up...' : 'Get Started'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

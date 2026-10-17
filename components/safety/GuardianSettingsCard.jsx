'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, KeyRound, Loader2, MailCheck, ShieldCheck } from 'lucide-react'
import { canChangeCodeWord, setupCodeWord, testCodeWord } from '@/app/actions/codeword'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function GuardianSettingsCard({ companionId }) {
  const queryClient = useQueryClient()
  const [word, setWord] = useState('')
  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const statusQuery = useQuery({
    queryKey: ['code-word-status', companionId],
    queryFn: () => canChangeCodeWord(companionId),
    enabled: Boolean(companionId),
  })

  const setupMutation = useMutation({
    mutationFn: () => setupCodeWord(companionId, word),
    onSuccess: async (result) => {
      if (result.error) {
        setError(result.error)
        setFeedback('')
        return
      }

      setWord('')
      setEditing(false)
      setError('')
      setFeedback('Code word set ✓')
      await queryClient.invalidateQueries({ queryKey: ['code-word-status', companionId] })
    },
    onError: () => {
      setError('Unable to set your code word. Please try again.')
      setFeedback('')
    },
  })
  const testMutation = useMutation({
    mutationFn: () => testCodeWord(companionId),
    onSuccess: () => {
      setError('')
      setFeedback('Test alert sent to your email')
    },
    onError: () => {
      setFeedback('')
      setError('The test email could not be sent. Please try again.')
    },
  })

  const status = statusQuery.data
  const showSetup = !status?.isSet || editing

  const handleSubmit = (event) => {
    event.preventDefault()
    setError('')
    setFeedback('')
    setupMutation.mutate()
  }

  if (!companionId || statusQuery.isLoading) {
    return (
      <section aria-label="Guardian Settings" className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-gray-50" />
      </section>
    )
  }

  return (
    <section aria-labelledby="guardian-settings-title" className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50">
          <ShieldCheck className="h-5 w-5 text-[var(--hana-blush-dark)]" aria-hidden="true" />
        </div>
        <div>
          <h2 id="guardian-settings-title" className="text-base font-bold text-[var(--hana-charcoal)]">Guardian Settings</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--hana-ash)]">
            Your code word silently contacts your safety network when you use it in a chat during an active booking.
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hana-muted)]" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold text-[var(--hana-charcoal)]">Code Word Setup</h3>
              {status?.isSet && !editing ? (
                <div className="mt-1.5">
                  <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Code word is active
                  </p>
                  <p className="mt-1 text-xs text-[var(--hana-muted)]">Set on {formatDate(status.setOn)}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {showSetup ? (
          <form onSubmit={handleSubmit} className="mt-4 max-w-xl">
            <label htmlFor="guardian-code-word" className="mb-1.5 block text-sm font-medium text-[var(--hana-charcoal)]">
              Enter your secret code word
            </label>
            <input
              id="guardian-code-word"
              type="password"
              value={word}
              onChange={(event) => setWord(event.target.value)}
              autoComplete="new-password"
              minLength={5}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[var(--hana-charcoal)] outline-none transition focus:border-pink-300 focus:bg-white focus:ring-2 focus:ring-pink-100"
              placeholder="Enter your secret code word"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--hana-ash)]">
              Min 5 characters. Choose something you’d naturally say in conversation.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={setupMutation.isPending || word.trim().length < 5}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--hana-blush-dark)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--hana-rose)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {setupMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {status?.isSet ? 'Save New Code Word' : 'Set Code Word'}
              </button>
              {status?.isSet ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setWord('')
                    setError('')
                  }}
                  className="min-h-10 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[var(--hana-ash)] transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
        {status?.isSet && !editing ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setFeedback('')
                setError('')
                testMutation.mutate()
              }}
              disabled={testMutation.isPending}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 transition hover:bg-pink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <MailCheck className="h-4 w-4" aria-hidden="true" />}
              Test My Code Word
            </button>

            {status.canChange ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true)
                  setFeedback('')
                  setError('')
                }}
                className="min-h-10 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-[var(--hana-ash)] transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300"
              >
                Change Code Word
              </button>
            ) : (
              <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-sm text-[var(--hana-ash)]">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Can change on {formatDate(status.nextChangeDate)}
              </span>
            )}
          </div>
        ) : null}

        <div aria-live="polite" className="mt-3 min-h-5">
          {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
          {error ? <p role="alert" className="text-sm font-medium text-red-600">{error}</p> : null}
          {statusQuery.isError ? <p role="alert" className="text-sm font-medium text-red-600">Guardian settings could not be loaded.</p> : null}
        </div>
      </div>
    </section>
  )
}

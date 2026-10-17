'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Clock3, ExternalLink, Loader2, Radio, ShieldAlert } from 'lucide-react'
import { getAdminAlerts, markEvidenceReviewed } from '@/app/actions/codeword'
import { supabase } from '@/lib/supabase'

function formatBooking(booking) {
  if (!booking) return 'Booking details unavailable'
  const date = new Date(booking.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${booking.activityType} · ${date} · ${booking.startTime}–${booking.endTime}`
}

export default function AdminAlertsClient({ initialAlerts = [], initialError = '' }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [pendingId, setPendingId] = useState(null)
  const [error, setError] = useState(initialError)
  const [connected, setConnected] = useState(false)

  const refreshAlerts = useCallback(async () => {
    try {
      const nextAlerts = await getAdminAlerts()
      setAlerts(nextAlerts)
      setError('')
    } catch {
      setError('Alerts could not be refreshed.')
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('admin:alerts')
      .on('broadcast', { event: 'codeword_triggered' }, refreshAlerts)
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refreshAlerts])

  const handleReviewed = async (id) => {
    setPendingId(id)
    setError('')

    try {
      await markEvidenceReviewed(id)
      setAlerts(current => current.map(alert => (
        alert.id === id ? { ...alert, adminReviewed: true } : alert
      )))
    } catch {
      setError('The evidence record could not be marked as reviewed.')
    } finally {
      setPendingId(null)
    }
  }
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
              Code Word Alerts
            </h1>
            <p className="mt-1 text-sm text-gray-600">Emergency alerts from active Hana bookings.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
            <Radio className={`h-3.5 w-3.5 ${connected ? 'text-emerald-600' : 'text-amber-600'}`} aria-hidden="true" />
            {connected ? 'Listening live' : 'Connecting'}
          </div>
        </header>

        {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 space-y-4" aria-live="polite">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold">No code word alerts</h2>
              <p className="mt-1 text-sm text-gray-600">New alerts will appear here in real time.</p>
            </div>
          ) : alerts.map(alert => (
            <article
              id={`evidence-${alert.id}`}
              key={alert.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm ${alert.adminReviewed ? 'border-gray-200' : 'border-red-200'}`}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {alert.companion.image ? (
                    <img src={alert.companion.image} alt={alert.companion.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">
                      {alert.companion.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-bold">{alert.companion.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${alert.adminReviewed ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {alert.adminReviewed ? 'Reviewed' : 'Needs review'}
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-gray-500">Client</dt>
                      <dd className="font-medium text-gray-900">{alert.client.name}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Booking</dt>
                      <dd className="font-medium text-gray-900">{formatBooking(alert.booking)}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      {new Date(alert.timestamp).toLocaleString('en-IN')}
                    </span>
                    <a href={`#evidence-${alert.id}`} className="inline-flex items-center gap-1.5 font-medium text-pink-700 hover:underline">
                      Evidence log {alert.id}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleReviewed(alert.id)}
                  disabled={alert.adminReviewed || pendingId === alert.id}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-600"
                >
                  {pendingId === alert.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {alert.adminReviewed ? 'Reviewed' : 'Mark as Reviewed'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

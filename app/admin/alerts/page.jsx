import { redirect } from 'next/navigation'
import { getAdminAlerts } from '@/app/actions/codeword'
import AdminAlertsClient from './AdminAlertsClient'

export const dynamic = 'force-dynamic'

export default async function AdminAlertsPage() {
  let initialAlerts = []
  let initialError = ''

  try {
    initialAlerts = await getAdminAlerts()
  } catch (error) {
    if (error?.message === 'Unauthorized') {
      redirect('/login?redirect=/admin/alerts')
    }
    if (error?.message === 'Forbidden') {
      return (
        <main className="min-h-screen bg-gray-50 px-4 py-16 text-gray-950">
          <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-xl font-bold">Admin access required</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              This account does not have the ADMIN role. Sign in with an administrator account to view safety alerts.
            </p>
          </div>
        </main>
      )
    }

    console.error('Failed to load admin alerts', error)
    initialError = 'Admin alerts could not be loaded. Check that the safety database tables have been applied.'
  }

  return <AdminAlertsClient initialAlerts={initialAlerts} initialError={initialError} />
}

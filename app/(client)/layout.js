'use client'

import AuthGuard from '@/components/auth/AuthGuard'

export default function ClientLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>
}

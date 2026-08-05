'use client'

import CompanionSidebar from '@/components/layout/CompanionSidebar'
import CompanionBottomNav from '@/components/layout/CompanionBottomNav'
import CompanionTopNav from '@/components/layout/CompanionTopNav'
import AuthGuard from '@/components/auth/AuthGuard'

export default function CompanionLayout({ children }) {
  return (
    <AuthGuard>
      <div className="relative min-h-[100dvh] bg-[var(--hana-cream)]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,107,138,0.16),transparent_30%),radial-gradient(circle_at_95%_15%,rgba(233,30,99,0.10),transparent_26%)]" aria-hidden="true" />

        <div className="relative hidden md:block">
          <CompanionSidebar />
        </div>

        <main id="main-content" className="relative min-h-[100dvh] pb-24 md:ml-[256px] md:pb-0">
          <CompanionTopNav />
          <div className="px-4 py-5 sm:px-6 md:px-8 md:py-7 xl:px-10">
            {children}
          </div>
        </main>

        <div className="relative md:hidden">
          <CompanionBottomNav />
        </div>
      </div>
    </AuthGuard>
  )
}

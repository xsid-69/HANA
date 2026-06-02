'use client'

import CompanionSidebar from '@/components/layout/CompanionSidebar'
import CompanionBottomNav from '@/components/layout/CompanionBottomNav'

export default function CompanionLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--hana-cream)] relative">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-8%] w-[550px] h-[550px] bg-pink-300/18 rounded-full blur-[110px] animate-pulse-soft" />
        <div className="absolute top-[30%] right-[-12%] w-[500px] h-[500px] bg-purple-200/14 rounded-full blur-[120px] animate-float-gentle" />
        <div className="absolute bottom-[-5%] left-[25%] w-[450px] h-[450px] bg-fuchsia-200/10 rounded-full blur-[110px]" />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block relative z-10">
        <CompanionSidebar />
      </div>

      {/* Main Content */}
      <main className="md:ml-[240px] min-h-screen pb-24 md:pb-0 relative z-10">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden relative z-10">
        <CompanionBottomNav />
      </div>
    </div>
  )
}

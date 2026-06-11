'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { useState } from 'react'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

const NAV_LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/messages', label: 'Messages' },
  { href: '/profile', label: 'Profile' },
]

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user
  const [searchVal, setSearchVal] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
      <div className="flex px-12 py-3.5 justify-between items-center gap-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/discover" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex justify-center items-center shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow group-hover:scale-105 duration-300">
            <Heart className="w-5 h-5 text-white fill-white/30" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-gray-900">Hana</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-0.5 bg-gray-50 rounded-full p-1 border border-gray-100">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || (link.href === '/discover' && pathname.startsWith('/companion'))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  isActive ? 'font-semibold text-white' : 'font-medium text-gray-500 hover:text-gray-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-md shadow-pink-500/25"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Search + Bell + Avatar */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative rounded-full bg-white border border-gray-200 flex px-4 py-2.5 items-center w-56 hover:border-pink-300 transition-colors focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="bg-transparent outline-none text-sm ml-2 w-full placeholder:text-gray-400 text-gray-900"
              placeholder="Search companions..."
            />
          </form>

          <NotificationDropdown />

          <Link href="/profile" className="w-10 h-10 rounded-full ring-2 ring-pink-200 overflow-hidden hover:ring-pink-400 hover:scale-105 transition-all cursor-pointer shadow-md">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-sm font-bold text-white">
                {user?.name?.[0] || '?'}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

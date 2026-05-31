'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Bell, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/discover', label: 'Discover' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/messages', label: 'Messages' },
  { href: '/profile', label: 'Profile' },
]

export default function TopNav() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
      <div className="flex px-12 py-3.5 justify-between items-center gap-6 max-w-[1440px] mx-auto">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex justify-center items-center shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow group-hover:scale-105 duration-300">
            <Heart className="w-5 h-5 text-white fill-white/30" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-gray-900">
            Hana
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-0.5 bg-gray-50 rounded-full p-1 border border-gray-100">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-5 py-2 rounded-full text-sm transition-all duration-300 ${
                  isActive
                    ? 'font-semibold text-white'
                    : 'font-medium text-gray-500 hover:text-gray-900'
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
          <div className="relative rounded-full bg-white border border-gray-200 flex px-4 py-2.5 items-center w-56 hover:border-pink-300 transition-colors focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              className="bg-transparent outline-none text-sm ml-2 w-full placeholder:text-gray-400 text-gray-900"
              placeholder="Search companions..."
            />
          </div>

          <button className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-pink-300 transition-all btn-press group">
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-pink-500 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 absolute right-2 top-2 border-2 border-white" />
          </button>

          <div className="w-10 h-10 rounded-full ring-2 ring-pink-200 overflow-hidden hover:ring-pink-400 hover:scale-105 transition-all cursor-pointer shadow-md">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-sm font-bold text-white">
                {session?.user?.name?.[0] || '?'}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

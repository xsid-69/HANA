'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Search, Heart, LogIn, User, Calendar, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/auth-store'
import { useState, useRef, useEffect } from 'react'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

const NAV_LINKS = [
  { href: '/discover', label: 'Discover' },
  { href: '/bookings', label: 'Bookings', auth: true },
  { href: '/messages', label: 'Messages', auth: true },
  { href: '/profile', label: 'Profile', auth: true },
]

const MOBILE_MENU_ITEMS = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
]

export default function TopNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user
  const isLoggedIn = !!user
  const [searchVal, setSearchVal] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const visibleLinks = NAV_LINKS.filter(link => !link.auth || isLoggedIn)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchVal.trim()) {
      router.push(`/discover?q=${encodeURIComponent(searchVal.trim())}`)
      setSearchVal('')
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMobileMenuOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

  return (
    <>
      {/* Mobile top navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--hana-subtle)]/60 bg-[var(--hana-cream)]/92 px-4 py-2.5 backdrop-blur-xl md:hidden">
        <div className="relative mx-auto flex h-11 max-w-xl items-center justify-between">
          <Link href="/discover" className="flex min-h-11 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--hana-blush-dark)]">
            <span className="flex size-9 items-center justify-center rounded-xl bg-hana-gradient text-white shadow-[0_8px_20px_-10px_rgba(233,30,99,0.7)]">
              <Heart className="size-4 fill-white/25" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-bold tracking-[-0.03em] text-[var(--hana-charcoal)]">Hana</span>
          </Link>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <NotificationDropdown />
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    aria-label="Open account menu"
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-account-menu"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="size-11 overflow-hidden rounded-[15px] bg-white shadow-sm ring-1 ring-[var(--hana-subtle)] outline-none transition-shadow hover:ring-[var(--hana-pink-light)] focus-visible:ring-2 focus-visible:ring-[var(--hana-blush-dark)]"
                  >
                    {user?.image ? (
                      <img src={user.image} alt={`${user?.name || 'User'} profile`} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center bg-hana-gradient text-sm font-bold text-white">{user?.name?.[0] || '?'}</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {mobileMenuOpen && (
                      <motion.div
                        id="mobile-account-menu"
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-[3.25rem] w-64 overflow-hidden rounded-[20px] border border-[var(--hana-subtle)]/70 bg-white p-2 shadow-[0_22px_60px_-28px_rgba(66,25,43,0.45)]"
                      >
                        <div className="border-b border-[var(--hana-ivory)] px-3 py-3">
                          <p className="truncate text-sm font-semibold text-[var(--hana-charcoal)]">{user?.name || 'User'}</p>
                          <p className="mt-0.5 truncate text-xs text-[var(--hana-muted)]">{user?.email}</p>
                        </div>
                        <nav className="py-1" aria-label="Account menu">
                          {MOBILE_MENU_ITEMS.map(item => (
                            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)] hover:text-[var(--hana-charcoal)]">
                              <item.icon className="size-4 text-[var(--hana-blush-dark)]" aria-hidden="true" />
                              {item.label}
                            </Link>
                          ))}
                        </nav>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--hana-blush-dark)] px-4 text-xs font-semibold text-white shadow-sm shadow-pink-500/20">
                <LogIn className="size-4" aria-hidden="true" /> Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Top Nav */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-pink-100 shadow-sm">
        <div className="flex px-4 py-3.5 justify-between items-center gap-4 lg:px-8 xl:px-12 max-w-[1440px] mx-auto">
          {/* Logo */}
          <Link href="/discover" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex justify-center items-center shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40 transition-shadow group-hover:scale-105 duration-300">
              <Heart className="w-5 h-5 text-white fill-white/30" />
            </div>
            <span className="hidden font-heading font-bold text-xl tracking-tight text-gray-900 lg:inline">Hana</span>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-0.5 bg-gray-50 rounded-full p-1 border border-gray-100">
            {visibleLinks.map(link => {
              const isActive = pathname === link.href || (link.href === '/discover' && pathname.startsWith('/companion'))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2 rounded-full text-sm transition-all duration-300 lg:px-4 xl:px-5 ${
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

          {/* Right: Search + Bell + Avatar / Sign In */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="relative hidden rounded-full bg-white border border-gray-200 px-4 py-2.5 items-center w-48 hover:border-pink-300 transition-colors focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-100 lg:flex xl:w-56">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="bg-transparent outline-none text-sm ml-2 w-full placeholder:text-gray-400 text-gray-900"
                placeholder="Search companions..."
              />
            </form>

            {isLoggedIn ? (
              <>
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
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold rounded-full shadow-md shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-105 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

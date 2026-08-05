'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'

export default function SmoothScrollProvider({ children }) {
  const pathname = usePathname()
  const lenisRef = useRef(null)

  useEffect(() => {
    const reduced = window.localStorage.getItem('hana-motion') === 'reduced'
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'

    if (reduced) return undefined

    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.05,
      anchors: true,
      autoResize: true,
    })

    let frameId = null
    lenisRef.current = lenis
    document.documentElement.classList.add('has-lenis')

    const raf = (time) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
      lenis.destroy()
      lenisRef.current = null
      document.documentElement.classList.remove('has-lenis')
      delete document.documentElement.dataset.motion
    }
  }, [])


  useEffect(() => {
    const lenis = lenisRef.current
    if (!lenis) return undefined

    lenis.stop()
    lenis.scrollTo(0, { immediate: true, force: true })
    const frameId = requestAnimationFrame(() => {
      lenis.resize()
      lenis.start()
    })

    return () => cancelAnimationFrame(frameId)
  }, [pathname])

  return <MotionConfig reducedMotion="never">{children}</MotionConfig>
}
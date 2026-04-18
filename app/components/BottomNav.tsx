'use client'

import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function BottomNav() {
  const pathname = usePathname()
  const links = [
    { href: '/', icon: '🏠', label: 'Accueil' },
    { href: '/jobs', icon: '📋', label: 'Offres' },
    { href: '/candidat/swipe', icon: '💫', label: 'Swipe' },
    { href: '/matches', icon: '✨', label: 'Matchs' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
      <div className="max-w-2xl mx-auto bg-[#0f1729]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/50">
        <div className="flex justify-around py-3">
          {links.map(link => {
            const isActive = pathname === link.href
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors duration-300",
                  isActive ? "text-cyan-400" : "text-gray-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-cyan-400/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="text-2xl relative z-10">{link.icon}</span>
                <span className="text-xs font-bold relative z-10">{link.label}</span>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

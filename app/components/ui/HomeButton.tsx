'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function HomeButton() {
    const pathname = usePathname()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null
    if (pathname === '/') return null

    return (
        <motion.button
            onClick={() => router.push('/')}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 left-6 z-50 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-colors shadow-[0_0_20px_rgba(0,0,0,0.5)] group"
            title="Retour à l'accueil"
        >
            <Home size={24} className="group-hover:fill-current" />
        </motion.button>
    )
}

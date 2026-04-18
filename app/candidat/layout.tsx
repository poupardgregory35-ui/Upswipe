'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, User, Briefcase, Settings, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CandidateLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
            {/* Background Ambient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-black to-black -z-10" />

            {/* Main Content */}
            <main className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen relative">
                {children}
            </main>

            {/* Bottom Navigation (Mobile App Style) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-4 z-50">
                <div className="max-w-md mx-auto flex justify-between items-center text-xs font-medium">


                    <Link href="/candidat/dashboard" className={`flex flex-col items-center gap-1 transition-colors ${isActive('/candidat/dashboard') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Home size={24} strokeWidth={isActive('/candidat/dashboard') ? 2.5 : 2} />
                        <span>Dashboard</span>
                    </Link>

                    <button onClick={handleSignOut} className="flex flex-col items-center gap-1 text-slate-500 hover:text-red-400 transition-colors">
                        <LogOut size={24} />
                        <span>Sortir</span>
                    </button>

                </div>
            </nav>
        </div>
    )
}

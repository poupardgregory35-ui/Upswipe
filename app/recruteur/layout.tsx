'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/app/components/ui/Logo'
import { LayoutDashboard, Users, UserCircle, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RecruiterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [companyName, setCompanyName] = useState<string>('Entreprise')
    const router = useRouter()

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('recruiter_company_name').eq('id', user.id).single()
                if (data?.recruiter_company_name) {
                    setCompanyName(data.recruiter_company_name)
                }
            }
        }
        getProfile()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
        const active = pathname === href
        return (
            <Link
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-semibold ${active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
            >
                <Icon size={18} />
                {label}
            </Link>
        )
    }

    // During onboarding (4 steps) we strip the layout chrome:
    // - no top nav (would let the user escape mid-flow → broken state)
    // - no max-w-7xl/bg-slate-50 wrapper (would create white side-bands
    //   around the dark gradient pages)
    // The onboarding pages render their own full-screen dark layout.
    // We keep a tiny Logout button as a safety net.
    const isOnboarding = pathname?.startsWith('/recruteur/onboarding') ?? false

    if (isOnboarding) {
        return (
            <>
                <button
                    onClick={handleSignOut}
                    className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md text-white/70 hover:text-red-400 hover:bg-white/20 transition-all"
                    title="Déconnexion"
                >
                    <LogOut size={18} />
                </button>
                {children}
            </>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Top Navigation (Desktop/Pro Style) */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                    <div className="flex items-center gap-8">
                        {/* Logo (Custom small version for header if needed, strictly text or reusing Logo component) */}
                        <div className="scale-75 origin-left">
                            <Logo size="sm" />
                        </div>

                        <nav className="hidden md:flex items-center gap-2">
                            <NavItem href="/recruteur/dashboard" icon={LayoutDashboard} label="Tableau de bord" />
                            <NavItem href="/recruteur/swipe" icon={Users} label="Candidats" />
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-slate-900">{companyName}</p>
                            <p className="text-xs text-slate-500">Recruteur</p>
                        </div>
                        <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 text-slate-500">
                            <UserCircle size={20} />
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            title="Déconnexion"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>

                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    )
}

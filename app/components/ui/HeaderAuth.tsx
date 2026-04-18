'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { User, LogOut, Briefcase, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function HeaderAuth() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                setRole(profile?.role || 'candidate')
            }
            setLoading(false)
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setRole(null)
        router.push('/')
        router.refresh()
    }

    if (loading) return null

    if (!user) {
        return null // No generic login link
    }

    if (role === 'recruiter') {
        return (
            <div className="flex items-center gap-6">
                <Link
                    href="/recruteur/dashboard"
                    className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition-colors"
                >
                    <Briefcase size={18} />
                    <span className="hidden md:inline">Mes Missions</span>
                </Link>
                <Link
                    href="/recruteur/dashboard"
                    className="flex items-center gap-2 font-bold text-slate-700 hover:text-blue-600 transition-colors"
                >
                    <LayoutDashboard size={18} />
                    <span className="hidden md:inline">Dashboard</span>
                </Link>
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-semibold"
                >
                    <LogOut size={18} />
                    <span className="hidden md:inline">Déconnexion</span>
                </button>
            </div>
        )
    }


    // Candidate
    return (
        <div className="flex items-center gap-4">
            <Link
                href="/candidate/swipe"
                className="flex items-center gap-2 font-bold text-slate-700 hover:text-green-600 transition-colors"
            >
                <User size={18} />
                <span className="hidden md:inline">Mon Profil</span>
            </Link>
            <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-semibold"
            >
                <LogOut size={18} />
                <span className="hidden md:inline">Déconnexion</span>
            </button>
        </div>
    )
}

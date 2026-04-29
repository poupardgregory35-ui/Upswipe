'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2 } from 'lucide-react'
import { Logo } from '@/app/components/ui/Logo'

export default function ActivationPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [profile, setProfile] = useState<any>(null)
    // When true we display the welcome transition screen for ~2.2s before
    // sending the user to the dashboard. Softens the dark→light jump and
    // gives a "moment of arrival" vibe.
    const [activated, setActivated] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('profiles')
            .select('*, villes_france(*)')
            .eq('id', user.id)
            .single()

        setProfile(data)
    }

    const activate = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({ recruiter_onboarding_completed: true })
            .eq('id', user.id)

        setActivated(true)
        // Hard navigation so the dashboard layout (light theme) is picked up
        // cleanly instead of a flash transition under the dark gradient.
        setTimeout(() => router.push('/recruteur/dashboard'), 2200)
    }

    if (!profile) return null

    if (activated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="text-7xl mb-6 animate-bounce">🎉</div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                        Bienvenue {profile?.recruiter_company_name} !
                    </h1>
                    <p className="text-xl text-gray-300 mb-10">
                        Ton espace recruteur est prêt.
                    </p>
                    <div className="flex justify-center items-center gap-3 text-cyan-400">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm font-semibold">Chargement de ton tableau de bord…</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="flex justify-center mb-6">
                    <Logo size="md" dark />
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Récapitulatif</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                </div>

                {/* Carte Preview */}
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-6">
                    <div className="text-white space-y-3">
                        <div>
                            <div className="text-2xl font-bold">{profile.recruiter_company_name}</div>
                            <div className="text-gray-300">
                                📍 {profile.villes_france?.name}
                            </div>
                        </div>
                        <div className="text-sm">
                            📞 {profile.recruiter_company_phone}
                        </div>
                        {profile.recruiter_company_email && (
                            <div className="text-sm">
                                📧 {profile.recruiter_company_email}
                            </div>
                        )}
                        <div className="pt-3 border-t border-white/20">
                            <div className="text-sm text-gray-300 mb-2">Recherche :</div>
                            <div className="flex gap-2 flex-wrap">
                                {profile.recruiter_needs?.map((need: string) => (
                                    <span key={need} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">
                                        {need}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-orange-400">
                                {profile.recruiter_urgency === 'immediate' && '⚡️ Immédiat'}
                                {profile.recruiter_urgency === 'urgent' && '🔥 Urgent'}
                                {profile.recruiter_urgency === 'planned' && '📅 Planifié'}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={activate}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-6 rounded-2xl text-xl hover:scale-105 transition-transform shadow-2xl"
                >
                    ✓ ACTIVER MON COMPTE RECRUTEUR
                </button>
            </div>
        </div>
    )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function ActivationPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [profile, setProfile] = useState<any>(null)

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
            .update({
                is_available: true,
                candidate_onboarding_completed: true
            })
            .eq('id', user.id)

        router.push('/candidat/swipe')
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Ton profil</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                </div>

                {/* Carte Preview */}
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 mb-6">
                    {profile.candidate_photo_url && (
                        <img
                            src={profile.candidate_photo_url}
                            alt="Photo"
                            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                        />
                    )}
                    <div className="text-center text-white">
                        <div className="text-xl font-bold mb-1">{profile.full_name || 'Candidat'}</div>
                        <div className="text-gray-300 mb-3">
                            {profile.candidate_diploma} • {profile.villes_france?.name}
                        </div>
                        {profile.candidate_tags && profile.candidate_tags.length > 0 && (
                            <div className="flex gap-2 justify-center flex-wrap">
                                {profile.candidate_tags.map((tag: string) => (
                                    <span key={tag} className="bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={activate}
                    className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-black py-6 rounded-2xl text-xl hover:scale-105 transition-transform shadow-2xl"
                >
                    ✓ JE SUIS DISPO
                </button>

                <p className="text-center text-gray-400 text-sm mt-4">
                    Tu recevras des offres adaptées à ton profil
                </p>
            </div>
        </div>
    )
}

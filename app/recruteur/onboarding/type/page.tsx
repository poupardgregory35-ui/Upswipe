'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Logo } from '@/app/components/ui/Logo'

const TYPES = [
    { id: 'pme', emoji: '🚑', label: 'PME Ambulance' },
    { id: 'smur', emoji: '🏥', label: 'SMUR/CHU' },
    { id: 'groupe', emoji: '🏢', label: 'Groupe/Réseau' },
    { id: 'vsl', emoji: '🚕', label: 'VSL/Taxi' },
]

export default function TypePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()

    const saveType = async (type: string) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({
                recruiter_company_type: type,
                role: 'recruiter'
            })
            .eq('id', user.id)

        router.push('/recruteur/onboarding/identite')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                <div className="flex justify-center mb-6">
                    <Logo size="md" dark />
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Type d'entreprise ?</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => saveType(type.id)}
                            className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all active:scale-95"
                        >
                            <div className="text-6xl mb-4">{type.emoji}</div>
                            <div className="text-xl font-bold text-white">{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function DiplomePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()

    const saveDiploma = async (diploma: 'DEA' | 'Auxiliaire') => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({
                candidate_diploma: diploma,
                role: 'candidate'
            })
            .eq('id', user.id)

        router.push('/onboarding/identite')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Ton grade ?</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => saveDiploma('DEA')}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all active:scale-95"
                    >
                        <div className="text-6xl mb-4">🏅</div>
                        <div className="text-xl font-bold text-white">DEA</div>
                        <div className="text-sm text-gray-300 mt-2">Diplôme d'État</div>
                    </button>

                    <button
                        onClick={() => saveDiploma('Auxiliaire')}
                        className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all active:scale-95"
                    >
                        <div className="text-6xl mb-4">🥈</div>
                        <div className="text-xl font-bold text-white">Auxiliaire</div>
                        <div className="text-sm text-gray-300 mt-2">Certificat AEA</div>
                    </button>
                </div>
            </div>
        </div>
    )
}

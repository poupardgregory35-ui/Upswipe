'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const URGENCES = [
    { id: 'immediate', emoji: '⚡️', label: 'Immédiat', sublabel: '<7 jours' },
    { id: 'urgent', emoji: '🔥', label: 'Urgent', sublabel: '<1 mois' },
    { id: 'planned', emoji: '📅', label: 'Planifié', sublabel: '>1 mois' },
]

export default function BesoinsPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [selectedDiplomas, setSelectedDiplomas] = useState<string[]>([])
    const [selectedUrgency, setSelectedUrgency] = useState<string>('urgent')

    const toggleDiploma = (diploma: string) => {
        setSelectedDiplomas(prev =>
            prev.includes(diploma)
                ? prev.filter(d => d !== diploma)
                : [...prev, diploma]
        )
    }

    const canContinue = selectedDiplomas.length >= 1

    const saveAndContinue = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({
                recruiter_needs: selectedDiplomas,
                recruiter_urgency: selectedUrgency
            })
            .eq('id', user.id)

        router.push('/recruteur/onboarding/activation')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Vos besoins</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                {/* Diplômes */}
                <div className="mb-8">
                    <h3 className="text-white font-bold mb-4">Qui recherchez-vous ?</h3>
                    <div className="space-y-3">
                        {['DEA', 'Auxiliaire'].map(diploma => (
                            <label
                                key={diploma}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${selectedDiplomas.includes(diploma)
                                        ? 'bg-blue-500/20 border-blue-500'
                                        : 'bg-white/5 border-white/20'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedDiplomas.includes(diploma)}
                                    onChange={() => toggleDiploma(diploma)}
                                    className="w-5 h-5"
                                />
                                <span className="text-white font-bold">{diploma}</span>
                            </label>
                        ))}
                    </div>
                    {selectedDiplomas.length === 0 && (
                        <p className="text-red-400 text-sm mt-2">⚠️ Cochez au moins 1 profil</p>
                    )}
                </div>

                {/* Urgence */}
                <div className="mb-6">
                    <h3 className="text-white font-bold mb-4">Urgence du recrutement</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {URGENCES.map(urgence => (
                            <button
                                key={urgence.id}
                                onClick={() => setSelectedUrgency(urgence.id)}
                                className={`p-4 rounded-xl border-2 transition ${selectedUrgency === urgence.id
                                        ? 'bg-orange-500/20 border-orange-500'
                                        : 'bg-white/5 border-white/20'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{urgence.emoji}</div>
                                <div className="text-white font-bold text-sm">{urgence.label}</div>
                                <div className="text-gray-400 text-xs">{urgence.sublabel}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={saveAndContinue}
                    disabled={!canContinue}
                    className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}

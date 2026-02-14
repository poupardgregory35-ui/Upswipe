'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const TAGS = [
    { id: 'nuit', emoji: '🌙', label: 'Gardes nuit' },
    { id: 'smur', emoji: '🏥', label: 'SMUR/Urgences' },
    { id: 'pediatrie', emoji: '🧸', label: 'Pédiatrie' },
    { id: 'bariatrique', emoji: '🏋️', label: 'Bariatrique' },
]

export default function TerrainPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        )
    }

    const saveAndContinue = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({ candidate_tags: selectedTags })
            .eq('id', user.id)

        router.push('/onboarding/activation')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Coche ce que tu gères</h1>
                    <p className="text-gray-300">Optionnel mais recommandé</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {TAGS.map(tag => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`p-6 rounded-2xl border-2 transition-all ${selectedTags.includes(tag.id)
                                    ? 'bg-cyan-400 border-cyan-400 text-black'
                                    : 'bg-white/10 border-white/20 text-white'
                                }`}
                        >
                            <div className="text-4xl mb-2">{tag.emoji}</div>
                            <div className="font-bold">{tag.label}</div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={saveAndContinue}
                    className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl hover:bg-cyan-500 transition-all"
                >
                    {selectedTags.length > 0 ? 'Continuer' : 'Passer'}
                </button>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type PresentationType = 'cv' | 'video' | 'text'

export default function PresentationPage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [selectedType, setSelectedType] = useState<PresentationType>('text')
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
    const [pitchText, setPitchText] = useState('')

    const canContinue =
        (selectedType === 'cv' && cvFile) ||
        (selectedType === 'video' && videoBlob) ||
        (selectedType === 'text' && pitchText.length >= 20)

    const saveAndContinue = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const updates: any = {
            candidate_presentation_type: selectedType
        }

        if (selectedType === 'cv' && cvFile) {
            const cvPath = `${user.id}/cv_${Date.now()}.pdf`
            // Check if 'cvs' bucket exists (it should from previous steps)
            const { data } = await supabase.storage
                .from('cvs')
                .upload(cvPath, cvFile)

            if (data) {
                const { data: { publicUrl } } = supabase.storage
                    .from('cvs')
                    .getPublicUrl(cvPath)
                updates.candidate_cv_url = publicUrl
            }
        } else if (selectedType === 'text') {
            updates.candidate_pitch = pitchText
        }

        await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        router.push('/onboarding/terrain')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Présente-toi</h1>
                    <p className="text-gray-300">Choisis ton format</p>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setSelectedType('text')}
                        className={`flex-1 py-3 rounded-xl font-bold transition ${selectedType === 'text'
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white'
                            }`}
                    >
                        ✍️ Texte
                    </button>
                    <button
                        onClick={() => setSelectedType('cv')}
                        className={`flex-1 py-3 rounded-xl font-bold transition ${selectedType === 'cv'
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white'
                            }`}
                    >
                        📄 CV
                    </button>
                    <button
                        onClick={() => setSelectedType('video')}
                        className={`flex-1 py-3 rounded-xl font-bold transition ${selectedType === 'video'
                                ? 'bg-white text-black'
                                : 'bg-white/10 text-white'
                            }`}
                    >
                        🎥 Vidéo
                    </button>
                </div>

                {/* Content */}
                {selectedType === 'text' && (
                    <div>
                        <textarea
                            value={pitchText}
                            onChange={(e) => setPitchText(e.target.value.slice(0, 200))}
                            placeholder="Ambulancier DEA motivé, 5 ans exp..."
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white h-32 resize-none"
                            maxLength={200}
                        />
                        <p className="text-gray-400 text-sm mt-2">
                            {pitchText.length}/200 caractères
                        </p>
                    </div>
                )}

                {selectedType === 'cv' && (
                    <div>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-white/50">
                            {cvFile ? (
                                <span className="text-white">{cvFile.name}</span>
                            ) : (
                                <>
                                    <span className="text-4xl mb-2">📄</span>
                                    <span className="text-white">Upload ton CV</span>
                                    <span className="text-gray-400 text-sm">PDF, DOC, JPG (max 5Mo)</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {selectedType === 'video' && (
                    <div className="text-center text-white">
                        <p>Vidéo 30s (bientôt disponible)</p>
                        <p className="text-sm text-gray-400 mt-2">En attendant, utilise le texte</p>
                    </div>
                )}

                <button
                    onClick={saveAndContinue}
                    disabled={!canContinue}
                    className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}

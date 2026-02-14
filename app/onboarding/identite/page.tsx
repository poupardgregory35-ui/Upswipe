'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function IdentitePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [selectedCity, setSelectedCity] = useState<number | null>(null)
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    // DEMO DATA - In production, this would be fetched from DB or API
    const cities = [
        { id: 1, name: 'Rennes' },
        { id: 2, name: 'Saint-Malo' },
        { id: 3, name: 'Fougères' },
        { id: 4, name: 'Vitré' },
        { id: 5, name: 'Redon' },
        { id: 6, name: 'Brest' },
        { id: 7, name: 'Lorient' },
        { id: 8, name: 'Vannes' },
        { id: 9, name: 'Nantes' },
        { id: 10, name: 'Paris' },
    ]

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setPhotoFile(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const saveAndContinue = async () => {
        if (!selectedCity || !photoFile) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Upload photo
        const photoPath = `${user.id}/${Date.now()}.jpg`
        const { data: uploadData } = await supabase.storage
            .from('candidate-photos') // Ensure this bucket exists or use 'cvs'/'videos' as proxy if needed, ideally 'avatars'
            .upload(photoPath, photoFile)

        // Note: Assuming 'candidate-photos' bucket exists. If not, we might need to create it or use existing.
        // For now, let's assume it exists as per previous discussions or we will use a generic public one if needed.
        // Update: user prompt mentions 'candidate-photos'.

        if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
                .from('candidate-photos')
                .getPublicUrl(photoPath)

            await supabase
                .from('profiles')
                .update({
                    city_id: selectedCity,
                    candidate_photo_url: publicUrl
                })
                .eq('id', user.id)
        }

        router.push('/onboarding/presentation')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Identité</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="mb-6">
                    <label className="block text-white font-bold mb-3">Photo de profil</label>
                    <div className="relative">
                        {photoPreview ? (
                            <div className="relative w-32 h-32 mx-auto">
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-full h-full rounded-full object-cover"
                                />
                                <button
                                    onClick={() => {
                                        setPhotoFile(null)
                                        setPhotoPreview(null)
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-32 h-32 mx-auto border-2 border-dashed border-white/30 rounded-full cursor-pointer hover:border-white/50">
                                <span className="text-4xl">📸</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>
                </div>

                {/* Ville */}
                <div className="mb-6">
                    <label className="block text-white font-bold mb-3">Ville</label>
                    <select
                        value={selectedCity || ''}
                        onChange={(e) => setSelectedCity(Number(e.target.value))}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white"
                    >
                        <option value="">Sélectionne ta ville</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id} className="text-black">
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={saveAndContinue}
                    disabled={!selectedCity || !photoFile}
                    className="w-full bg-cyan-400 text-black font-bold py-4 rounded-xl hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}

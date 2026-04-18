'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function IdentitePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [companyName, setCompanyName] = useState('')
    const [cityId, setCityId] = useState<number | null>(null)
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    // DEMO DATA
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

    const canContinue = companyName && cityId && phone

    const saveAndContinue = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        await supabase
            .from('profiles')
            .update({
                recruiter_company_name: companyName,
                city_id: cityId,
                recruiter_company_phone: phone,
                recruiter_company_email: email || null
            })
            .eq('id', user.id)

        router.push('/recruteur/onboarding/besoins')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Votre entreprise</h1>
                    <div className="flex justify-center gap-2 mt-4">
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                        <div className="w-3 h-3 rounded-full bg-white/30"></div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-white font-bold mb-2">Nom entreprise</label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Ambulances Martin"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Ville</label>
                        <select
                            value={cityId || ''}
                            onChange={(e) => setCityId(Number(e.target.value))}
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white"
                        >
                            <option value="">Sélectionnez</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id} className="text-black">
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Téléphone</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="06 12 34 56 78"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Email (optionnel)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="contact@ambulances-martin.fr"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                    </div>
                </div>

                <button
                    onClick={saveAndContinue}
                    disabled={!canContinue}
                    className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                >
                    Continuer
                </button>
            </div>
        </div>
    )
}

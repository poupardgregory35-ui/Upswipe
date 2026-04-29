'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

export default function IdentitePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [companyName, setCompanyName] = useState('')
    const [city, setCity] = useState('') // Display string "75001 - Paris"
    const [cityId, setCityId] = useState<number | null>(null) // Resolved villes_france.id
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [lookupLoading, setLookupLoading] = useState(false)
    const [saving, setSaving] = useState(false)

    const canContinue = companyName && cityId && phone && !lookupLoading

    // When the user types a 5-digit postal code, hit geo.api.gouv.fr to get the
    // city name, then look up the corresponding villes_france.id from Supabase.
    // We store BOTH the display string (recruiter_company_city) and the FK
    // (city_id) so the matching function can resolve the recruiter's location.
    const handleZipChange = async (val: string) => {
        setCity(val)
        setCityId(null)

        if (val.length === 5 && /^\d+$/.test(val)) {
            setLookupLoading(true)
            try {
                // 1. Resolve postal code → city name (geo.api.gouv.fr)
                const res = await fetch(
                    `https://geo.api.gouv.fr/communes?codePostal=${val}&fields=nom&format=json&geometry=centre`
                )
                const data = await res.json()
                if (data && data.length > 0) {
                    const cityName = data[0].nom
                    setCity(`${val} - ${cityName}`)

                    // 2. Resolve postal_code → villes_france.id (real FK for matching)
                    const { data: villeRow } = await supabase
                        .from('villes_france')
                        .select('id')
                        .eq('postal_code', val)
                        .limit(1)
                        .maybeSingle()

                    if (villeRow?.id) {
                        setCityId(villeRow.id)
                    } else {
                        toast.error("Cette ville n'est pas encore référencée dans notre base.")
                    }
                } else {
                    toast.error('Code postal introuvable.')
                }
            } catch (err) {
                console.error('City fetch error', err)
                toast.error('Erreur lors de la recherche de la ville.')
            } finally {
                setLookupLoading(false)
            }
        }
    }

    const saveAndContinue = async () => {
        if (!canContinue) return
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({
                    recruiter_company_name: companyName,
                    recruiter_company_city: city,
                    city_id: cityId,
                    recruiter_company_phone: phone,
                    recruiter_company_email: email || null
                })
                .eq('id', user.id)

            if (error) throw error

            router.push('/recruteur/onboarding/besoins')
        } catch (err: any) {
            console.error(err)
            toast.error(err?.message || 'Erreur lors de la sauvegarde.')
        } finally {
            setSaving(false)
        }
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
                        <label className="block text-white font-bold mb-2">Ville (Code Postal)</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={city}
                                onChange={(e) => handleZipChange(e.target.value)}
                                placeholder="Code postal (ex: 75001)"
                                className="w-full bg-white/10 border-2 border-white/20 rounded-xl pl-10 pr-10 py-3 text-white placeholder-gray-400"
                            />
                            {lookupLoading && (
                                <Loader2 className="absolute right-3 top-3.5 animate-spin text-slate-400" size={18} />
                            )}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Tape ton code postal, la ville s'affichera automatiquement.
                        </p>
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
                    disabled={!canContinue || saving}
                    className="w-full bg-blue-500 text-white font-bold py-4 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : 'Continuer'}
                </button>
            </div>
        </div>
    )
}

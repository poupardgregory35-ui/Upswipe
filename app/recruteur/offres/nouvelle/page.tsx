'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import CitySearch from '@/app/components/CitySearch'

export default function NouvelleOffrePage() {
    const router = useRouter()
    const supabase = createClientComponentClient()
    const [loading, setLoading] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    // NOUVEL ÉTAT POUR LA VILLE
    const [selectedCity, setSelectedCity] = useState<{ id: number, name: string, postal_code: string } | null>(null)

    const [title, setTitle] = useState('')
    const [salary, setSalary] = useState('')
    const [type, setType] = useState('CDI')
    const [diplomas, setDiplomas] = useState<string[]>([])
    const [description, setDescription] = useState('')

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (data?.role !== 'recruiter') {
            router.push('/dashboard')
            return
        }

        setProfile(data)
        // Note: Pré-remplissage de la ville non géré ici car nécessiterait une requête supplémentaire pour avoir le nom/code postal
        // On laisse vide par défaut, ou on pourrait faire une requête si city_id existe.
        // Pour l'instant on suit la demande de remplacement simple.
    }

    const toggleDiploma = (diploma: string) => {
        setDiplomas(prev =>
            prev.includes(diploma)
                ? prev.filter(d => d !== diploma)
                : [...prev, diploma]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title) {
            alert('⚠️ Titre manquant')
            return
        }

        if (!selectedCity) {
            alert('⚠️ Ville manquante')
            return
        }

        if (diplomas.length === 0) {
            alert('⚠️ Sélectionnez au moins 1 diplôme')
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const jobData = {
                recruiter_id: user?.id,
                title,
                company: profile?.recruiter_company_name || 'Entreprise',
                city_id: selectedCity.id,
                required_diplomas: diplomas,
                company_type: profile?.recruiter_company_type || 'pme',
                salary: salary ? parseInt(salary) : null,
                type,
                description: description || null,
                is_active: true
            }

            console.log('📤 Envoi:', jobData)

            const { data, error } = await supabase
                .from('jobs')
                .insert(jobData)
                .select()
                .single()

            if (error) {
                console.error('❌ ERREUR:', error)
                alert('❌ Erreur : ' + error.message)
                return
            }

            console.log('✅ Succès:', data)
            alert('✅ Offre publiée !')
            router.push('/recruteur/dashboard')

        } catch (err) {
            console.error('❌ CATCH:', err)
            alert('❌ Erreur: ' + err)
        } finally {
            setLoading(false)
        }
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white">Chargement...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/recruteur/dashboard')}
                        className="text-white hover:underline mb-4"
                    >
                        ← Retour
                    </button>
                    <h1 className="text-3xl font-black text-white">Nouvelle Offre</h1>
                    <p className="text-gray-400">{profile.recruiter_company_name}</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-8 space-y-6">

                    <div>
                        <label className="block text-white font-bold mb-2">Titre du poste *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ambulancier DEA - Gardes nuit"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Ville *</label>
                        <CitySearch
                            selectedCity={selectedCity}
                            onSelect={(city) => setSelectedCity(city)}
                        />
                        {!selectedCity && (
                            <p className="text-red-400 text-sm mt-2">⚠️ Sélectionnez une ville</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Diplômes recherchés *</label>
                        <div className="space-y-3">
                            <label
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${diplomas.includes('DEA')
                                    ? 'bg-blue-500/30 border-blue-500'
                                    : 'bg-white/5 border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={diplomas.includes('DEA')}
                                    onChange={() => toggleDiploma('DEA')}
                                    className="w-5 h-5"
                                />
                                <div>
                                    <div className="text-white font-bold">DEA</div>
                                    <div className="text-gray-400 text-sm">Diplôme d'État Ambulancier</div>
                                </div>
                            </label>

                            <label
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition ${diplomas.includes('Auxiliaire')
                                    ? 'bg-blue-500/30 border-blue-500'
                                    : 'bg-white/5 border-white/20 hover:border-white/40'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={diplomas.includes('Auxiliaire')}
                                    onChange={() => toggleDiploma('Auxiliaire')}
                                    className="w-5 h-5"
                                />
                                <div>
                                    <div className="text-white font-bold">Auxiliaire Ambulancier</div>
                                    <div className="text-gray-400 text-sm">Certificat d'Auxiliaire</div>
                                </div>
                            </label>
                        </div>
                        {diplomas.length === 0 && (
                            <p className="text-red-400 text-sm mt-2">⚠️ Cochez au moins 1 diplôme</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Description du poste (optionnel)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez le poste, les horaires, les avantages..."
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 h-32 resize-none"
                            maxLength={500}
                        />
                        <p className="text-gray-400 text-sm mt-1">{description.length}/500 caractères</p>
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Salaire mensuel (€, optionnel)</label>
                        <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(e.target.value)}
                            placeholder="2300"
                            min="1500"
                            max="5000"
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-white font-bold mb-2">Type de contrat</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-white/10 border-2 border-white/20 rounded-xl px-4 py-3 text-white"
                        >
                            <option value="CDI" className="text-black">CDI</option>
                            <option value="CDD" className="text-black">CDD</option>
                            <option value="Interim" className="text-black">Intérim</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || diplomas.length === 0}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-4 rounded-xl hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '⏳ Publication en cours...' : '✓ PUBLIER L\'OFFRE'}
                    </button>
                </form>
            </div>
        </div>
    )
}

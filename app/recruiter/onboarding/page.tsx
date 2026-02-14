'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Building2, MapPin, Phone, Check, Loader2, ArrowRight } from 'lucide-react'

export default function RecruiterOnboarding() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        city: '',
        type: 'Ambulance',
        phone: ''
    })

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Check if already onboarded
            const { data: profile } = await supabase
                .from('profiles')
                .select('recruiter_company_name')
                .eq('id', user.id)
                .single()

            if (profile?.recruiter_company_name) {
                router.push('/recruiter/dashboard')
            }
        }
        checkUser()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    recruiter_company_name: formData.name,
                    recruiter_company_city: formData.city,
                    recruiter_company_type: formData.type,
                    recruiter_company_phone: formData.phone
                })
                .eq('id', userId)

            if (error) throw error

            router.push('/recruiter/dashboard')

        } catch (error) {
            console.error(error)
            alert("Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Finalisez votre profil</h1>
                    <p className="text-slate-500">Quelques détails sur votre entreprise pour commencer.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la société</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                placeholder="Jussieu Secours"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ville</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    placeholder="Paris"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option>Ambulance</option>
                                <option>Taxi</option>
                                <option>Hôpital</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input
                                type="tel"
                                required
                                placeholder="06 12 34 56 78"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <>Accéder au Dashboard <ArrowRight size={20} /></>}
                    </button>

                </form>
            </div>
        </div>
    )
}

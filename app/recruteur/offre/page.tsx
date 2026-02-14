'use client'

import { useState } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Logo } from '@/app/components/ui/Logo'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Building2, MapPin, Briefcase, Euro, Phone, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { RecruiterBackground } from '@/app/components/ui/RecruiterBackground'

export default function RecruiterOfferPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        companyName: '',
        companyCity: '',
        phone: '',
        badgeRequired: 'DEA',
        schedule: 'jour',
        salary: 2400
    })

    const handleSubmit = async () => {
        if (!formData.companyName || !formData.companyCity || !formData.phone) {
            alert('Veuillez remplir les informations de la société')
            return
        }

        setLoading(true)
        try {
            const email = `recruiter.${Date.now()}@test.com`
            const password = `pass-${Date.now()}` // Auto-generated password for demo flow

            // 1. Create Auth User (triggers handle_new_user which creates profile)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        role: 'recruteur',
                        full_name: formData.companyName
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No user created")

            // Wait a bit for trigger
            await new Promise(r => setTimeout(r, 1000))

            // 2. Update the automatically created profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .update({
                    company_name: formData.companyName,
                    company_city: formData.companyCity,
                    phone: formData.phone,
                    recruiter_company_name: formData.companyName, // Redundant but safe
                    recruiter_company_city: formData.companyCity,
                    recruiter_company_phone: formData.phone,
                    role: 'recruteur' // Ensure role is set
                })
                .eq('id', authData.user.id)
                .select()
                .single()

            if (profileError) throw profileError

            // 3. Create Job linked to recruiter
            const { data: job, error: jobError } = await supabase.from('jobs').insert({
                recruiter_id: authData.user.id,
                badge_required: formData.badgeRequired,
                schedule: formData.schedule,
                salary: formData.salary,
                city: formData.companyCity,
                title: `Ambulancier ${formData.badgeRequired}`,
                company: formData.companyName,
                company_type: 'pme', // Defaulting for demo
                required_diplomas: [formData.badgeRequired]
            }).select().single()

            if (jobError) throw jobError

            localStorage.setItem('upswipe_recruiter', JSON.stringify({
                id: profile.id,
                company: profile.company_name,
                city: profile.company_city,
                current_job_id: job.id,
                badge_required: job.badge_required
            }))

            router.push('/recruteur/swipe')

        } catch (error: any) {
            console.error('Error:', error)
            alert('Erreur: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-6 pb-24 max-w-xl mx-auto font-sans relative">
            <RecruiterBackground />

            <div className="flex justify-center mb-8 pt-4">
                <Logo size="sm" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Espace Recruteur</h1>
                    <p className="text-slate-400">Configurez votre offre de mission</p>
                </div>

                <Card variant="solid" className="p-6 backdrop-blur-xl bg-white border border-slate-100 shadow-xl">

                    {/* Company Info */}
                    <div className="mb-8 border-b border-slate-100 pb-6">
                        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-lg">
                            <Building2 size={20} className="text-blue-600" /> Entreprise
                        </h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Nom de la société / Ambulance"
                                value={formData.companyName}
                                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Ville"
                                        value={formData.companyCity}
                                        onChange={e => setFormData({ ...formData, companyCity: e.target.value })}
                                    />
                                </div>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-3.5 text-slate-400" />
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Tél Mobile"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Job Info */}
                    <div>
                        <h3 className="text-slate-900 font-bold mb-4 flex items-center gap-2 text-lg">
                            <Briefcase size={20} className="text-blue-600" /> Détails du poste
                        </h3>

                        <div className="space-y-5">
                            {/* Badge */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500">Qualification requise</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['DEA', 'Auxiliaire', 'VSL', 'Régulateur'].map(badge => (
                                        <button
                                            key={badge}
                                            onClick={() => setFormData({ ...formData, badgeRequired: badge })}
                                            className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${formData.badgeRequired === badge
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                                }`}
                                        >
                                            {badge}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Schedule */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500">Horaires</label>
                                <div className="flex bg-slate-100 rounded-lg p-1">
                                    {['jour', 'nuit', 'mixte'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFormData({ ...formData, schedule: s })}
                                            className={`flex-1 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${formData.schedule === s
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Salary */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Euro size={16} /> Salaire Mensuel (Net)
                                </label>
                                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <input
                                        type="range"
                                        min="1500"
                                        max="4000"
                                        step="50"
                                        className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                        value={formData.salary}
                                        onChange={e => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                                    />
                                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-slate-900 font-bold min-w-[100px] text-center shadow-sm">
                                        {formData.salary} €
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </Card>

                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin" /> Publication...
                        </div>
                    ) : 'Trouver des candidats'}
                </Button>
            </motion.div>
        </div>
    )
}

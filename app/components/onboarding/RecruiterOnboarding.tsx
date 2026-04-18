'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, ChevronLeft, Building2, Car, Truck, Stethoscope,
    MapPin, Phone, Mail, CheckCircle2, Zap, Flame, Calendar, Loader2
} from 'lucide-react'
import { toast } from 'sonner'

// --- Types ---
type OnboardingStep = 1 | 2 | 3 | 4
type CompanyType = 'pme' | 'smur' | 'groupe' | 'vsl'
type Urgency = 'immediate' | 'urgent' | 'planned'

export function RecruiterOnboarding() {
    const supabase = createClientComponentClient()
    const router = useRouter()

    // Global State
    const [step, setStep] = useState<OnboardingStep>(1)
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form Data
    const [companyType, setCompanyType] = useState<CompanyType | null>(null)
    const [companyName, setCompanyName] = useState('')
    const [companyCity, setCompanyCity] = useState('')
    const [companyPhone, setCompanyPhone] = useState('')
    const [companyEmail, setCompanyEmail] = useState('')
    const [needs, setNeeds] = useState<string[]>([])
    const [urgency, setUrgency] = useState<Urgency>('immediate')

    // --- Hydration & Persistence ---
    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Check Session
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                        router.push('/login/recruteur?view=login')
                        return
                    }
                }

                // 2. Fetch Profile to Resume Step
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single()

                    if (profile) {
                        // Restore Data
                        if (profile.recruiter_company_type) setCompanyType(profile.recruiter_company_type as CompanyType)
                        if (profile.recruiter_company_name) setCompanyName(profile.recruiter_company_name)
                        if (profile.recruiter_company_city) setCompanyCity(profile.recruiter_company_city)
                        if (profile.recruiter_company_phone) setCompanyPhone(profile.recruiter_company_phone)
                        if (profile.recruiter_company_email) setCompanyEmail(profile.recruiter_company_email)
                        if (profile.recruiter_needs) setNeeds(profile.recruiter_needs)
                        if (profile.recruiter_urgency) setUrgency(profile.recruiter_urgency as Urgency)

                        // Deduce Step
                        if (!profile.recruiter_company_type) setStep(1)
                        else if (!profile.recruiter_company_name) setStep(2)
                        else if (!profile.recruiter_needs || profile.recruiter_needs.length === 0) setStep(3)
                        else setStep(4)
                    }
                }
            } catch (err) {
                console.error("Session init error:", err)
            } finally {
                setInitializing(false)
            }
        }

        initSession()
    }, [supabase, router])

    // --- Helpers ---

    const saveProgress = async (currentStepData: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').update(currentStepData).eq('id', user.id)
            }
        } catch (e) {
            console.error("Progress save failed", e)
        }
    }

    const handleNext = async () => {
        if (step < 4) {
            const nextStep = (step + 1) as OnboardingStep

            // Silent Save
            let updateData = {}
            if (step === 1) updateData = { recruiter_company_type: companyType }
            if (step === 2) updateData = {
                recruiter_company_name: companyName,
                recruiter_company_city: companyCity,
                recruiter_company_phone: companyPhone,
                recruiter_company_email: companyEmail
            }
            if (step === 3) updateData = {
                recruiter_needs: needs,
                recruiter_urgency: urgency
            }

            await saveProgress(updateData)
            setStep(nextStep)
        }
    }

    const handleBack = () => {
        if (step > 1) setStep(prev => (prev - 1) as OnboardingStep)
    }

    const validateStep2 = () => {
        return companyName.length > 2 && companyCity.length > 2 && companyPhone.length >= 10
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Utilisateur non connecté")

            // Database Update
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    recruiter_company_type: companyType,
                    recruiter_company_name: companyName,
                    recruiter_company_city: companyCity,
                    recruiter_company_phone: companyPhone,
                    recruiter_company_email: companyEmail || user.email, // Fallback to auth email
                    recruiter_needs: needs,
                    recruiter_urgency: urgency,
                    recruiter_onboarding_completed: true
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Redirect to Dashboard
            router.push('/recruteur/dashboard')

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Une erreur est survenue')
            toast.error(err.message || 'Une erreur est survenue')
        } finally {
            setLoading(false)
        }
    }

    // --- Steps Components ---

    const StepIndicator = () => (
        <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3, 4].map((s) => (
                <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-200'
                        }`}
                />
            ))}
        </div>
    )

    if (initializing) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-slate-500 text-sm animate-pulse">Chargement de votre espace...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
            <div className="w-full max-w-lg">

                {/* Header Progress */}
                <div className="text-center mb-6">
                    <span className="text-xs font-bold text-blue-600 tracking-widest uppercase">
                        Étape {step}/4
                    </span>
                    <StepIndicator />
                </div>

                <AnimatePresence mode='wait'>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white border border-slate-200 shadow-xl rounded-3xl p-6 md:p-8 min-h-[500px] flex flex-col"
                    >
                        {/* --- STEP 1: COMPANY TYPE --- */}
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl font-black mb-2 text-center text-slate-900">Quelle structure ?</h2>
                                <p className="text-center text-slate-500 text-sm mb-8">Choisissez votre type d'établissement</p>

                                <div className="grid grid-cols-2 gap-4 flex-1 content-center">
                                    {[
                                        { id: 'pme', label: 'PME Ambulance', icon: Truck, desc: 'Majoritaire' },
                                        { id: 'smur', label: 'SMUR / CHU', icon: Stethoscope, desc: 'Public' },
                                        { id: 'groupe', label: 'Groupe / Réseau', icon: Building2, desc: 'Multi-sites' },
                                        { id: 'vsl', label: 'VSL / Taxi', icon: Car, desc: 'Transport assis' },
                                    ].map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => { setCompanyType(item.id as CompanyType); handleNext() }}
                                            className={`p-4 rounded-2xl border-2 text-left transition-all group ${companyType === item.id
                                                ? 'border-blue-600 bg-blue-50'
                                                : 'border-slate-100 bg-slate-50 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${companyType === item.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 group-hover:text-blue-500 shadow-sm'
                                                }`}>
                                                <item.icon size={20} />
                                            </div>
                                            <span className={`block font-bold ${companyType === item.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                                {item.label}
                                            </span>
                                            <span className="text-xs text-slate-400">{item.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* --- STEP 2: IDENTITY --- */}
                        {step === 2 && (
                            <>
                                <h2 className="text-2xl font-black mb-6 text-center text-slate-900">Identité Entreprise</h2>
                                <div className="space-y-5 flex-1 p-2">

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nom de l'entreprise</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Ambulances Martin"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ville (Code Postal)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Code postal (ex: 69002)"
                                                value={companyCity}
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    setCompanyCity(val);
                                                    if (val.length === 5 && /^\d+$/.test(val)) {
                                                        try {
                                                            setLoading(true);
                                                            const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${val}&fields=nom&format=json&geometry=centre`);
                                                            const data = await res.json();
                                                            if (data && data.length > 0) {
                                                                setCompanyCity(`${val} - ${data[0].nom}`);
                                                            }
                                                        } catch (err) { console.error(err) }
                                                        finally { setLoading(false) }
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                            />
                                            {loading && <Loader2 className="absolute right-3 top-3.5 animate-spin text-blue-500" size={18} />}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                placeholder="06 12 34 56 78"
                                                value={companyPhone}
                                                onChange={(e) => setCompanyPhone(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email <span className="text-slate-300 font-normal">(Optionnel)</span></label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                                            <input
                                                type="email"
                                                placeholder="contact@entreprise.fr"
                                                value={companyEmail}
                                                onChange={(e) => setCompanyEmail(e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                            />
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft /></button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!validateStep2()}
                                        className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- STEP 3: NEEDS & URGENCY --- */}
                        {step === 3 && (
                            <>
                                <h2 className="text-2xl font-black mb-2 text-center text-slate-900">Vos Besoins</h2>
                                <p className="text-center text-slate-500 text-sm mb-6">Sélectionnez les profils recherchés</p>

                                <div className="flex-1 overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-3 mb-8">
                                        {['DEA', 'Auxiliaire', 'Régulateur', 'Chauffeur VSL'].map((profile) => (
                                            <button
                                                key={profile}
                                                onClick={() => setNeeds(prev => prev.includes(profile) ? prev.filter(p => p !== profile) : [...prev, profile])}
                                                className={`p-3 rounded-xl border text-sm font-bold transition-all flex items-center gap-2 ${needs.includes(profile)
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${needs.includes(profile) ? 'border-white bg-white text-blue-600' : 'border-slate-300'}`}>
                                                    {needs.includes(profile) && <CheckCircle2 size={12} />}
                                                </div>
                                                {profile}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-3 text-center">Urgence du recrutement</p>
                                        <div className="flex gap-2 justify-center">
                                            {[
                                                { id: 'immediate', label: 'Immédiat', icon: Zap, color: 'text-amber-500' },
                                                { id: 'urgent', label: 'Urgent', icon: Flame, color: 'text-red-500' },
                                                { id: 'planned', label: 'Planifié', icon: Calendar, color: 'text-green-500' },
                                            ].map((u) => (
                                                <button
                                                    key={u.id}
                                                    onClick={() => setUrgency(u.id as Urgency)}
                                                    className={`flex-1 p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${urgency === u.id
                                                        ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500'
                                                        : 'bg-transparent border-slate-200 hover:bg-white'
                                                        }`}
                                                >
                                                    <u.icon className={u.color} size={20} />
                                                    <span className="text-[10px] font-bold text-slate-600">{u.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><ChevronLeft /></button>
                                    <button
                                        onClick={handleNext}
                                        disabled={needs.length === 0}
                                        className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- STEP 4: ACTIVATION --- */}
                        {step === 4 && (
                            <>
                                <h2 className="text-2xl font-black mb-6 text-center text-slate-900">Activation</h2>

                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Truck size={100} className="text-slate-900" />
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{companyName}</h3>
                                        <p className="text-slate-500 text-sm mb-4 flex items-center gap-1"><MapPin size={14} /> {companyCity}</p>

                                        <div className="space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 size={16} className="text-blue-500" />
                                                <span className="font-medium text-slate-900 uppercase text-xs tracking-wider">{companyType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone size={16} className="text-blue-500" />
                                                <span>{companyPhone}</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-200 mt-2">
                                                <span className="text-xs text-slate-400 uppercase">Recherche :</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {needs.map(n => (
                                                        <span key={n} className="bg-white border border-slate-200 px-2 py-1 rounded-md text-xs font-bold text-slate-700">{n}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 text-center px-4">
                                        <p className="text-sm text-slate-500">
                                            En activant votre compte, vous accédez immédiatement au vivier de candidats disponibles.
                                        </p>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-between items-center gap-4">
                                    <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" disabled={loading}><ChevronLeft /></button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={20} />}
                                        {loading ? 'Activation...' : 'ACTIVER MON COMPTE'}
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

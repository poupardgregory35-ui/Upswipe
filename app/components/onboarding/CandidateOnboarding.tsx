'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronRight, ChevronLeft, Upload, Video, Type,
    CheckCircle2, MapPin, Loader2, Camera, FileText
} from 'lucide-react'
import { toast } from 'sonner'

// --- Types ---
type OnboardingStep = 1 | 2 | 3 | 4 | 5
type PresentationType = 'cv' | 'video' | 'text'

export function CandidateOnboarding() {
    const supabase = createClientComponentClient()
    const router = useRouter()

    // Global State
    const [step, setStep] = useState<OnboardingStep>(1)
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(true) // Session hydration state
    const [error, setError] = useState<string | null>(null)

    // Form Data
    const [diploma, setDiploma] = useState<string | null>(null)
    const [city, setCity] = useState('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null) // For existing photo
    const [presentationType, setPresentationType] = useState<PresentationType>('cv')
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [pitchText, setPitchText] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [isAvailable, setIsAvailable] = useState(false)

    // --- Hydration & Persistence ---
    useEffect(() => {
        const initSession = async () => {
            try {
                // 1. Check Session
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                        router.push('/login/candidat?view=login')
                        return
                    }
                }

                // 2. Fetch Profile to Resume Step (using RPC to bypass cache)
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profileData, error } = await supabase.rpc('candidate_profile_get_v2', {
                        p_user_id: user.id
                    })

                    if (profileData) {
                        const profile = profileData as any // Cast JSON result

                        // Restore Data
                        if (profile.candidate_diploma) setDiploma(profile.candidate_diploma)
                        if (profile.candidate_city) setCity(profile.candidate_city)
                        if (profile.candidate_photo_url) setPhotoPreview(profile.candidate_photo_url)
                        if (profile.candidate_presentation_type) setPresentationType(profile.candidate_presentation_type)
                        if (profile.candidate_pitch) setPitchText(profile.candidate_pitch)
                        if (profile.candidate_tags) setTags(profile.candidate_tags)

                        // Deduce Step
                        if (!profile.candidate_diploma) setStep(1)
                        else if (!profile.candidate_city) setStep(2)
                        else if (!profile.candidate_presentation_type) setStep(3)
                        else if (!profile.candidate_tags || profile.candidate_tags.length === 0) setStep(4)
                        else setStep(5)
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

    const uploadFile = async (file: File, bucket: string, path: string) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${path}-${Math.random()}.${fileExt}`
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        return publicUrl
    }

    const saveProgress = async (currentStepData: any) => {
        // Silent update - can keep using direct update or skip if causing issues
        // For robustness, let's skip strict checking here or use standard update
        // If standard update fails (400), it's not blocking the UI flow immediately
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('profiles').update(currentStepData).eq('id', user.id)
            }
        } catch (e) {
            console.warn("Progress save warning", e)
        }
    }

    const handleNext = async () => {
        if (step < 5) {
            const nextStep = (step + 1) as OnboardingStep

            // Silent Save
            let updateData = {}
            if (step === 1) updateData = { candidate_diploma: diploma }
            if (step === 2) updateData = { candidate_city: city }
            if (step === 3) updateData = {
                candidate_presentation_type: presentationType,
                candidate_pitch: pitchText
            }
            if (step === 4) updateData = { candidate_tags: tags }

            await saveProgress(updateData)
            setStep(nextStep)
        }
    }

    const handleBack = () => {
        if (step > 1) setStep(prev => (prev - 1) as OnboardingStep)
    }

    const validateStep3 = () => {
        if (presentationType === 'cv' && (cvFile || true)) return true
        if (presentationType === 'video' && (videoFile || true)) return true
        if (presentationType === 'text' && pitchText.length >= 20) return true
        return false
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Utilisateur non connecté")

            // Upload Files
            let photoUrl = photoPreview
            let cvUrl = null
            let videoUrl = null

            if (photoFile) {
                photoUrl = await uploadFile(photoFile, 'avatars', `${user.id}/avatar`)
            }
            if (cvFile && presentationType === 'cv') {
                cvUrl = await uploadFile(cvFile, 'cvs', `${user.id}/cv`)
            }

            // RPC Call instead of direct Update
            const { data, error: rpcError } = await supabase.rpc('candidate_profile_save_v2', {
                p_user_id: user.id,
                p_diploma: diploma,
                p_city: city,
                p_photo_url: photoUrl,
                p_presentation_type: presentationType,
                p_cv_url: cvUrl,
                p_video_url: videoUrl,
                p_pitch: pitchText,
                p_tags: tags,
                p_available: isAvailable
            })

            if (rpcError) throw rpcError

            console.log('✅ SAUVEGARDÉ:', data);

            // Redirect to Dashboard
            router.push('/candidat/swipe')

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Une erreur est survenue')
            toast.error(err.message || "Erreur lors de l'enregistrement")
        } finally {
            setLoading(false)
        }
    }

    // --- Steps Components ---

    const StepIndicator = () => (
        <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
                <div
                    key={s}
                    className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-green-500' : 'w-2 bg-neutral-800'
                        }`}
                />
            ))}
        </div>
    )

    if (initializing) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
                <p className="text-neutral-500 text-sm animate-pulse">Chargement de votre profil...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-green-500/30">
            <div className="w-full max-w-md">

                {/* Header Progress */}
                <div className="text-center mb-6">
                    <span className="text-xs font-bold text-green-500 tracking-widest uppercase">
                        Étape {step}/5
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
                        className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8 min-h-[400px] flex flex-col"
                    >
                        {/* --- STEP 1: DIPLOMA --- */}
                        {step === 1 && (
                            <>
                                <h2 className="text-2xl font-bold mb-8 text-center">Ton Diplôme ?</h2>
                                <div className="grid gap-4 flex-1 content-center">
                                    {['DEA', 'Auxiliaire', 'Bac Pro', 'Autre'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => { setDiploma(d); handleNext() }}
                                            className={`p-4 rounded-xl border font-semibold text-lg transition-all ${diploma === d
                                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                                : 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* --- STEP 2: IDENTITY --- */}
                        {step === 2 && (
                            <>
                                <h2 className="text-2xl font-bold mb-6 text-center">Ton Identité</h2>
                                <div className="flex flex-col items-center gap-6 flex-1">
                                    {/* Photo Upload */}
                                    <div className="relative group cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                            onChange={(e) => e.target.files?.[0] && setPhotoFile(e.target.files[0])}
                                        />
                                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed transition-all ${photoFile || photoPreview ? 'border-green-500 bg-green-500/10' : 'border-neutral-700 hover:border-neutral-500'
                                            }`}>
                                            {photoFile ? (
                                                <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover rounded-full" />
                                            ) : photoPreview ? (
                                                <img src={photoPreview} alt="Stored" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <Camera size={32} className="text-neutral-500" />
                                            )}
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-2 text-center">Tap pour ajouter photo</p>
                                    </div>

                                    {/* City Input with Zip Code */}
                                    <div className="w-full space-y-2">
                                        <label className="text-sm text-neutral-400 font-medium">Ta ville (Code Postal)</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-neutral-500" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Code postal (ex: 69002)"
                                                value={city} // We use 'city' state to store the display string "Code - Ville"
                                                onChange={async (e) => {
                                                    const val = e.target.value;
                                                    setCity(val);

                                                    // Simple auto-complete logic
                                                    if (val.length === 5 && /^\d+$/.test(val)) {
                                                        try {
                                                            setLoading(true);
                                                            const res = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${val}&fields=nom&format=json&geometry=centre`);
                                                            const data = await res.json();
                                                            if (data && data.length > 0) {
                                                                // Take the first one for simplicity or let user choose if multiple
                                                                const cityName = data[0].nom;
                                                                setCity(`${val} - ${cityName}`);
                                                            }
                                                        } catch (err) {
                                                            console.error("City fetch error", err);
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                                            />
                                            {loading && <Loader2 className="absolute right-3 top-3.5 animate-spin text-neutral-500" size={18} />}
                                        </div>
                                        <div className="text-xs text-neutral-600 pl-2">
                                            Tape ton code postal, la ville s'affichera automatiquement.
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-between">
                                    <button onClick={handleBack} className="p-2 hover:bg-neutral-800 rounded-full"><ChevronLeft /></button>
                                    <button
                                        onClick={handleNext}
                                        disabled={!city}
                                        className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:scale-105 transition-transform"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- STEP 3: PRESENTATION --- */}
                        {step === 3 && (
                            <>
                                <h2 className="text-2xl font-bold mb-6 text-center">Présente-toi</h2>

                                {/* Tabs */}
                                <div className="flex bg-neutral-800 p-1 rounded-xl mb-6">
                                    {(['cv', 'video', 'text'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setPresentationType(t)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${presentationType === t
                                                ? 'bg-neutral-700 text-white shadow-sm'
                                                : 'text-neutral-500 hover:text-neutral-300'
                                                }`}
                                        >
                                            {t === 'cv' && <FileText size={16} />}
                                            {t === 'video' && <Video size={16} />}
                                            {t === 'text' && <Type size={16} />}
                                        </button>
                                    ))}
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 flex flex-col justify-center">
                                    {presentationType === 'cv' && (
                                        <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.png"
                                                onChange={(e) => e.target.files?.[0] && setCvFile(e.target.files[0])}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <Upload className="mx-auto mb-4 text-neutral-500" size={32} />
                                            <p className="text-sm font-medium">{cvFile ? cvFile.name : "Glisse ton CV ou clique ici"}</p>
                                            <p className="text-xs text-neutral-500 mt-2">PDF, DOC, JPG (Max 5Mo)</p>
                                        </div>
                                    )}

                                    {presentationType === 'video' && (
                                        <div className="bg-neutral-800 rounded-2xl p-8 text-center">
                                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                <div className="w-6 h-6 bg-white rounded-sm" />
                                            </div>
                                            <p className="font-bold">Enregistre ta vidéo (30s)</p>
                                            <p className="text-xs text-neutral-500 mt-2">Sois naturel, présente ton parcours.</p>
                                            {/* Simplified for now, real implementation needs MediaRecorder */}
                                            <button className="mt-4 px-4 py-2 bg-neutral-700 rounded-lg text-xs" onClick={() => setVideoFile(new File([], "placeholder"))}>
                                                [Simuler Enregistrement]
                                            </button>
                                        </div>
                                    )}

                                    {presentationType === 'text' && (
                                        <textarea
                                            value={pitchText}
                                            onChange={(e) => setPitchText(e.target.value)}
                                            placeholder="Salut, je suis ambulancier depuis 5 ans..."
                                            className="w-full h-40 bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 resize-none"
                                            maxLength={200}
                                        />
                                    )}
                                </div>

                                <div className="mt-6 flex justify-between items-center">
                                    <button onClick={handleBack} className="p-2 hover:bg-neutral-800 rounded-full"><ChevronLeft /></button>
                                    <div className="text-xs text-neutral-500">
                                        {presentationType === 'text' && `${pitchText.length}/200`}
                                    </div>
                                    <button
                                        onClick={handleNext}
                                        disabled={!validateStep3()}
                                        className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:scale-105 transition-transform"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- STEP 4: TERRAIN / TAGS --- */}
                        {step === 4 && (
                            <>
                                <h2 className="text-2xl font-bold mb-2 text-center">Tes préférences</h2>
                                <p className="text-center text-neutral-400 text-sm mb-8">Sélectionne ce que tu maîtrises</p>

                                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                                    {['Nuit', 'UPH/SAMU', 'Pédiatrie', 'Bariatrique', 'Grand Déplacement', 'Dialyse'].map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                                            className={`p-4 rounded-xl border text-sm font-bold transition-all ${tags.includes(tag)
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:bg-neutral-700'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <button onClick={handleBack} className="p-2 hover:bg-neutral-800 rounded-full"><ChevronLeft /></button>
                                    <button
                                        onClick={handleNext}
                                        disabled={tags.length === 0}
                                        className="bg-white text-black px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:scale-105 transition-transform"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </>
                        )}

                        {/* --- STEP 5: ACTIVATION --- */}
                        {step === 5 && (
                            <>
                                <h2 className="text-2xl font-bold mb-8 text-center">Récapitulatif</h2>

                                <div className="flex-1 space-y-4">
                                    {/* Profile Card Preview */}
                                    <div className="bg-neutral-800 rounded-2xl p-4 flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-full bg-neutral-700 overflow-hidden shrink-0">
                                            {photoFile ? (
                                                <img src={URL.createObjectURL(photoFile)} alt="" className="w-full h-full object-cover" />
                                            ) : photoPreview ? (
                                                <img src={photoPreview} alt="Stored" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-neutral-500">?</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Candidat</h3>
                                            <p className="text-sm text-neutral-400">{diploma} • {city}</p>
                                            <div className="flex gap-2 mt-2">
                                                {tags.slice(0, 3).map(t => (
                                                    <span key={t} className="text-[10px] bg-neutral-900 px-2 py-1 rounded text-neutral-300">{t}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggle Availability */}
                                    <button
                                        onClick={() => setIsAvailable(!isAvailable)}
                                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isAvailable
                                            ? 'bg-green-500/20 border-green-500'
                                            : 'bg-neutral-800 border-neutral-700'
                                            }`}
                                    >
                                        <span className={`font-bold ${isAvailable ? 'text-green-400' : 'text-neutral-400'}`}>
                                            {isAvailable ? '✅  JE SUIS DISPONIBLE' : '❌  NON DISPONIBLE'}
                                        </span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isAvailable ? 'border-green-500 bg-green-500' : 'border-neutral-500'}`}>
                                            {isAvailable && <CheckCircle2 size={14} className="text-black" />}
                                        </div>
                                    </button>
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-between items-center gap-4">
                                    <button onClick={handleBack} className="p-2 hover:bg-neutral-800 rounded-full" disabled={loading}><ChevronLeft /></button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                    >
                                        {loading && <Loader2 className="animate-spin" size={20} />}
                                        {loading ? 'Activation...' : 'C\'est parti !'}
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

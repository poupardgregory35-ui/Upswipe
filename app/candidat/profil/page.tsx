'use client'

import { useState, useRef } from 'react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Logo } from '@/app/components/ui/Logo'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { User, MapPin, Scale, Clock, Award, Video, Camera, Play, X, Loader2, FileText, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CandidateBackground } from '@/app/components/ui/CandidateBackground'

export default function CandidateProfilePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
    const [videoPreview, setVideoPreview] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const [isRecording, setIsRecording] = useState(false)
    const [cvFile, setCvFile] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        firstName: '',
        phone: '',
        badge: 'DEA',
        experience: 'débutant',
        schedule: ['jour'],
        zone: { city: '', radius: 20 },
        salary: 1800
    })

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            if (videoRef.current) videoRef.current.srcObject = stream

            const mediaRecorder = new MediaRecorder(stream)
            const chunks: BlobPart[] = []

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' })
                setVideoBlob(blob)
                setVideoPreview(URL.createObjectURL(blob))
                if (videoRef.current) videoRef.current.srcObject = null
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current = mediaRecorder
            mediaRecorder.start()
            setIsRecording(true)
        } catch (e) {
            console.error(e)
            alert("Accès caméra refusé")
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setIsRecording(false)
    }

    const handleSubmit = async () => {
        if (!cvFile) {
            alert("Le CV est obligatoire !")
            return
        }

        setLoading(true)
        try {
            // 1. Upload CV (Mandatory)
            // Sanitize filename: remove accents and special chars
            const sanitizedName = cvFile.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.-]/g, "_")
            const cvFileName = `cv_${Date.now()}_${sanitizedName}`
            const { data: cvData, error: cvError } = await supabase.storage
                .from('cvs')
                .upload(cvFileName, cvFile)

            if (cvError) throw new Error(`Erreur upload CV: ${cvError.message}`)

            const { data: publicCvUrlData } = supabase.storage
                .from('cvs')
                .getPublicUrl(cvFileName)

            const cvUrl = publicCvUrlData.publicUrl

            // 2. Upload Video (Optional - Fail safe)
            let videoUrl = null
            if (videoBlob) {
                try {
                    const fileName = `video_${Date.now()}.webm`
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('videos')
                        .upload(fileName, videoBlob)

                    if (uploadError) throw uploadError

                    const { data: publicUrlData } = supabase.storage
                        .from('videos')
                        .getPublicUrl(fileName)

                    videoUrl = publicUrlData.publicUrl
                } catch (videoError: any) {
                    console.warn("Video upload failed, proceeding without video:", videoError.message)
                    // We intentionally swallow the error here to allow profile creation without video
                    // if the bucket is missing or connection fails for video only.
                }
            }

            // 3. Create Profile
            const email = `candidate.${Date.now()}@test.com` // Mock email

            const { data, error } = await supabase.from('profiles').insert({
                email,
                role: 'candidat',
                first_name: formData.firstName,
                phone: formData.phone,
                badge: formData.badge,
                experience_level: formData.experience,
                availability: formData.schedule,
                zone_city: formData.zone.city,
                zone_radius_km: formData.zone.radius,
                min_salary: formData.salary,
                video_url: videoUrl,
                cv_url: cvUrl
            }).select().single()

            if (error) throw error

            // 4. Save to LocalStorage
            localStorage.setItem('upswipe_candidate', JSON.stringify(data))

            // 5. Redirect
            router.push('/candidat/swipe')

        } catch (error: any) {
            console.error(error)
            alert('Erreur: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => setStep(s => s + 1)
    const prevStep = () => setStep(s => s - 1)

    return (
        <div className="min-h-screen p-6 pb-24 max-w-md mx-auto font-sans relative text-white">
            <CandidateBackground />

            <div className="flex justify-center mb-6 pt-4">
                <Logo size="sm" />
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i
                        ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                        : 'bg-white/10'}`}
                    />
                ))}
            </div>

            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">PROFIL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">FLASH</span> ⚡</h1>
                            <p className="text-cyan-200">Crée ton profil en 30 secondes</p>
                        </div>

                        <div className="bg-neutral-900/80 backdrop-blur-xl border border-purple-500/50 rounded-3xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.15)] relative overflow-hidden">
                            {/* Glow effect inside card */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="space-y-5 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                                        <User size={16} /> Prénom
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ton prénom"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                                        <User size={16} /> Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full bg-black/50 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] outline-none transition-all placeholder:text-white/20"
                                        placeholder="06 12 34 56 78"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>

                                {/* CV Upload Field */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                                        <FileText size={16} /> CV (Obligatoire)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="cv-upload"
                                            accept=".pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={e => setCvFile(e.target.files ? e.target.files[0] : null)}
                                        />
                                        <label
                                            htmlFor="cv-upload"
                                            className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-dashed cursor-pointer transition-all ${cvFile
                                                ? 'bg-purple-600/20 border-purple-500 text-purple-200'
                                                : 'bg-black/30 border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                                                }`}
                                        >
                                            <Upload size={20} />
                                            <span className="truncate">{cvFile ? cvFile.name : "Importer mon CV (PDF, DOC)"}</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                                        <Award size={16} /> Qualification
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['DEA', 'Auxiliaire', 'VSL', 'Régulateur'].map(b => (
                                            <button
                                                key={b}
                                                onClick={() => setFormData({ ...formData, badge: b })}
                                                className={`py-3 rounded-xl text-sm font-bold border transition-all ${formData.badge === b
                                                    ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                                                    }`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={nextStep}
                            disabled={!cvFile || !formData.firstName}
                            className={`w-full py-4 text-lg font-black tracking-wide rounded-2xl transition-all transform hover:scale-[1.02] ${!cvFile || !formData.firstName ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'}`}
                        >
                            SUIVANT ➔
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-white mb-1">Tes Critères 🎯</h1>
                            <p className="text-purple-300">Dis-nous ce que tu cherches</p>
                        </div>

                        <div className="bg-neutral-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-purple-300">Zone de recherche</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-3.5 text-cyan-400" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-cyan-400 outline-none"
                                            placeholder="Ville"
                                            value={formData.zone.city}
                                            onChange={e => setFormData({ ...formData, zone: { ...formData.zone, city: e.target.value } })}
                                        />
                                    </div>
                                    <input
                                        type="range"
                                        min="5" max="100"
                                        value={formData.zone.radius}
                                        onChange={e => setFormData({ ...formData, zone: { ...formData.zone, radius: parseInt(e.target.value) } })}
                                        className="w-full accent-cyan-400 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="text-right text-xs text-cyan-400 font-bold">{formData.zone.radius} km autour</div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-purple-300">Salaire minimum</label>
                                    <div className="flex items-center gap-4 bg-black/30 p-3 rounded-xl border border-white/5">
                                        <input
                                            type="range"
                                            min="1400" max="3000" step="50"
                                            value={formData.salary}
                                            onChange={e => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                                            className="flex-1 accent-purple-500 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <span className="font-bold text-white min-w-[80px] text-right">{formData.salary} €</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-purple-300">Disponibilités</label>
                                    <div className="flex bg-black/50 rounded-xl p-1 border border-white/10">
                                        {['jour', 'nuit', 'mixte'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFormData({ ...formData, schedule: [s] })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${formData.schedule.includes(s)
                                                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                                                    : 'text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={prevStep} className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10">
                                RETOUR
                            </Button>
                            <Button
                                onClick={nextStep}
                                className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                            >
                                SUIVANT ➔
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-black text-white mb-1">Pitch Vidéo 🎥</h1>
                            <p className="text-cyan-200">30s pour convaincre (Optionnel)</p>
                        </div>

                        <div className="bg-black/60 rounded-3xl overflow-hidden border border-white/10 aspect-[9/16] relative shadow-2xl">
                            {videoPreview ? (
                                <div className="relative w-full h-full">
                                    <video src={videoPreview} className="w-full h-full object-cover" autoPlay loop playsInline />
                                    <button
                                        onClick={() => { setVideoPreview(null); setVideoBlob(null); }}
                                        className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center relative">
                                    {isRecording ? (
                                        <video ref={videoRef} className="w-full h-full object-cover absolute inset-0" autoPlay muted playsInline />
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                                <Camera size={40} className="text-cyan-400" />
                                            </div>
                                            <p className="text-sm text-gray-400 mb-6">
                                                Présente-toi, ton expérience et ce que tu cherches.
                                            </p>
                                        </div>
                                    )}

                                    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
                                        {isRecording ? (
                                            <button
                                                onClick={stopRecording}
                                                className="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center bg-red-500/20 animate-pulse"
                                            >
                                                <div className="w-6 h-6 bg-red-500 rounded-sm" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={startRecording}
                                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:scale-110 transition-transform bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)] border-none"
                                            >
                                                <div className="w-4 h-4 bg-black rounded-full" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" onClick={prevStep} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                                RETOUR
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-[2] bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black shadow-[0_0_20px_rgba(168,85,247,0.5)] border-none"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "C'EST PARTI ! 🚀"}
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

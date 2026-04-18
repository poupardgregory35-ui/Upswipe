'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Logo } from '@/app/components/ui/Logo'
import Link from 'next/link'

export default function LoginRecruiterPage() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // FORCE SIGNOUT ON MOUNT TO CLEAR BAD SESSIONS
    useEffect(() => {
        const clearSession = async () => {
            await supabase.auth.signOut()
        }
        clearSession()
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) throw authError

            // Fetch profile
            const { data: { user } } = await supabase.auth.getUser()

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user?.id)
                .single()

            if (profileError) {
                console.error('Profile fetch error:', profileError)
                setError(`Erreur lecture profil: ${profileError.message}`)
                await supabase.auth.signOut()
                return
            }

            if (profile?.role === 'recruiter') {
                router.push('/recruteur/dashboard')
            } else {
                // If not recruiter, force logout and show error
                await supabase.auth.signOut()
                const debugInfo = `ID: ${user?.id?.slice(0, 5)}... | Rôle trouvé: ${profile?.role || 'aucun'}`
                setError(`Ce compte n'est pas un compte Recruteur. (${debugInfo})`)
            }
            router.refresh()

        } catch (err: any) {
            setError(err.message || 'Erreur de connexion')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80')] bg-cover bg-center opacity-10 blur-sm pointer-events-none" />

            <div className="w-full max-w-md z-10">
                <div className="flex justify-center mb-8">
                    <Logo size="lg" />
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
                    <h1 className="text-3xl font-black text-white text-center mb-2">
                        Espace Recruteur
                    </h1>
                    <p className="text-slate-400 text-center mb-8">Connexion sécurisée</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Pro</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="nom@entreprise.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Se connecter <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
                            Retour à l'accueil connexion
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

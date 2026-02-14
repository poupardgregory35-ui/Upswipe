'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Logo } from '@/app/components/ui/Logo'
import Link from 'next/link'
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

function CandidateLoginForm() {
    const supabase = createClientComponentClient()
    const router = useRouter()
    const searchParams = useSearchParams()
    const view = searchParams.get('view') || 'login' // 'login' or 'signup'

    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isSignUp = view === 'signup'

    const handleGoogleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/dispatch?role=candidate`,
                queryParams: { access_type: 'offline', prompt: 'consent' },
            },
        })
        if (error) {
            console.error('Google login error:', error)
            toast.error('Erreur connexion Google.')
            setLoading(false)
        }
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                // SIGN UP
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`
                    }
                })
                if (signUpError) throw signUpError

                // Manual Profile Creation for Email Signup
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase.from('profiles').insert({
                        id: user.id,
                        role: 'candidate',
                        email: user.email,
                        onboarding_completed: false
                    })
                }

                // If email confirmation is off, we can log them in directly?
                // Or just try to sign in immediately
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
                if (!signInError) {
                    router.push('/auth/dispatch?role=candidate')
                    return
                } else {
                    toast.success("Compte créé ! Vérifiez vos emails si nécessaire.")
                }

            } else {
                // SIGN IN
                const { error: authError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                })
                if (authError) throw authError

                router.push('/auth/dispatch?role=candidate')
            }

        } catch (err: any) {
            setError(err.message || 'Erreur d\'authentification')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[140px]" />

            <div className="w-full max-w-md z-10">
                <div className="flex justify-center mb-8">
                    <Link href="/">
                        <Logo size="lg" />
                    </Link>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h1 className="text-3xl font-black text-white text-center mb-2">
                        {isSignUp ? 'Créer mon profil' : 'Connexion Candidat'}
                    </h1>
                    <p className="text-slate-400 text-center mb-8 text-sm">
                        {isSignUp ? 'Commencez par sécuriser votre compte' : 'Accédez à vos missions'}
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-bold py-4 rounded-xl hover:bg-gray-100 transition-all shadow-lg disabled:opacity-50 mb-8"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {isSignUp ? "S'inscrire avec Google" : "Continuer avec Google"}
                    </button>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-2 text-slate-500">Ou avec email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-slate-500" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="Mot de passe"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-slate-500 hover:text-green-400 transition-colors"
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
                            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>{isSignUp ? "Créer mon compte" : "Se connecter"} <ArrowRight size={20} /></>}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            {isSignUp ? "Déjà un compte ? " : "Pas encore inscrit ? "}
                            <Link
                                href={isSignUp ? "/login/candidate?view=login" : "/login/candidate?view=signup"}
                                className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                            >
                                {isSignUp ? "Me connecter" : "Créer un profil"}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CandidateLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-green-500" size={48} /></div>}>
            <CandidateLoginForm />
        </Suspense>
    )
}

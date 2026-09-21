import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    // Pattern updateSession officiel @supabase/ssr : la response doit être
    // recréée à chaque écriture de cookie pour que req et res restent
    // synchronisés (sinon les cookies rafraîchis ne sont pas propagés).
    let res = NextResponse.next({ request: req })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
                    res = NextResponse.next({ request: req })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        res.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // getUser() (et non getSession()) : @supabase/ssr recommande cet appel
    // dans le middleware car il revalide le token auprès de Supabase Auth,
    // ce qui déclenche le même rafraîchissement de session que l'ancien
    // getSession() d'auth-helpers-nextjs, de façon plus fiable.
    await supabase.auth.getUser()

    return res
}

export const config = {
    // Limité aux routes qui dépendent réellement d'une session (l'app est
    // en 'use client' et revérifie déjà l'auth côté client sur ces pages).
    // Les pages publiques (accueil, login, signup, assets) n'ont pas besoin
    // de ce round-trip Supabase à chaque navigation.
    matcher: [
        '/candidat/:path*',
        '/recruteur/:path*',
        '/dashboard/:path*',
        '/onboarding/:path*',
        '/auth/:path*',
    ],
}

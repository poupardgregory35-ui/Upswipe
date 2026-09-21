import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    await supabase.auth.getSession()
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

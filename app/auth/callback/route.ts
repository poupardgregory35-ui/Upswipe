import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = createRouteHandlerClient({ cookies })
        await supabase.auth.exchangeCodeForSession(code)

        // ⚠️ Vérification Role Recruteur Direct
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role === 'recruiter') {
                return NextResponse.redirect(new URL('/recruteur/dashboard', requestUrl.origin))
            } else {
                return NextResponse.redirect(new URL('/candidate/swipe', requestUrl.origin))
            }
        }
    }

    // Redirect par défaut
    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}

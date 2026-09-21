import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Remplace createRouteHandlerClient({ cookies }) de @supabase/auth-helpers-nextjs
// (déprécié). Usage : route handlers (app/**/route.ts). cookies() est
// asynchrone depuis Next 15, d'où le createClient() async.
export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // setAll appelé depuis un Server Component : sans effet,
                        // le middleware se charge de rafraîchir la session.
                    }
                },
            },
        }
    )
}

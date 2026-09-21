import { createBrowserClient } from '@supabase/ssr'

// Remplace createClientComponentClient() de @supabase/auth-helpers-nextjs
// (déprécié). Même usage : appeler createClient() dans chaque composant
// client qui a besoin d'un accès Supabase lié à la session du navigateur.
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

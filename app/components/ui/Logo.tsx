interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
    /**
     * Set true when rendering on a DARK background.
     * The `/gold.png` asset has a non-transparent cream/white background,
     * so dropping it on a dark page makes it look like a sticker. Until we
     * ship a transparent variant, the dark mode renders a typographic
     * wordmark instead — clean, on-brand, no sticker effect.
     */
    dark?: boolean
}

import Image from 'next/image'
import Link from 'next/link'

export function Logo({ className = "", size = 'md', dark = false }: LogoProps) {
    const dimensions = {
        sm: { width: 100, height: 36 },
        md: { width: 200, height: 72 },
        lg: { width: 400, height: 144 }
    }

    const { width, height } = dimensions[size]

    if (dark) {
        // Typographic wordmark for dark contexts.
        // Sizes are tuned so the wordmark visually matches the image footprint
        // for the same `size` prop (the consumer often centers it in a slot
        // sized for the image).
        const titleSize = {
            sm: 'text-xl',
            md: 'text-3xl',
            lg: 'text-5xl md:text-6xl'
        }[size]
        const subtitleSize = {
            sm: 'text-[8px]',
            md: 'text-[10px]',
            lg: 'text-xs'
        }[size]
        const subtitleSpacing = size === 'sm' ? 'mt-0.5' : 'mt-1.5'

        return (
            <Link
                href="/"
                className={`inline-flex flex-col items-center ${className} hover:opacity-80 transition-opacity`}
                title="Retour à l'accueil"
            >
                <span className={`${titleSize} font-black tracking-tight text-white leading-none`}>
                    UP<span className="text-yellow-400">SWIPE</span>
                </span>
                <span className={`${subtitleSize} ${subtitleSpacing} font-semibold tracking-[0.2em] text-slate-400`}>
                    MATCHING TRANSPORT SANITAIRE
                </span>
            </Link>
        )
    }

    return (
        <Link href="/" className={`relative block ${className} hover:opacity-80 transition-opacity`} style={{ width, height }} title="Retour à l'accueil">
            <Image
                src="/gold.png"
                alt="UPSWIPE Logo"
                fill
                className="object-contain"
                priority
            />
        </Link>
    )
}

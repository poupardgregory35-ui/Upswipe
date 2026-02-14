interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

import Image from 'next/image'
import Link from 'next/link'

export function Logo({ className = "", size = 'md' }: LogoProps) {
    const dimensions = {
        sm: { width: 100, height: 36 },
        md: { width: 200, height: 72 },
        lg: { width: 400, height: 144 }
    }

    const { width, height } = dimensions[size]

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

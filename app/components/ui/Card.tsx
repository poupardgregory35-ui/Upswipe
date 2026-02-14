import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    gradient?: boolean
    variant?: 'glass' | 'solid' | 'cyber' | 'gradient'
}

export function Card({ children, className, variant = 'glass', gradient = false, ...props }: CardProps) {
    const variants: Record<string, string> = {
        glass: "bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-lg border text-white",
        solid: "bg-white shadow-sm text-slate-900 border border-slate-100",
        cyber: "bg-neutral-900/80 border border-purple-500 backdrop-blur-xl text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]",
        gradient: "bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-xl text-white border"
    }

    return (
        <div
            className={cn(
                "rounded-3xl p-6 transition-all duration-300",
                gradient ? variants.gradient : variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

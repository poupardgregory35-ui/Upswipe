import { Inter } from 'next/font/google'
import './globals.css'
import { HomeButton } from './components/ui/HomeButton'
import { Toaster } from 'sonner' // Added import

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UPSWIPE - Recrutement Ambulancier',
  description: 'L\'application de matching pour le transport sanitaire.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-black`}>
        <main className="min-h-screen relative">
          {children}
          <HomeButton />
        </main>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="system"
        />
      </body>
    </html>
  )
}

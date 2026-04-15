import { Inter } from 'next/font/google'
import './globals.css'
import { HomeButton } from './components/ui/HomeButton'
import { Toaster } from 'sonner' // Added import
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

const BASE_URL = 'https://upswipe.capsops.fr'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'UPSWIPE – Recrutement Ambulancier | Matching Transport Sanitaire',
    template: '%s | UPSWIPE',
  },
  description:
    'UPSWIPE connecte ambulanciers (DEA, AA) et entreprises de transport sanitaire via un matching géolocalisé. Trouvez votre prochain poste ou profil en 48h.',
  keywords: [
    'recrutement ambulancier',
    'emploi ambulancier DEA',
    'offre emploi transport sanitaire',
    'poste ambulancier',
    'matching ambulancier',
    'VSL recrutement',
    'auxiliaire ambulancier emploi',
  ],
  authors: [{ name: 'CAPSO SASU', url: BASE_URL }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: BASE_URL,
    siteName: 'UPSWIPE',
    title: 'UPSWIPE – Trouvez votre prochain poste ambulancier en 2 swipes',
    description:
      'La plateforme de matching dédiée au transport sanitaire. Ambulanciers DEA, AA : swipe et trouve ton CDI. Recruteurs : accédez aux profils vérifiés géolocalisés.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'UPSWIPE – Matching Transport Sanitaire',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UPSWIPE – Recrutement ambulancier par matching',
    description:
      'Swipe ton prochain poste ambulancier. Matching géolocalisé, profils DEA vérifiés, résultat en 48h.',
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'UPSWIPE',
  url: 'https://upswipe.capsops.fr',
  description:
    'Plateforme de matching pour le recrutement dans le transport sanitaire privé. Connecte ambulanciers (DEA, AA) et entreprises via un système de swipe géolocalisé.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Gratuit pour les candidats ambulanciers',
  },
  provider: {
    '@type': 'Organization',
    name: 'CAPSO SASU',
    url: 'https://upswipe.capsops.fr',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'poupardgregory35@gmail.com',
      contactType: 'customer support',
      availableLanguage: 'French',
    },
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Ambulanciers DEA, Auxiliaires Ambulanciers, Entreprises de transport sanitaire',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#0f1729]`}>
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

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'UPSWIPE – Matching Transport Sanitaire'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0f1729 0%, #1a2a4a 50%, #0f1729 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circles décoratifs */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'rgba(0, 120, 255, 0.08)',
          top: '-150px',
          right: '-100px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(0, 200, 180, 0.06)',
          bottom: '-100px',
          left: '-80px',
          display: 'flex',
        }} />

        {/* Logo + Nom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
          }}>
            🚑
          </div>
          <span style={{
            fontSize: '64px',
            fontWeight: '900',
            color: 'white',
            letterSpacing: '-2px',
          }}>
            Upswipe
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: '32px',
          color: '#00d4b4',
          fontWeight: '700',
          marginBottom: '20px',
          letterSpacing: '-0.5px',
        }}>
          Matching Transport Sanitaire
        </div>

        {/* Description */}
        <div style={{
          fontSize: '22px',
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          maxWidth: '800px',
          lineHeight: '1.5',
          marginBottom: '40px',
        }}>
          Trouve ton prochain poste ambulancier · DEA, AA, VSL
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Gratuit', 'Géolocalisé', 'Résultat en 48h'].map((label) => (
            <div key={label} style={{
              padding: '10px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(0, 212, 180, 0.4)',
              background: 'rgba(0, 212, 180, 0.1)',
              color: '#00d4b4',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '16px',
          display: 'flex',
        }}>
          upswipe.capsops.fr
        </div>
      </div>
    ),
    { ...size }
  )
}

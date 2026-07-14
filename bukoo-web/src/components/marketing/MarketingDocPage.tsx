import type { ReactNode } from 'react'

export function MarketingDocPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
}) {
  return (
    <>
      <section style={{
        padding: '140px 24px 48px',
        textAlign: 'center',
        position: 'relative',
      }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 560,
          height: 320,
          background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <span className="s-eyebrow">{eyebrow}</span>
          <h1 className="s-h2" style={{ marginTop: 12, marginBottom: intro ? 16 : 0 }}>{title}</h1>
          {intro ? (
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.65, maxWidth: 560, margin: '0 auto' }}>
              {intro}
            </p>
          ) : null}
        </div>
      </section>

      <article style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '0 24px 96px',
        color: 'rgba(255,255,255,0.88)',
        fontSize: 15,
        lineHeight: 1.75,
      }}
      >
        {children}
      </article>
    </>
  )
}

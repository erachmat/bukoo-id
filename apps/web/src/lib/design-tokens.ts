/**
 * BUKOO Design Tokens — Single Source of Truth
 * Extracted from Figma file: https://www.figma.com/design/NHqkNlovrJLDtYsf2ORvNk
 * 
 * These tokens are canonical for both bukoo.id (reader homepage) and
 * publisher.bukoo.id (publisher landing). Any visual change must update
 * this file first, then propagate to CSS.
 */

export const colors = {
  // Primary brand palette
  forest: '#1E4035',
  forestDark: '#122A22',
  forestDarker: '#0A1A15',
  forestLight: '#2A5A48',
  
  // Accent / CTA
  gold: '#B58418',
  goldHover: '#A07015',
  amber: '#C9952A',
  amberLight: '#F0D080',
  
  // Surfaces
  cream: '#FAF7F2',
  creamSurface: '#F4F1E8',
  white: '#FFFFFF',
  
  // Text
  textPrimary: '#F0EDE6',
  textSecondary: 'rgba(240, 237, 230, 0.65)',
  textMuted: 'rgba(240, 237, 230, 0.35)',
  
  // Accents
  teal: '#00C9A7',
  tealDark: '#00957A',
  coral: '#FF6B4A',
  
  // Borders
  border: 'rgba(201, 149, 42, 0.12)',
  borderHi: 'rgba(201, 149, 42, 0.3)',
  
  // Card backgrounds
  cardBg: 'rgba(255, 255, 255, 0.04)',
  cardBgHi: 'rgba(255, 255, 255, 0.07)',
} as const;

export const typography = {
  // Font families
  fontFamilySerif: "'Playfair Display', Georgia, serif",
  fontFamilySans: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  
  // Font sizes (desktop)
  fontSizeHero: 'clamp(46px, 6vw, 88px)',
  fontSizeH1: 'clamp(38px, 5vw, 68px)',
  fontSizeH2: 'clamp(32px, 4vw, 48px)',
  fontSizeBody: '15px',
  fontSizeSmall: '13px',
  
  // Line heights
  lineHeightTight: '1.04',
  lineHeightBase: '1.65',
  lineHeightRelaxed: '1.8',
} as const;

export const layout = {
  // Container widths
  containerMax: '1240px',
  containerNarrow: '760px',
  contentMax: '1160px',
  
  // Spacing
  sectionPaddingY: '80px',
  sectionPaddingYLarge: '120px',
  gutter: '48px',
} as const;

export const shape = {
  // Border radius
  radiusSm: '6px',
  radiusMd: '12px',
  radiusLg: '20px',
  radiusPill: '999px',
  
  // Stroke
  strokeWidth: '1.5px',
} as const;

export const shadows = {
  card: '0 8px 24px rgba(0, 0, 0, 0.5)',
  cardHover: '0 16px 40px rgba(0, 0, 0, 0.6)',
  glow: '0 8px 24px rgba(201, 149, 42, 0.35)',
} as const;
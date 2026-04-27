import React from 'react';

export type Book = {
  id: string;
  title: string;
  author: string;
  bgClass: string;
  tags?: string[];
  rating?: number;
  readers?: string;
  rank?: number;
  badge?: string;
  coverContent: React.ReactNode;
};

export const trendingBooks: Book[] = [
  {
    id: 't1',
    rank: 1,
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    bgClass: 'bg-laut',
    tags: ['🇮🇩 Sastra', 'Novel', 'Sejarah'],
    rating: 4.8,
    readers: '42.841',
    coverContent: (
      <>
        <svg style={{ position: 'absolute', bottom: '0', left: '0', right: '0', width: '100%', height: '40%' }} viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0,18 Q25,8 50,18 Q75,28 100,18 L100,30 L0,30Z" fill="rgba(255,255,255,.12)" /></svg>
        <div style={{ position: 'relative', zIndex: '1', textAlign: 'center' }}>
          <div style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,.85)', textTransform: 'uppercase', letterSpacing: '.5px', lineHeight: '1.4' }}>LAUT<br />BERCERITA</div>
          <div style={{ fontSize: '7px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>LEILA S.C.</div>
        </div>
      </>
    )
  },
  {
    id: 't2',
    rank: 2,
    title: 'Atomic Habits',
    author: 'James Clear',
    bgClass: 'bg-atomic',
    tags: ['Self-Dev', 'Produktivitas'],
    rating: 4.9,
    readers: '38.124',
    coverContent: (
      <>
        <div style={{ width: '32px', height: '32px', border: '2px solid rgba(78,205,196,.7)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}><div style={{ width: '16px', height: '16px', border: '2px solid rgba(78,205,196,.9)', borderRadius: '50%' }}></div></div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: 'rgba(78,205,196,.9)', textAlign: 'center' }}>ATOMIC<br />HABITS</div>
        <div style={{ fontSize: '6px', color: 'rgba(255,255,255,.35)', marginTop: '2px' }}>JAMES CLEAR</div>
      </>
    )
  },
  {
    id: 't3',
    rank: 3,
    title: 'Bumi Manusia',
    author: 'Pramoedya A.T.',
    bgClass: 'bg-bumi',
    tags: ['🇮🇩 Sastra', 'Klasik'],
    rating: 4.9,
    readers: '29.556',
    coverContent: (
      <>
        <div style={{ fontSize: '7.5px', fontWeight: '700', color: 'rgba(255,200,100,.9)', textAlign: 'center', lineHeight: '1.4' }}>BUMI<br />MANUSIA</div>
        <div style={{ fontSize: '6px', color: 'rgba(255,255,255,.4)', marginTop: '3px' }}>PRAMOEDYA</div>
        <div style={{ marginTop: '4px', background: 'rgba(0,201,167,.7)', padding: '1px 6px', borderRadius: '2px', fontSize: '6px', fontWeight: '700', color: '#0D1117' }}>🇮🇩</div>
      </>
    )
  },
  {
    id: 't4',
    rank: 4,
    title: 'Sapiens (ID)',
    author: 'Yuval Noah Harari',
    bgClass: 'bg-sapiens',
    tags: ['Sains', 'Sejarah'],
    rating: 4.8,
    readers: '24.210',
    coverContent: (
      <>
        <div style={{ fontSize: '5.5px', color: 'rgba(168,85,247,.8)', letterSpacing: '.8px', marginBottom: '3px' }}>Y.N. HARARI</div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', letterSpacing: '.8px' }}>SAPIENS</div>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', textAlign: 'center', marginTop: '2px' }}>A BRIEF HISTORY</div>
      </>
    )
  },
  {
    id: 't5',
    rank: 5,
    title: 'Think & Grow Rich',
    author: 'Napoleon Hill',
    bgClass: 'bg-think',
    tags: ['Bisnis', 'Self-Dev'],
    rating: 4.7,
    readers: '18.933',
    coverContent: (
      <>
        <div style={{ fontSize: '5px', color: 'rgba(255,215,0,.7)', letterSpacing: '.5px', marginBottom: '2px' }}>N. HILL</div>
        <div style={{ width: '20px', height: '1px', background: 'rgba(255,215,0,.4)', marginBottom: '3px' }}></div>
        <div style={{ fontSize: '7px', fontWeight: '700', color: 'rgba(255,215,0,.9)', textAlign: 'center', lineHeight: '1.3' }}>THINK &<br />GROW RICH</div>
      </>
    )
  },
  {
    id: 't6',
    rank: 6,
    title: 'Psychology of Money',
    author: 'Morgan Housel',
    bgClass: 'bg-psych',
    tags: ['Keuangan', 'Bisnis'],
    rating: 4.8,
    readers: '17.445',
    coverContent: (
      <>
        <div style={{ fontSize: '5px', color: 'rgba(147,197,253,.8)', letterSpacing: '.5px', marginBottom: '2px' }}>MORGAN HOUSEL</div>
        <div style={{ fontSize: '7px', fontWeight: '700', color: 'rgba(147,197,253,.9)', textAlign: 'center', lineHeight: '1.3' }}>THE PSYCH<br />OF MONEY</div>
      </>
    )
  },
  {
    id: 't7',
    rank: 7,
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    bgClass: 'bg-alchm',
    tags: ['Fiksi', 'Filosofi'],
    rating: 4.8,
    readers: '15.820',
    coverContent: (
      <>
        <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(255,200,80,.9)', textAlign: 'center', lineHeight: '1.4' }}>THE<br />ALCHEMIST</div>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PAULO COELHO</div>
      </>
    )
  },
  {
    id: 't8',
    rank: 8,
    title: 'Rich Dad Poor Dad',
    author: 'Robert Kiyosaki',
    bgClass: 'bg-richdad',
    tags: ['Keuangan', 'Bisnis'],
    rating: 4.7,
    readers: '14.220',
    coverContent: (
      <>
        <div style={{ fontSize: '6px', fontWeight: '700', color: 'rgba(100,220,130,.9)', textAlign: 'center', lineHeight: '1.4' }}>RICH DAD<br />POOR DAD</div>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>KIYOSAKI</div>
      </>
    )
  },
  {
    id: 't9',
    rank: 9,
    title: 'Deep Work',
    author: 'Cal Newport',
    bgClass: 'bg-deepwk',
    tags: ['Produktivitas', 'Self-Dev'],
    rating: 4.7,
    readers: '12.108',
    coverContent: (
      <>
        <div style={{ fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,.8)', textAlign: 'center', lineHeight: '1.3' }}>DEEP<br />WORK</div>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.35)', marginTop: '2px' }}>CAL NEWPORT</div>
      </>
    )
  },
  {
    id: 't10',
    rank: 10,
    title: 'Ikigai',
    author: 'Garcia & Miralles',
    bgClass: 'bg-ikigai',
    tags: ['Filosofi', 'Gaya Hidup'],
    rating: 4.7,
    readers: '11.503',
    coverContent: (
      <>
        <div style={{ fontSize: '9px', fontWeight: '700', color: '#fff', letterSpacing: '.5px' }}>IKIGAI</div>
        <div style={{ fontSize: '14px', marginTop: '2px' }}>🌸</div>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>GARCIA & MIRALLES</div>
      </>
    )
  }
];

export const originalBooks: Book[] = [
  {
    id: 'o1',
    title: 'Tanah & Kata',
    author: 'Puthut EA',
    bgClass: 'bg-orig',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>TANAH<br />&amp; KATA</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>PUTHUT EA</div>
      </>
    )
  },
  {
    id: 'o2',
    title: 'Generasi Layar',
    author: 'Clara Shinta',
    bgClass: 'bg-show',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>GENERASI<br />LAYAR</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>CLARA SHINTA</div>
      </>
    )
  },
  {
    id: 'o3',
    title: 'Mimpi di Jakarta',
    author: 'Rio Alfiano',
    bgClass: 'bg-noa',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>MIMPI<br />DI JAKARTA</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>RIO ALFIANO</div>
      </>
    )
  },
  {
    id: 'o4',
    title: 'Senja Nusantara',
    author: 'Dee Lestari',
    bgClass: 'bg-power',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>SENJA<br />NUSANTARA</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>DEE LESTARI</div>
      </>
    )
  },
  {
    id: 'o5',
    title: 'Rasa Indonesia',
    author: 'Alanda Kariza',
    bgClass: 'bg-flow',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>RASA<br />INDONESIA</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>ALANDA KARIZA</div>
      </>
    )
  },
  {
    id: 'o6',
    title: 'Kode Rahasia',
    author: 'Azhar Nurun Ala',
    bgClass: 'bg-zero',
    badge: 'ORIGINAL',
    coverContent: (
      <>
        <div style={{ background: 'var(--amber)', color: 'var(--forest-dd)', fontSize: '6px', fontWeight: '700', padding: '2px 6px', borderRadius: '2px', marginBottom: '5px' }}>ORIGINAL</div>
        <div style={{ fontSize: '6.5px', fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: '1.4' }}>KODE<br />RAHASIA</div>
        <div style={{ fontSize: '5.5px', color: 'rgba(255,255,255,.4)', marginTop: '2px' }}>AZHAR NURUN ALA</div>
      </>
    )
  }
];

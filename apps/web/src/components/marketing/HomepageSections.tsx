import Image from 'next/image';

const features = [
  ['book-open-01.png', 'Satu langganan, ribuan judul', 'Akses banyak judul kurasi dari penerbit Indonesia. Bayar sekali sebulan, baca sepuasnya — tanpa beli buku satuan.'],
  ['cafe.png', 'Semurah secangkir kopi', 'Mulai Rp 29.900 per bulan untuk akses penuh. Jauh lebih hemat dibanding membeli buku fisik satu per satu.'],
  ['elements.png', 'Karya Indonesia untuk dunia', 'Kami mengangkat karya dari banyak penulis Indonesia, agar bisa dinikmati pembaca di mana saja.'],
  ['elements03.png', 'Baca di mana saja, bahkan offline', 'iOS & Android, sinkron otomatis antar perangkat. Unduh buku untuk dibaca tanpa koneksi internet.'],
  ['elements02.png', 'Bukoo Assistant', 'Asisten baca berbasis AI yang membangun peta baca personal, merangkum bab, dan menjawab pertanyaanmu tentang isi bacaan.'],
  ['elements01.png', 'Fleksibel & tanpa kontrak', 'Berlangganan bulanan tanpa kontrak. Batalkan kapan saja langsung dari aplikasi — tanpa penalti, tanpa ribet.'],
] as const;

const assistantBullets = [
  'Rekomendasi personal sesuai riwayat dan suasana bacamu',
  'Rangkuman bab otomatis dan insight kunci tiap buku',
  'Peta baca: jalur membaca yang dikurasi sesuai tujuanmu',
];

const communityBullets = [
  'Club Baca virtual & tantangan membaca bulanan',
  'Bagikan highlight, catatan, dan review langsung dari buku',
  'Profil pembaca dengan streak, badge, dan statistik personal',
];

function ProductSection({ eyebrow, title, text, bullets, image, reverse = false }: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  text: string;
  bullets: string[];
  image: string;
  reverse?: boolean;
}) {
  return (
    <section className={`homepage-product ${reverse ? 'homepage-product-reverse' : ''}`}>
      <div className="homepage-product-copy">
        <p className="homepage-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="homepage-lede">{text}</p>
        <ul>{bullets.map((bullet) => <li key={bullet}><Image src="/homepage-assets/green-checklist-icon.png" alt="" width={21} height={21} />{bullet}</li>)}</ul>
      </div>
      <div className="homepage-product-art">
        <Image src={`/homepage-assets/${image}`} alt="" width={960} height={1100} />
      </div>
    </section>
  );
}

export function HomepageSections() {
  return (
    <>
      <section className="homepage-intro">
        <h2>Kenapa membaca di<br /><em>BUKOO?</em></h2>
        <p className="homepage-section-lede">Bukan sekadar rak buku digital — sebuah cara baru menikmati bacaan tanpa harus membeli satu per satu.</p>
        <div className="homepage-feature-grid">
          {features.map(([icon, title, text]) => (
            <article className="homepage-feature-card" key={title}>
              <Image src={`/homepage-assets/${icon}`} alt="" width={72} height={72} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow={<span className="assistant-brand"><Image src="/homepage-assets/bukoo-assistant-logo.png" alt="" width={42} height={28} /><span>Bukoo <span className="assistant-plain">Assistant</span></span></span>}
        title={<>Asisten baca yang<br /><em>mengenal seleramu</em></>}
        text="Lebih dari sekadar merekomendasikan buku — ia membangun peta baca personal, merangkum bab, dan menjawab pertanyaanmu tentang isi bacaan."
        bullets={assistantBullets}
        image="Group01.png"
      />

      <ProductSection
        eyebrow={<>Komunitas <em>Bukoo</em></>}
        title={<>Membaca Lebih<br /><em>Menyenangkan Bersama</em></>}
        text="Bergabung dengan komunitas pembaca Indonesia. Ikut tantangan baca, bagikan insight, dan temukan teman baca yang punya selera serupa."
        bullets={communityBullets}
        image="Group03.png"
        reverse
      />

      <section className="homepage-publisher-band">
        <p>Bermitra dengan penerbit terbaik Indonesia — mengangkat karya anak bangsa.</p>
      </section>
    </>
  );
}

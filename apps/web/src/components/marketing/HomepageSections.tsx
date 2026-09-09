import Image from 'next/image';
import Link from 'next/link';

const features = [
  { icon: 'book-open-01.png', title: 'Koleksi Pilihan', text: 'Ribuan buku pilihan dari penerbit terbaik Indonesia dan dunia.' },
  { icon: 'cafe.png', title: 'Baca Sesuai Ritmemu', text: 'Temukan ruang tenang untuk membaca kapan pun dan di mana pun.' },
  { icon: 'elements.png', title: 'Pengalaman Personal', text: 'Rekomendasi yang memahami selera dan perjalanan bacamu.' },
  { icon: 'elements01.png', title: 'Baca Bersama', text: 'Bagikan insight dan bertumbuh bersama komunitas pembaca.' },
];

function ProductSection({
  eyebrow,
  title,
  text,
  bullets,
  image,
  reverse = false,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: React.ReactNode;
  text: string;
  bullets: string[];
  image: string;
  reverse?: boolean;
  href: string;
  linkLabel: string;
}) {
  return (
    <section className={`homepage-product ${reverse ? 'homepage-product-reverse' : ''}`}>
      <div className="homepage-product-copy">
        <p className="homepage-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="homepage-lede">{text}</p>
        <ul>
          {bullets.map((bullet) => <li key={bullet}><span>✓</span>{bullet}</li>)}
        </ul>
        <Link className="homepage-text-link" href={href}>{linkLabel} <span>→</span></Link>
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
        <p className="homepage-eyebrow">Satu aplikasi, banyak kemungkinan</p>
        <h2>Lebih dari sekadar<br /><em>membaca buku.</em></h2>
        <p className="homepage-section-lede">BUKOO hadir untuk menemani setiap langkah dalam perjalanan membaca dan menemukan ide-ide baru.</p>
        <div className="homepage-feature-grid">
          {features.map((feature) => (
            <article className="homepage-feature-card" key={feature.title}>
              <Image src={`/homepage-assets/${feature.icon}`} alt="" width={72} height={72} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <ProductSection
        eyebrow="Bukoo Assistant"
        title={<>Teman baca yang<br /><em>selalu mengerti.</em></>}
        text="Dapatkan panduan personal untuk membaca lebih bermakna. Tanyakan apa saja, temukan rekomendasi baru, dan bangun kebiasaan membaca yang bertahan lama."
        bullets={['Rekomendasi sesuai minat dan tujuanmu', 'Rangkuman dan insight dari buku yang sedang dibaca', 'Peta baca personal untuk perjalananmu']}
        image="Group01.png"
        href="/ai-companion"
        linkLabel="Kenali Bukoo Assistant"
      />

      <ProductSection
        eyebrow="Komunitas Bukoo"
        title={<>Karena membaca<br /><em>lebih seru bersama.</em></>}
        text="Temukan pembaca dengan rasa ingin tahu yang sama. Ikut baca bareng, bagikan pendapat, dan rayakan setiap halaman yang kamu selesaikan."
        bullets={['Ikuti klub dan tantangan baca', 'Bagikan highlight, catatan, dan ulasan', 'Temukan teman baca dengan selera serupa']}
        image="Group02.png"
        reverse
        href="/komunitas"
        linkLabel="Jelajahi komunitas"
      />

      <ProductSection
        eyebrow="Dibuat untuk pembaca"
        title={<>Buka dunia baru,<br /><em>satu halaman sekali.</em></>}
        text="Dari cerita yang menghibur sampai gagasan yang mengubah cara pandang, selalu ada sesuatu yang menunggumu di BUKOO."
        bullets={['Akses dari aplikasi iOS dan Android', 'Sinkronisasi otomatis di semua perangkat', 'Simpan buku untuk dibaca offline']}
        image="Group03.png"
        href="/koleksi"
        linkLabel="Lihat koleksi buku"
      />

      <section className="homepage-publisher-band">
        <div>
          <p className="homepage-eyebrow">Untuk penerbit</p>
          <h2>Jadikan ceritamu<br /><em>lebih mudah ditemukan.</em></h2>
          <p>BUKOO membantu penerbit menjangkau pembaca baru dan membangun hubungan yang lebih dekat dengan komunitas literasi Indonesia.</p>
          <a className="homepage-button homepage-button-light" href="https://publisher.bukoo.id/publisher/daftar" target="_blank" rel="noopener noreferrer">Bergabung sebagai penerbit →</a>
        </div>
        <Image src="/homepage-assets/elements03.png" alt="" width={208} height={230} />
      </section>
    </>
  );
}

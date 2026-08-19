import Link from 'next/link';

export default function KontakPage() {
  return (
    <>
      {/* Hero */}
      <section className="phero">
        <div className="phero-bg"></div>
        <div className="phero-grid"></div>
        <div className="wrap">
          <span className="eyebrow">Perusahaan · Kontak</span>
          <h1 className="ph-h1">Mari <em>terhubung</em></h1>
          <p className="ph-lead">
            Punya pertanyaan, ide kerjasama, atau sekadar ingin menyapa? Pilih kanal yang paling sesuai — tim kami senang mendengar dari Anda.
          </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Hubungi Kami</span>
            <h2 className="h2">Kanal <em>yang tepat</em> untuk Anda</h2>
          </div>
          <div className="contact-grid">
            <div>
              <div className="contact-ch">
                <div className="ic">💬</div>
                <div>
                  <h5>Pertanyaan umum &amp; dukungan</h5>
                  <p><a href="mailto:halo@bukoo.id">halo@bukoo.id</a></p>
                </div>
              </div>
              <div className="contact-ch">
                <div className="ic">📚</div>
                <div>
                  <h5>Kemitraan penerbit</h5>
                  <p><a href="mailto:penerbit@bukoo.id">penerbit@bukoo.id</a></p>
                </div>
              </div>
              <div className="contact-ch">
                <div className="ic">📈</div>
                <div>
                  <h5>Investor relations</h5>
                  <p><a href="mailto:invest@bukoo.id">invest@bukoo.id</a></p>
                </div>
              </div>
              <div className="contact-ch">
                <div className="ic">📰</div>
                <div>
                  <h5>Media &amp; pers</h5>
                  <p><a href="mailto:newsroom@bukoo.id">newsroom@bukoo.id</a></p>
                </div>
              </div>
              <div className="contact-ch">
                <div className="ic">🏢</div>
                <div>
                  <h5>Kantor</h5>
                  <p>PT Bukoo Digital Indonesia · Indonesia</p>
                </div>
              </div>
            </div>

            <div className="demo-form">
              <div className="fg">
                <label>Nama</label>
                <input type="text" required placeholder="Nama Anda" name="nama" />
              </div>
              <div className="fg">
                <label>Email</label>
                <input type="email" required placeholder="email@anda.id" name="email" />
              </div>
              <div className="fg">
                <label>Topik</label>
                <select name="topik">
                  <option>Pertanyaan umum</option>
                  <option>Dukungan teknis</option>
                  <option>Kemitraan penerbit</option>
                  <option>Investor</option>
                  <option>Media &amp; pers</option>
                </select>
              </div>
              <div className="fg">
                <label>Pesan</label>
                <textarea required placeholder="Tulis pesan Anda di sini." name="pesan"></textarea>
              </div>
              <button type="button" className="form-submit">Kirim pesan</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

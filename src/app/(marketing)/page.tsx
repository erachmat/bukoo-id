import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, Zap, Sparkles, ShieldCheck } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full relative py-24 md:py-32 lg:py-40 overflow-hidden flex justify-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20 dark:bg-black dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
        <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Platform Membaca Digital No.1 di Indonesia
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-balance">
            Baca Lebih Banyak, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Bayar Lebih Sedikit.
            </span>
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground text-lg sm:text-xl text-balance">
            Ribuan buku premium dalam genggaman Anda. Nikmati akses tanpa batas ke koleksi buku terbaik dari penulis lokal maupun internasional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-8">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full rounded-full text-base h-12 px-8 shadow-lg hover:shadow-xl transition-all">
                Mulai Baca Gratis
              </Button>
            </Link>
            <Link href="/library" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full rounded-full text-base h-12 px-8">
                Jelajahi Katalog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 bg-muted/30 flex justify-center">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Mengapa Memilih BUKOO?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Dibangun untuk memberikan pengalaman membaca terbaik bagi pembaca Indonesia.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Akses Tanpa Batas</h3>
              <p className="text-muted-foreground text-balance">
                Baca semua buku di koleksi langganan kami tanpa batasan. Dari fiksi hingga buku pengembangan diri.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Baca Offline</h3>
              <p className="text-muted-foreground text-balance">
                Unduh buku favorit Anda dan baca di mana saja, kapan saja, bahkan saat tidak ada koneksi internet.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pembayaran Lokal</h3>
              <p className="text-muted-foreground text-balance">
                Dukung pembayaran yang sesuai di Indonesia. GoPay, OVO, QRIS, hingga Virtual Account perbankan lokal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 flex justify-center">
        <div className="container px-4 md:px-6">
          <div className="bg-primary rounded-3xl p-8 md:p-16 flex flex-col items-center text-center text-primary-foreground shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10 text-balance">
              Siap Memulai Petualangan Membaca?
            </h2>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-2xl mb-10 relative z-10 text-balance">
              Bergabung dengan ribuan pembaca lainnya. Coba gratis dengan mengklaim buku pertama Anda. Batal kapan saja.
            </p>
            <div className="relative z-10">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="rounded-full text-base h-14 px-10 font-bold hover:scale-105 transition-transform duration-300">
                  Buat Akun Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

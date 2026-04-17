import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <div className="flex flex-col justify-center flex-1 px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="w-full max-w-sm mx-auto lg:w-96">
          <div>
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                BUKOO
              </span>
            </Link>
          </div>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="relative flex-1 hidden w-0 lg:block">
        <div className="absolute inset-0 bg-primary h-full w-full object-cover flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 h-full w-full bg-black/20 dark:bg-black/60 z-10" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="z-20 text-center px-12 relative text-primary-foreground max-w-2xl">
              <Sparkles className="mx-auto h-16 w-16 mb-8 text-primary-foreground/80" />
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                Gerbang Menuju Ribuan Dunia Baru
              </h2>
              <p className="text-xl text-primary-foreground/80 text-balance">
                Temukan buku-buku terbaik dari penulis lokal maupun internasional. Baca di mana saja, kapan saja dengan BUKOO.
              </p>
          </div>
        </div>
      </div>
    </div>
  )
}

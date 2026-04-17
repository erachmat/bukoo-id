'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = (tier: string) => {
    setLoading(tier)
    // Mocking Xendit payment gateway flow
    setTimeout(() => {
      alert(`Mengarahkan ke Xendit Checkout untuk paket ${tier}... (Mock)`)
      setLoading(null)
    }, 1500)
  }

  return (
    <div className="container py-24 px-4 md:px-6">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Pilih Paket Membaca Anda</h1>
        <p className="text-xl text-muted-foreground">Mulai dengan gratis, tingkatkan saat Anda butuh akses lebih. Batalkan kapan saja tanpa syarat.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* FREE TIER */}
        <Card className="flex flex-col relative border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Dasar</CardTitle>
            <CardDescription>Untuk pembaca kasual</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              Gratis
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Akses ke buku domain publik</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Maksimal 3 buku per bulan</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Baca hanya saat online</li>
              <li className="flex items-center text-muted-foreground"><Check className="text-muted-foreground/30 mr-2 h-4 w-4" /> Tanpa akses buku Premium</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => handleSubscribe('Free')}>
              {loading === 'Free' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pilih Paket Dasar"}
            </Button>
          </CardFooter>
        </Card>

        {/* BASIC TIER */}
        <Card className="flex flex-col relative border-primary shadow-lg scale-105 z-10 bg-background">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-blue-600 rounded-t-xl" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">
            Paling Populer
          </div>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Reguler</CardTitle>
            <CardDescription>Untuk pembaca rutin</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              Rp 29.000
              <span className="ml-1 text-xl font-medium text-muted-foreground">/bln</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Akses ke semua buku reguler</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Baca sepuasnya tanpa batas</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Download untuk baca offline (5 buku)</li>
              <li className="flex items-center text-muted-foreground"><Check className="text-muted-foreground/30 mr-2 h-4 w-4" /> Tanpa akses buku Premium</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => handleSubscribe('Regular')}>
              {loading === 'Regular' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Langganan Sekarang"}
            </Button>
          </CardFooter>
        </Card>

        {/* PREMIUM TIER */}
        <Card className="flex flex-col relative border-border/50 shadow-sm bg-muted/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Premium</CardTitle>
            <CardDescription>Untuk kutu buku sejati</CardDescription>
            <div className="mt-4 flex items-baseline text-4xl font-extrabold">
              Rp 59.000
              <span className="ml-1 text-xl font-medium text-muted-foreground">/bln</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center font-semibold text-amber-600 dark:text-amber-500"><Check className="text-amber-500 mr-2 h-4 w-4" /> Bebas akses ke SEMUA buku Premium</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Baca sepuasnya tanpa batas</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Download untuk baca offline tanpa batas</li>
              <li className="flex items-center"><Check className="text-primary mr-2 h-4 w-4" /> Kualitas audio reader tertinggi</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full" onClick={() => handleSubscribe('Premium')}>
              {loading === 'Premium' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Langganan Premium"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

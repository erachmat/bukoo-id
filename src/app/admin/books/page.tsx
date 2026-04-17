import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
import { mockBooks } from '@/lib/data/mock-books'

export default function AdminBooksPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kelola Buku</h1>
        <p className="text-muted-foreground mt-2">
          Tambahkan buku baru atau kelola katalog yang sudah ada.
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Daftar Buku</TabsTrigger>
          <TabsTrigger value="upload">Upload Buku Baru</TabsTrigger>
        </TabsList>
        
        {/* TAB 1: BOOK LIST */}
        <TabsContent value="list" className="space-y-4">
          <div className="rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul & Penulis</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBooks.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <div className="font-medium text-primary">{book.title}</div>
                      <div className="text-xs text-muted-foreground">{book.author}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {book.genre[0]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {book.isPremium ? (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-[10px]">PREMIUM</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px]">GRATIS</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center text-xs font-medium text-muted-foreground">
                        <CheckCircle2 className="w-3 h-3 text-green-500 mr-1" />
                        Terbit
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        
        {/* TAB 2: UPLOAD */}
        <TabsContent value="upload">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6 bg-background border rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Judul Buku</Label>
                    <Input id="title" placeholder="Masukkan judul..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="author">Penulis</Label>
                    <Input id="author" placeholder="Nama penulis..." />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="desc">Deskripsi / Sinopsis</Label>
                  <textarea 
                    id="desc" 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Sinopsis singkat..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="genre">Kategori Utama</Label>
                    <select id="genre" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="fiksi">Fiksi</option>
                      <option value="non-fiksi">Non-Fiksi</option>
                      <option value="pengembangan_diri">Pengembangan Diri</option>
                      <option value="roman">Roman</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipe Akses</Label>
                    <select id="type" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option value="free">Gratis (Free Tier)</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Drag Drop File Zone */}
            <div className="space-y-6">
              <div className="bg-background border border-dashed border-muted-foreground/50 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm h-[200px] hover:bg-muted/50 transition-colors cursor-pointer">
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="text-sm font-medium mb-1">Upload File (EPUB/PDF)</p>
                <p className="text-xs text-muted-foreground">Maksimal ukuran 50MB</p>
              </div>

              <div className="bg-background border border-dashed border-muted-foreground/50 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm h-[200px] hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="w-16 h-24 bg-muted rounded border flex items-center justify-center mb-4">
                  <span className="text-xs text-muted-foreground">Cover</span>
                </div>
                <p className="text-sm font-medium mb-1">Upload Cover</p>
                <p className="text-xs text-muted-foreground">Rasio 2:3 (JPG/PNG)</p>
              </div>

              <Button className="w-full h-12" size="lg">Simpan & Terbitkan</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

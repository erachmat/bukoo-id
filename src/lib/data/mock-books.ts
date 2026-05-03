export type MockBook = {
  id: string
  title: string
  author: string
  description: string
  coverUrl: string
  genre: string[]
  language: string
  year: number
  pageCount: number
  readCount: number
  isPremium: boolean
}

export const mockBooks: MockBook[] = [
  {
    id: "book-1",
    title: "Sitti Nurbaya",
    author: "Marah Roesli",
    description: "Kisah cinta tragis antara Sitti Nurbaya dan Samsulbahri, sebuah roman klasik dari zaman Balai Pustaka yang menyoroti pergesekan adat dan kebebasan.",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600&auto=format&fit=crop",
    genre: ["Roman", "Klasik", "Fiksi Sejarah"],
    language: "ID",
    year: 1922,
    pageCount: 312,
    readCount: 15400,
    isPremium: false,
  },
  {
    id: "book-2",
    title: "Salah Asuhan",
    author: "Abdoel Moeis",
    description: "Kisah Hanafi yang mengalami krisis identitas akibat pendidikan dan pengaruh budaya Barat yang berbenturan dengan adat Minangkabau.",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600&auto=format&fit=crop",
    genre: ["Roman", "Klasik", "Drama"],
    language: "ID",
    year: 1928,
    pageCount: 280,
    readCount: 12100,
    isPremium: false,
  },
  {
    id: "book-3",
    title: "Atomic Habits (Mock)",
    author: "James Clear",
    description: "Perubahan Kecil yang Memberikan Hasil Luar Biasa. Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk.",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    genre: ["Pengembangan Diri", "Psikologi", "Non-Fiksi"],
    language: "ID",
    year: 2018,
    pageCount: 320,
    readCount: 89000,
    isPremium: true,
  },
  {
    id: "book-4",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A classic novel of manners, following the character development of Elizabeth Bennet, the dynamic protagonist of the book who learns about the repercussions of hasty judgments.",
    coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    genre: ["Classic", "Romance"],
    language: "EN",
    year: 1813,
    pageCount: 432,
    readCount: 45000,
    isPremium: false,
  },
  {
    id: "book-5",
    title: "Filosofi Teras",
    author: "Henry Manampiring",
    description: "Filsafat Yunani-Romawi kuno untuk mental tangguh masa kini. Buku pengenalan Stoikisme untuk masyarakat Indonesia yang rentan dengan stres.",
    coverUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600&auto=format&fit=crop",
    genre: ["Filsafat", "Pengembangan Diri", "Non-Fiksi"],
    language: "ID",
    year: 2018,
    pageCount: 344,
    readCount: 56000,
    isPremium: true,
  },
  {
    id: "book-6",
    title: "Laut Bercerita",
    author: "Leila S. Chudori",
    description: "Kisah keluarga yang kehilangan, sekumpulan sahabat yang merasakan kekosongan di dada, sekelompok orang yang gemar menyiksa dan lancar berkhianat.",
    coverUrl: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=600&auto=format&fit=crop",
    genre: ["Fiksi Sejarah", "Drama", "Sastra"],
    language: "ID",
    year: 2017,
    pageCount: 394,
    readCount: 72000,
    isPremium: true,
  }
]

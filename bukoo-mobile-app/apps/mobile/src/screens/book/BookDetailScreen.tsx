import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../../services/api';
import { useBookDownload } from '../../hooks/useBookDownload';
import { RootStackParamList, ReadingStackParamList } from '../../navigation/types';

type DetailRouteProp = RouteProp<ReadingStackParamList, 'BookDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MASTER_SAMPLE_BOOKS: Record<string, any> = {
  book_laskar_pelangi: {
    id: 'book_laskar_pelangi',
    title: 'Laskar Pelangi',
    author: 'Andrea Hirata',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 1200,
    genre: ['Fiksi', 'Drama', 'Edukasi'],
    totalPages: 529,
    language: 'id',
    publishedYear: 2005,
    synopsis: 'Kisah inspiratif tentang sepuluh anak dari keluarga miskin di Pulau Belitong yang berjuang mendapatkan pendidikan layak bersama dua guru hebat.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  book_bumi_manusia: {
    id: 'book_bumi_manusia',
    title: 'Bumi Manusia',
    author: 'Pramoedya Ananta Toer',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    ratingAverage: 4.9,
    ratingCount: 3500,
    genre: ['Fiksi', 'Sejarah', 'Klasik'],
    totalPages: 535,
    language: 'id',
    publishedYear: 1980,
    synopsis: 'Kisah cinta Minke dan Annelies dengan latar belakang kolonial Belanda di Indonesia, menyuguhkan perjuangan melawan feodalisme dan ketidakadilan.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  book_cantik_itu_luka: {
    id: 'book_cantik_itu_luka',
    title: 'Cantik Itu Luka',
    author: 'Eka Kurniawan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    ratingAverage: 4.7,
    ratingCount: 1800,
    genre: ['Fiksi', 'Realisme Magis', 'Klasik'],
    totalPages: 508,
    language: 'id',
    publishedYear: 2002,
    synopsis: 'Kisah epik yang memadukan realisme magis, sejarah, asmara, dan tragedi tentang kehidupan Dewi Ayu dan anak-anak perempuannya yang rupawan.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  book_laut_bercerita: {
    id: 'book_laut_bercerita',
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 2200,
    genre: ['Fiksi', 'Sejarah', 'Politik'],
    totalPages: 379,
    language: 'id',
    publishedYear: 2017,
    synopsis: 'Novel mengharukan yang menelusuri kisah hilangnya para aktivis tahun 1998 dari sudut pandang Biru Laut dan adiknya Asmara Jati.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  book_saman: {
    id: 'book_saman',
    title: 'Saman',
    author: 'Ayu Utami',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    ratingAverage: 4.5,
    ratingCount: 850,
    genre: ['Fiksi', 'Modern', 'Sosial'],
    totalPages: 150,
    language: 'id',
    publishedYear: 1998,
    synopsis: 'Sebuah novel eksperimental yang mengangkat tema seksualitas, represi politik, dan pergulatan iman pada akhir masa Orde Baru.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'art-of-war': {
    id: 'art-of-war',
    title: 'The Art of War',
    author: 'Sun Tzu',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    ratingAverage: 4.6,
    ratingCount: 5000,
    genre: ['Non-fiksi', 'Sejarah', 'Filsafat'],
    totalPages: 273,
    language: 'en',
    publishedYear: 2000,
    synopsis: 'Sebuah risalah militer kuno dari Tiongkok yang menawarkan wawasan mendalam tentang strategi, taktik, dan penyelesaian konflik.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'pride-prejudice': {
    id: 'pride-prejudice',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    ratingAverage: 4.7,
    ratingCount: 9500,
    genre: ['Fiksi', 'Romansa', 'Klasik'],
    totalPages: 432,
    language: 'en',
    publishedYear: 1813,
    synopsis: 'Sebuah kisah romansa klasik tentang hubungan antara Elizabeth Bennet yang cerdas dan Fitzwilliam Darcy yang sombong.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'great-gatsby': {
    id: 'great-gatsby',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    ratingAverage: 4.4,
    ratingCount: 8200,
    genre: ['Fiksi', 'Klasik'],
    totalPages: 180,
    language: 'en',
    publishedYear: 1925,
    synopsis: 'Mengisahkan kegemerlapan dan kemerosotan moral era jazz Amerika melalui kisah cinta Jay Gatsby yang obsesif terhadap Daisy Buchanan.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'tale-two-cities': {
    id: 'tale-two-cities',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    ratingAverage: 4.5,
    ratingCount: 4200,
    genre: ['Fiksi', 'Sejarah', 'Klasik'],
    totalPages: 489,
    language: 'en',
    publishedYear: 1859,
    synopsis: 'Mengambil latar belakang di London dan Paris sebelum dan selama Revolusi Prancis, menggambarkan perjuangan dan pengorbanan rakyat kecil.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  sapiens: {
    id: 'sapiens',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 15000,
    genre: ['Non-fiksi', 'Sains', 'Sejarah'],
    totalPages: 512,
    language: 'en',
    publishedYear: 2011,
    synopsis: 'Sebuah penelusuran sejarah umat manusia dari munculnya Homo sapiens di Afrika Timur hingga era teknologi modern.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'atomic-habits': {
    id: 'atomic-habits',
    title: 'Atomic Habits',
    author: 'James Clear',
    coverUrl: 'https://covers.openlibrary.org/b/id/12812239-L.jpg',
    ratingAverage: 4.9,
    ratingCount: 22000,
    genre: ['Non-fiksi', 'Pengembangan Diri'],
    totalPages: 320,
    language: 'en',
    publishedYear: 2018,
    synopsis: 'Cara mudah dan terbukti untuk membangun kebiasaan baik dan menghilangkan kebiasaan buruk dengan memanfaatkan perubahan kecil.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'one-piece': {
    id: 'one-piece',
    title: 'One Piece, Vol. 1',
    author: 'Eiichiro Oda',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    ratingAverage: 4.9,
    ratingCount: 30000,
    genre: ['Komik', 'Petualangan'],
    totalPages: 208,
    language: 'id',
    publishedYear: 1997,
    synopsis: 'Awal petualangan Monkey D. Luffy yang bermimpi menjadi Raja Bajak Laut setelah memakan buah iblis Gomu Gomu.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  naruto: {
    id: 'naruto',
    title: 'Naruto, Vol. 1',
    author: 'Masashi Kishimoto',
    coverUrl: 'https://covers.openlibrary.org/b/id/8431872-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 25000,
    genre: ['Komik', 'Aksi', 'Petualangan'],
    totalPages: 192,
    language: 'id',
    publishedYear: 1999,
    synopsis: 'Kisah ninja yatim piatu, Naruto Uzumaki, yang bermimpi diakui oleh penduduk desa dengan menjadi Hokage.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  doraemon: {
    id: 'doraemon',
    title: 'Doraemon, Vol. 1',
    author: 'Fujiko F. Fujio',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    ratingAverage: 4.9,
    ratingCount: 15000,
    genre: ['Komik', 'Sains', 'Anak-anak'],
    totalPages: 190,
    language: 'id',
    publishedYear: 1970,
    synopsis: 'Petualangan robot kucing dari abad ke-22 bernama Doraemon yang dikirim untuk menolong bocah pemalas bernama Nobita.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'audio-hobbit': {
    id: 'audio-hobbit',
    title: 'The Hobbit (Audio)',
    author: 'J.R.R. Tolkien',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 6500,
    genre: ['Audiobook', 'Fiksi', 'Fantasi'],
    totalPages: 310,
    language: 'en',
    publishedYear: 1937,
    synopsis: 'Petualangan seru Bilbo Baggins yang direkrut oleh penyihir Gandalf untuk merebut kembali harta karun dari naga Smaug.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'audio-sherlock': {
    id: 'audio-sherlock',
    title: 'Sherlock Holmes',
    author: 'Arthur Conan Doyle',
    coverUrl: 'https://covers.openlibrary.org/b/id/12781440-L.jpg',
    ratingAverage: 4.7,
    ratingCount: 4300,
    genre: ['Audiobook', 'Misteri'],
    totalPages: 350,
    language: 'en',
    publishedYear: 1892,
    synopsis: 'Kumpulan kasus detektif jenius Sherlock Holmes dan asistennya Dr. Watson dalam memecahkan misteri di kota London.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'kancil-buaya': {
    id: 'kancil-buaya',
    title: 'Kancil dan Buaya',
    author: 'Dongeng Rakyat',
    coverUrl: 'https://covers.openlibrary.org/b/id/12093551-L.jpg',
    ratingAverage: 4.5,
    ratingCount: 2000,
    genre: ['Anak-anak', 'Dongeng'],
    totalPages: 32,
    language: 'id',
    publishedYear: 2010,
    synopsis: 'Kisah kecerdikan Kancil saat menyeberangi sungai dengan mengelabui kawanan buaya lapar.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'malin-kundang': {
    id: 'malin-kundang',
    title: 'Malin Kundang',
    author: 'Cerita Rakyat',
    coverUrl: 'https://covers.openlibrary.org/b/id/11100378-L.jpg',
    ratingAverage: 4.6,
    ratingCount: 1500,
    genre: ['Anak-anak', 'Cerita Rakyat'],
    totalPages: 40,
    language: 'id',
    publishedYear: 2012,
    synopsis: 'Legenda Malin Kundang, seorang anak yang durhaka kepada ibunya setelah sukses merantau dan dikutuk menjadi batu.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  'brief-history': {
    id: 'brief-history',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
    ratingAverage: 4.8,
    ratingCount: 8900,
    genre: ['Sains', 'Non-fiksi', 'Fisika'],
    totalPages: 256,
    language: 'en',
    publishedYear: 1988,
    synopsis: 'Buku ilmiah populer yang memaparkan kosmologi, ruang dan waktu, teori relativitas, serta lubang hitam secara sederhana.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  },
  cosmos: {
    id: 'cosmos',
    title: 'Cosmos',
    author: 'Carl Sagan',
    coverUrl: 'https://covers.openlibrary.org/b/id/12528734-L.jpg',
    ratingAverage: 4.9,
    ratingCount: 11000,
    genre: ['Sains', 'Non-fiksi'],
    totalPages: 384,
    language: 'en',
    publishedYear: 1980,
    synopsis: 'Eksplorasi memukau tentang alam semesta, sejarah perkembangan ilmu pengetahuan, dan tempat manusia di kosmos.',
    epubUrl: 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub',
  }
};

export default function BookDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { bookId } = route.params;

  const { download, remove, isDownloading, downloadProgress, localUri, isDownloaded } = useBookDownload(bookId);

  const [isExpanded, setIsExpanded] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      try {
        const response = await api.get(`/books/${bookId}`);
        return response.data;
      } catch (e) {
        return null;
      }
    },
    retry: false,
  });

  const { data: readingProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['reading', bookId],
    queryFn: async () => {
      try {
        const response = await api.get(`/reading/${bookId}/progress`);
        return response.data;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && (err as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
  });

  const displayBook = book || MASTER_SAMPLE_BOOKS[bookId] || MASTER_SAMPLE_BOOKS['book_bumi_manusia'];

  if (isLoading || isLoadingProgress) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#1B3A2D" style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (!displayBook) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Book not found.</Text>
      </SafeAreaView>
    );
  }

  const hasProgress = !!readingProgress;
  const buttonText = hasProgress ? 'Lanjutkan Membaca' : 'Mulai Membaca';

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [1.2, 1, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.coverContainer}>
          <Animated.Image 
            source={{ uri: displayBook.coverUrl }} 
            style={[styles.coverImage, { transform: [{ scale: imageScale }] }]} 
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>{displayBook.title}</Text>
          <Text style={styles.author}>{displayBook.author}</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.ratingScore}>{displayBook.ratingAverage?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.ratingCount}>({displayBook.ratingCount || 0} ulasan)</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {displayBook.genre?.map((g: string) => (
              <View key={g} style={styles.tag}>
                <Text style={styles.tagText}>{g}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Halaman</Text>
              <Text style={styles.metadataValue}>{displayBook.totalPages}</Text>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Bahasa</Text>
              <Text style={styles.metadataValue}>{displayBook.language?.toUpperCase()}</Text>
            </View>
            <View style={styles.metadataDivider} />
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Rilis</Text>
              <Text style={styles.metadataValue}>{displayBook.publishedYear}</Text>
            </View>
          </View>

          <View style={styles.actionsContainer}>
            {!isDownloaded ? (
              <TouchableOpacity 
                style={[styles.primaryButton, isDownloading && styles.primaryButtonDisabled]}
                onPress={() => download(displayBook.epubUrl || 'https://github.com/IDPF/epub3-samples/releases/download/20230704/georgia-cfi.epub')}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <View style={styles.downloadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={styles.downloadSpinner} />
                    <Text style={styles.primaryButtonText}>Unduh ({Math.round(downloadProgress)}%)</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Unduh Buku</Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('ReadingStack', { screen: 'Reading', params: { bookId: displayBook.id, localEpubUri: localUri! } })}
              >
                <Text style={styles.primaryButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            )}

            {isDownloaded ? (
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor: '#E53E3E' }]}
                onPress={() => remove()}
              >
                <Text style={[styles.secondaryButtonText, { color: '#E53E3E' }]}>Hapus Buku</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Tambah ke Rak</Text>
              </TouchableOpacity>
            )}
          </View>

          {isDownloading && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` }]} />
            </View>
          )}

          <View style={styles.synopsisContainer}>
            <Text style={styles.sectionTitle}>Sinopsis</Text>
            <Text 
              style={styles.synopsisText} 
              numberOfLines={isExpanded ? undefined : 4}
            >
              {displayBook.synopsis}
            </Text>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
              <Text style={styles.readMoreText}>
                {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F1E8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#1B3A2D',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  coverContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#EAE5D9', // slightly darker cream for cover background
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 8,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1B3A2D',
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: '#9A978E',
    textAlign: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 4,
  },
  ratingScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A2D',
    marginRight: 6,
  },
  ratingCount: {
    fontSize: 14,
    color: '#9A978E',
  },
  tagsScroll: {
    marginBottom: 24,
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: 'rgba(27, 58, 45, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  tagText: {
    color: '#1B3A2D',
    fontWeight: '600',
    fontSize: 13,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4CEB8',
    marginBottom: 24,
  },
  metadataItem: {
    alignItems: 'center',
  },
  metadataDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#D4CEB8',
  },
  metadataLabel: {
    fontSize: 12,
    color: '#9A978E',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metadataValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B3A2D',
  },
  actionsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#C8541F',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9A978E',
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadSpinner: {
    marginRight: 8,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#EAE5D9',
    borderRadius: 2,
    marginTop: -20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C8541F',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4CEB8',
  },
  secondaryButtonText: {
    color: '#1B3A2D',
    fontSize: 14,
    fontWeight: '600',
  },
  synopsisContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B3A2D',
    marginBottom: 12,
  },
  synopsisText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4A4A4A',
  },
  readMoreText: {
    marginTop: 8,
    color: '#C8541F',
    fontWeight: '600',
    fontSize: 14,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 36,
    color: '#1B3A2D',
    marginLeft: -2,
  },
});

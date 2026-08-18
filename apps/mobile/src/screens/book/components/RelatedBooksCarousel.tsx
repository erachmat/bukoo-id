import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { RootStackParamList } from '../../../navigation/types';
import { MASTER_SAMPLE_BOOKS } from '../BookDetailScreen';

interface RelatedBooksCarouselProps {
  currentBookId: string;
}

export function RelatedBooksCarousel({ currentBookId }: RelatedBooksCarouselProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const relatedList = Object.values(MASTER_SAMPLE_BOOKS)
    .filter((b) => b.id !== currentBookId)
    .slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Rekomendasi Serupa</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        data={relatedList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.push('ReadingStack', {
                screen: 'BookDetail',
                params: { bookId: item.id },
              } as never)
            }
          >
            <Image source={{ uri: item.coverUrl }} style={styles.coverImage} />
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.author}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.forest,
    marginBottom: 14,
  },
  listContent: {
    gap: 12,
  },
  bookCard: {
    width: 120,
  },
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.sansMedium,
    color: COLORS.forest,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
});

import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';

interface BookCoverCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
  };
  onPress: () => void;
  size?: 'small' | 'large';
  dark?: boolean;
}

export default function BookCoverCard({ book, onPress, size = 'small', dark = false }: BookCoverCardProps) {
  const isLarge = size === 'large';
  
  return (
    <TouchableOpacity 
      style={[styles.container, isLarge ? styles.containerLarge : styles.containerSmall]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, isLarge ? styles.imageContainerLarge : styles.imageContainerSmall]}>
        <Image 
          source={{ uri: book.coverUrl }} 
          style={styles.image} 
          resizeMode="cover"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, dark && styles.titleDark]} numberOfLines={2}>{book.title}</Text>
        <Text style={[styles.author, dark && styles.authorDark]} numberOfLines={1}>{book.author}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  containerSmall: {
    width: 120,
  },
  containerLarge: {
    width: 160,
  },
  imageContainer: {
    borderRadius: 8,
    backgroundColor: '#D4CEB8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  imageContainerSmall: {
    width: 120,
    height: 180,
  },
  imageContainerLarge: {
    width: 160,
    height: 240,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  textContainer: {
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B3A2D',
    marginBottom: 4,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  author: {
    fontSize: 12,
    color: '#9A978E',
  },
  authorDark: {
    color: '#8E8E93',
  },
});

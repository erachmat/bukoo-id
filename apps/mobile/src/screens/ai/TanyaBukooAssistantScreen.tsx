import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { Ionicons } from '@expo/vector-icons';
import { AiChatSection } from './components/AiChatSection';
import { AiSummaryModal } from './components/AiSummaryModal';
import { useUserLibrary } from '../../hooks/api/useLibraryApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TanyaBukooAssistantScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [summaryModalVisible, setSummaryModalVisible] = useState(false);
  const { data: libraryProgress } = useUserLibrary();

  // Real active reading progress (same source as the AI Companion insight card).
  const realActive = libraryProgress && libraryProgress.length > 0 ? libraryProgress[0] : null;
  const activeBook = realActive
    ? {
        id: realActive.bookId,
        title: realActive.bookTitle ?? 'Buku',
      }
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.gold} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Tanya Bukoo Assistant</Text>
        </View>
      </View>

      <View style={styles.chatContainer}>
        <AiChatSection
          currentBookTitle={activeBook?.title ?? 'bukumu'}
          onOpenSummaryModal={() => setSummaryModalVisible(true)}
          isFullScreen
        />
      </View>

      <AiSummaryModal
        visible={summaryModalVisible}
        onClose={() => setSummaryModalVisible(false)}
        bookId={activeBook?.id ?? ''}
        bookTitle={activeBook?.title ?? ''}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backButton: {
    padding: 6,
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

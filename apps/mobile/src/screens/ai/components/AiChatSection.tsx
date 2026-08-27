import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { aiCompanionService, ChatMessage, AiChatHistoryTurn } from '../../../services/aiCompanionService';

interface AiChatSectionProps {
  currentBookTitle?: string;
  onOpenSummaryModal?: () => void;
  isFullScreen?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Halo! Saya BUKOO AI Assistant. Ada yang ingin kamu tanyakan atau rangkum dari buku yang sedang kamu baca?',
    timestamp: 'Baru saja',
  },
];

const QUICK_PROMPTS = [
  { id: 'prompt-summary', label: '💡 Rangkum Buku Ini', query: 'Rangkum buku ini secara singkat dan jelas' },
  { id: 'prompt-chars', label: '❓ Siapa Karakter Utama?', query: 'Siapa karakter utama dan bagaimana watak mereka?' },
  { id: 'prompt-rec', label: '🎯 Rekomendasi Similar', query: 'Berikan rekomendasi buku serupa yang cocok untukku' },
  { id: 'prompt-time', label: '⏱️ Estimasi Selesai', query: 'Berapa estimasi waktu membaca hingga tamat?' },
];

export function AiChatSection({ currentBookTitle = 'bukumu', onOpenSummaryModal, isFullScreen = false }: AiChatSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    // Build recent conversation history (exclude the static welcome message).
    const history: AiChatHistoryTurn[] = messages
      .filter((m) => m.id !== 'msg-1')
      .slice(-10)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const reply = await aiCompanionService.askAiAssistant(textToSend, currentBookTitle, history);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error('[AiChatSection] Failed to get AI reply:', e);
    } finally {
      setIsLoading(false);
      // Auto scroll to bottom
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <View style={[styles.container, isFullScreen && styles.containerFull]}>
      {/* Quick Prompt Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promptScroll}>
        {QUICK_PROMPTS.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.promptChip}
            onPress={() => {
              if (p.id === 'prompt-summary' && onOpenSummaryModal) {
                onOpenSummaryModal();
              } else {
                handleSend(p.query);
              }
            }}
          >
            <Text style={styles.promptChipText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Message List */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.chatScroll, isFullScreen ? styles.chatScrollFull : styles.chatScrollCard]}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View key={msg.id} style={[styles.bubbleRow, isUser ? styles.userRow : styles.aiRow]}>
              {!isUser && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color={COLORS.gold} />
                </View>
              )}
              <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
                <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                  {msg.text}
                </Text>
                <Text style={[styles.timeText, isUser ? styles.userTime : styles.aiTime]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          );
        })}
        {isLoading && (
          <View style={styles.aiRow}>
            <View style={styles.aiAvatar}>
              <ActivityIndicator size="small" color={COLORS.gold} />
            </View>
            <View style={[styles.bubble, styles.aiBubble]}>
              <Text style={styles.aiText}>BUKOO AI sedang mengetik…</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={`Tanya AI tentang "${currentBookTitle}"...`}
          placeholderTextColor={COLORS.muted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => handleSend()} disabled={isLoading}>
          <Ionicons name="send" size={16} color="#0A1A15" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F2922',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#173E33',
    padding: 14,
    marginBottom: 20,
  },
  containerFull: {
    flex: 1,
    borderRadius: 0,
    borderWidth: 0,
    marginBottom: 0,
  },
  promptScroll: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  promptChip: {
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: COLORS.gold + '40',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  promptChipText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
  },
  chatScroll: {
    marginBottom: 12,
  },
  chatScrollCard: {
    maxHeight: 280,
    minHeight: 180,
  },
  chatScrollFull: {
    flex: 1,
    minHeight: 0,
  },
  chatContent: {
    paddingVertical: 4,
    gap: 10,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: COLORS.gold,
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONTS.sansRegular,
  },
  userText: {
    color: '#0A1A15',
    fontWeight: '600',
  },
  aiText: {
    color: COLORS.cream,
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  userTime: {
    color: 'rgba(10, 26, 21, 0.6)',
  },
  aiTime: {
    color: COLORS.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0A1A15',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  textInput: {
    flex: 1,
    color: COLORS.cream,
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

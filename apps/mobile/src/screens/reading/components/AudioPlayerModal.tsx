import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import {
  audioPlayerService,
  AudioPlayerState,
  PlaybackRate,
  SleepTimer,
} from '../../../services/audioPlayerService';

interface AudioPlayerModalProps {
  visible: boolean;
  onClose: () => void;
}

const PLAYBACK_RATES: PlaybackRate[] = [1.0, 1.25, 1.5, 2.0];
const SLEEP_TIMERS: { value: SleepTimer; label: string }[] = [
  { value: 0, label: 'Matikan' },
  { value: 15, label: '15 Menit' },
  { value: 30, label: '30 Menit' },
  { value: 45, label: '45 Menit' },
];

export function AudioPlayerModal({ visible, onClose }: AudioPlayerModalProps) {
  const [playerState, setPlayerState] = useState<AudioPlayerState>(audioPlayerService.getState());
  const [showSleepModal, setShowSleepModal] = useState(false);

  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribe(setPlayerState);
    return () => unsubscribe();
  }, []);

  if (!playerState.activeTrack) return null;

  const track = playerState.activeTrack;
  const progressPercent = Math.min(100, (playerState.currentSeconds / track.durationSeconds) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextSpeed = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playerState.playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    audioPlayerService.setPlaybackRate(PLAYBACK_RATES[nextIndex]);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="chevron-down" size={26} color={COLORS.creamLight} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Audio Companion</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSleepModal(true)}>
              <Ionicons
                name="moon"
                size={20}
                color={playerState.sleepTimerMinutes > 0 ? COLORS.gold : COLORS.creamLight}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Artwork Cover */}
            <View style={styles.artworkContainer}>
              <Image source={{ uri: track.coverUrl }} style={styles.coverImage} />
            </View>

            {/* Track Info */}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{track.chapterTitle}</Text>
              <Text style={styles.bookTitleAuthor}>
                {track.bookTitle} • {track.bookAuthor}
              </Text>
            </View>

            {/* Progress Bar & Scrubber */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(playerState.currentSeconds)}</Text>
                <Text style={styles.timeText}>{formatTime(track.durationSeconds)}</Text>
              </View>
            </View>

            {/* Transport Controls */}
            <View style={styles.controlsRow}>
              {/* Playback Speed */}
              <TouchableOpacity style={styles.speedButton} onPress={handleNextSpeed}>
                <Text style={styles.speedText}>{playerState.playbackRate}x</Text>
              </TouchableOpacity>

              {/* Skip 15s Back */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => audioPlayerService.skip15s('backward')}
              >
                <Ionicons name="refresh-outline" size={24} color={COLORS.cream} />
                <Text style={styles.skipLabel}>-15s</Text>
              </TouchableOpacity>

              {/* Play / Pause Big Button */}
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={() => audioPlayerService.togglePlay()}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={playerState.isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#0A1A15"
                  style={{ marginLeft: playerState.isPlaying ? 0 : 4 }}
                />
              </TouchableOpacity>

              {/* Skip 15s Forward */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => audioPlayerService.skip15s('forward')}
              >
                <Ionicons name="reload-outline" size={24} color={COLORS.cream} />
                <Text style={styles.skipLabel}>+15s</Text>
              </TouchableOpacity>

              {/* Stop & Close */}
              <TouchableOpacity style={styles.speedButton} onPress={() => audioPlayerService.stop()}>
                <Ionicons name="stop" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Sleep Timer Indicator */}
            {playerState.sleepTimerMinutes > 0 && (
              <View style={styles.sleepActiveBadge}>
                <Ionicons name="moon" size={14} color={COLORS.gold} />
                <Text style={styles.sleepActiveText}>
                  Sleep timer aktif: {playerState.sleepTimerMinutes} Menit
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Sleep Timer Selector Modal Overlay */}
          {showSleepModal && (
            <Pressable style={styles.sleepOverlay} onPress={() => setShowSleepModal(false)}>
              <View style={styles.sleepContent}>
                <Text style={styles.sleepTitle}>Pengatur Waktu Tidur (Sleep Timer)</Text>
                {SLEEP_TIMERS.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.sleepOption}
                    onPress={() => {
                      audioPlayerService.setSleepTimer(item.value);
                      setShowSleepModal(false);
                    }}
                  >
                    <Text style={styles.sleepOptionText}>{item.label}</Text>
                    {playerState.sleepTimerMinutes === item.value && (
                      <Ionicons name="checkmark" size={18} color={COLORS.gold} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0F2922',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 30,
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 6,
  },
  body: {
    paddingHorizontal: 24,
  },
  artworkContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  coverImage: {
    width: 180,
    height: 270,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    textAlign: 'center',
    marginBottom: 4,
  },
  bookTitleAuthor: {
    fontSize: 13,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#1E4D40',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  speedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  skipButton: {
    alignItems: 'center',
  },
  skipLabel: {
    fontSize: 10,
    color: COLORS.creamLight,
    marginTop: 2,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  sleepActiveText: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: FONTS.sansMedium,
  },
  sleepOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sleepContent: {
    width: '100%',
    backgroundColor: '#0A1A15',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  sleepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 16,
  },
  sleepOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  sleepOptionText: {
    fontSize: 14,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansRegular,
  },
});

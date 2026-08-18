import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioPlayerService, AudioPlayerState } from '../services/audioPlayerService';
import { AudioPlayerModal } from '../screens/reading/components/AudioPlayerModal';
import { COLORS } from '../constants/COLORS';
import { FONTS } from '../constants/FONTS';

export function MiniAudioPlayer() {
  const [playerState, setPlayerState] = useState<AudioPlayerState>(audioPlayerService.getState());
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = audioPlayerService.subscribe(setPlayerState);
    return () => unsubscribe();
  }, []);

  if (!playerState.activeTrack) return null;

  const track = playerState.activeTrack;
  const progressPercent = Math.min(100, (playerState.currentSeconds / track.durationSeconds) * 100);

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.topProgressBackground}>
          <View style={[styles.topProgressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.contentRow}>
          <Image source={{ uri: track.coverUrl }} style={styles.coverThumbnail} />

          <View style={styles.infoContainer}>
            <Text style={styles.chapterTitle} numberOfLines={1}>
              {track.chapterTitle}
            </Text>
            <Text style={styles.authorTitle} numberOfLines={1}>
              {track.bookTitle} • {track.bookAuthor}
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={(e) => {
                e.stopPropagation();
                audioPlayerService.skip15s('forward');
              }}
            >
              <Ionicons name="reload-outline" size={18} color={COLORS.cream} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={(e) => {
                e.stopPropagation();
                audioPlayerService.togglePlay();
              }}
            >
              <Ionicons
                name={playerState.isPlaying ? 'pause' : 'play'}
                size={18}
                color="#0A1A15"
                style={{ marginLeft: playerState.isPlaying ? 0 : 2 }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>

      <AudioPlayerModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F2922',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#173E33',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  topProgressBackground: {
    height: 3,
    backgroundColor: '#1E4D40',
  },
  topProgressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  coverThumbnail: {
    width: 34,
    height: 50,
    borderRadius: 4,
  },
  infoContainer: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  authorTitle: {
    fontSize: 11,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconButton: {
    padding: 6,
  },
  playPauseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

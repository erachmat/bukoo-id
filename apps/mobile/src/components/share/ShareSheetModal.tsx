import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/COLORS';
import { FONTS } from '../../constants/FONTS';
import { ShareCard, ShareCardData, SHARE_CARD_WIDTH } from './ShareCard';
import { captureCard, shareCardGeneric, shareCardToIGStory } from '../../services/shareService';

export interface ShareSheetOption {
  key: string;
  label: string;
  data: ShareCardData;
}

interface ShareSheetModalProps {
  visible: boolean;
  onClose: () => void;
  /** Card options; when >1 a segmented toggle is shown (e.g. Book vs Progress). */
  options: ShareSheetOption[];
  /** Attribution link attached to the Instagram Story sticker. */
  link: string;
  /** Message used by the generic share sheet. */
  message?: string;
}

const CARD_HEIGHT = (SHARE_CARD_WIDTH * 16) / 9;
const PREVIEW_WIDTH = 240;
const PREVIEW_HEIGHT = (PREVIEW_WIDTH * 16) / 9;
const PREVIEW_SCALE = PREVIEW_WIDTH / SHARE_CARD_WIDTH;

function getCoverOf(data: ShareCardData): string | undefined {
  return 'coverUrl' in data ? data.coverUrl : undefined;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  visible,
  onClose,
  options,
  link,
  message,
}) => {
  const captureTargetRef = useRef<View>(null);
  const coverReadyRef = useRef(false);
  const lastLoadedCoverRef = useRef<string | null>(null);
  const prevVisibleRef = useRef(false);

  const [selectedKey, setSelectedKey] = useState<string>(options[0]?.key ?? '');
  const [capturing, setCapturing] = useState(false);

  const activeOption = options.find((o) => o.key === selectedKey) ?? options[0];
  const coverUri = activeOption ? getCoverOf(activeOption.data) : undefined;

  const markReady = useCallback(() => {
    coverReadyRef.current = true;
  }, []);

  /** Ready immediately when the option has no cover, or its cover already loaded. */
  const resetReadyFor = useCallback(
    (option?: ShareSheetOption) => {
      if (!option) return;
      const cover = getCoverOf(option.data);
      if (cover && cover !== lastLoadedCoverRef.current) {
        coverReadyRef.current = false;
      } else {
        markReady();
      }
    },
    [markReady],
  );

  // Fresh open → reset selection + readiness.
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      const first = options[0];
      setSelectedKey(first?.key ?? '');
      resetReadyFor(first);
    }
    prevVisibleRef.current = visible;
  }, [visible, options, resetReadyFor]);

  const selectVariant = (key: string) => {
    const opt = options.find((o) => o.key === key);
    if (!opt) return;
    setSelectedKey(key);
    resetReadyFor(opt);
  };

  const handleCoverLoad = (uri: string) => () => {
    lastLoadedCoverRef.current = uri;
    markReady();
  };

  const waitForReady = () =>
    new Promise<void>((resolve) => {
      if (coverReadyRef.current) {
        resolve();
        return;
      }
      const started = Date.now();
      const iv = setInterval(() => {
        if (coverReadyRef.current || Date.now() - started > 4000) {
          clearInterval(iv);
          resolve();
        }
      }, 60);
    });

  const handleShare = async (platform: 'instagram' | 'generic') => {
    if (!activeOption || capturing) return;
    setCapturing(true);
    try {
      await waitForReady();
      const uri = await captureCard(captureTargetRef);
      const shareMessage = message ?? `Baca di BUKOO — ${activeOption.label}`;
      if (platform === 'instagram') {
        try {
          await shareCardToIGStory(uri, link);
          onClose();
        } catch {
          // Instagram not installed / intent failed → offer generic fallback.
          Alert.alert(
            'Instagram tidak terpasang',
            'Ingin membagikan kartu ini lewat aplikasi lain?',
            [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Bagikan',
                onPress: () => {
                  shareCardGeneric(uri, shareMessage)
                    .then(() => onClose())
                    .catch(() => undefined);
                },
              },
            ],
          );
        }
      } else {
        await shareCardGeneric(uri, shareMessage);
        onClose();
      }
    } catch {
      Alert.alert('Gagal membagikan', 'Terjadi kesalahan saat membuat kartu. Silakan coba lagi.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        {/* Full-size capture target — rendered off-screen so the capture is unscaled. */}
        {activeOption && (
          <View
            ref={captureTargetRef}
            collapsable={false}
            pointerEvents="none"
            style={styles.captureTarget}
          >
            <ShareCard
              data={activeOption.data}
              onCoverLoad={coverUri ? handleCoverLoad(coverUri) : undefined}
            />
          </View>
        )}

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Bagikan ke…</Text>

          {options.length > 1 && (
            <View style={styles.variantRow}>
              {options.map((o) => {
                const active = o.key === selectedKey;
                return (
                  <TouchableOpacity
                    key={o.key}
                    style={[styles.variantPill, active && styles.variantPillActive]}
                    onPress={() => selectVariant(o.key)}
                  >
                    <Text style={[styles.variantPillText, active && styles.variantPillTextActive]}>
                      {o.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeOption && (
            <View style={styles.previewWrap}>
              <View
                style={[
                  styles.previewCard,
                  {
                    left: -(SHARE_CARD_WIDTH - PREVIEW_WIDTH) / 2,
                    top: -(CARD_HEIGHT - PREVIEW_HEIGHT) / 2,
                    transform: [{ scale: PREVIEW_SCALE }],
                  },
                ]}
              >
                <ShareCard data={activeOption.data} />
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.igButton}
              onPress={() => handleShare('instagram')}
              disabled={capturing}
            >
              {capturing ? (
                <ActivityIndicator size="small" color="#0A1A15" />
              ) : (
                <>
                  <Ionicons name="logo-instagram" size={18} color="#0A1A15" />
                  <Text style={styles.igButtonText}>Instagram Story</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.genericButton}
              onPress={() => handleShare('generic')}
              disabled={capturing}
            >
              <Ionicons name="share-social-outline" size={18} color={COLORS.cream} />
              <Text style={styles.genericButtonText}>Bagikan lainnya…</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Batal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  captureTarget: {
    position: 'absolute',
    left: -10000,
    top: 0,
    width: SHARE_CARD_WIDTH,
  },
  sheet: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    backgroundColor: '#0E2820',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gold + '22',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.forestBorder,
    marginBottom: 14,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.cream,
    marginBottom: 12,
  },
  variantRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  variantPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#12332A',
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  variantPillActive: {
    backgroundColor: COLORS.goldPill,
    borderColor: COLORS.gold,
  },
  variantPillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.muted,
  },
  variantPillTextActive: {
    color: COLORS.gold,
  },
  previewWrap: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    overflow: 'hidden',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    backgroundColor: COLORS.forestDark,
    marginBottom: 16,
  },
  previewCard: {
    position: 'absolute',
    width: SHARE_CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  igButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.gold,
    paddingVertical: 12,
    borderRadius: 12,
  },
  igButtonText: {
    color: '#0A1A15',
    fontFamily: FONTS.sansBold,
    fontSize: 14,
  },
  genericButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#12332A',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  genericButtonText: {
    color: COLORS.cream,
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 6,
  },
  cancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.muted,
  },
});

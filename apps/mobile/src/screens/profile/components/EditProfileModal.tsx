import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/COLORS';
import { FONTS } from '../../../constants/FONTS';
import { useAuthStore } from '../../../stores/authStore';
import { AVATAR_PRESETS, userProfileService } from '../../../services/userProfileService';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_GENRES = [
  'Fiksi',
  'Agama',
  'Sejarah',
  'Sains',
  'Pengembangan Diri',
  'Biografi',
  'Komik',
  'Filsafat',
  'Audiobook',
  'Anak-anak',
];

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('preset_pembaca');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [useCustomUrlMode, setUseCustomUrlMode] = useState<boolean>(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Fiksi', 'Agama']);
  const [isSaving, setIsSaving] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      if (user?.avatarUrl?.startsWith('http://') || user?.avatarUrl?.startsWith('https://')) {
        setCustomAvatarUrl(user.avatarUrl);
        setUseCustomUrlMode(true);
      } else if (user?.avatarUrl) {
        setSelectedAvatarId(user.avatarUrl);
        setUseCustomUrlMode(false);
      }
      userProfileService.getFavoriteGenres().then(setSelectedGenres);
      setNameError('');
    }
  }, [visible, user]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Nama lengkap tidak boleh kosong');
      return;
    }
    if (trimmedName.length > 50) {
      setNameError('Nama terlalu panjang (maks. 50 karakter)');
      return;
    }

    setIsSaving(true);
    setNameError('');

    let finalAvatarUrl: string | null = null;
    if (useCustomUrlMode && customAvatarUrl.trim().length > 0) {
      finalAvatarUrl = customAvatarUrl.trim();
    } else {
      finalAvatarUrl = selectedAvatarId;
    }

    await userProfileService.updateProfile({
      name: trimmedName,
      avatarUrl: finalAvatarUrl,
      favoriteGenres: selectedGenres,
    });

    setIsSaving(false);
    onClose();
  };

  const selectedPresetObj = AVATAR_PRESETS.find((p) => p.id === selectedAvatarId) || AVATAR_PRESETS[0];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="create-outline" size={22} color={COLORS.gold} />
              <Text style={styles.title}>Edit Profil & Preferensi</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={COLORS.creamLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Avatar Preview */}
            <View style={styles.avatarPreviewSection}>
              {useCustomUrlMode && customAvatarUrl.trim().length > 0 ? (
                <Image source={{ uri: customAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarCircle, { backgroundColor: selectedPresetObj.bgColor }]}>
                  <Text style={styles.avatarEmoji}>{selectedPresetObj.emoji}</Text>
                </View>
              )}
              <Text style={styles.avatarLabel}>
                {useCustomUrlMode ? 'URL Foto Profil Kustom' : selectedPresetObj.name}
              </Text>

              <TouchableOpacity
                style={styles.toggleCustomButton}
                onPress={() => setUseCustomUrlMode(!useCustomUrlMode)}
              >
                <Ionicons name={useCustomUrlMode ? 'images-outline' : 'link-outline'} size={14} color={COLORS.gold} />
                <Text style={styles.toggleCustomText}>
                  {useCustomUrlMode ? 'Gunakan Ilustrasi Preset' : 'Gunakan URL Foto Kustom'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Avatar Selection Mode */}
            {!useCustomUrlMode ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pilih Ilustrasi Avatar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = selectedAvatarId === preset.id;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetCard,
                          { backgroundColor: preset.bgColor },
                          isSelected && styles.presetCardSelected,
                        ]}
                        onPress={() => setSelectedAvatarId(preset.id)}
                      >
                        <Text style={styles.presetEmoji}>{preset.emoji}</Text>
                        <Text style={styles.presetName} numberOfLines={1}>
                          {preset.name}
                        </Text>
                        {isSelected && (
                          <View style={styles.presetCheck}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.gold} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>URL Foto Profil (HTTPS)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://domain.com/avatar.jpg"
                  placeholderTextColor={COLORS.muted}
                  value={customAvatarUrl}
                  onChangeText={setCustomAvatarUrl}
                  autoCapitalize="none"
                />
              </View>
            )}

            {/* Display Name Input */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.sectionTitle}>Nama Lengkap</Text>
                <Text style={styles.charCounter}>{name.length}/50</Text>
              </View>
              <TextInput
                style={[styles.textInput, !!nameError && styles.textInputError]}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (nameError) setNameError('');
                }}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor={COLORS.muted}
                maxLength={50}
              />
              {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

            {/* Email Address Readout */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alamat Email</Text>
              <View style={styles.emailBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.muted} style={{ marginRight: 10 }} />
                <Text style={styles.emailText}>{user?.email || 'email@bukoo.id'}</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.verifiedText}>Terverifikasi</Text>
                </View>
              </View>
            </View>

            {/* Favorite Reading Genres Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori Bacaan Favorit</Text>
              <Text style={styles.sectionSubtitle}>
                Pilih kategori favoritmu untuk prioritas rekomendasi di Beranda:
              </Text>
              <View style={styles.genresRow}>
                {AVAILABLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <TouchableOpacity
                      key={genre}
                      style={[styles.genrePill, isSelected && styles.genrePillSelected]}
                      onPress={() => toggleGenre(genre)}
                    >
                      <Text style={[styles.genreText, isSelected && styles.genreTextSelected]}>
                        {isSelected ? `✓ ${genre}` : `+ ${genre}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSaving}>
              <Text style={styles.cancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#0A1A15" />
              ) : (
                <Text style={styles.saveText}>Simpan Perubahan</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0F2922',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#173E33',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#173E33',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatarPreviewSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 6,
  },
  toggleCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
  },
  toggleCustomText: {
    fontSize: 12,
    color: COLORS.gold,
    fontFamily: FONTS.sansMedium,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    fontFamily: FONTS.sansRegular,
    marginBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 11,
    color: COLORS.muted,
  },
  presetScroll: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  presetCard: {
    width: 80,
    height: 90,
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardSelected: {
    borderColor: COLORS.gold,
  },
  presetEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  presetName: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    textAlign: 'center',
  },
  presetCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  textInput: {
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.cream,
    fontSize: 15,
    fontFamily: FONTS.sansRegular,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  emailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emailText: {
    flex: 1,
    color: COLORS.creamLight,
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genrePill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#0A1A15',
    borderWidth: 1,
    borderColor: '#1E4D40',
  },
  genrePillSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  genreText: {
    fontSize: 12,
    color: COLORS.creamLight,
    fontFamily: FONTS.sansMedium,
  },
  genreTextSelected: {
    color: '#0A1A15',
    fontWeight: 'bold',
  },
  actionsFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#173E33',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E4D40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: COLORS.creamLight,
    fontSize: 14,
    fontFamily: FONTS.sansMedium,
  },
  saveButton: {
    flex: 2,
    backgroundColor: COLORS.gold,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#0A1A15',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
  },
});

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import { COLORS } from '../../constants/COLORS';
import axios from 'axios';

interface ResetPasswordScreenProps {
  route: {
    params?: {
      email?: string;
    };
  };
  navigation: {
    navigate: (screen: string) => void;
    reset: (state: { index: number; routes: { name: string }[] }) => void;
  };
}

export default function ResetPasswordScreen({ route, navigation }: ResetPasswordScreenProps) {
  const email = route.params?.email || '';
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isFocusedCode, setIsFocusedCode] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Custom Alert Modal State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('error');
  const [alertButtons, setAlertButtons] = useState<{ text: string; onPress: () => void; style?: 'default' | 'cancel' }[]>([]);

  const showAlert = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' = 'error',
    buttons?: { text: string; onPress: () => void; style?: 'default' | 'cancel' }[]
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertButtons(buttons || []);
    setAlertVisible(true);
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      showAlert('Error', 'Semua kolom wajib diisi.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Konfirmasi password tidak cocok.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        token: code,
        newPassword,
      });

      showAlert(
        'Berhasil',
        'Password Anda telah berhasil diubah. Silakan masuk kembali dengan password baru Anda.',
        'success',
        [
          {
            text: 'Masuk',
            onPress: () => {
              setCode('');
              setNewPassword('');
              setConfirmPassword('');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            },
          },
        ]
      );
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Kode verifikasi salah atau kadaluarsa.';
      showAlert('Gagal Reset Password', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Atur Ulang Password</Text>
          <Text style={styles.subtitle}>
            Masukkan kode verifikasi yang dikirim ke <Text style={styles.emailHighlight}>{email}</Text> beserta password baru Anda.
          </Text>
        </View>

        {/* Verification Code Input */}
        <TextInput
          style={[styles.input, isFocusedCode && styles.inputFocused]}
          placeholder="Kode Verifikasi (OTP)"
          placeholderTextColor="#8E8E93"
          keyboardType="number-pad"
          autoCapitalize="none"
          value={code}
          onChangeText={setCode}
          onFocus={() => setIsFocusedCode(true)}
          onBlur={() => setIsFocusedCode(false)}
        />

        {/* New Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.inputPassword, isFocusedPassword && styles.inputFocused]}
            placeholder="Password Baru"
            placeholderTextColor="#8E8E93"
            secureTextEntry={!isNewPasswordVisible}
            value={newPassword}
            onChangeText={setNewPassword}
            onFocus={() => setIsFocusedPassword(true)}
            onBlur={() => setIsFocusedPassword(false)}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}
          >
            <Ionicons
              name={isNewPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm New Password Input */}
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.inputPassword, isFocusedConfirm && styles.inputFocused]}
            placeholder="Konfirmasi Password Baru"
            placeholderTextColor="#8E8E93"
            secureTextEntry={!isConfirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onFocus={() => setIsFocusedConfirm(true)}
            onBlur={() => setIsFocusedConfirm(false)}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            <Ionicons
              name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Ubah Password</Text>
          )}
        </TouchableOpacity>

        {/* Back to Login Link */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>Batal dan Kembali ke Masuk</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Alert Modal */}
      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name={
                  alertType === 'success'
                    ? 'checkmark-circle-outline'
                    : alertType === 'error'
                    ? 'alert-circle-outline'
                    : 'information-circle-outline'
                }
                size={48}
                color={alertType === 'success' ? '#34C759' : alertType === 'error' ? '#FF3B30' : '#0A84FF'}
              />
            </View>
            <Text style={styles.modalTitle}>{alertTitle}</Text>
            <Text style={styles.modalMessage}>{alertMessage}</Text>

            <View style={styles.modalButtonsContainer}>
              {alertButtons.length > 0 ? (
                alertButtons.map((btn, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.modalButton,
                      btn.style === 'cancel' && styles.modalButtonCancel,
                      alertButtons.length > 1 && { flex: 1, marginHorizontal: 4 }
                    ]}
                    onPress={() => {
                      setAlertVisible(false);
                      btn.onPress();
                    }}
                  >
                    <Text style={[
                      styles.modalButtonText,
                      btn.style === 'cancel' && styles.modalButtonTextCancel
                    ]}>{btn.text}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setAlertVisible(false)}
                >
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.forestDark,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'center',
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.cream,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.forestBorder,
    backgroundColor: COLORS.forestCard,
    paddingHorizontal: 16,
    color: COLORS.creamLight,
    fontSize: 15,
    marginBottom: 16,
  },
  inputFocused: {
    borderColor: COLORS.gold,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 16,
  },
  inputPassword: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.forestBorder,
    backgroundColor: COLORS.forestCard,
    paddingLeft: 16,
    paddingRight: 50,
    color: COLORS.creamLight,
    fontSize: 15,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    height: 20,
    justifyContent: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.ember,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    shadowColor: COLORS.ember,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: COLORS.forestCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: COLORS.ember,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.forestBorder,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalButtonTextCancel: {
    color: COLORS.muted,
    fontWeight: '500',
  },
});

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import axios from 'axios';

interface ForgotPasswordScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
    goBack: () => void;
  };
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);

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

  const handleRequestCode = async () => {
    if (!email) {
      showAlert('Error', 'Silakan masukkan email Anda.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showAlert(
        'Kode Terkirim',
        'Kami telah mengirimkan kode verifikasi perubahan password ke email Anda.',
        'success',
        [
          {
            text: 'Masukkan Kode',
            onPress: () => navigation.navigate('ResetPassword', { email }),
          },
        ]
      );
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : 'Gagal mengirim kode verifikasi. Coba lagi.';
      showAlert('Gagal', message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Lupa Password</Text>
          <Text style={styles.subtitle}>
            Masukkan alamat email Anda untuk menerima kode verifikasi pengaturan ulang password.
          </Text>
        </View>

        {/* Email Input */}
        <TextInput
          style={[styles.input, isFocusedEmail && styles.inputFocused]}
          placeholder="Email Terdaftar"
          placeholderTextColor="#8E8E93"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setIsFocusedEmail(true)}
          onBlur={() => setIsFocusedEmail(false)}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRequestCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Kirim Kode Verifikasi</Text>
          )}
        </TouchableOpacity>

        {/* Back Link */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali ke Halaman Masuk</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: '#000000',
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 24,
  },
  inputFocused: {
    borderColor: '#C8541F',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#C8541F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#C8541F',
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
    color: '#C8541F',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
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
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#8E8E93',
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
    backgroundColor: '#C8541F',
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
    borderColor: '#2C2C2E',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalButtonTextCancel: {
    color: '#8E8E93',
    fontWeight: '500',
  },
});

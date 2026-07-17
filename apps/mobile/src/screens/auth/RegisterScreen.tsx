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
import { useRegister } from '../../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/COLORS';

import axios from 'axios';

interface RegisterScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToToS, setAgreeToToS] = useState(false);

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);
  const [isFocusedConfirm, setIsFocusedConfirm] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const registerMutation = useRegister();

  const handleRegister = () => {
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (!name) {
      setNameError('Nama lengkap wajib diisi.');
      hasError = true;
    }
    if (!email) {
      setEmailError('Email wajib diisi.');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Format email tidak valid.');
      hasError = true;
    }
    if (!password) {
      setPasswordError('Password wajib diisi.');
      hasError = true;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Konfirmasi password wajib diisi.');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Konfirmasi password tidak cocok.');
      hasError = true;
    }

    if (hasError) return;

    if (!agreeToToS) {
      showAlert(
        'Syarat & Ketentuan',
        'Anda harus menyetujui Syarat Layanan & Kebijakan Privasi BUKOO untuk mendaftar.',
        'info'
      );
      return;
    }

    registerMutation.mutate(
      { name, email, password, agreeToS: agreeToToS },
      {
        onSuccess: () => {
          showAlert(
            'Pendaftaran Berhasil',
            'Akun Anda telah berhasil dibuat. Silakan masuk.',
            'success',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Login');
                },
              },
            ]
          );
        },
        onError: (error: unknown) => {
          const message = axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Gagal mendaftarkan akun. Silakan coba lagi.';
          showAlert('Registrasi Gagal', message, 'error');
        },
      }
    );
  };

  const isLoading = registerMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Daftar Akun</Text>
          <Text style={styles.subtitle}>Buat akun baru untuk mulai membaca koleksi buku terbaik</Text>
        </View>

        {/* Name Input */}
        <TextInput
          style={[
            styles.input,
            isFocusedName && styles.inputFocused,
            !!nameError && styles.inputError,
            !!nameError && { marginBottom: 4 }
          ]}
          placeholder="Nama Lengkap"
          placeholderTextColor="#8E8E93"
          value={name}
          onChangeText={(txt) => {
            setName(txt);
            if (nameError) setNameError('');
          }}
          onFocus={() => setIsFocusedName(true)}
          onBlur={() => setIsFocusedName(false)}
        />
        {!!nameError && <Text style={styles.errorText}>{nameError}</Text>}

        {/* Email Input */}
        <TextInput
          style={[
            styles.input,
            isFocusedEmail && styles.inputFocused,
            !!emailError && styles.inputError,
            !!emailError && { marginBottom: 4 }
          ]}
          placeholder="Email"
          placeholderTextColor="#8E8E93"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(txt) => {
            setEmail(txt);
            if (emailError) setEmailError('');
          }}
          onFocus={() => setIsFocusedEmail(true)}
          onBlur={() => setIsFocusedEmail(false)}
        />
        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

        {/* Password Input */}
        <View style={[styles.passwordContainer, !!passwordError && { marginBottom: 4 }]}>
          <TextInput
            style={[
              styles.inputPassword,
              isFocusedPassword && styles.inputFocused,
              !!passwordError && styles.inputError
            ]}
            placeholder="Password"
            placeholderTextColor="#8E8E93"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              if (passwordError) setPasswordError('');
            }}
            onFocus={() => setIsFocusedPassword(true)}
            onBlur={() => setIsFocusedPassword(false)}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={22}
              color="#C8541F"
            />
          </TouchableOpacity>
        </View>
        {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}

        {/* Confirm Password Input */}
        <View style={[styles.passwordContainer, !!confirmPasswordError && { marginBottom: 4 }]}>
          <TextInput
            style={[
              styles.inputPassword,
              isFocusedConfirm && styles.inputFocused,
              !!confirmPasswordError && styles.inputError
            ]}
            placeholder="Konfirmasi Password"
            placeholderTextColor="#8E8E93"
            secureTextEntry={!isConfirmPasswordVisible}
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              if (confirmPasswordError) setConfirmPasswordError('');
            }}
            onFocus={() => setIsFocusedConfirm(true)}
            onBlur={() => setIsFocusedConfirm(false)}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            <Ionicons
              name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
              size={22}
              color="#C8541F"
            />
          </TouchableOpacity>
        </View>
        {!!confirmPasswordError && <Text style={styles.errorText}>{confirmPasswordError}</Text>}

        {/* ToS Checkbox */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setAgreeToToS(!agreeToToS)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreeToToS && styles.checkboxChecked]}>
            {agreeToToS && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Saya menyetujui Syarat Layanan & Kebijakan Privasi BUKOO
          </Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Daftar Sekarang</Text>
          )}
        </TouchableOpacity>

        {/* Login Navigation Link */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Masuk disini</Text>
          </TouchableOpacity>
        </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.cream,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingRight: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.forestBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: COLORS.forestCard,
  },
  checkboxChecked: {
    backgroundColor: COLORS.ember,
    borderColor: COLORS.ember,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 13,
    color: COLORS.muted,
    flexShrink: 1,
    lineHeight: 18,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.ember,
    justifyContent: 'center',
    alignItems: 'center',
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
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.muted,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gold,
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
    top: 0,
    height: 48,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
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

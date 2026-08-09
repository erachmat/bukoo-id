import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LogoBukoo } from '../../assets/logo/LogoBukoo';
import { useLogin, useSocialLogin } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/types';
import {
  REFRESH_TOKEN_KEY,
  ACCESS_TOKEN_KEY,
  BIOMETRIC_ENABLED_KEY,
  authApi,
} from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/COLORS';

// NOTE: Google Sign-In requires configuration files to be added manually:
// - iOS: iOS GoogleService-Info.plist
// - Android: Android google-services.json
// Make sure to add them to your native project build directories.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-oauth-client-id.apps.googleusercontent.com',
  offlineAccess: true,
});

interface LoginScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedPassword, setIsFocusedPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const loginMutation = useLogin();
  const socialLoginMutation = useSocialLogin();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      if (hasHardware && isEnrolled && isEnabled === 'true') {
        setBiometricsAvailable(true);
      }
    } catch {
      setBiometricsAvailable(false);
    }
  };

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    let hasError = false;

    if (!email) {
      setEmailError('Email tidak boleh kosong.');
      hasError = true;
    } else if (!email.includes('@')) {
      setEmailError('Format email tidak valid.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password tidak boleh kosong.');
      hasError = true;
    }

    if (hasError) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async () => {
          // Check if biometrics can be enabled
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && isEnrolled) {
            const isEnabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
            if (isEnabled !== 'true') {
              showAlert(
                'Aktifkan Biometrik',
                'Apakah Anda ingin mengaktifkan login biometrik untuk masuk berikutnya?',
                'info',
                [
                  { text: 'Tidak', onPress: () => {}, style: 'cancel' },
                  {
                    text: 'Ya',
                    onPress: async () => {
                      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
                      setBiometricsAvailable(true);
                    },
                  },
                ]
              );
            }
          }
        },
        onError: (error: unknown) => {
          const status = (error as { response?: { status?: number } })?.response?.status;
          if (status === 401 || status === 400) {
            showAlert('Gagal Masuk', 'Email atau password yang Anda masukkan salah. Silakan periksa kembali kredensial Anda.', 'error');
          } else {
            showAlert('Error', 'Terjadi kesalahan sistem. Silakan coba lagi.', 'error');
          }
        },
      }
    );
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Masuk BUKOO dengan Biometrik',
        fallbackLabel: 'Gunakan Password',
      });

      if (result.success) {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // Perform silent refresh session
          const data = await authApi.refresh(refreshToken);
          await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
          if (data.refreshToken) {
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
          }
          setUser(data.user);
        } else {
          showAlert('Gagal', 'Kredensial biometrik tidak valid atau kadaluarsa.', 'error');
        }
      }
    } catch {
      showAlert('Error', 'Gagal memproses autentikasi biometrik.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.type === 'success') {
        const token = userInfo.data.idToken;
        if (token) {
          socialLoginMutation.mutate({ provider: 'GOOGLE', token });
        } else {
          showAlert('Error', 'Gagal mendapatkan token Google.', 'error');
        }
      }
    } catch (error: unknown) {
      showAlert('Google Sign-In', error instanceof Error ? error.message : 'Proses masuk dengan Google dibatalkan.', 'info');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const token = credential.identityToken;
      if (token) {
        socialLoginMutation.mutate({ provider: 'APPLE', token });
      } else {
        showAlert('Error', 'Gagal mendapatkan token Apple.', 'error');
      }
    } catch (error: unknown) {
      showAlert('Apple Sign-In', error instanceof Error ? error.message : 'Proses masuk dengan Apple dibatalkan.', 'info');
    }
  };

  const isLoading = loginMutation.isPending || socialLoginMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {/* App Title */}
        <View style={styles.headerContainer}>
          <LogoBukoo size={42} />
          <Text style={styles.subtitle}>Selamat datang kembali di perpustakaan digitalmu</Text>
        </View>

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

        {/* Forgot Password Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Lupa password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Masuk</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Trigger */}
        {biometricsAvailable && (
          <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
            <Text style={styles.biometricButtonText}>Masuk dengan Biometrik 🔒</Text>
          </TouchableOpacity>
        )}

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In */}
        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignIn}>
          <Text style={styles.socialButtonText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        {/* Apple Sign In */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
            <Text style={styles.socialButtonText}>Masuk dengan Apple</Text>
          </TouchableOpacity>
        )}

        {/* Register Navigation */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Daftar disini</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: COLORS.forestDark,
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
    fontSize: 32,
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
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 12,
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
  inputFocused: {
    borderColor: COLORS.gold,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    height: 48,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 13,
    color: COLORS.gold,
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.ember,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  biometricButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.forestBorder,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.muted,
  },
  socialButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.forestBorder,
    backgroundColor: COLORS.forestCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.creamLight,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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

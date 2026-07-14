import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { useLogout } from '../../hooks/useAuth';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const menuItems = [
    { id: '1', title: 'Pengaturan Akun', icon: '⚙️' },
    { id: '2', title: 'Langganan', icon: '💳' },
    { id: '3', title: 'Preferensi Bacaan', icon: '📚' },
    { id: '4', title: 'Bantuan & Dukungan', icon: '❓' },
    { id: '5', title: 'Tentang BUKOO', icon: 'ℹ️' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.profileCard}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Pengguna BUKOO'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            
            {user?.subscriptionTier && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{user.subscriptionTier}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={item.id} style={[styles.menuItem, index !== menuItems.length - 1 && styles.menuDivider]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuText}>{item.title}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#FFFFFF',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#C8541F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 84, 31, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#C8541F',
  },
  menuContainer: {
    backgroundColor: '#1C1C1E',
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  chevron: {
    fontSize: 24,
    color: '#8E8E93',
  },
  logoutButton: {
    marginHorizontal: 20,
    backgroundColor: '#1C1C1E',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF453A',
  },
});

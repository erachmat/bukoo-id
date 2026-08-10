# Task 1 Brief: Add Custom Logout Modal to ProfileScreen.tsx

**Task Goal**: Replace standard `Alert.alert` dialog in `apps/mobile/src/screens/profile/ProfileScreen.tsx` with a custom Dark Forest styled modal card.

**Files to modify**:
- Modify: `apps/mobile/src/screens/profile/ProfileScreen.tsx`

**Specification**:
1. In `ProfileScreen.tsx`, add state `const [showLogoutModal, setShowLogoutModal] = useState(false);`.
2. Replace `Alert.alert` inside `handleLogout` with `setShowLogoutModal(true);`.
3. Add custom Logout `<Modal>` component:
```tsx
{/* Custom Logout Modal */}
<Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
  <View style={styles.modalOverlay}>
    <View style={styles.logoutModalCard}>
      <View style={styles.logoutIconBadge}>
        <Ionicons name="log-out-outline" size={32} color="#EF4444" />
      </View>

      <Text style={styles.logoutModalTitle}>Keluar dari BUKOO?</Text>
      <Text style={styles.logoutModalSubtitle}>
        Apakah Anda yakin ingin keluar dari akun Anda? Sesi membaca dan progress Anda tersimpan dengan aman.
      </Text>

      <View style={styles.logoutModalActions}>
        <TouchableOpacity style={styles.logoutCancelButton} onPress={() => setShowLogoutModal(false)}>
          <Text style={styles.logoutCancelText}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutConfirmButton}
          onPress={() => {
            setShowLogoutModal(false);
            logout();
          }}
        >
          <Text style={styles.logoutConfirmText}>Ya, Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```
4. Add styles to `StyleSheet.create`:
   - `logoutModalCard` (`backgroundColor: '#122B23'`, `borderRadius: 24`, `borderWidth: 1`, `borderColor: '#1D4437'`, `padding: 24`, `alignItems: 'center'`)
   - `logoutIconBadge` (`width: 64`, `height: 64`, `borderRadius: 32`, `backgroundColor: 'rgba(239, 68, 68, 0.15)'`, `justifyContent: 'center'`, `alignItems: 'center'`, `marginBottom: 16`)
   - `logoutModalTitle` (`fontSize: 22`, `fontFamily: FONTS.serifBold`, `color: COLORS.cream`, `marginBottom: 8`)
   - `logoutModalSubtitle` (`fontSize: 14`, `color: COLORS.muted`, `textAlign: 'center'`, `lineHeight: 20`, `marginBottom: 24`)
   - `logoutModalActions` (`flexDirection: 'row'`, `gap: 12`, `width: '100%'`)
   - `logoutCancelButton` (`flex: 1`, `height: 48`, `borderRadius: 24`, `borderWidth: 1`, `borderColor: '#1D4437'`, `backgroundColor: 'rgba(11, 25, 20, 0.5)'`)
   - `logoutCancelText` (`color: COLORS.creamLight`, `fontSize: 15`, `fontWeight: '600'`)
   - `logoutConfirmButton` (`flex: 1`, `height: 48`, `borderRadius: 24`, `backgroundColor: '#EF4444'`)
   - `logoutConfirmText` (`color: '#FFFFFF'`, `fontSize: 15`, `fontWeight: 'bold'`)

**Verification**:
Run `npm run typecheck --workspace=apps/mobile` and `npm run lint --workspace=apps/mobile`.

**Commit**:
Commit with `git commit -m "feat(mobile): redesign logout modal with custom dark forest dialog"`.

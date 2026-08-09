# Custom Logout Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace plain OS system alert dialog for logout in `ProfileScreen.tsx` with a custom Dark Forest styled modal card.

**Architecture:** Use state `showLogoutModal` in `ProfileScreen.tsx` and render custom overlay modal matching Bukoo theme tokens (`#122B23`, `#EF4444`, `COLORS.cream`).

**Tech Stack:** React Native, Expo, TypeScript, `Ionicons`.

## Global Constraints

- TypeScript strict mode — no `any` types.
- Follow verification workflow: `npm run typecheck --workspace=apps/mobile`, `npm run lint --workspace=apps/mobile`, `npm run test --workspace=apps/mobile`.

---

### Task 1: Add Custom Logout Modal to `ProfileScreen.tsx`

**Files:**
- Modify: [apps/mobile/src/screens/profile/ProfileScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/profile/ProfileScreen.tsx)

**Interfaces:**
- Consumes: `useLogout()` from `apps/mobile/src/hooks/useAuth.ts`
- Produces: Styled custom Logout Modal dialog in `ProfileScreen.tsx`

- [ ] **Step 1: Add state and update `handleLogout` in `ProfileScreen.tsx`**

```typescript
const [showLogoutModal, setShowLogoutModal] = useState(false);

const handleLogout = () => {
  setShowLogoutModal(true);
};
```

- [ ] **Step 2: Add Logout Modal JSX to `ProfileScreen.tsx`**

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

- [ ] **Step 3: Add styles to `StyleSheet.create` in `ProfileScreen.tsx`**

```typescript
  logoutModalCard: {
    width: '88%',
    backgroundColor: '#122B23',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1D4437',
    padding: 24,
    alignItems: 'center',
  },
  logoutIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: FONTS.serifBold,
    color: COLORS.cream,
    marginBottom: 8,
    textAlign: 'center',
  },
  logoutModalSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.sansRegular,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  logoutModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1D4437',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 25, 20, 0.5)',
  },
  logoutCancelText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.sansMedium,
    color: COLORS.creamLight,
  },
  logoutConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutConfirmText: {
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
```

- [ ] **Step 4: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/src/screens/profile/ProfileScreen.tsx
git commit -m "feat(mobile): redesign logout modal with custom dark forest dialog"
```

---

### Task 2: Final Workspaces Verification & Checklist Run

- [ ] **Step 1: Run typecheck**
Run: `npm run typecheck --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run lint**
Run: `npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Run test**
Run: `npm run test --workspace=apps/mobile`
Expected: Verified output ("No tests specified for mobile yet").

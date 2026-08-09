# Persistent Auth & Silent Auto-Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement resilient silent auto-login on startup and explicit token cleanup on logout for `@bukoo/mobile`.

**Architecture:** Enhances `useAuthHydration` in `useAuth.ts` to preserve cached user sessions during network errors while purging invalid 401/403 tokens, and wires `ProfileScreen.tsx` logout to `useLogout()`.

**Tech Stack:** React Native, Expo, `expo-secure-store`, `@react-native-async-storage/async-storage`, Zustand, `@tanstack/react-query`.

## Global Constraints

- TypeScript strict mode — no `any` types.
- Follow verification workflow: `npm run typecheck --workspace=apps/mobile`, `npm run lint --workspace=apps/mobile`, `npm run test --workspace=apps/mobile`.

---

### Task 1: Offline-Resilient `useAuthHydration`

**Files:**
- Modify: [apps/mobile/src/hooks/useAuth.ts](file:///home/erachmat/Projects/bukoo/apps/mobile/src/hooks/useAuth.ts)

**Interfaces:**
- Consumes: `SecureStore`, `authApi.refresh`, `useAuthStore`
- Produces: Resilient `useAuthHydration()` hook

- [ ] **Step 1: Update `useAuthHydration` implementation**

In `apps/mobile/src/hooks/useAuth.ts`:
```typescript
export function useAuthHydration() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          try {
            const data = await authApi.refresh(refreshToken);
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, data.accessToken);
            if (data.refreshToken) {
              await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken);
            }
            setUser(data.user);
          } catch (err: unknown) {
            const status = (err as { response?: { status?: number } })?.response?.status;
            if (status === 401 || status === 403) {
              // Token is invalid/revoked: purge local tokens & clear user
              await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
              await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
              clearUser();
            } else {
              // Network error or backend offline: preserve stored user profile if present
              if (user) {
                setUser(user);
              }
            }
          }
        } else {
          clearUser();
        }
      } catch {
        clearUser();
      } finally {
        setIsReady(true);
      }
    };

    hydrateAuth();
  }, [setUser, clearUser, user]);

  return isReady;
}
```

- [ ] **Step 2: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/hooks/useAuth.ts
git commit -m "feat(mobile): make useAuthHydration offline resilient"
```

---

### Task 2: Connect Logout Action in `ProfileScreen.tsx`

**Files:**
- Modify: [apps/mobile/src/screens/profile/ProfileScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/profile/ProfileScreen.tsx)

**Interfaces:**
- Consumes: `useLogout()` from `apps/mobile/src/hooks/useAuth.ts`
- Produces: Working logout button with confirm alert modal in `ProfileScreen.tsx`

- [ ] **Step 1: Import `useLogout` and wire logout button in `ProfileScreen.tsx`**

```typescript
import { useLogout } from '../../hooks/useAuth';

// Inside ProfileScreen component:
const logoutMutation = useLogout();

const handleLogout = () => {
  Alert.alert(
    'Keluar dari Bukoo',
    'Apakah Anda yakin ingin keluar dari akun Anda?',
    [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => logoutMutation.mutate(),
      },
    ]
  );
};
```

- [ ] **Step 2: Verify TypeScript & Lint**

Run: `npm run typecheck --workspace=apps/mobile && npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/screens/profile/ProfileScreen.tsx
git commit -m "feat(mobile): connect ProfileScreen logout to useLogout mutation"
```

---

### Task 3: Final Verification & Checklist Run

- [ ] **Step 1: Run typecheck**
Run: `npm run typecheck --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run lint**
Run: `npm run lint --workspace=apps/mobile`
Expected: PASS with 0 errors.

- [ ] **Step 3: Run test**
Run: `npm run test --workspace=apps/mobile`
Expected: Verified output ("No tests specified for mobile yet").

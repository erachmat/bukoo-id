# Task 1 Brief: Offline-Resilient useAuthHydration Hook

**Task Goal**: Update `useAuthHydration()` in `apps/mobile/src/hooks/useAuth.ts` so that invalid 401/403 refresh tokens purge stored tokens and return user to login, while network errors preserve cached user profile for offline EPUB reading.

**Files to modify**:
- Modify: `apps/mobile/src/hooks/useAuth.ts`

**Specification**:
Update `useAuthHydration()` in `apps/mobile/src/hooks/useAuth.ts`:
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

**Verification**:
Run `npm run typecheck --workspace=apps/mobile` and `npm run lint --workspace=apps/mobile`.

**Commit**:
Commit with `git commit -m "feat(mobile): make useAuthHydration offline resilient"`.

# Design Document: Persistent Auth & Silent Auto-Login System

**Date**: 2026-08-09  
**Status**: Approved by User  
**Target Workspace**: `@bukoo/mobile` (`apps/mobile`)

---

## 1. Executive Summary

This specification defines the persistent authentication and silent auto-login architecture for the Bukoo Mobile Application (`apps/mobile`). It ensures seamless multi-session authentication, secure JWT token management via `expo-secure-store`, offline-resilient app hydration, and clean token eviction on explicit user logout or token revocation.

---

## 2. Architecture & Token Lifecycle

```
                               ┌────────────────────────┐
                               │  App Startup Launch    │
                               └───────────┬────────────┘
                                           │
                                           ▼
                               ┌────────────────────────┐
                               │  useAuthHydration()    │
                               └───────────┬────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Checks expo-secure-store for        │
                        │ REFRESH_TOKEN_KEY                   │
                        └──────────────────┬──────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             [Token Found]                                 [No Token Found]
                    │                                             │
                    ▼                                             ▼
        Calls authApi.refresh()                            clearUser() -> AuthStack
                    │
       ┌────────────┴────────────┬────────────────────────┐
       │                         │                        │
       ▼ (200 OK)                ▼ (401/403 Invalid)      ▼ (Network Error / Offline)
Update SecureStore        Clear SecureStore tokens   Preserve AsyncStorage User profile
setUser(user)             clearUser() -> AuthStack   Keep isAuthenticated = true
MainTabs App Flow                                    Enable offline EPUB reading
```

---

## 3. Storage Hierarchy

| Key | Storage Engine | Purpose | Persistence Scope |
|---|---|---|---|
| `access_token` | `expo-secure-store` | Short-lived Bearer token for API authorization | App install lifetime / Until logout |
| `refresh_token` | `expo-secure-store` | Long-lived refresh token for obtaining new access tokens | App install lifetime / Until logout |
| `bukoo-auth-storage` | `AsyncStorage` | Rehydratable `UserPublicDto` user profile JSON | Persistent across sessions |

---

## 4. Key Functional Enhancements

### 4.1. Offline-Resilient App Hydration ([useAuth.ts](file:///home/erachmat/Projects/bukoo/apps/mobile/src/hooks/useAuth.ts))
- Modify `useAuthHydration()`:
  - If `authApi.refresh()` throws an HTTP 401 or 403 status (unauthorized/revoked refresh token), clear local tokens and set user to `null`.
  - If `authApi.refresh()` fails due to network disconnection or server unreachable (e.g. `!error.response`), check if `useAuthStore` already has a cached `user` object from `AsyncStorage`. If so, preserve the authenticated session so the user can read cached EPUB files offline.

### 4.2. Clean Logout Integration ([ProfileScreen.tsx](file:///home/erachmat/Projects/bukoo/apps/mobile/src/screens/profile/ProfileScreen.tsx))
- Connect the **Keluar** (Logout) button in `ProfileScreen` to `useLogout()`.
- Upon logout confirmation:
  1. Calls `authApi.logout()`.
  2. Deletes `access_token` and `refresh_token` from `expo-secure-store`.
  3. Resets `useAuthStore` (`clearUser()`).
  4. Automatically navigates back to `AuthStack` (`LoginScreen`).

---

## 5. Verification & Testing Strategy

1. **Type Checking**:
   - `npm run typecheck --workspace=apps/mobile`
2. **Linting**:
   - `npm run lint --workspace=apps/mobile`
3. **Execution & UI Validation**:
   - Verify app launch auto-login with stored tokens.
   - Verify token cleanup on explicit logout.

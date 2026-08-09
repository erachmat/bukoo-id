# Design Document: Custom Logout Modal Component Redesign

**Date**: 2026-08-09  
**Status**: Approved by User  
**Target Workspace**: `@bukoo/mobile` (`apps/mobile`)

---

## 1. Executive Summary

This spec defines the replacement of standard React Native system alert dialogs (`Alert.alert`) for user logout confirmation with a custom themed Modal in `ProfileScreen.tsx`. The custom dialog aligns with Bukoo's dark forest design language (`#0B1914`, `#122B23`), featuring a red icon badge, clean typography, and styled action buttons.

---

## 2. Component Specifications

### 2.1 State & Flow (`ProfileScreen.tsx`)
- **State**: `showLogoutModal` (`boolean`)
- **Trigger**: Clicking the bottom **Keluar** button sets `setShowLogoutModal(true)`.
- **Cancel Action**: Dismisses modal (`setShowLogoutModal(false)`).
- **Confirm Action**: Executes `logout()` mutation from `useLogout()`, clearing session state and navigating back to `AuthStack`.

### 2.2 Layout & Styling Specifications
- **Backdrop Overlay**: `rgba(5, 12, 10, 0.8)` with backdrop blur/fade.
- **Card Container**:
  - `backgroundColor`: `#122B23`
  - `borderColor`: `#1D4437`
  - `borderWidth`: `1`
  - `borderRadius`: `24`
  - `padding`: `24`
- **Icon Header**:
  - Circle background `rgba(239, 68, 68, 0.15)`
  - Icon: `<Ionicons name="log-out-outline" size={28} color="#EF4444" />`
- **Button Row**:
  - **Batal**: Transparent with `#1D4437` border, `COLORS.cream` text.
  - **Keluar**: Solid `#EF4444` background with `#FFFFFF` text.

---

## 3. Verification Plan

1. **Type Checking**:
   - `npm run typecheck --workspace=apps/mobile`
2. **Linting**:
   - `npm run lint --workspace=apps/mobile`
3. **UI Validation**:
   - Verify modal opening on "Keluar" button click, cancel action, and logout confirmation token eviction.

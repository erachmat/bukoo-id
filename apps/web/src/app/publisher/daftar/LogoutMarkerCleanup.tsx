"use client";

import { useEffect } from "react";

/**
 * Removes the `?logout=1` marker from the address bar after a sign-out redirect
 * lands on the landing page. The marker is only consumed by middleware (to
 * bypass the "logged-in publisher → dashboard" bounce); once the page renders
 * it's purely cosmetic, so we clean it up with history.replaceState.
 */
export function LogoutMarkerCleanup() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "1") {
      const url = new URL(window.location.href);
      url.searchParams.delete("logout");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
  }, []);

  return null;
}

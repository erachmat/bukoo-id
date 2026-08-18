import React from "react";
import "./publisher.css";

// Root publisher layout — simple pass-through.
// Public pages (daftar, royalti, panduan) render without auth.
// Protected pages live in (protected)/ and have their own layout with auth.
export default function PublisherRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

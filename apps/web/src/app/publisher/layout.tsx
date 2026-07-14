import React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import "./publisher.css";
import { PublisherSidebar } from "./sidebar-client";

export default async function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user || (user as any).role !== "PUBLISHER") {
    redirect("/login");
  }

  return (
    <div className="pub-container" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <PublisherSidebar user={user} />
      <div style={{ marginLeft: "260px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

import React from "react";
import { PublisherNav } from "@/components/publisher/PublisherNav";
import { SubmitForm } from "./SubmitForm";

export const metadata = {
  title: "BUKOO — Submit & Unggah Judul Baru",
  description: "Unggah naskah e-book baru ke platform BUKOO. Proses peninjauan cepat, konversi EPUB otomatis, dan distribusi aman.",
};

export default function PublisherSubmitPage() {
  return (
    <div className="pub-page-wrap">
      <PublisherNav currentTab="submit" />

      {/* Hero Section */}
      <section className="pub-hero" style={{ paddingBottom: 40 }}>
        <div className="pub-hero-bg" />
        <div className="pub-wrap">
          <span className="pub-eyebrow">Submit &amp; Unggah Judul</span>
          <h1 className="pub-h1">
            Terbitkan karya baru ke <em>katalog BUKOO</em>
          </h1>
          <p className="pub-lead">
            Unggah berkas naskah EPUB/PDF beserta metadata e-book Anda. Tim redaksi &amp; kurasi BUKOO akan memverifikasi berkas dalam 1-2 hari kerja sebelum terbit resmi.
          </p>
        </div>
      </section>

      {/* Submit Form Container */}
      <section className="pub-sec" style={{ paddingTop: 20 }}>
        <div className="pub-wrap">
          <SubmitForm />
        </div>
      </section>
    </div>
  );
}

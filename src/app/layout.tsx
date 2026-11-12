import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#047857",
};

export const metadata: Metadata = {
  title: "Sistem Survei Kepuasan Layanan & Executive Dashboard - UP Taman Margasatwa Ragunan",
  description:
    "Aplikasi Survei Indeks Kepuasan Layanan (IKM) dan Executive Dashboard Analitik UP Taman Margasatwa Ragunan - Dinas Pertamanan dan Hutan Kota Provinsi DKI Jakarta sesuai Standar PermenPAN-RB No. 14 / 2017",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

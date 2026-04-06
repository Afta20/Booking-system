import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'HIMSI Book — Sistem Booking Fasilitas Kampus',
    template: '%s | HIMSI Book',
  },
  description:
    'Sistem peminjaman fasilitas kampus digital untuk organisasi mahasiswa HIMSI. Booking ruangan dan peralatan dengan mudah dan efisien.',
  keywords: ['booking', 'fasilitas kampus', 'HIMSI', 'peminjaman ruangan', 'organisasi mahasiswa'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

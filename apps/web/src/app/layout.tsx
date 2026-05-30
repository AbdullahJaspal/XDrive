import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';

import { BRAND } from '@/lib/brand';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const siteDescription = `Private hire journeys with ${BRAND.name} — licensed, discreet, and impeccably timed.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: `${BRAND.name} — Private hire`,
  description: siteDescription,
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: `${BRAND.name} — Private hire`,
    description: siteDescription,
    type: 'website',
    locale: 'en_GB',
    siteName: BRAND.name,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: BRAND.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — Private hire`,
    description: siteDescription,
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className={`${inter.variable} ${cormorant.variable} min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}

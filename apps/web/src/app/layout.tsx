import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import { BRAND } from '@/lib/brand';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const siteDescription = `Book a licensed private hire taxi with ${BRAND.name}. Fast quotes, accessibility options, and reliable UK journeys.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: `${BRAND.name} — Book a taxi`,
  description: siteDescription,
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: `${BRAND.name} — Book a taxi`,
    description: siteDescription,
    type: 'website',
    locale: 'en_GB',
    siteName: BRAND.name,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: `${BRAND.name} — Book a taxi`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — Book a taxi`,
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
      <body className={`${inter.variable} ${plusJakarta.variable} min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}

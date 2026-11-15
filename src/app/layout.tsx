import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { CS_CONTACTS } from '@/lib/cs-contacts';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
const SITE_URL = 'https://www.berkatmandiripendingin.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Berkat Mandiri Pendingin | Pusat AC, Kompresor, Refrigerant & Spare Part Terlengkap di Indonesia',
    template: '%s | Berkat Mandiri Pendingin',
  },
  description: 'PT Berkat Mandiri Pendingin — Distributor HVAC resmi sejak 2010 di Kawasan MM2100 Bekasi. Pusat penjualan AC, kompresor, refrigerant, spare part, chiller, VRV/VRF, dan sistem pendingin gedung terlengkap. Harga kompetitif, garansi resmi, pengiriman ke 34 provinsi Indonesia.',
  authors: [{ name: 'PT Berkat Mandiri Pendingin', url: SITE_URL }],
  creator: 'PT Digital Bisnis Manajemen',
  publisher: 'PT Berkat Mandiri Pendingin',
  category: 'business',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: 'Berkat Mandiri Pendingin',
    title: 'Berkat Mandiri Pendingin | Distributor HVAC Resmi Sejak 2010',
    description: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.',
    images: [{ url: '/images/hero/hero-1.png', alt: 'Sistem pendingin HVAC modern — PT Berkat Mandiri Pendingin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Berkat Mandiri Pendingin | Distributor HVAC Resmi Sejak 2010',
    description: 'Pusat penjualan AC, kompresor, refrigerant, spare part, dan sistem pendingin gedung terlengkap di Indonesia.',
    images: ['/images/hero/hero-1.png'],
  },
  icons: { icon: '/images/logo.svg' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteStructuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'HVACBusiness',
        '@id': `${SITE_URL}/#organization`,
        name: 'PT Berkat Mandiri Pendingin',
        alternateName: 'Berkat Mandiri Pendingin',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logo.svg`,
        image: `${SITE_URL}/images/hero/hero-1.png`,
        description: 'Distributor HVAC resmi sejak 2010 — pusat AC, kompresor, refrigerant, spare part, chiller, dan sistem pendingin gedung terlengkap di Indonesia.',
        foundingDate: '2010',
        telephone: '+62-813-5000-3423',
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+62-813-5000-3423',
            contactType: 'sales',
            areaServed: 'ID',
            availableLanguage: ['id'],
          },
          ...CS_CONTACTS.map((cs) => ({
            '@type': 'ContactPoint',
            telephone: cs.waDisplay.replace(' ', '-'),
            contactType: 'customer support',
            name: cs.name,
            areaServed: 'ID',
            availableLanguage: ['id'],
          })),
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bekasi',
          addressRegion: 'Jawa Barat',
          addressCountry: 'ID',
        },
        areaServed: { '@type': 'Country', name: 'Indonesia' },
        knowsAbout: ['Kompresor AC', 'Sistem HVAC', 'Chiller', 'VRV/VRF', 'Refrigerant', 'Spare part pendingin'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Berkat Mandiri Pendingin',
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'id-ID',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/produk?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster richColors position="top-right" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData).replace(/</g, '\\u003c') }} />
      </body>
    </html>
  );
}

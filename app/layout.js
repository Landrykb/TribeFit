import { Inter } from 'next/font/google';
import './globals.css';
import { ApiProvider } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata = {
  title: 'TribeFit - Stronger Together',
  description: 'Social pact fitness app. One tribe, one pact.',
  keywords: 'fitness, social, accountability, workout, tribe, pact',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TribeFit',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#A3E635',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} ${inter.variable} antialiased bg-surface-950 text-surface-50 min-h-screen`}>
        <ApiProvider>
          {children}
        </ApiProvider>
      </body>
    </html>
  );
}
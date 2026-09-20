import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

// 🎨 Headings Font - Modern & Elegant
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// 📖 Body Font - Clean & Readable
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

// 🔢 Numbers Font - Monospace for trading data
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'TradeSage AI - Forex Trading Signals',
  description: 'AI-powered forex trading signals with ICT/SMC strategy',
  keywords: ['forex', 'trading', 'signals', 'AI', 'ICT', 'SMC', 'gold', 'silver'],
  authors: [{ name: 'TradeSage AI' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
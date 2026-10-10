import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

// 🎨 Corporate Font - Inter
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// ✨ Elegant Font - Playfair Display (special words के लिए)
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-fancy',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'MyTrade AI — AI-Powered Forex Signals',
  description: 'AI-powered Forex trading signals with institutional-grade ICT/SMC analysis. Built for serious traders.',
  keywords: ['forex', 'trading', 'signals', 'AI', 'ICT', 'SMC', 'gold', 'silver'],
  authors: [{ name: 'MyTrade AI' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
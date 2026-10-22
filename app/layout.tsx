import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

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
      <body className="font-body antialiased">
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
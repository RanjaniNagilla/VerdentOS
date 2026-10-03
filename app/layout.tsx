import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verdantos ESG Engine',
  description: 'AI-Powered Carbon & Supply Chain Mitigation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased transition-colors duration-150">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
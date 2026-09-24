import type { Metadata } from 'next';
import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ANNASETU — Surplus Food. Shared With Purpose. Real Impact.',
  description:
    'A verified, need-driven surplus-food rescue and delivery marketplace connecting verified food donors with verified NGO needs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen bg-[#f7f1e3] text-[#23262b] dark:bg-[#14171a] dark:text-[#f7f1e3] transition-colors selection:bg-[#1f4d36] selection:text-white">
        {children}
      </body>
    </html>
  );
}

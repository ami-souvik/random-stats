import './globals.css';
import {
  Poppins as FontPoppins,
  Habibi as FontHabibi,
  Libre_Baskerville as FontLibre_Baskerville,
  Geist_Mono as FontGeist_Mono,
} from "next/font/google";
import Providers from './providers';
import HeroBanner from './HeroBanner';
import { Metadata } from 'next';

export const defaultFont = FontPoppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const serifFont = FontLibre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const monoFont = FontGeist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const fontClass = `${defaultFont.variable} ${serifFont.variable} ${monoFont.variable}`;


export const metadata: Metadata = {
  title: 'Random Stats | Compact Data Generation',
  description: 'Generate synthetic datasets with a refined, compact interface.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontClass} dark`}>
      <body className="bg-black text-white antialiased font-sans">
        <Providers>
          <div className="flex flex-col h-screen">
            <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h1 className="text-xl font-serif italic tracking-tight">RandomStats</h1>
              <div className="section-label">Synthetic Data Engine</div>
            </header>
            <HeroBanner />
            <main className="flex-grow overflow-hidden min-h-0">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

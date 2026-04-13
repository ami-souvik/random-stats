import './globals.css';
import { Inter, Instrument_Serif } from 'next/font/google';
import Providers from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const instrumentSerif = Instrument_Serif({ 
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic', 'normal'],
  variable: '--font-serif',
});

export const metadata = {
  title: 'Random Stats | Compact Data Generation',
  description: 'Generate synthetic datasets with a refined, compact interface.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable} dark`}>
      <body className="bg-black text-white antialiased font-sans">
        <Providers>
          <div className="flex flex-col h-screen">
            <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center shrink-0">
              <h1 className="text-xl font-serif italic tracking-tight">RandomStats</h1>
              <div className="section-label">Synthetic Data Engine</div>
            </header>
            <main className="flex-grow overflow-hidden">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BitFlow Paper | Profesyonel Bitcoin Terminali',
  description: 'Sıfır gecikmeli, gerçek zamanlı Binance verisiyle çalışan profesyonel kripto simülasyon terminali.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-fin-bg text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}